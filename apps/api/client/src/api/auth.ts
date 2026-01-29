/**
 * Auth token management
 * Stores token in memory (primary) and sessionStorage (persistence)
 */

const TOKEN_KEY = 'eve_auth_token';

// In-memory token for fast access
let memoryToken: string | null = null;

/**
 * Get the current auth token from memory or sessionStorage
 */
export function getToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  // Restore from sessionStorage if available
  try {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      memoryToken = storedToken;
      return storedToken;
    }
  } catch (error) {
    console.warn('Failed to read token from sessionStorage:', error);
  }

  return null;
}

/**
 * Store the auth token in both memory and sessionStorage
 */
export function setToken(token: string): void {
  memoryToken = token;

  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn('Failed to store token in sessionStorage:', error);
  }
}

/**
 * Clear the auth token from both memory and sessionStorage
 */
export function clearToken(): void {
  memoryToken = null;

  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to remove token from sessionStorage:', error);
  }
}

/**
 * Check if the user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
