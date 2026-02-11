/**
 * Workflows API functions
 */

import { get, post } from './client';
import type { Workflow, WorkflowRun } from './types';

/**
 * Get workflows for a project
 */
export async function getWorkflows(projectId: string): Promise<Workflow[]> {
  return get<Workflow[]>(`/projects/${projectId}/workflows`);
}

/**
 * Get a single workflow by name
 */
export async function getWorkflow(projectId: string, name: string): Promise<Workflow> {
  return get<Workflow>(`/projects/${projectId}/workflows/${name}`);
}

/**
 * Run a workflow with optional inputs
 */
export async function runWorkflow(
  projectId: string,
  name: string,
  inputs?: Record<string, unknown>
): Promise<WorkflowRun> {
  return post<WorkflowRun>(
    `/projects/${projectId}/workflows/${name}/run`,
    inputs ? { inputs } : undefined
  );
}
