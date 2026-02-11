/**
 * Pipeline list, detail, runs, and run mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPipelines,
  getPipeline,
  getPipelineRuns,
  getPipelineRun,
  runPipeline,
} from '../api';

/**
 * Hook to get pipelines for a project
 * @param projectId - The project ID to fetch pipelines for
 */
export function usePipelines(projectId: string | undefined) {
  return useQuery({
    queryKey: ['pipelines', projectId],
    queryFn: () => getPipelines(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single pipeline by name
 * @param projectId - The project ID the pipeline belongs to
 * @param name - The pipeline name
 */
export function usePipeline(
  projectId: string | undefined,
  name: string | undefined
) {
  return useQuery({
    queryKey: ['pipelines', projectId, name],
    queryFn: () => getPipeline(projectId!, name!),
    enabled: !!projectId && !!name,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get runs for a pipeline
 * @param projectId - The project ID
 * @param name - The pipeline name
 */
export function usePipelineRuns(
  projectId: string | undefined,
  name: string | undefined
) {
  return useQuery({
    queryKey: ['pipelines', projectId, name, 'runs'],
    queryFn: () => getPipelineRuns(projectId!, name!),
    enabled: !!projectId && !!name,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get a single pipeline run
 * @param projectId - The project ID
 * @param name - The pipeline name
 * @param runId - The run ID
 */
export function usePipelineRun(
  projectId: string | undefined,
  name: string | undefined,
  runId: string | undefined
) {
  return useQuery({
    queryKey: ['pipelines', projectId, name, 'runs', runId],
    queryFn: () => getPipelineRun(projectId!, name!, runId!),
    enabled: !!projectId && !!name && !!runId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to run a pipeline
 */
export function useRunPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      name,
      inputs,
    }: {
      projectId: string;
      name: string;
      inputs?: Record<string, unknown>;
    }) => runPipeline(projectId, name, inputs),
    onSuccess: (_, { projectId, name }) => {
      queryClient.invalidateQueries({
        queryKey: ['pipelines', projectId, name, 'runs'],
      });
    },
  });
}
