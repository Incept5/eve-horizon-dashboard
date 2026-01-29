/**
 * System administration API functions
 */

import { get } from './client';
import type { Organization, Member, SystemEvent } from './types';

/**
 * Get all organizations
 */
export async function getOrgs(): Promise<Organization[]> {
  return get<Organization[]>('/system/orgs');
}

/**
 * Get members for a specific organization
 */
export async function getOrgMembers(orgId: number): Promise<Member[]> {
  return get<Member[]>(`/system/orgs/${orgId}/members`);
}

/**
 * Get system events
 */
export async function getSystemEvents(): Promise<SystemEvent[]> {
  return get<SystemEvent[]>('/system/events');
}
