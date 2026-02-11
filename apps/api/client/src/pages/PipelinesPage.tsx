import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProjectContext } from '../contexts/ProjectContext';
import { usePipelines, usePipelineRuns, useRunPipeline } from '../hooks';
import type { Pipeline, PipelineRun, PipelineRunStep } from '../api/types';

// Run Pipeline Modal Component
function RunPipelineModal({
  pipelineName,
  onClose,
  onRun,
  isRunning,
}: {
  pipelineName: string;
  onClose: () => void;
  onRun: (inputs: string) => void;
  isRunning: boolean;
}) {
  const [inputs, setInputs] = useState('{}');
  const [isValidJson, setIsValidJson] = useState(true);

  const handleInputChange = (value: string) => {
    setInputs(value);
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleRun = () => {
    if (isValidJson) {
      onRun(inputs);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-eve-900 border border-eve-700 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Run Pipeline: {pipelineName}
          </h2>
          <button
            onClick={onClose}
            className="text-eve-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Optional Inputs (JSON)
            </label>
            <textarea
              value={inputs}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full px-4 py-3 bg-eve-950 border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-eve-600 ${
                isValidJson ? 'border-eve-700' : 'border-error-600'
              }`}
              rows={6}
              placeholder='{"key": "value"}'
            />
            {!isValidJson && (
              <p className="text-error-400 text-sm mt-1">Invalid JSON format</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleRun} disabled={!isValidJson || isRunning} loading={isRunning} fullWidth>
              Run Pipeline
            </Button>
            <Button onClick={onClose} variant="ghost" fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pipeline Card Component
function PipelineCard({
  pipeline,
  projectId,
}: {
  pipeline: Pipeline;
  projectId: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const { data: runs = [], isLoading: runsLoading } = usePipelineRuns(
    isExpanded ? projectId : undefined,
    isExpanded ? pipeline.name : undefined
  );

  const runPipelineMutation = useRunPipeline();

  const handleRunPipeline = (inputs: string) => {
    try {
      const parsed = JSON.parse(inputs);
      runPipelineMutation.mutate(
        { projectId, name: pipeline.name, inputs: parsed },
        {
          onSuccess: () => {
            setShowRunModal(false);
          },
        }
      );
    } catch {
      // JSON parse error handled by modal validation
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'info';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <>
      <Card>
        <div className="space-y-4">
          {/* Pipeline Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {pipeline.name}
                </h3>
              </div>
              <p className="text-sm text-eve-400">{pipeline.description || 'No description'}</p>
              {pipeline.triggers && pipeline.triggers.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {pipeline.triggers.map((trigger) => (
                    <Badge key={trigger} variant="default">{trigger}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowRunModal(true)}
              size="sm"
              className="flex-shrink-0"
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run
            </Button>
          </div>

          {/* Steps overview */}
          {pipeline.steps && pipeline.steps.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-eve-400">
              <span>{pipeline.steps.length} steps:</span>
              <div className="flex items-center gap-1">
                {pipeline.steps.map((step, idx) => (
                  <span key={idx}>
                    <span className="text-eve-300">{step.name}</span>
                    {idx < pipeline.steps.length - 1 && <span className="text-eve-600 mx-1">&rarr;</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Runs Section */}
          <div className="pt-4 border-t border-eve-700">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-eve-200 hover:text-white transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Recent Runs
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {runsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-eve-500"></div>
                  </div>
                )}

                {!runsLoading && runs.length === 0 && (
                  <p className="text-sm text-eve-400 text-center py-4">No runs yet.</p>
                )}

                {!runsLoading && runs.map((run: PipelineRun) => (
                  <div
                    key={run.id}
                    className="bg-eve-950/50 rounded-lg border border-eve-700/50 p-4 space-y-3"
                  >
                    {/* Run Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusBadgeVariant(run.status)}>
                          {run.status}
                        </Badge>
                        <span className="text-sm text-eve-300 font-mono">
                          {run.id}
                        </span>
                      </div>
                      <div className="text-sm text-eve-400">
                        {run.started_at && run.completed_at
                          ? formatDuration(run.started_at, run.completed_at)
                          : run.started_at
                          ? 'Running...'
                          : 'Pending'}
                      </div>
                    </div>

                    {/* Run Timestamps */}
                    {run.started_at && (
                      <div className="flex items-center gap-4 text-xs text-eve-400">
                        <span>Started {formatRelativeTime(run.started_at)}</span>
                        {run.completed_at && (
                          <>
                            <span>&bull;</span>
                            <span>
                              Completed {formatRelativeTime(run.completed_at)}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Steps */}
                    {run.steps && run.steps.length > 0 && (
                      <div className="space-y-2">
                        {run.steps.map((step: PipelineRunStep, idx: number) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              selectedStep === `${run.id}-${step.name}`
                                ? 'bg-eve-800/50'
                                : 'hover:bg-eve-900/30'
                            }`}
                          >
                            {/* Step Status Icon */}
                            <div className="flex-shrink-0">
                              {step.status === 'success' && (
                                <svg
                                  className="w-5 h-5 text-success-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {step.status === 'failed' && (
                                <svg
                                  className="w-5 h-5 text-error-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {step.status === 'running' && (
                                <svg
                                  className="w-5 h-5 text-warning-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              )}
                              {step.status !== 'success' &&
                                step.status !== 'failed' &&
                                step.status !== 'running' && (
                                <svg
                                  className="w-5 h-5 text-eve-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Step Info */}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() =>
                                  setSelectedStep(
                                    selectedStep === `${run.id}-${step.name}`
                                      ? null
                                      : `${run.id}-${step.name}`
                                  )
                                }
                                className="text-sm text-white hover:text-eve-100 transition-colors text-left"
                              >
                                {step.name}
                              </button>
                              {step.started_at && (
                                <div className="text-xs text-eve-500 mt-0.5">
                                  {step.completed_at
                                    ? formatDuration(
                                        step.started_at,
                                        step.completed_at
                                      )
                                    : 'Running...'}
                                </div>
                              )}
                            </div>

                            {/* View Logs Indicator */}
                            {selectedStep === `${run.id}-${step.name}` && (
                              <svg
                                className="w-4 h-4 text-eve-400 flex-shrink-0"
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
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step Logs / Error */}
                    {selectedStep && selectedStep.startsWith(run.id) && (
                      <div className="mt-3 p-3 bg-eve-950 rounded border border-eve-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-eve-300">
                            Step Details
                          </span>
                          <span className="text-xs text-eve-500 font-mono">
                            {selectedStep.replace(`${run.id}-`, '')}
                          </span>
                        </div>
                        {run.steps.find(
                          (s: PipelineRunStep) => `${run.id}-${s.name}` === selectedStep
                        )?.error ? (
                          <pre className="text-xs text-error-400 font-mono overflow-x-auto">
                            {run.steps.find(
                              (s: PipelineRunStep) => `${run.id}-${s.name}` === selectedStep
                            )?.error}
                          </pre>
                        ) : (
                          <pre className="text-xs text-eve-400 font-mono overflow-x-auto">
                            Log output for this step will appear here...
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {showRunModal && (
        <RunPipelineModal
          pipelineName={pipeline.name}
          onClose={() => setShowRunModal(false)}
          onRun={handleRunPipeline}
          isRunning={runPipelineMutation.isPending}
        />
      )}
    </>
  );
}

// Main Pipelines Page Component
export function PipelinesPage() {
  const { currentProject, isLoading: projectLoading } = useProjectContext();
  const projectId = currentProject?.id?.toString();
  const {
    data: pipelines = [],
    isLoading,
    error,
  } = usePipelines(projectId);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Pipelines</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view pipelines.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Pipelines</h1>
        <div className="text-sm text-eve-400">
          Project: <span className="text-white">{currentProject.name}</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">
            {error instanceof Error ? error.message : 'Failed to load pipelines'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && pipelines.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-eve-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              No pipelines configured
            </h3>
            <p className="text-eve-400">
              Configure pipelines in your manifest file to see them here.
            </p>
          </div>
        </Card>
      )}

      {/* Pipelines List */}
      {!isLoading && !error && pipelines.length > 0 && (
        <div className="grid gap-4">
          {pipelines.map((pipeline: Pipeline) => (
            <PipelineCard
              key={pipeline.name}
              pipeline={pipeline}
              projectId={projectId!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
