import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface Job {
  id: string;
  subject: string;
  description?: string;
  phase: string;
  status: string;
  issue_type: 'epic' | 'story' | 'task';
  parent_id?: string;
}

// Mock data
const mockEpic: Job = {
  id: '1',
  subject: 'User Authentication',
  description: 'Implement complete auth flow with login, logout, and session management',
  phase: 'active',
  status: 'in_progress',
  issue_type: 'epic',
};

const mockChildren: Job[] = [
  { id: '2', subject: 'Design login form', issue_type: 'story', phase: 'done', status: 'completed', parent_id: '1' },
  { id: '3', subject: 'Implement JWT validation', issue_type: 'story', phase: 'active', status: 'in_progress', parent_id: '1' },
  { id: '4', subject: 'Add form validation', issue_type: 'task', phase: 'done', status: 'completed', parent_id: '2' },
  { id: '5', subject: 'Style login button', issue_type: 'task', phase: 'review', status: 'pending_review', parent_id: '2' },
  { id: '6', subject: 'Create token refresh logic', issue_type: 'task', phase: 'active', status: 'in_progress', parent_id: '3' },
  { id: '7', subject: 'Write JWT tests', issue_type: 'task', phase: 'backlog', status: 'pending', parent_id: '3' },
];

interface TreeNode {
  job: Job;
  children: TreeNode[];
}

export function EpicDetailPage() {
  const { epicId: _epicId } = useParams<{ epicId: string }>();
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3']));

  // Build tree structure
  const buildTree = (jobs: Job[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create nodes for all jobs
    jobs.forEach((job) => {
      nodeMap.set(job.id, { job, children: [] });
    });

    // Build parent-child relationships
    jobs.forEach((job) => {
      const node = nodeMap.get(job.id)!;
      if (job.parent_id && nodeMap.has(job.parent_id)) {
        nodeMap.get(job.parent_id)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
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

  const getIssueTypeIcon = (issueType: string) => {
    switch (issueType) {
      case 'epic':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'story':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render tree node recursively
  const renderTreeNode = (node: TreeNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.job.id);
    const hasChildren = node.children.length > 0;
    const indentWidth = depth * 24;

    return (
      <div key={node.job.id}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-eve-700/30 rounded transition-colors cursor-pointer"
          style={{ paddingLeft: `${12 + indentWidth}px` }}
          onClick={() => hasChildren && toggleNode(node.job.id)}
        >
          {/* Expand/collapse icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren && (
              <svg
                className={`w-4 h-4 text-eve-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          {/* Issue type icon */}
          <div className="text-eve-400">{getIssueTypeIcon(node.job.issue_type)}</div>

          {/* Subject */}
          <span className="text-white flex-1">{node.job.subject}</span>

          {/* Phase badge */}
          <Badge variant={getPhaseVariant(node.job.phase)} />
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate progress
  const doneCount = mockChildren.filter((j) => j.phase === 'done').length;
  const totalCount = mockChildren.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Build tree with epic as root
  const treeData = buildTree([mockEpic, ...mockChildren]);

  // Group children by phase for kanban
  const groupByPhase = (jobs: Job[]) => {
    return {
      backlog: jobs.filter((j) => j.phase === 'backlog' || j.phase === 'idea' || j.phase === 'ready'),
      active: jobs.filter((j) => j.phase === 'active'),
      review: jobs.filter((j) => j.phase === 'review'),
      done: jobs.filter((j) => j.phase === 'done'),
    };
  };

  const kanbanColumns = groupByPhase(mockChildren);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" onClick={() => navigate('/epics')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Epics
        </Button>
      </div>

      {/* Epic header */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{mockEpic.subject}</h1>
              <p className="text-eve-300">{mockEpic.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPhaseVariant(mockEpic.phase)} />
            </div>
          </div>

          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-eve-400">Progress</span>
              <span className="text-eve-300 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-eve-900 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-eve-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-eve-400">
              {doneCount} of {totalCount} items completed
            </div>
          </div>
        </div>
      </Card>

      {/* Tree view section */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Hierarchy</h2>
          <div className="space-y-1">
            {treeData.map((node) => renderTreeNode(node))}
          </div>
        </div>
      </Card>

      {/* Mini Kanban board */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Board View</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Backlog column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-eve-300 uppercase">Backlog</h3>
                <span className="text-xs text-eve-500 bg-eve-800 px-2 py-0.5 rounded-full">
                  {kanbanColumns.backlog.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanbanColumns.backlog.map((job) => (
                  <div
                    key={job.id}
                    className="bg-eve-900/50 border border-eve-700 rounded p-3 hover:border-eve-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-eve-400">{getIssueTypeIcon(job.issue_type)}</div>
                      <span className="text-xs text-eve-500 uppercase">{job.issue_type}</span>
                    </div>
                    <p className="text-sm text-white">{job.subject}</p>
                  </div>
                ))}
                {kanbanColumns.backlog.length === 0 && (
                  <div className="text-xs text-eve-500 text-center py-4">No items</div>
                )}
              </div>
            </div>

            {/* Active column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-eve-300 uppercase">Active</h3>
                <span className="text-xs text-eve-500 bg-eve-800 px-2 py-0.5 rounded-full">
                  {kanbanColumns.active.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanbanColumns.active.map((job) => (
                  <div
                    key={job.id}
                    className="bg-amber-900/20 border border-amber-700/50 rounded p-3 hover:border-amber-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-amber-400">{getIssueTypeIcon(job.issue_type)}</div>
                      <span className="text-xs text-amber-500 uppercase">{job.issue_type}</span>
                    </div>
                    <p className="text-sm text-white">{job.subject}</p>
                  </div>
                ))}
                {kanbanColumns.active.length === 0 && (
                  <div className="text-xs text-eve-500 text-center py-4">No items</div>
                )}
              </div>
            </div>

            {/* Review column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-eve-300 uppercase">Review</h3>
                <span className="text-xs text-eve-500 bg-eve-800 px-2 py-0.5 rounded-full">
                  {kanbanColumns.review.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanbanColumns.review.map((job) => (
                  <div
                    key={job.id}
                    className="bg-orange-900/20 border border-orange-700/50 rounded p-3 hover:border-orange-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-orange-400">{getIssueTypeIcon(job.issue_type)}</div>
                      <span className="text-xs text-orange-500 uppercase">{job.issue_type}</span>
                    </div>
                    <p className="text-sm text-white">{job.subject}</p>
                  </div>
                ))}
                {kanbanColumns.review.length === 0 && (
                  <div className="text-xs text-eve-500 text-center py-4">No items</div>
                )}
              </div>
            </div>

            {/* Done column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-eve-300 uppercase">Done</h3>
                <span className="text-xs text-eve-500 bg-eve-800 px-2 py-0.5 rounded-full">
                  {kanbanColumns.done.length}
                </span>
              </div>
              <div className="space-y-2">
                {kanbanColumns.done.map((job) => (
                  <div
                    key={job.id}
                    className="bg-green-900/20 border border-green-700/50 rounded p-3 hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-green-400">{getIssueTypeIcon(job.issue_type)}</div>
                      <span className="text-xs text-green-500 uppercase">{job.issue_type}</span>
                    </div>
                    <p className="text-sm text-white">{job.subject}</p>
                  </div>
                ))}
                {kanbanColumns.done.length === 0 && (
                  <div className="text-xs text-eve-500 text-center py-4">No items</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
