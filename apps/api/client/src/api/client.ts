/**
 * Base API client with fetch wrapper
 * Handles authentication, error handling, and JSON parsing
 */

import { getToken, clearToken } from './auth';
import type { ApiError } from './types';

const BASE_URL = '/api';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Make an authenticated API request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add custom headers
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      requestHeaders[key] = String(value);
    });
  }

  // Attach authorization header if token exists
  const token = getToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch (error) {
    throw new ApiClientError(
      'Network error: Failed to reach the server',
      0
    );
  }

  // Handle 401 Unauthorized by clearing auth state (only if we sent a token)
  if (response.status === 401) {
    if (token) {
      clearToken();
    }
    throw new ApiClientError(
      'Unauthorized: Please log in again',
      401
    );
  }

  // Parse response body
  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiClientError(
        'Failed to parse JSON response',
        response.status
      );
    }
  } else {
    // Non-JSON response
    const text = await response.text();
    if (!response.ok) {
      throw new ApiClientError(
        text || `Request failed with status ${response.status}`,
        response.status
      );
    }
    return text as T;
  }

  // Handle error responses
  if (!response.ok) {
    const apiError = data as ApiError;
    throw new ApiClientError(
      apiError.message || apiError.error || `Request failed with status ${response.status}`,
      response.status,
      apiError
    );
  }

  return data as T;
}

/**
 * HTTP GET request
 */
export async function get<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * HTTP POST request
 */
export async function post<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * HTTP PUT request
 */
export async function put<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * HTTP PATCH request
 */
export async function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * HTTP DELETE request
 */
export async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' });
}
