/**
 * Secrets list, validation, and mutation hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSecrets,
  createSecret,
  deleteSecret,
  validateProjectSecrets,
} from '../api';
import type { SecretScope, CreateSecretRequest } from '../api';

/**
 * Hook to get secrets filtered by scope
 * @param scopeType - The scope type to filter by (system, org, user, project)
 * @param scopeId - The scope ID to filter by
 */
export function useSecrets(
  scopeType?: SecretScope,
  scopeId?: string
) {
  return useQuery({
    queryKey: ['secrets', scopeType, scopeId],
    queryFn: () => listSecrets({ scope_type: scopeType!, scope_id: scopeId! }),
    enabled: !!scopeType && !!scopeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new secret
 */
export function useCreateSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scopeType,
      scopeId,
      data,
    }: {
      scopeType: SecretScope;
      scopeId: string;
      data: CreateSecretRequest;
    }) => createSecret(scopeType, scopeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
}

/**
 * Hook to delete a secret
 */
export function useDeleteSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (secretId: string) => deleteSecret(secretId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
}

/**
 * Hook to validate that a project has all required secrets configured
 * @param projectId - The project ID to validate secrets for
 */
export function useValidateSecrets() {
  return useMutation({
    mutationFn: (projectId: string) => validateProjectSecrets(projectId),
  });
}
