/**
 * Builds API functions
 */

import { get, post } from './client';
import type { Build, BuildRun, BuildArtifact } from './types';

/**
 * Get builds for a project
 */
export async function getBuilds(projectId: string): Promise<Build[]> {
  return get<Build[]>(`/projects/${projectId}/builds`);
}

/**
 * Get a single build by ID
 */
export async function getBuild(buildId: string): Promise<Build> {
  return get<Build>(`/builds/${buildId}`);
}

/**
 * Start a new build run
 */
export async function startBuildRun(buildId: string): Promise<BuildRun> {
  return post<BuildRun>(`/builds/${buildId}/runs`);
}

/**
 * Get runs for a build
 */
export async function getBuildRuns(buildId: string): Promise<BuildRun[]> {
  return get<BuildRun[]>(`/builds/${buildId}/runs`);
}

/**
 * Get build logs, optionally for a specific run
 */
export async function getBuildLogs(buildId: string, runId?: string): Promise<string> {
  const params: Record<string, string> = {};
  if (runId) {
    params.run_id = runId;
  }

  return get<string>(`/builds/${buildId}/logs`, {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
}

/**
 * Get artifacts produced by a build
 */
export async function getBuildArtifacts(buildId: string): Promise<BuildArtifact[]> {
  return get<BuildArtifact[]>(`/builds/${buildId}/artifacts`);
}

/**
 * Cancel a running build
 */
export async function cancelBuild(buildId: string): Promise<void> {
  await post(`/builds/${buildId}/cancel`);
}
