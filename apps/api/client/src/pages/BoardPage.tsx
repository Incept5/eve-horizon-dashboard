import { useState, useEffect } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { getJobs } from '../api/jobs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import type { Job, JobPhase, IssueType } from '../api/types';

const PHASES: readonly JobPhase[] = ['idea', 'backlog', 'ready', 'active', 'review', 'done'];

interface JobCardProps {
  job: Job;
  onClick: (jobId: string) => void;
}

function JobCard({ job, onClick }: JobCardProps) {
  const issueTypeBadgeColors: Record<IssueType, string> = {
    epic: 'bg-purple-900/50 text-purple-300 border-purple-700',
    story: 'bg-blue-900/50 text-blue-300 border-blue-700',
    task: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  const statusDotColors: Record<string, string> = {
    pending: 'bg-gray-500',
    active: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-gray-400',
  };

  return (
    <div
      onClick={() => onClick(job.id)}
      className="bg-eve-800/50 backdrop-blur-sm border border-eve-700 rounded-lg p-3 cursor-pointer hover:border-eve-600 hover:shadow-lg transition-all duration-200"
    >
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white line-clamp-2">
          {job.subject}
        </h4>
        <div className="flex items-center justify-between gap-2">
          <Badge
            className={`text-xs ${issueTypeBadgeColors[job.issue_type]}`}
          >
            {job.issue_type}
          </Badge>
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                statusDotColors[job.status] || 'bg-gray-500'
              }`}
              title={job.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SwimlaneProps {
  epicName: string;
  epicId: string | null;
  phases: readonly JobPhase[];
  jobsByPhase: Record<JobPhase, Job[]>;
  onJobClick: (jobId: string) => void;
}

function Swimlane({ epicName, epicId: _epicId, phases, jobsByPhase, onJobClick }: SwimlaneProps) {
  return (
    <div className="border-b border-eve-700 last:border-b-0">
      <div className="flex">
        {/* Epic header */}
        <div className="w-48 flex-shrink-0 p-4 border-r border-eve-700 bg-eve-800/30">
          <div className="sticky top-0">
            <p className="text-sm font-medium text-eve-200 truncate" title={epicName}>
              {epicName}
            </p>
          </div>
        </div>

        {/* Phase columns */}
        <div className="flex-1 flex">
          {phases.map((phase) => {
            const jobs = jobsByPhase[phase] || [];
            return (
              <div
                key={phase}
                className="flex-1 min-w-[280px] p-4 border-r border-eve-700 last:border-r-0"
              >
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} onClick={onJobClick} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BoardPage() {
  const { currentProject } = useProjectContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs function
  const fetchJobs = async () => {
    if (!currentProject) {
      setJobs([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedJobs = await getJobs(currentProject.id.toString());
      setJobs(fetchedJobs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
      setError(errorMessage);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchJobs();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentProject]);

  // Filter jobs by search query
  const filteredJobs = jobs.filter((job) =>
    job.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group jobs by epic (parent_id)
  const jobsByEpic = filteredJobs.reduce((acc, job) => {
    const epicId = job.parent_id || 'unassigned';
    if (!acc[epicId]) {
      acc[epicId] = [];
    }
    acc[epicId].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  // Get epic names
  const epicNames: Record<string, string> = {};
  jobs.forEach((job) => {
    if (job.issue_type === 'epic') {
      epicNames[job.id] = job.subject;
    }
  });

  // Sort epics: named epics first, then unassigned
  const sortedEpicIds = Object.keys(jobsByEpic).sort((a, b) => {
    if (a === 'unassigned') return 1;
    if (b === 'unassigned') return -1;
    return (epicNames[a] || a).localeCompare(epicNames[b] || b);
  });

  // Handle job click
  const handleJobClick = (jobId: string) => {
    console.log('Job clicked:', jobId);
    // Drawer integration will go here
  };

  // Handle new job
  const handleNewJob = () => {
    alert('New Job modal coming soon!');
  };

  // Get job counts by phase
  const jobCountsByPhase = PHASES.reduce((acc, phase) => {
    acc[phase] = filteredJobs.filter((job) => job.phase === phase).length;
    return acc;
  }, {} as Record<JobPhase, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
        <Button onClick={handleNewJob}>+ New Job</Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search jobs by subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* No project selected */}
      {!currentProject && !isLoading && (
        <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
          <p className="text-eve-300 text-center">
            Please select a project from the Projects page to view jobs.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && currentProject && filteredJobs.length === 0 && jobs.length === 0 && (
        <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
          <p className="text-eve-300 text-center">
            No jobs found. Create your first job to get started.
          </p>
        </div>
      )}

      {/* No search results */}
      {!isLoading && !error && currentProject && filteredJobs.length === 0 && jobs.length > 0 && (
        <div className="bg-eve-900 rounded-lg border border-eve-800 p-8">
          <p className="text-eve-300 text-center">
            No jobs match your search criteria.
          </p>
        </div>
      )}

      {/* Kanban board */}
      {!isLoading && !error && currentProject && filteredJobs.length > 0 && (
        <div className="bg-eve-900 rounded-lg border border-eve-800 overflow-hidden">
          {/* Column headers */}
          <div className="flex border-b border-eve-700 bg-eve-800/50">
            <div className="w-48 flex-shrink-0 p-4 border-r border-eve-700">
              <p className="text-sm font-semibold text-eve-300">Epic</p>
            </div>
            <div className="flex-1 flex overflow-x-auto">
              {PHASES.map((phase) => (
                <div
                  key={phase}
                  className="flex-1 min-w-[280px] p-4 border-r border-eve-700 last:border-r-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-eve-200 capitalize">
                      {phase}
                    </p>
                    <Badge variant={phase} className="text-xs">
                      {jobCountsByPhase[phase]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swimlanes */}
          <div className="overflow-x-auto">
            {sortedEpicIds.map((epicId) => {
              const epicName = epicId === 'unassigned'
                ? 'Unassigned'
                : epicNames[epicId] || `Epic ${epicId.substring(0, 8)}`;

              const epicJobs = jobsByEpic[epicId];
              const jobsByPhase = PHASES.reduce((acc, phase) => {
                acc[phase] = epicJobs.filter((job) => job.phase === phase);
                return acc;
              }, {} as Record<JobPhase, Job[]>);

              return (
                <Swimlane
                  key={epicId}
                  epicName={epicName}
                  epicId={epicId === 'unassigned' ? null : epicId}
                  phases={PHASES}
                  jobsByPhase={jobsByPhase}
                  onJobClick={handleJobClick}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
