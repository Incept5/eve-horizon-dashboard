/**
 * Admin API functions
 */

import { get, post } from './client';
import type { SystemHealth, InviteUserRequest, User } from './types';

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  return get<SystemHealth>('/system/health');
}

/**
 * Invite a user to the platform
 */
export async function inviteUser(data: InviteUserRequest): Promise<User> {
  return post<User>('/admin/users/invite', data);
}
