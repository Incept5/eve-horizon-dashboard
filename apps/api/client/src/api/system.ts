/**
 * System administration API functions
 *
 * Legacy module — retained for backward compatibility with SystemPage.
 * New code should use the dedicated orgs.ts, events.ts, and admin.ts modules.
 */

import { get } from './client';
import type { Organization, Member, SystemEvent } from './types';

/**
 * Get all organizations (legacy system endpoint)
 * @deprecated Use listOrgs() from orgs.ts for the canonical /orgs endpoint
 */
export async function getOrgs(): Promise<Organization[]> {
  return get<Organization[]>('/system/orgs');
}

/**
 * Get members for a specific organization (legacy system endpoint)
 * @deprecated Use listOrgMembers() from orgs.ts for the canonical /orgs/:id/members endpoint
 */
export async function getOrgMembers(orgId: number): Promise<Member[]> {
  return get<Member[]>(`/system/orgs/${orgId}/members`);
}

/**
 * Get system events
 * @deprecated Use getProjectEvents() from events.ts for project-scoped events
 */
export async function getSystemEvents(): Promise<SystemEvent[]> {
  return get<SystemEvent[]>('/system/events');
}
