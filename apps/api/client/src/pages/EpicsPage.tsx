import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

interface Epic {
  id: string;
  subject: string;
  description?: string;
  phase: string;
  status: string;
  issue_type: 'epic';
  children_count: number;
  done_count: number;
}

// Mock epics for development
const mockEpics: Epic[] = [
  {
    id: '1',
    subject: 'User Authentication',
    description: 'Implement full auth flow with OAuth, session management, and security best practices',
    phase: 'active',
    status: 'in_progress',
    issue_type: 'epic',
    children_count: 5,
    done_count: 2,
  },
  {
    id: '2',
    subject: 'Dashboard UI',
    description: 'Build the main dashboard interface with real-time updates and responsive design',
    phase: 'review',
    status: 'pending_review',
    issue_type: 'epic',
    children_count: 8,
    done_count: 6,
  },
  {
    id: '3',
    subject: 'API Integration',
    description: 'Connect to backend services with proper error handling and retry logic',
    phase: 'backlog',
    status: 'pending',
    issue_type: 'epic',
    children_count: 3,
    done_count: 0,
  },
  {
    id: '4',
    subject: 'Database Migration',
    description: 'Migrate from SQLite to PostgreSQL with zero downtime',
    phase: 'ready',
    status: 'ready',
    issue_type: 'epic',
    children_count: 12,
    done_count: 3,
  },
  {
    id: '5',
    subject: 'Testing Infrastructure',
    description: 'Set up comprehensive testing with unit, integration, and e2e tests',
    phase: 'done',
    status: 'completed',
    issue_type: 'epic',
    children_count: 10,
    done_count: 10,
  },
  {
    id: '6',
    subject: 'Performance Optimization',
    description: 'Optimize application performance for faster load times and better UX',
    phase: 'idea',
    status: 'draft',
    issue_type: 'epic',
    children_count: 0,
    done_count: 0,
  },
];

export function EpicsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, _setIsLoading] = useState(false);

  // Filter epics based on search query
  const filteredEpics = mockEpics.filter((epic) =>
    epic.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    epic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    epic.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getPhaseVariant = (phase: string) => {
    const phaseMap: Record<string, 'idea' | 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'cancelled'> = {
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
      {!isLoading && filteredEpics.length === 0 && mockEpics.length === 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No epics found. Create your first epic to get started.
          </p>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && filteredEpics.length === 0 && mockEpics.length > 0 && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No epics match your search criteria.
          </p>
        </Card>
      )}

      {/* Epic grid */}
      {!isLoading && filteredEpics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEpics.map((epic) => {
            const progress = calculateProgress(epic.done_count, epic.children_count);

            return (
              <Card
                key={epic.id}
                className="cursor-pointer transition-all hover:border-eve-600 hover:shadow-lg"
                onClick={() => handleEpicClick(epic.id)}
              >
                <div className="space-y-4">
                  {/* Header with title and phase badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {epic.subject}
                      </h3>
                    </div>
                    <Badge variant={getPhaseVariant(epic.phase)} />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-eve-300 line-clamp-2">
                    {truncateDescription(epic.description)}
                  </p>

                  {/* Progress section */}
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
