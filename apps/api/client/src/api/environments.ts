/**
 * Environments API functions
 */

import { get, post } from './client';
import type { Environment, Deployment } from './types';

/**
 * Get environments for a project
 */
export async function getEnvironments(projectId: string): Promise<Environment[]> {
  return get<Environment[]>(`/projects/${projectId}/environments`);
}

/**
 * Get single environment
 */
export async function getEnvironment(projectId: string, envName: string): Promise<Environment> {
  return get<Environment>(`/projects/${projectId}/environments/${envName}`);
}

/**
 * Deploy to an environment
 */
export async function deployEnvironment(
  projectId: string,
  envName: string,
  ref: string,
  inputs?: Record<string, unknown>
): Promise<Deployment> {
  return post<Deployment>(`/projects/${projectId}/environments/${envName}/deploy`, {
    ref,
    inputs,
  });
}

/**
 * Get deployment history
 */
export async function getDeployments(projectId: string, envName: string): Promise<Deployment[]> {
  return get<Deployment[]>(`/projects/${projectId}/environments/${envName}/deployments`);
}
