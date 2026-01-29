/**
 * AdminRoute - Route wrapper that requires admin privileges
 * Redirects to projects page if user is not an admin
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function AdminRoute() {
  const { isAdmin } = useAuthContext();

  // Redirect to projects if not admin
  if (!isAdmin) {
    return <Navigate to="/projects" replace />;
  }

  // Render child routes if admin
  return <Outlet />;
}
