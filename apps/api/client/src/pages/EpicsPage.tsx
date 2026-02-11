import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useProjectContext } from '../contexts/ProjectContext';
import { useJobs } from '../hooks';
import type { Job, JobPhase } from '../api/types';

interface EpicWithProgress {
  job: Job;
  children_count: number;
  done_count: number;
}

export function EpicsPage() {
  const navigate = useNavigate();
  const { currentProject } = useProjectContext();
  const projectId = currentProject?.id;
  const { data: allJobs = [], isLoading, error } = useJobs(projectId);

  const [searchQuery, setSearchQuery] = useState('');

  // Derive epics with child counts from the full job list
  const epicsWithProgress: EpicWithProgress[] = useMemo(() => {
    const epics = allJobs.filter((job: Job) => job.issue_type === 'epic');
    return epics.map((epic: Job) => {
      const children = allJobs.filter((job: Job) => job.parent_id === epic.id);
      const doneCount = children.filter((job: Job) => job.phase === 'done').length;
      return {
        job: epic,
        children_count: children.length,
        done_count: doneCount,
      };
    });
  }, [allJobs]);

  // Filter epics based on search query
  const filteredEpics = useMemo(() => {
    if (!searchQuery) return epicsWithProgress;
    const query = searchQuery.toLowerCase();
    return epicsWithProgress.filter(
      (epic) =>
        epic.job.subject.toLowerCase().includes(query) ||
        epic.job.description?.toLowerCase().includes(query) ||
        epic.job.status.toLowerCase().includes(query)
    );
  }, [epicsWithProgress, searchQuery]);

  const handleEpicClick = (epicId: string) => {
    navigate(`/epics/${epicId}`);
  };

  const handleCreateEpic = () => {
    console.log('Create epic clicked - modal/form to be implemented');
  };

  const truncateDescription = (description: string | undefined, maxLength: number = 80) => {
    if (!description) return 'No description provided';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const getPhaseVariant = (phase: string): JobPhase | 'default' => {
    const phaseMap: Record<string, JobPhase> = {
      idea: 'idea',
      backlog: 'backlog',
      ready: 'ready',
      active: 'active',
      review: 'review',
      done: 'done',
      cancelled: 'cancelled',
    };
    return phaseMap[phase] || 'default';
  };

  const calculateProgress = (doneCount: number, totalCount: number) => {
    if (totalCount === 0) return 0;
    return Math.round((doneCount / totalCount) * 100);
  };

  // Skeleton loader for loading state
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-eve-700 rounded w-3/4"></div>
            <div className="h-4 bg-eve-700 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-eve-700 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-eve-700 rounded w-full"></div>
          <div className="h-4 bg-eve-700 rounded w-2/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-eve-700 rounded-full w-full"></div>
          <div className="h-4 bg-eve-700 rounded w-1/3"></div>
        </div>
      </div>
    </Card>
  );

  // No project selected
  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Epics</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view epics.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Epics</h1>
        <Button onClick={handleCreateEpic}>
          + New Epic
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search epics by title, description, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">
            {error instanceof Error ? error.message : 'Failed to load epics'}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state - no epics at all */}
      {!isLoading && !error && filteredEpics.length === 0 && epicsWithProgress.length === 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No epics found. Create your first epic to get started.
          </p>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && !error && filteredEpics.length === 0 && epicsWithProgress.length > 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No epics match your search criteria.
          </p>
        </Card>
      )}

      {/* Epic grid */}
      {!isLoading && !error && filteredEpics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEpics.map((epic) => {
            const progress = calculateProgress(epic.done_count, epic.children_count);

            return (
              <Card
                key={epic.job.id}
                className="cursor-pointer transition-all hover:border-eve-600 hover:shadow-lg"
                onClick={() => handleEpicClick(epic.job.id)}
              >
                <div className="space-y-4">
                  {/* Header with title and phase badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {epic.job.subject}
                      </h3>
                    </div>
                    <Badge variant={getPhaseVariant(epic.job.phase)} />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-eve-300 line-clamp-2">
                    {truncateDescription(epic.job.description)}
                  </p>

                  {/* Progress section */}
                  {epic.children_count > 0 && (
                    <div className="space-y-2">
                      {/* Progress bar */}
                      <div className="w-full bg-eve-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-eve-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-eve-400">
                          {epic.done_count} of {epic.children_count} completed
                        </span>
                        <span className="text-eve-300 font-medium">{progress}%</span>
                      </div>
                    </div>
                  )}

                  {/* Footer with child count */}
                  <div className="pt-3 border-t border-eve-700">
                    <div className="flex items-center gap-2 text-sm text-eve-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      <span>
                        {epic.children_count} {epic.children_count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
