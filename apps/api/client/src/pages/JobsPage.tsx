import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge, PhaseBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

// Mock data
interface Job {
  id: string;
  subject: string;
  issue_type: 'story' | 'task' | 'bug' | 'epic';
  phase: 'idea' | 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'cancelled';
  status: string;
  created_at: string;
  updated_at: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    subject: 'Setup auth flow',
    issue_type: 'story',
    phase: 'active',
    status: 'in_progress',
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-01-29T08:00:00Z',
  },
  {
    id: '2',
    subject: 'Design database schema',
    issue_type: 'task',
    phase: 'done',
    status: 'completed',
    created_at: '2026-01-27T10:00:00Z',
    updated_at: '2026-01-28T15:00:00Z',
  },
  {
    id: '3',
    subject: 'Fix login redirect bug',
    issue_type: 'bug',
    phase: 'review',
    status: 'in_review',
    created_at: '2026-01-27T14:30:00Z',
    updated_at: '2026-01-29T09:15:00Z',
  },
  {
    id: '4',
    subject: 'Implement user dashboard',
    issue_type: 'story',
    phase: 'ready',
    status: 'todo',
    created_at: '2026-01-26T09:00:00Z',
    updated_at: '2026-01-28T11:20:00Z',
  },
  {
    id: '5',
    subject: 'Add API rate limiting',
    issue_type: 'task',
    phase: 'backlog',
    status: 'todo',
    created_at: '2026-01-25T16:00:00Z',
    updated_at: '2026-01-26T10:30:00Z',
  },
  {
    id: '6',
    subject: 'Performance optimization epic',
    issue_type: 'epic',
    phase: 'idea',
    status: 'planning',
    created_at: '2026-01-24T11:00:00Z',
    updated_at: '2026-01-27T14:45:00Z',
  },
  {
    id: '7',
    subject: 'Refactor authentication module',
    issue_type: 'task',
    phase: 'active',
    status: 'in_progress',
    created_at: '2026-01-28T13:20:00Z',
    updated_at: '2026-01-29T07:30:00Z',
  },
  {
    id: '8',
    subject: 'Update dependencies',
    issue_type: 'task',
    phase: 'done',
    status: 'completed',
    created_at: '2026-01-23T08:00:00Z',
    updated_at: '2026-01-24T16:00:00Z',
  },
  {
    id: '9',
    subject: 'Implement search functionality',
    issue_type: 'story',
    phase: 'ready',
    status: 'todo',
    created_at: '2026-01-26T12:00:00Z',
    updated_at: '2026-01-28T09:00:00Z',
  },
  {
    id: '10',
    subject: 'Fix memory leak in worker process',
    issue_type: 'bug',
    phase: 'active',
    status: 'in_progress',
    created_at: '2026-01-28T15:45:00Z',
    updated_at: '2026-01-29T08:20:00Z',
  },
];

type SortField = 'subject' | 'issue_type' | 'phase' | 'status' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export function JobsPage() {
  const [jobs] = useState<Job[]>(mockJobs);
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      // Search filter
      const matchesSearch = job.subject
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Phase filter
      const matchesPhase =
        selectedPhases.length === 0 || selectedPhases.includes(job.phase);

      // Type filter
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(job.issue_type);

      return matchesSearch && matchesPhase && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle dates
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchQuery, selectedPhases, selectedTypes, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const togglePhase = (phase: string) => {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
    setCurrentPage(1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleRowClick = (job: Job) => {
    console.log('Job clicked:', job.id, job);
    // TODO: Navigate to job detail page
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTypeVariant = (
    type: string
  ): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case 'bug':
        return 'error';
      case 'story':
        return 'info';
      case 'epic':
        return 'warning';
      case 'task':
        return 'default';
      default:
        return 'default';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 text-eve-500 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="w-4 h-4 text-eve-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-eve-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <div className="text-sm text-eve-400">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search jobs by subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />

          {/* Phase filters */}
          <div>
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Filter by Phase
            </label>
            <div className="flex flex-wrap gap-2">
              {['idea', 'backlog', 'ready', 'active', 'review', 'done', 'cancelled'].map(
                (phase) => (
                  <button
                    key={phase}
                    onClick={() => togglePhase(phase)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedPhases.includes(phase)
                        ? 'bg-eve-600 text-white ring-2 ring-eve-500'
                        : 'bg-eve-800 text-eve-300 hover:bg-eve-700'
                    }`}
                  >
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Type filters */}
          <div>
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Filter by Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['story', 'task', 'bug', 'epic'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-eve-600 text-white ring-2 ring-eve-500'
                      : 'bg-eve-800 text-eve-300 hover:bg-eve-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(searchQuery || selectedPhases.length > 0 || selectedTypes.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPhases([]);
                setSelectedTypes([]);
                setCurrentPage(1);
              }}
              className="text-sm text-eve-400 hover:text-eve-200 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-eve-300">No jobs found.</p>
            {(searchQuery || selectedPhases.length > 0 || selectedTypes.length > 0) && (
              <p className="text-sm text-eve-400 mt-2">
                Try adjusting your filters.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-eve-700 bg-eve-900/50">
                    <th
                      onClick={() => handleSort('subject')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Subject
                        <SortIcon field="subject" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('issue_type')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Type
                        <SortIcon field="issue_type" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('phase')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Phase
                        <SortIcon field="phase" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('created_at')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors hidden lg:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        Created
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('updated_at')}
                      className="group text-left py-4 px-6 text-sm font-semibold text-eve-200 cursor-pointer hover:bg-eve-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Updated
                        <SortIcon field="updated_at" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      onClick={() => handleRowClick(job)}
                      className={`
                        border-b border-eve-700/50 cursor-pointer transition-colors
                        hover:bg-eve-700/30
                        ${index % 2 === 0 ? 'bg-eve-900/20' : 'bg-eve-900/40'}
                      `}
                    >
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-white">
                          {job.subject}
                        </div>
                        <div className="text-xs text-eve-400 mt-1">#{job.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getTypeVariant(job.issue_type)}>
                          {job.issue_type}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <PhaseBadge phase={job.phase} />
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <span className="text-sm text-eve-300">
                          {job.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-eve-400 hidden lg:table-cell">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="py-4 px-6 text-sm text-eve-400">
                        {formatDate(job.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-eve-700 bg-eve-900/30">
                <div className="text-sm text-eve-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of{' '}
                  {filteredJobs.length} jobs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-eve-800 text-eve-200 hover:bg-eve-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-eve-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              currentPage === page
                                ? 'bg-eve-600 text-white'
                                : 'bg-eve-800 text-eve-200 hover:bg-eve-700'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-eve-800 text-eve-200 hover:bg-eve-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
