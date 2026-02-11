/**
 * Build list, detail, runs, logs, artifacts, and mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBuilds,
  getBuild,
  getBuildRuns,
  getBuildLogs,
  getBuildArtifacts,
  startBuildRun,
  cancelBuild,
} from '../api';

/**
 * Hook to get builds for a project
 * @param projectId - The project ID to fetch builds for
 */
export function useBuilds(projectId: string | undefined) {
  return useQuery({
    queryKey: ['builds', projectId],
    queryFn: () => getBuilds(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get a single build by ID
 * @param buildId - The build ID to fetch
 */
export function useBuild(buildId: string | undefined) {
  return useQuery({
    queryKey: ['builds', 'detail', buildId],
    queryFn: () => getBuild(buildId!),
    enabled: !!buildId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get runs for a build
 * @param buildId - The build ID to fetch runs for
 */
export function useBuildRuns(buildId: string | undefined) {
  return useQuery({
    queryKey: ['builds', buildId, 'runs'],
    queryFn: () => getBuildRuns(buildId!),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get logs for a build
 * @param buildId - The build ID to fetch logs for
 */
export function useBuildLogs(buildId: string | undefined) {
  return useQuery({
    queryKey: ['builds', buildId, 'logs'],
    queryFn: () => getBuildLogs(buildId!),
    enabled: !!buildId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get artifacts produced by a build
 * @param buildId - The build ID to fetch artifacts for
 */
export function useBuildArtifacts(buildId: string | undefined) {
  return useQuery({
    queryKey: ['builds', buildId, 'artifacts'],
    queryFn: () => getBuildArtifacts(buildId!),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to start a new build run
 */
export function useStartBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (buildId: string) => startBuildRun(buildId),
    onSuccess: (_, buildId) => {
      queryClient.invalidateQueries({
        queryKey: ['builds', buildId, 'runs'],
      });
    },
  });
}

/**
 * Hook to cancel a running build
 */
export function useCancelBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (buildId: string) => cancelBuild(buildId),
    onSuccess: (_, buildId) => {
      queryClient.invalidateQueries({
        queryKey: ['builds', buildId, 'runs'],
      });
    },
  });
}
