/**
 * Project event list and emit mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectEvents, emitEvent } from '../api';
import type { EmitEventRequest } from '../api';

/**
 * Hook to get events for a project with optional filters
 * @param projectId - The project ID to fetch events for
 * @param filters - Optional filters for event type and source
 */
export function useProjectEvents(
  projectId: string | undefined,
  filters?: { type?: string; source?: string }
) {
  return useQuery({
    queryKey: ['events', projectId, filters],
    queryFn: () => getProjectEvents(projectId!, filters),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to emit an event for a project
 */
export function useEmitEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: EmitEventRequest;
    }) => emitEvent(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['events', projectId],
      });
    },
  });
}
