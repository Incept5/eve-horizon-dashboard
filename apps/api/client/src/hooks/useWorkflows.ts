/**
 * Workflow list, detail, and run mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkflows, getWorkflow, runWorkflow } from '../api';

/**
 * Hook to get workflows for a project
 * @param projectId - The project ID to fetch workflows for
 */
export function useWorkflows(projectId: string | undefined) {
  return useQuery({
    queryKey: ['workflows', projectId],
    queryFn: () => getWorkflows(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single workflow by name
 * @param projectId - The project ID the workflow belongs to
 * @param name - The workflow name
 */
export function useWorkflow(
  projectId: string | undefined,
  name: string | undefined
) {
  return useQuery({
    queryKey: ['workflows', projectId, name],
    queryFn: () => getWorkflow(projectId!, name!),
    enabled: !!projectId && !!name,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to run a workflow
 */
export function useRunWorkflow() {
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
    }) => runWorkflow(projectId, name, inputs),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['workflows', projectId],
      });
    },
  });
}
