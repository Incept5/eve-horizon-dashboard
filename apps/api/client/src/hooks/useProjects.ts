/**
 * Projects list and detail hooks
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../api/client';
import type { Project, ProjectListResponse } from '../api/types';

/**
 * Fetch all projects
 */
async function fetchProjects(): Promise<Project[]> {
  const response = await get<ProjectListResponse>('/projects');
  return response.projects;
}

/**
 * Fetch a single project by ID
 */
async function fetchProject(projectId: number): Promise<Project> {
  return get<Project>(`/projects/${projectId}`);
}

/**
 * Hook to get list of all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single project by ID
 */
export function useProject(projectId: number | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: projectId !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
