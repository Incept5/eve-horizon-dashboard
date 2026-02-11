/**
 * Projects API functions
 */

import { get, post, patch, del } from './client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddProjectMemberRequest,
  PaginatedResponse,
} from './types';

/**
 * List projects, optionally filtered by organization
 */
export async function listProjects(orgId?: string): Promise<Project[]> {
  const params: Record<string, string> = {};
  if (orgId) {
    params.org_id = orgId;
  }

  const response = await get<PaginatedResponse<Project> | Project[]>('/projects', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });

  // Handle both paginated and plain array responses
  if (Array.isArray(response)) {
    return response;
  }
  return response.data;
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project> {
  return get<Project>(`/projects/${projectId}`);
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectRequest): Promise<Project> {
  return post<Project>('/projects', data);
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
  return patch<Project>(`/projects/${projectId}`, data);
}

/**
 * Get members of a project
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return get<ProjectMember[]>(`/projects/${projectId}/members`);
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  projectId: string,
  data: AddProjectMemberRequest
): Promise<ProjectMember> {
  return post<ProjectMember>(`/projects/${projectId}/members`, data);
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await del(`/projects/${projectId}/members/${userId}`);
}

/**
 * Sync a project's manifest from its repository
 */
export async function syncProjectManifest(projectId: string): Promise<void> {
  await post(`/projects/${projectId}/sync`);
}
