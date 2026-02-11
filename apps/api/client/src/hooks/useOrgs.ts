/**
 * Organization list, detail, member, and mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listOrgs,
  getOrg,
  createOrg,
  updateOrg,
  deleteOrg,
  listOrgMembers,
  addOrgMember,
  removeOrgMember,
} from '../api';
import type {
  CreateOrgRequest,
  UpdateOrgRequest,
  AddOrgMemberRequest,
} from '../api';

/**
 * Hook to get list of all organizations
 */
export function useOrgs() {
  return useQuery({
    queryKey: ['orgs'],
    queryFn: listOrgs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single organization by ID
 * @param orgId - The organization ID to fetch
 */
export function useOrg(orgId: string | undefined) {
  return useQuery({
    queryKey: ['orgs', orgId],
    queryFn: () => getOrg(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get members of an organization
 * @param orgId - The organization ID to fetch members for
 */
export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ['orgs', orgId, 'members'],
    queryFn: () => listOrgMembers(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new organization
 */
export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgRequest) => createOrg(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
    },
  });
}

/**
 * Hook to update an organization
 */
export function useUpdateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateOrgRequest }) =>
      updateOrg(orgId, data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      queryClient.invalidateQueries({ queryKey: ['orgs', orgId] });
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => deleteOrg(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
    },
  });
}

/**
 * Hook to add a member to an organization
 * @param orgId - The organization ID to add a member to
 */
export function useAddOrgMember(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddOrgMemberRequest) => addOrgMember(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orgs', orgId, 'members'],
      });
    },
  });
}

/**
 * Hook to remove a member from an organization
 * @param orgId - The organization ID to remove a member from
 */
export function useRemoveOrgMember(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeOrgMember(orgId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orgs', orgId, 'members'],
      });
    },
  });
}
