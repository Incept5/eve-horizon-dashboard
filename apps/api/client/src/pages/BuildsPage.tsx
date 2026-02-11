/**
 * BuildsPage - Project builds listing with expandable detail sections
 * Shows build cards with runs, artifacts, and logs for the current project.
 */

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { useProjectContext } from '../contexts/ProjectContext';
import {
  useBuilds,
  useBuildRuns,
  useBuildArtifacts,
  useBuildLogs,
  useStartBuild,
  useCancelBuild,
} from '../hooks';
import type { Build, BuildRun } from '../api/types';

// --- Helpers ---

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function truncateId(id: string, len = 8): string {
  return id.length > len ? id.slice(0, len) : id;
}

function getBuildStatusVariant(status?: string): BadgeVariant {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'warning';
    case 'pending':
      return 'default';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'info';
  }
}

function getRunStatusVariant(
  status: BuildRun['status']
): BadgeVariant {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'warning';
    case 'pending':
      return 'default';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'info';
  }
}

// --- Build Detail Panel ---

function BuildDetail({ buildId }: { buildId: string }) {
  const {
    data: runs,
    isLoading: runsLoading,
    error: runsError,
  } = useBuildRuns(buildId);
  const {
    data: artifacts,
    isLoading: artifactsLoading,
  } = useBuildArtifacts(buildId);
  const { data: logs, isLoading: logsLoading } = useBuildLogs(buildId);

  const startBuild = useStartBuild();
  const cancelBuild = useCancelBuild();

  const hasRunningBuild = runs?.some((r) => r.status === 'running');

  return (
    <div className="mt-4 space-y-4">
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => startBuild.mutate(buildId)}
          loading={startBuild.isPending}
          disabled={hasRunningBuild}
        >
          Start Build
        </Button>
        {hasRunningBuild && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => cancelBuild.mutate(buildId)}
            loading={cancelBuild.isPending}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Build Runs */}
      <div>
        <h4 className="text-sm font-semibold text-eve-200 mb-2">Build Runs</h4>
        {runsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-eve-500" />
          </div>
        ) : runsError ? (
          <p className="text-sm text-error-400">Failed to load runs.</p>
        ) : !runs || runs.length === 0 ? (
          <p className="text-sm text-eve-400">No runs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eve-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    ID
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Status
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Started
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-eve-700/50 hover:bg-eve-800/30"
                  >
                    <td className="py-2 px-3 text-xs text-eve-200 font-mono">
                      {truncateId(run.id)}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant={getRunStatusVariant(run.status)}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-eve-300">
                      {run.started_at
                        ? formatRelativeTime(run.started_at)
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-xs text-eve-300">
                      {run.completed_at
                        ? formatRelativeTime(run.completed_at)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Artifacts */}
      <div>
        <h4 className="text-sm font-semibold text-eve-200 mb-2">Artifacts</h4>
        {artifactsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-eve-500" />
          </div>
        ) : !artifacts || artifacts.length === 0 ? (
          <p className="text-sm text-eve-400">No artifacts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eve-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Service
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Image
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-eve-300">
                    Digest
                  </th>
                </tr>
              </thead>
              <tbody>
                {artifacts.map((artifact) => (
                  <tr
                    key={artifact.id}
                    className="border-b border-eve-700/50 hover:bg-eve-800/30"
                  >
                    <td className="py-2 px-3 text-xs text-white">
                      {artifact.service}
                    </td>
                    <td className="py-2 px-3 text-xs text-eve-200 font-mono">
                      {artifact.image}
                    </td>
                    <td className="py-2 px-3 text-xs text-eve-300 font-mono">
                      {artifact.digest
                        ? truncateId(artifact.digest, 16)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs */}
      <div>
        <h4 className="text-sm font-semibold text-eve-200 mb-2">Logs</h4>
        {logsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-eve-500" />
          </div>
        ) : !logs ? (
          <p className="text-sm text-eve-400">No logs available.</p>
        ) : (
          <pre className="p-4 bg-eve-950 rounded-lg border border-eve-700/50 text-xs text-eve-300 font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
            {typeof logs === 'string' ? logs : JSON.stringify(logs, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// --- Build Card ---

function BuildCard({ build }: { build: Build }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm text-white">
                {truncateId(build.id)}
              </span>
              {build.status && (
                <Badge variant={getBuildStatusVariant(build.status)}>
                  {build.status}
                </Badge>
              )}
            </div>
            <code className="text-xs text-eve-400 bg-eve-950 px-2 py-0.5 rounded font-mono">
              {build.ref}
            </code>
          </div>
          {build.created_at && (
            <span className="text-xs text-eve-400 flex-shrink-0">
              {formatRelativeTime(build.created_at)}
            </span>
          )}
        </div>

        {/* Services list */}
        {build.services && build.services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {build.services.map((svc) => (
              <Badge key={svc} variant="info">
                {svc}
              </Badge>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <div className="pt-3 border-t border-eve-700">
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
            Details
          </button>

          {isExpanded && <BuildDetail buildId={build.id} />}
        </div>
      </div>
    </Card>
  );
}

// --- Main Page ---

export function BuildsPage() {
  const { currentProject, isLoading: projectLoading } = useProjectContext();
  const projectId = currentProject ? String(currentProject.id) : undefined;
  const {
    data: builds,
    isLoading,
    error,
    refetch,
  } = useBuilds(projectId);

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
        <h1 className="text-3xl font-bold text-white">Builds</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to view builds.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Builds</h1>
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
      {!isLoading && !error && (!builds || builds.length === 0) && (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No builds found for this project.
          </p>
        </Card>
      )}

      {/* Build Cards */}
      {!isLoading && builds && builds.length > 0 && (
        <div className="grid gap-4">
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}
    </div>
  );
}
