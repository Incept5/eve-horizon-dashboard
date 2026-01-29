import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export interface JobDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
}

type TabType = 'overview' | 'attempts' | 'logs' | 'result';

interface JobAttempt {
  id: string;
  attemptNumber: number;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime: string | null;
  duration: string;
}

interface JobDetails {
  id: string;
  subject: string;
  description: string;
  phase: 'idea' | 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'cancelled';
  status: 'pending' | 'running' | 'completed' | 'failed';
  issueType: string;
  gitBranch: string;
  gitRef: string;
  createdAt: string;
  updatedAt: string;
  parentEpic: { id: string; title: string } | null;
  attempts: JobAttempt[];
  result: Record<string, any> | null;
}

// Mock data
const getMockJobDetails = (jobId: string): JobDetails => ({
  id: jobId,
  subject: 'Implement user authentication system',
  description:
    'Build a secure authentication system with JWT tokens, refresh tokens, and password hashing. Include email verification and password reset functionality.',
  phase: 'active',
  status: 'running',
  issueType: 'feature',
  gitBranch: 'feature/auth-system',
  gitRef: 'a3f4b2c',
  createdAt: '2026-01-28T10:30:00Z',
  updatedAt: '2026-01-29T14:22:00Z',
  parentEpic: {
    id: 'epic-123',
    title: 'Core Platform Infrastructure',
  },
  attempts: [
    {
      id: 'attempt-1',
      attemptNumber: 1,
      status: 'failed',
      startTime: '2026-01-28T10:30:00Z',
      endTime: '2026-01-28T10:45:00Z',
      duration: '15m 23s',
    },
    {
      id: 'attempt-2',
      attemptNumber: 2,
      status: 'running',
      startTime: '2026-01-29T14:00:00Z',
      endTime: null,
      duration: '22m 15s',
    },
  ],
  result: {
    status: 'success',
    data: {
      filesChanged: ['src/auth/jwt.ts', 'src/auth/middleware.ts', 'src/routes/auth.ts'],
      testsAdded: 12,
      testsPassed: 10,
      testsFailed: 2,
      coverage: '87.5%',
    },
    metadata: {
      executionTime: '1234ms',
      memoryUsed: '128MB',
    },
  },
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusBadgeVariant = (
  status: string
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'running':
      return 'warning';
    case 'failed':
      return 'error';
    case 'pending':
      return 'info';
    default:
      return 'default';
  }
};

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  isOpen,
  onClose,
  jobId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      setJobDetails(getMockJobDetails(jobId));
      setActiveTab('overview');
    }
  }, [isOpen, jobId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyResult = () => {
    if (jobDetails?.result) {
      navigator.clipboard.writeText(JSON.stringify(jobDetails.result, null, 2));
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  if (!isOpen || !jobDetails) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-eve-900 border-l border-eve-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-eve-700 bg-eve-800/50">
          <h2 className="text-lg font-semibold text-eve-100">Job Details</h2>
          <button
            onClick={onClose}
            className="text-eve-400 hover:text-eve-200 transition-colors"
            aria-label="Close drawer"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-eve-700 bg-eve-800/30 px-6">
          {(['overview', 'attempts', 'logs', 'result'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-eve-200'
                  : 'text-eve-400 hover:text-eve-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-eve-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-120px)] px-6 py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Subject */}
              <div>
                <h3 className="text-xl font-semibold text-eve-100 mb-2">
                  {jobDetails.subject}
                </h3>
                <p className="text-eve-300 text-sm leading-relaxed">
                  {jobDetails.description}
                </p>
              </div>

              {/* Status and Phase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-eve-400 mb-2">
                    Status
                  </label>
                  <Badge variant={getStatusBadgeVariant(jobDetails.status)}>
                    {jobDetails.status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-xs font-medium text-eve-400 mb-2">
                    Phase
                  </label>
                  <Badge variant={jobDetails.phase}>{jobDetails.phase}</Badge>
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-xs font-medium text-eve-400 mb-2">
                  Issue Type
                </label>
                <Badge variant="info">{jobDetails.issueType}</Badge>
              </div>

              {/* Git Metadata */}
              <div className="border-t border-eve-700 pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-eve-200">Git Metadata</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-eve-400">Branch</span>
                    <code className="text-xs text-eve-200 bg-eve-800 px-2 py-1 rounded">
                      {jobDetails.gitBranch}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-eve-400">Ref</span>
                    <code className="text-xs text-eve-200 bg-eve-800 px-2 py-1 rounded">
                      {jobDetails.gitRef}
                    </code>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-t border-eve-700 pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-eve-200">Timestamps</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-eve-400">Created</span>
                    <span className="text-xs text-eve-300">
                      {formatDate(jobDetails.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-eve-400">Updated</span>
                    <span className="text-xs text-eve-300">
                      {formatDate(jobDetails.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parent Epic */}
              {jobDetails.parentEpic && (
                <div className="border-t border-eve-700 pt-4">
                  <label className="block text-xs font-medium text-eve-400 mb-2">
                    Parent Epic
                  </label>
                  <button className="text-sm text-eve-500 hover:text-eve-400 transition-colors flex items-center gap-2">
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {jobDetails.parentEpic.title}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attempts' && (
            <div className="space-y-4">
              {jobDetails.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="border border-eve-700 rounded-lg p-4 bg-eve-800/30 hover:bg-eve-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-eve-200">
                        Attempt #{attempt.attemptNumber}
                      </span>
                      <Badge variant={getStatusBadgeVariant(attempt.status)}>
                        {attempt.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-eve-400">{attempt.duration}</span>
                  </div>
                  <div className="space-y-1 text-xs text-eve-400">
                    <div className="flex justify-between">
                      <span>Started</span>
                      <span className="text-eve-300">
                        {formatDate(attempt.startTime)}
                      </span>
                    </div>
                    {attempt.endTime && (
                      <div className="flex justify-between">
                        <span>Ended</span>
                        <span className="text-eve-300">
                          {formatDate(attempt.endTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-eve-800 mb-4">
                  <svg
                    className="w-8 h-8 text-eve-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-eve-300 text-sm">Logs will stream here...</p>
                <p className="text-eve-500 text-xs mt-2">
                  Log streaming functionality coming soon
                </p>
              </div>
            </div>
          )}

          {activeTab === 'result' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-eve-200">Job Result</h4>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyResult}
                  className="text-xs"
                >
                  {copiedResult ? (
                    <>
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
                      Copied
                    </>
                  ) : (
                    <>
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-eve-950 border border-eve-700 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono">
                  <code className="text-eve-300">
                    {jobDetails.result
                      ? JSON.stringify(jobDetails.result, null, 2)
                          .split('\n')
                          .map((line, i) => {
                            // Basic syntax highlighting
                            if (line.includes(':')) {
                              const [key, ...value] = line.split(':');
                              return (
                                <div key={i}>
                                  <span className="text-eve-500">{key}:</span>
                                  <span className="text-eve-300">
                                    {value.join(':')}
                                  </span>
                                </div>
                              );
                            }
                            return <div key={i}>{line}</div>;
                          })
                      : 'No result available'}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
