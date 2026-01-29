/**
 * Pipeline API functions
 */

import { get, post } from './client';
import type { Pipeline, PipelineRun } from './types';

/**
 * Get pipelines for a project
 */
export async function getPipelines(projectId: string): Promise<Pipeline[]> {
  return get<Pipeline[]>(`/projects/${projectId}/pipelines`);
}

/**
 * Get single pipeline
 */
export async function getPipeline(
  projectId: string,
  pipelineName: string
): Promise<Pipeline> {
  return get<Pipeline>(`/projects/${projectId}/pipelines/${pipelineName}`);
}

/**
 * Run a pipeline
 */
export async function runPipeline(
  projectId: string,
  pipelineName: string,
  inputs?: Record<string, unknown>
): Promise<PipelineRun> {
  return post<PipelineRun>(
    `/projects/${projectId}/pipelines/${pipelineName}/runs`,
    inputs
  );
}

/**
 * Get pipeline runs
 */
export async function getPipelineRuns(
  projectId: string,
  pipelineName: string
): Promise<PipelineRun[]> {
  return get<PipelineRun[]>(
    `/projects/${projectId}/pipelines/${pipelineName}/runs`
  );
}

/**
 * Get single pipeline run
 */
export async function getPipelineRun(
  projectId: string,
  pipelineName: string,
  runId: string
): Promise<PipelineRun> {
  return get<PipelineRun>(
    `/projects/${projectId}/pipelines/${pipelineName}/runs/${runId}`
  );
}
