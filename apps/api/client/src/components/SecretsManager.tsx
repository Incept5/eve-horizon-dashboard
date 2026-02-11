/**
 * SecretsManager - Reusable secrets management component
 * Provides CRUD operations for secrets scoped to an org or project,
 * with optional validation for project-scoped secrets.
 */

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Modal, ModalFooter } from './ui/Modal';
import { ErrorState } from './ui/ErrorState';
import {
  useSecrets,
  useCreateSecret,
  useDeleteSecret,
  useValidateSecrets,
} from '../hooks';
import type { SecretScope, SecretValidationResult } from '../api/types';

export interface SecretsManagerProps {
  scopeType: 'org' | 'project';
  scopeId: string;
  canManage: boolean;
  showValidate?: boolean;
}

const typeOptions = [
  { value: '', label: 'Default' },
  { value: 'env', label: 'Environment Variable' },
  { value: 'file', label: 'File' },
  { value: 'docker', label: 'Docker Registry' },
  { value: 'token', label: 'API Token' },
];

export function SecretsManager({
  scopeType,
  scopeId,
  canManage,
  showValidate = false,
}: SecretsManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addKey, setAddKey] = useState('');
  const [addValue, setAddValue] = useState('');
  const [addType, setAddType] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<SecretValidationResult | null>(null);

  const {
    data: secrets,
    isLoading,
    error,
    refetch,
  } = useSecrets(scopeType as SecretScope, scopeId);

  const createSecret = useCreateSecret();
  const deleteSecret = useDeleteSecret();
  const validateSecrets = useValidateSecrets();

  const handleAdd = () => {
    if (!addKey.trim() || !addValue.trim()) return;

    createSecret.mutate(
      {
        scopeType: scopeType as SecretScope,
        scopeId,
        data: {
          key: addKey.trim(),
          value: addValue.trim(),
          ...(addType ? { type: addType } : {}),
        },
      },
      {
        onSuccess: () => {
          setAddKey('');
          setAddValue('');
          setAddType('');
          setShowAddModal(false);
        },
      }
    );
  };

  const handleDelete = (secretId: string) => {
    deleteSecret.mutate(secretId, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  const handleValidate = () => {
    validateSecrets.mutate(scopeId, {
      onSuccess: (result) => setValidationResult(result),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error as Error}
        onRetry={() => refetch()}
        variant="compact"
      />
    );
  }

  const secretsList = secrets || [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {canManage && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            Add Secret
          </Button>
        )}
        {showValidate && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleValidate}
            loading={validateSecrets.isPending}
          >
            Validate Secrets
          </Button>
        )}
      </div>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={validationResult.valid ? 'success' : 'error'}>
                {validationResult.valid ? 'Valid' : 'Missing Secrets'}
              </Badge>
            </div>
            {validationResult.present.length > 0 && (
              <div>
                <p className="text-sm font-medium text-eve-200 mb-1">
                  Present keys:
                </p>
                <div className="flex flex-wrap gap-2">
                  {validationResult.present.map((key) => (
                    <Badge key={key} variant="success">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {validationResult.missing.length > 0 && (
              <div>
                <p className="text-sm font-medium text-eve-200 mb-1">
                  Missing keys:
                </p>
                <div className="flex flex-wrap gap-2">
                  {validationResult.missing.map((key) => (
                    <Badge key={key} variant="error">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Secrets Table */}
      {secretsList.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No secrets configured.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eve-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                    Key
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                    Created At
                  </th>
                  {canManage && (
                    <th className="text-right py-3 px-4 text-sm font-semibold text-eve-200">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {secretsList.map((secret) => (
                  <tr
                    key={secret.id}
                    className="border-b border-eve-700/50 hover:bg-eve-800/30"
                  >
                    <td className="py-3 px-4 text-sm text-white font-mono">
                      {secret.key}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{secret.type || 'default'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-eve-300">
                      {secret.created_at
                        ? new Date(secret.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        {confirmDeleteId === secret.id ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-xs text-eve-400">
                              Delete?
                            </span>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(secret.id)}
                              loading={deleteSecret.isPending}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(secret.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Secret Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddKey('');
          setAddValue('');
          setAddType('');
        }}
        title="Add Secret"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Key"
            placeholder="SECRET_NAME"
            value={addKey}
            onChange={(e) => setAddKey(e.target.value)}
            fullWidth
          />
          <Input
            label="Value"
            type="password"
            placeholder="Secret value"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            fullWidth
          />
          <Select
            label="Type (optional)"
            options={typeOptions}
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddModal(false);
              setAddKey('');
              setAddValue('');
              setAddType('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!addKey.trim() || !addValue.trim()}
            loading={createSecret.isPending}
          >
            Add Secret
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
