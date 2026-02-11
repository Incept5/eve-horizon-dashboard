import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useProjectContext } from '../contexts/ProjectContext';
import { useEnvironments, useDeployments, useDeploy } from '../hooks';
import type { Environment, Deployment } from '../api/types';

function DeployModal({
  environment,
  projectId,
  onClose,
}: {
  environment: Environment;
  projectId: string;
  onClose: () => void;
}) {
  const [ref, setRef] = useState('');
  const [inputs, setInputs] = useState('');
  const deployMutation = useDeploy();

  const handleDeploy = () => {
    let parsedInputs: Record<string, unknown> | undefined;
    if (inputs.trim()) {
      try {
        parsedInputs = JSON.parse(inputs);
      } catch {
        return; // Invalid JSON, don't submit
      }
    }
    deployMutation.mutate(
      { projectId, envName: environment.name, ref, inputs: parsedInputs },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-eve-900 rounded-lg border border-eve-700 max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b border-eve-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Deploy to {environment.name}
            </h2>
            <button
              onClick={onClose}
              className="text-eve-400 hover:text-eve-200 transition-colors"
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
        </div>

        <div className="p-6 space-y-4">
          {deployMutation.error && (
            <div className="bg-error-900/20 border border-error-700 rounded-lg p-3">
              <p className="text-error-300 text-sm">
                {deployMutation.error instanceof Error
                  ? deployMutation.error.message
                  : 'Deploy failed'}
              </p>
            </div>
          )}

          <Input
            label="Git Ref (branch or SHA)"
            placeholder="main, feature-branch, or commit SHA"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            fullWidth
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Optional Inputs (JSON)
            </label>
            <textarea
              className="w-full px-4 py-2 bg-eve-900 border border-eve-700 hover:border-eve-600 rounded-lg text-white placeholder-eve-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eve-600 focus:border-transparent min-h-[120px] font-mono text-sm"
              placeholder='{"key": "value"}'
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-eve-700 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={deployMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDeploy}
            disabled={!ref || deployMutation.isPending}
            loading={deployMutation.isPending}
          >
            Deploy
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'deploying':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
}

function getDeploymentStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'success':
      return 'success';
    case 'deploying':
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function EnvironmentsPage() {
  const { currentProject, isLoading: projectLoading } = useProjectContext();
  const projectId = currentProject?.id?.toString();

  const {
    data: environments = [],
    isLoading: envsLoading,
    error: envsError,
  } = useEnvironments(projectId);

  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [expandedEnv, setExpandedEnv] = useState<string | null>(null);

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view environments.
          </p>
        </Card>
      </div>
    );
  }

  if (envsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
        </div>
      </div>
    );
  }

  if (envsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">
            {envsError instanceof Error ? envsError.message : 'Failed to load environments'}
          </p>
        </div>
      </div>
    );
  }

  if (environments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            No environments configured for this project.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Environments</h1>

      {/* Environment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {environments.map((env: Environment) => (
          <Card key={env.name}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {env.name}
                  </h3>
                </div>
                <Badge variant={getStatusBadgeVariant(env.status)}>
                  {env.status}
                </Badge>
              </div>

              <div className="space-y-2">
                {env.current_ref && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-eve-400">Current Ref:</span>
                    <code className="text-eve-200 bg-eve-950 px-2 py-0.5 rounded font-mono text-xs">
                      {env.current_ref}
                    </code>
                  </div>
                )}

                {env.current_version && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-eve-400">Version:</span>
                    <span className="text-eve-200 text-xs">{env.current_version}</span>
                  </div>
                )}

                {env.last_deployed_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-eve-400">Last Deploy:</span>
                    <span className="text-eve-300">
                      {formatTimestamp(env.last_deployed_at)}
                    </span>
                  </div>
                )}

                {env.url && (
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5 text-eve-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <a
                      href={env.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-eve-300 hover:text-eve-200 truncate"
                    >
                      {env.url}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-eve-700 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setSelectedEnv(env)}
                >
                  Deploy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedEnv(expandedEnv === env.name ? null : env.name)
                  }
                >
                  History
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Deployment History for expanded environment */}
      {expandedEnv && (
        <DeploymentHistory projectId={projectId!} envName={expandedEnv} />
      )}

      {/* Deploy Modal */}
      {selectedEnv && projectId && (
        <DeployModal
          environment={selectedEnv}
          projectId={projectId}
          onClose={() => setSelectedEnv(null)}
        />
      )}
    </div>
  );
}

function DeploymentHistory({
  projectId,
  envName,
}: {
  projectId: string;
  envName: string;
}) {
  const { data: deployments = [], isLoading, error } = useDeployments(projectId, envName);

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Deployment History: <span className="capitalize">{envName}</span>
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-eve-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-error-900/20 border border-error-700 rounded-lg p-3">
            <p className="text-error-300 text-sm">
              {error instanceof Error ? error.message : 'Failed to load deployments'}
            </p>
          </div>
        )}

        {!isLoading && !error && deployments.length === 0 && (
          <p className="text-eve-400 text-sm text-center py-8">
            No deployments yet.
          </p>
        )}

        {!isLoading && !error && deployments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eve-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-eve-400">
                    Environment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-eve-400">
                    Ref
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-eve-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-eve-400">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-eve-400">
                    Deployed By
                  </th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((deployment: Deployment) => (
                  <tr
                    key={deployment.id}
                    className="border-b border-eve-800 hover:bg-eve-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-eve-200 capitalize">
                      {deployment.environment}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <code className="text-eve-200 bg-eve-950 px-2 py-0.5 rounded font-mono text-xs">
                        {deployment.ref}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge
                        variant={getDeploymentStatusBadgeVariant(deployment.status)}
                      >
                        {deployment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-eve-300">
                      {deployment.started_at
                        ? formatTimestamp(deployment.started_at)
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-eve-300">
                      {deployment.deployed_by || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
