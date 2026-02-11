/**
 * System health, harness, and admin mutation hooks
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { getSystemHealth, getHarnesses, getHarness, inviteUser } from '../api';
import type { InviteUserRequest } from '../api';

/**
 * Hook to get system health status
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: getSystemHealth,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get all available harnesses
 */
export function useHarnesses() {
  return useQuery({
    queryKey: ['harnesses'],
    queryFn: getHarnesses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single harness by name
 * @param name - The harness name to fetch
 */
export function useHarness(name: string | undefined) {
  return useQuery({
    queryKey: ['harnesses', name],
    queryFn: () => getHarness(name!),
    enabled: !!name,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to invite a user to the platform
 */
export function useInviteUser() {
  return useMutation({
    mutationFn: (data: InviteUserRequest) => inviteUser(data),
  });
}
