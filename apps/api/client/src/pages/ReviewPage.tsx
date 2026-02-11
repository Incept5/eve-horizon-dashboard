import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProjectContext } from '../contexts/ProjectContext';
import { useJobs } from '../hooks';
import { approveJob, rejectJob } from '../api/jobs';
import type { Job } from '../api/types';

type FilterTab = 'needs-my-review' | 'all-pending';

interface RejectModalProps {
  isOpen: boolean;
  jobSubject: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RejectModal({ isOpen, jobSubject, onConfirm, onCancel }: RejectModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-eve-900 border border-eve-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-2">Reject Review</h3>
        <p className="text-eve-300 text-sm mb-4">
          {jobSubject}
        </p>

        <label htmlFor="reason" className="block text-sm font-medium text-eve-200 mb-2">
          Reason for rejection
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 bg-eve-950 border border-eve-700 rounded-lg text-white placeholder-eve-400 focus:outline-none focus:ring-2 focus:ring-eve-600 focus:border-transparent resize-none"
          rows={4}
          placeholder="Explain why this work needs to be revised..."
        />

        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1"
          >
            Confirm Rejection
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReviewPage() {
  const { currentProject } = useProjectContext();
  const projectId = currentProject?.id;
  const queryClient = useQueryClient();

  const { data: allJobs = [], isLoading, error } = useJobs(projectId);

  const [activeTab, setActiveTab] = useState<FilterTab>('needs-my-review');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedJobForReject, setSelectedJobForReject] = useState<Job | null>(null);

  // Filter for review-phase jobs
  const reviewJobs = allJobs.filter((job: Job) => job.phase === 'review');

  const filteredJobs = activeTab === 'needs-my-review'
    ? reviewJobs.filter((job: Job) => job.status === 'pending' || job.status === 'active')
    : reviewJobs;

  const getTimeInReview = (updatedAt: string): string => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    }
    if (diffHours > 0) {
      return `${diffHours}h`;
    }
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m`;
  };

  const truncateDescription = (text: string | undefined, maxLength: number = 120): string => {
    if (!text) return 'No description';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleApprove = async (jobId: string) => {
    setActionLoading(jobId);
    setActionError(null);
    try {
      await approveJob(jobId);
      // Invalidate jobs cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to approve job'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (job: Job) => {
    setSelectedJobForReject(job);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedJobForReject) return;
    setActionLoading(selectedJobForReject.id);
    setActionError(null);
    try {
      await rejectJob(selectedJobForReject.id, reason);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setRejectModalOpen(false);
      setSelectedJobForReject(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to reject job'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (jobId: string) => {
    console.log(`View details for job ${jobId}`);
  };

  // No project selected
  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Review Queue</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view the review queue.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Review Queue</h1>
        <Badge variant="review">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {/* Error state */}
      {(error || actionError) && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">
            {actionError ||
              (error instanceof Error ? error.message : 'Failed to load review queue')}
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-eve-700">
        <button
          onClick={() => setActiveTab('needs-my-review')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'needs-my-review'
              ? 'text-eve-200'
              : 'text-eve-400 hover:text-eve-300'
          }`}
        >
          Needs My Review
          {activeTab === 'needs-my-review' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-eve-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all-pending')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'all-pending'
              ? 'text-eve-200'
              : 'text-eve-400 hover:text-eve-300'
          }`}
        >
          All Pending
          {activeTab === 'all-pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-eve-500" />
          )}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredJobs.length === 0 && (
        <Card>
          <div className="text-center py-12 space-y-3">
            <div className="flex items-center justify-center text-eve-500">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-eve-300 text-lg font-medium">
              No items pending review
            </p>
            <p className="text-eve-400 text-sm">
              {activeTab === 'needs-my-review'
                ? 'All caught up! No reviews require your attention right now.'
                : 'The review queue is empty.'}
            </p>
          </div>
        </Card>
      )}

      {/* Review jobs grid */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job: Job) => (
            <Card key={job.id} className="hover:border-eve-600 transition-colors">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {job.subject}
                    </h3>
                    <p className="text-sm text-eve-300">
                      {truncateDescription(job.description)}
                    </p>
                  </div>
                  <Badge variant="review">{job.phase}</Badge>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-6 text-sm text-eve-400">
                  <div className="flex items-center gap-2">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{getTimeInReview(job.updated_at)} in review</span>
                  </div>

                  {job.harness && (
                    <div className="flex items-center gap-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{job.harness}</span>
                    </div>
                  )}

                  {job.git?.branch && (
                    <div className="flex items-center gap-2 text-eve-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span>{job.git.branch}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-eve-700">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(job.id)}
                    loading={actionLoading === job.id}
                    disabled={actionLoading !== null}
                  >
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(job)}
                    disabled={actionLoading !== null}
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(job.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        jobSubject={selectedJobForReject?.subject || ''}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedJobForReject(null);
        }}
      />
    </div>
  );
}
