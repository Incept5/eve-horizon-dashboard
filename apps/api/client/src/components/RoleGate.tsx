/**
 * RoleGate - Declarative conditional rendering based on RBAC permissions
 * Renders children only when the current user satisfies the required role.
 */

import type { ReactNode } from 'react';
import { useRoleContext } from '../contexts/RoleContext';

/**
 * Permission keys that map to boolean flags in the role context
 */
type Permission =
  | 'platformAdmin'
  | 'orgAdmin'
  | 'projectAdmin'
  | 'manageOrg'
  | 'manageProject';

interface RoleGateProps {
  require: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Map a permission key to its corresponding role context boolean
 */
const PERMISSION_MAP: Record<Permission, string> = {
  platformAdmin: 'isPlatformAdmin',
  orgAdmin: 'isOrgAdmin',
  projectAdmin: 'isProjectAdmin',
  manageOrg: 'canManageOrg',
  manageProject: 'canManageProject',
} as const;

/**
 * RoleGate component
 * Conditionally renders children based on the user's effective permissions.
 * Shows the fallback (or nothing) when the requirement is not met.
 *
 * @example
 * ```tsx
 * <RoleGate require="manageProject">
 *   <Button>Edit Settings</Button>
 * </RoleGate>
 *
 * <RoleGate require="platformAdmin" fallback={<p>Admin only</p>}>
 *   <SystemControls />
 * </RoleGate>
 * ```
 */
export function RoleGate({ require, fallback = null, children }: RoleGateProps) {
  const roleContext = useRoleContext();
  const contextKey = PERMISSION_MAP[require] as keyof typeof roleContext;
  const isPermitted = roleContext[contextKey] as boolean;

  if (!isPermitted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
