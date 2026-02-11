/**
 * Environment list, detail, deployment, and deploy mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnvironments,
  getEnvironment,
  getDeployments,
  deployEnvironment,
} from '../api';

/**
 * Hook to get environments for a project
 * @param projectId - The project ID to fetch environments for
 */
export function useEnvironments(projectId: string | undefined) {
  return useQuery({
    queryKey: ['environments', projectId],
    queryFn: () => getEnvironments(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get a single environment by name
 * @param projectId - The project ID the environment belongs to
 * @param envName - The environment name
 */
export function useEnvironment(
  projectId: string | undefined,
  envName: string | undefined
) {
  return useQuery({
    queryKey: ['environments', projectId, envName],
    queryFn: () => getEnvironment(projectId!, envName!),
    enabled: !!projectId && !!envName,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get deployment history for an environment
 * @param projectId - The project ID
 * @param envName - The environment name
 */
export function useDeployments(
  projectId: string | undefined,
  envName: string | undefined
) {
  return useQuery({
    queryKey: ['deployments', projectId, envName],
    queryFn: () => getDeployments(projectId!, envName!),
    enabled: !!projectId && !!envName,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to deploy to an environment
 */
export function useDeploy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      envName,
      ref,
      inputs,
    }: {
      projectId: string;
      envName: string;
      ref: string;
      inputs?: Record<string, unknown>;
    }) => deployEnvironment(projectId, envName, ref, inputs),
    onSuccess: (_, { projectId, envName }) => {
      queryClient.invalidateQueries({
        queryKey: ['environments', projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['deployments', projectId, envName],
      });
    },
  });
}
