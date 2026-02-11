/**
 * Organizations API functions
 */

import { get, post, patch, del } from './client';
import type {
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
  OrgMember,
  AddOrgMemberRequest,
  PaginatedResponse,
} from './types';

/**
 * List all organizations
 */
export async function listOrgs(): Promise<Organization[]> {
  const response = await get<PaginatedResponse<Organization> | Organization[]>('/orgs');

  // Handle both paginated and plain array responses
  if (Array.isArray(response)) {
    return response;
  }
  return response.data;
}

/**
 * Get a single organization by ID
 */
export async function getOrg(orgId: string): Promise<Organization> {
  return get<Organization>(`/orgs/${orgId}`);
}

/**
 * Create a new organization
 */
export async function createOrg(data: CreateOrgRequest): Promise<Organization> {
  return post<Organization>('/orgs', data);
}

/**
 * Update an organization
 */
export async function updateOrg(orgId: string, data: UpdateOrgRequest): Promise<Organization> {
  return patch<Organization>(`/orgs/${orgId}`, data);
}

/**
 * Delete an organization
 */
export async function deleteOrg(orgId: string): Promise<void> {
  await del(`/orgs/${orgId}`);
}

/**
 * List members of an organization
 */
export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  return get<OrgMember[]>(`/orgs/${orgId}/members`);
}

/**
 * Add a member to an organization
 */
export async function addOrgMember(orgId: string, data: AddOrgMemberRequest): Promise<OrgMember> {
  return post<OrgMember>(`/orgs/${orgId}/members`, data);
}

/**
 * Remove a member from an organization
 */
export async function removeOrgMember(orgId: string, userId: string): Promise<void> {
  await del(`/orgs/${orgId}/members/${userId}`);
}
