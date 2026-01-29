/**
 * Jobs list, detail, and mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../api/client';
import type {
  Job,
  JobDetail,
  JobListResponse,
  CreateJobRequest,
  UpdateJobRequest,
} from '../api/types';

/**
 * Fetch all jobs for a project
 */
async function fetchJobs(projectId: number): Promise<Job[]> {
  const response = await get<JobListResponse>(`/projects/${projectId}/jobs`);
  return response.jobs;
}

/**
 * Fetch a single job by ID
 */
async function fetchJob(jobId: number): Promise<JobDetail> {
  return get<JobDetail>(`/jobs/${jobId}`);
}

/**
 * Create a new job
 */
async function createJob(data: CreateJobRequest): Promise<Job> {
  return post<Job>('/jobs', data);
}

/**
 * Update an existing job
 */
async function updateJob(
  jobId: number,
  data: UpdateJobRequest
): Promise<Job> {
  return patch<Job>(`/jobs/${jobId}`, data);
}

/**
 * Delete a job
 */
async function deleteJob(jobId: number): Promise<void> {
  return del<void>(`/jobs/${jobId}`);
}

/**
 * Hook to get list of jobs for a project
 * @param projectId - The project ID to fetch jobs for
 * @param enablePolling - Whether to poll for updates (default: false, set to true on board page)
 */
export function useJobs(projectId: number | undefined, enablePolling = false) {
  return useQuery({
    queryKey: ['jobs', projectId],
    queryFn: () => fetchJobs(projectId!),
    enabled: projectId !== undefined,
    staleTime: enablePolling ? 0 : 1000 * 60 * 2, // 2 minutes if not polling
    refetchInterval: enablePolling ? 5000 : false, // Poll every 5 seconds when enabled
  });
}

/**
 * Hook to get a single job by ID
 */
export function useJob(jobId: number | undefined) {
  return useQuery({
    queryKey: ['jobs', 'detail', jobId],
    queryFn: () => fetchJob(jobId!),
    enabled: jobId !== undefined,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to create a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: (newJob) => {
      // Invalidate jobs list for the project
      queryClient.invalidateQueries({
        queryKey: ['jobs', newJob.project_id],
      });
    },
  });
}

/**
 * Hook to update a job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: number; data: UpdateJobRequest }) =>
      updateJob(jobId, data),
    onSuccess: (updatedJob) => {
      // Update the job detail cache
      queryClient.setQueryData(['jobs', 'detail', updatedJob.id], updatedJob);

      // Invalidate jobs list for the project
      queryClient.invalidateQueries({
        queryKey: ['jobs', updatedJob.project_id],
      });
    },
  });
}

/**
 * Hook to delete a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (_, jobId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: ['jobs', 'detail', jobId],
      });

      // Invalidate all jobs lists (we don't know which project it belonged to)
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      });
    },
  });
}
