/**
 * Project admin hooks for members, creation, and manifest sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectMembers,
  createProject,
  updateProject,
  addProjectMember,
  removeProjectMember,
  syncProjectManifest,
} from '../api';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
} from '../api';

/**
 * Hook to get members of a project
 * @param projectId - The project ID to fetch members for
 */
export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => getProjectMembers(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectRequest;
    }) => updateProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

/**
 * Hook to add a member to a project
 * @param projectId - The project ID to add a member to
 */
export function useAddProjectMember(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddProjectMemberRequest) =>
      addProjectMember(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'members'],
      });
    },
  });
}

/**
 * Hook to remove a member from a project
 * @param projectId - The project ID to remove a member from
 */
export function useRemoveProjectMember(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'members'],
      });
    },
  });
}

/**
 * Hook to sync a project's manifest from its repository
 */
export function useSyncManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => syncProjectManifest(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
