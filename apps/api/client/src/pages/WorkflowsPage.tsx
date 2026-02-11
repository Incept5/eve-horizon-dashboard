/**
 * WorkflowsPage - Project workflows listing with run modal
 * Shows workflow cards with step previews and a modal to trigger runs.
 */

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { useProjectContext } from '../contexts/ProjectContext';
import { useWorkflows, useRunWorkflow } from '../hooks';
import type { Workflow } from '../api/types';

// --- Run Workflow Modal ---

function RunWorkflowModal({
  workflow,
  projectId,
  onClose,
}: {
  workflow: Workflow;
  projectId: string;
  onClose: () => void;
}) {
  const [inputs, setInputs] = useState('{}');
  const [isValidJson, setIsValidJson] = useState(true);
  const runWorkflow = useRunWorkflow();

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
    if (!isValidJson) return;

    let parsedInputs: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(inputs);
      if (Object.keys(parsed).length > 0) {
        parsedInputs = parsed;
      }
    } catch {
      return;
    }

    runWorkflow.mutate(
      { projectId, name: workflow.name, inputs: parsedInputs },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-eve-900 border border-eve-700 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Run Workflow: {workflow.name}
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

        {workflow.description && (
          <p className="text-sm text-eve-400 mb-4">{workflow.description}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Inputs (JSON)
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
              <p className="text-error-400 text-sm mt-1">
                Invalid JSON format
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleRun}
              disabled={!isValidJson}
              loading={runWorkflow.isPending}
              fullWidth
            >
              Run
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

// --- Workflow Card ---

function WorkflowCard({
  workflow,
  projectId,
}: {
  workflow: Workflow;
  projectId: string;
}) {
  const [showRunModal, setShowRunModal] = useState(false);

  return (
    <>
      <Card>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white">
                {workflow.name}
              </h3>
              {workflow.description && (
                <p className="text-sm text-eve-400 mt-1">
                  {workflow.description}
                </p>
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

          {/* Steps preview */}
          {workflow.steps && workflow.steps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {workflow.steps.map((step, idx) => (
                <Badge key={idx} variant="default">
                  {step.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Triggers */}
          {workflow.triggers && workflow.triggers.length > 0 && (
            <div className="pt-3 border-t border-eve-700">
              <span className="text-xs text-eve-400">Triggers: </span>
              {workflow.triggers.map((trigger, idx) => (
                <Badge key={idx} variant="info" className="ml-1">
                  {trigger}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showRunModal && (
        <RunWorkflowModal
          workflow={workflow}
          projectId={projectId}
          onClose={() => setShowRunModal(false)}
        />
      )}
    </>
  );
}

// --- Main Page ---

export function WorkflowsPage() {
  const { currentProject, isLoading: projectLoading } = useProjectContext();
  const projectId = currentProject ? String(currentProject.id) : undefined;
  const {
    data: workflows,
    isLoading,
    error,
    refetch,
  } = useWorkflows(projectId);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Workflows</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view workflows.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Workflows</h1>
        <div className="text-sm text-eve-400">
          Project: <span className="text-white">{currentProject.name}</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <ErrorState
          error={error as Error}
          onRetry={() => refetch()}
          variant="compact"
        />
      )}

      {/* Empty */}
      {!isLoading && !error && (!workflows || workflows.length === 0) && (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">
              No workflows configured
            </h3>
            <p className="text-eve-400">
              Configure workflows in your manifest file to see them here.
            </p>
          </div>
        </Card>
      )}

      {/* Workflow Cards */}
      {!isLoading && workflows && workflows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.name}
              workflow={workflow}
              projectId={projectId!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
