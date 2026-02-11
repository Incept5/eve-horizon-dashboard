/**
 * Auth state management hook
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '../api/client';
import { setToken, clearToken, isAuthenticated } from '../api/auth';
import type { User } from '../api/types';

interface AuthMeResponse {
  auth_enabled: boolean;
  authenticated: boolean;
  user_id: string;
  email: string;
  role: string;
  is_admin: boolean;
  permissions: string[];
}

/**
 * Get the current user from the API
 */
async function getCurrentUser(): Promise<User> {
  const resp = await get<AuthMeResponse>('/auth/me');
  if (!resp.authenticated) {
    throw new Error('Not authenticated');
  }
  return {
    id: resp.user_id as unknown as number,
    email: resp.email,
    is_admin: resp.is_admin,
    role: resp.is_admin ? 'admin' : 'member',
  };
}

/**
 * Logout by clearing the token
 */
async function logout(): Promise<void> {
  clearToken();
}

/**
 * Hook for auth state management
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();

  // Query to get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    enabled: authenticated,
    staleTime: Infinity, // User data doesn't change often
    retry: false,
  });

  // Mutation for login (token-based)
  const loginMutation = useMutation({
    mutationFn: async (token: string) => {
      setToken(token);
      const user = await getCurrentUser();
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
    },
    onError: () => {
      clearToken();
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated: authenticated && !error,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
