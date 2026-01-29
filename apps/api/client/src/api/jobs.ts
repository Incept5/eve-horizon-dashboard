/**
 * Jobs API functions
 */

import { get, post, patch } from './client';
import type {
  Job,
  CreateJobRequest,
  JobAttempt,
  JobTreeNode,
  JobResult,
} from './types';

/**
 * Get jobs for a project with optional filters
 */
export async function getJobs(
  projectId: string,
  filters?: {
    phase?: string;
    issue_type?: string;
    parent_id?: string;
  }
): Promise<Job[]> {
  const params: Record<string, string> = {};
  if (filters?.phase) {
    params.phase = filters.phase;
  }
  if (filters?.issue_type) {
    params.issue_type = filters.issue_type;
  }
  if (filters?.parent_id) {
    params.parent_id = filters.parent_id;
  }

  return get<Job[]>(`/projects/${projectId}/jobs`, {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
}

/**
 * Get single job details
 */
export async function getJob(jobId: string): Promise<Job> {
  return get<Job>(`/jobs/${jobId}`);
}

/**
 * Create a new job
 */
export async function createJob(
  projectId: string,
  data: CreateJobRequest
): Promise<Job> {
  return post<Job>(`/projects/${projectId}/jobs`, data);
}

/**
 * Update job (for phase changes, etc)
 */
export async function updateJob(
  jobId: string,
  data: Partial<Job>
): Promise<Job> {
  return patch<Job>(`/jobs/${jobId}`, data);
}

/**
 * Get job tree (for epics)
 */
export async function getJobTree(jobId: string): Promise<JobTreeNode> {
  return get<JobTreeNode>(`/jobs/${jobId}/tree`);
}

/**
 * Get job attempts
 */
export async function getJobAttempts(jobId: string): Promise<JobAttempt[]> {
  return get<JobAttempt[]>(`/jobs/${jobId}/attempts`);
}

/**
 * Get job result
 */
export async function getJobResult(jobId: string): Promise<JobResult> {
  return get<JobResult>(`/jobs/${jobId}/result`);
}

/**
 * Submit job for review
 */
export async function submitJob(jobId: string): Promise<void> {
  await post(`/jobs/${jobId}/submit`);
}

/**
 * Approve job
 */
export async function approveJob(jobId: string): Promise<void> {
  await post(`/jobs/${jobId}/approve`);
}

/**
 * Reject job with optional reason
 */
export async function rejectJob(jobId: string, reason?: string): Promise<void> {
  await post(`/jobs/${jobId}/reject`, reason ? { reason } : undefined);
}
