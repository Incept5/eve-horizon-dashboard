/**
 * RoleContext - Role-based access control state management
 * Computes the current user's effective permissions based on platform admin status,
 * org membership, and project membership for the currently selected project.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import { useProjectContext } from './ProjectContext';
import { listOrgMembers } from '../api/orgs';
import { getProjectMembers } from '../api/projects';
import type { OrgMember, ProjectMember } from '../api/types';

type OrgRole = 'owner' | 'admin' | 'member';
type ProjectRole = 'owner' | 'admin' | 'member';

interface RoleContextValue {
  isPlatformAdmin: boolean;
  isOrgAdmin: boolean;
  isProjectAdmin: boolean;
  canManageOrg: boolean;
  canManageProject: boolean;
  orgRole: OrgRole | null;
  projectRole: ProjectRole | null;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

/**
 * Default value used while loading or when no project is selected.
 * Most restrictive permissions to avoid flash-of-privilege.
 */
const RESTRICTIVE_DEFAULTS: Omit<RoleContextValue, 'isPlatformAdmin' | 'isLoading'> = {
  isOrgAdmin: false,
  isProjectAdmin: false,
  canManageOrg: false,
  canManageProject: false,
  orgRole: null,
  projectRole: null,
};

interface RoleProviderProps {
  children: ReactNode;
}

/**
 * Find the current user in an org member list
 */
function findOrgMembership(members: OrgMember[], userId: number): OrgMember | undefined {
  const userIdStr = String(userId);
  return members.find((m) => m.user_id === userIdStr);
}

/**
 * Find the current user in a project member list
 */
function findProjectMembership(members: ProjectMember[], userId: number): ProjectMember | undefined {
  const userIdStr = String(userId);
  return members.find((m) => m.user_id === userIdStr);
}

/**
 * Check whether a role grants admin-level authority
 */
function isAdminRole(role: string): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * RoleProvider component
 * Fetches org and project memberships for the current user, then derives
 * a set of boolean permissions that the rest of the application can consume.
 */
export function RoleProvider({ children }: RoleProviderProps) {
  const { user, isAuthenticated, isAdmin } = useAuthContext();
  const { currentProject } = useProjectContext();

  const orgId = currentProject ? String(currentProject.org_id) : undefined;
  const projectId = currentProject ? String(currentProject.id) : undefined;
  const shouldFetch = isAuthenticated && !!currentProject;

  /**
   * Fetch org members for the current project's organization
   */
  const {
    data: orgMembers,
    isLoading: isOrgLoading,
  } = useQuery({
    queryKey: ['orgMembers', orgId],
    queryFn: () => listOrgMembers(orgId!),
    enabled: shouldFetch && !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Fetch project members for the current project
   */
  const {
    data: projectMembers,
    isLoading: isProjectLoading,
  } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => getProjectMembers(projectId!),
    enabled: shouldFetch && !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Derive effective permissions from memberships and platform admin status
   */
  const value = useMemo<RoleContextValue>(() => {
    const isPlatformAdmin = isAdmin;
    const isLoading = shouldFetch && (isOrgLoading || isProjectLoading);

    // Platform admins bypass all membership checks
    if (isPlatformAdmin) {
      return {
        isPlatformAdmin: true,
        isOrgAdmin: true,
        isProjectAdmin: true,
        canManageOrg: true,
        canManageProject: true,
        orgRole: null,
        projectRole: null,
        isLoading: false,
      };
    }

    // While loading, return most restrictive permissions
    if (isLoading || !user) {
      return {
        isPlatformAdmin: false,
        ...RESTRICTIVE_DEFAULTS,
        isLoading,
      };
    }

    // Resolve org role from membership list
    const orgMembership = orgMembers ? findOrgMembership(orgMembers, user.id) : undefined;
    const orgRole: OrgRole | null = orgMembership?.role ?? null;
    const isOrgAdmin = orgRole !== null && isAdminRole(orgRole);

    // Resolve project role from membership list
    const projectMembership = projectMembers ? findProjectMembership(projectMembers, user.id) : undefined;
    const projectRole: ProjectRole | null = projectMembership?.role ?? null;
    const isProjectAdmin = projectRole !== null && isAdminRole(projectRole);

    return {
      isPlatformAdmin: false,
      isOrgAdmin,
      isProjectAdmin,
      canManageOrg: isOrgAdmin,
      canManageProject: isOrgAdmin || isProjectAdmin,
      orgRole,
      projectRole,
      isLoading: false,
    };
  }, [isAdmin, user, shouldFetch, isOrgLoading, isProjectLoading, orgMembers, projectMembers]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Hook to access role context
 * Must be used within a RoleProvider
 */
export function useRoleContext(): RoleContextValue {
  const context = useContext(RoleContext);

  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }

  return context;
}
