/**
 * AuthContext - Global authentication state management
 * Provides auth state and methods throughout the application
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { post } from '../api/client';
import { setToken as storeToken, clearToken, getToken } from '../api/auth';
import type { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Get the current user from the API
 */
async function getCurrentUser(): Promise<User> {
  return post<User>('/auth/me');
}

/**
 * AuthProvider component
 * Manages authentication state and provides auth context to the application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state on mount
   * Check if token exists and validate it with the API
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        // Token is invalid or expired
        clearToken();
        setUser(null);
        setError(null); // Don't show error on initial load
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with a token
   * Stores the token and fetches the current user
   */
  const login = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      storeToken(token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      clearToken();
      setUser(null);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   * Clears the token and resets auth state
   */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    isAdmin: user?.is_admin ?? false,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
