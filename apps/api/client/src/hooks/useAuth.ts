/**
 * Auth state management hook
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post } from '../api/client';
import { setToken, clearToken, isAuthenticated } from '../api/auth';
import type { LoginRequest, LoginResponse, User } from '../api/types';

/**
 * Get the current user from the API
 */
async function getCurrentUser(): Promise<User> {
  return post<User>('/auth/me');
}

/**
 * Login with email and password
 */
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', credentials);
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

  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
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
