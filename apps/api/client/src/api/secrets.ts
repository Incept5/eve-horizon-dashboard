/**
 * Secrets API functions
 */

import { get, post, del } from './client';
import type {
  Secret,
  SecretScope,
  CreateSecretRequest,
  SecretValidationResult,
} from './types';

/**
 * List secrets filtered by scope
 */
export async function listSecrets(params: {
  scope_type: SecretScope;
  scope_id: string;
}): Promise<Secret[]> {
  return get<Secret[]>('/secrets', {
    params: {
      scope_type: params.scope_type,
      scope_id: params.scope_id,
    },
  });
}

/**
 * Create a secret within a given scope
 */
export async function createSecret(
  scopeType: SecretScope,
  scopeId: string,
  data: CreateSecretRequest
): Promise<Secret> {
  return post<Secret>('/secrets', {
    scope_type: scopeType,
    scope_id: scopeId,
    ...data,
  });
}

/**
 * Delete a secret by ID
 */
export async function deleteSecret(secretId: string): Promise<void> {
  await del(`/secrets/${secretId}`);
}

/**
 * Validate that a project has all required secrets configured
 */
export async function validateProjectSecrets(
  projectId: string
): Promise<SecretValidationResult> {
  return post<SecretValidationResult>(`/projects/${projectId}/secrets/validate`);
}
