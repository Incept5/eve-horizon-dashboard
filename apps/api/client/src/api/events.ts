/**
 * Events API functions
 */

import { get, post } from './client';
import type { ProjectEvent, EmitEventRequest } from './types';

/**
 * Get events for a project with optional filters
 */
export async function getProjectEvents(
  projectId: string,
  filters?: {
    type?: string;
    source?: string;
  }
): Promise<ProjectEvent[]> {
  const params: Record<string, string> = {};
  if (filters?.type) {
    params.type = filters.type;
  }
  if (filters?.source) {
    params.source = filters.source;
  }

  return get<ProjectEvent[]>(`/projects/${projectId}/events`, {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
}

/**
 * Emit an event for a project
 */
export async function emitEvent(
  projectId: string,
  data: EmitEventRequest
): Promise<ProjectEvent> {
  return post<ProjectEvent>(`/projects/${projectId}/events`, data);
}
