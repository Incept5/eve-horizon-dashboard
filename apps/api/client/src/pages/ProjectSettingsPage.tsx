/**
 * ProjectSettingsPage - Tabbed project administration page
 * Tabs: General | Members | Secrets | Events
 */

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ErrorState } from '../components/ui/ErrorState';
import { MembersTable } from '../components/MembersTable';
import { SecretsManager } from '../components/SecretsManager';
import { useProjectContext } from '../contexts/ProjectContext';
import { useRoleContext } from '../contexts/RoleContext';
import {
  useProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  useUpdateProject,
  useSyncManifest,
  useProjectEvents,
} from '../hooks';
import type { ProjectEvent } from '../api/types';

type TabType = 'general' | 'members' | 'secrets' | 'events';

const tabs: { id: TabType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'members', label: 'Members' },
  { id: 'secrets', label: 'Secrets' },
  { id: 'events', label: 'Events' },
];

// --- General Tab ---

function GeneralTab({
  projectId,
  projectName,
  projectSlug,
  repoUrl,
  branch,
  canManage,
}: {
  projectId: string;
  projectName: string;
  projectSlug: string;
  repoUrl: string;
  branch: string;
  canManage: boolean;
}) {
  const [name, setName] = useState(projectName);
  const [editRepoUrl, setEditRepoUrl] = useState(repoUrl);
  const [editBranch, setEditBranch] = useState(branch);
  const updateProject = useUpdateProject();
  const syncManifest = useSyncManifest();

  const handleSave = () => {
    updateProject.mutate({
      projectId,
      data: {
        name: name !== projectName ? name : undefined,
        repo_url: editRepoUrl !== repoUrl ? editRepoUrl : undefined,
        branch: editBranch !== branch ? editBranch : undefined,
      },
    });
  };

  const handleSync = () => {
    syncManifest.mutate(projectId);
  };

  const hasChanges =
    name !== projectName ||
    editRepoUrl !== repoUrl ||
    editBranch !== branch;

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Project Details
          </h3>

          <div className="space-y-4">
            {/* Name */}
            {canManage ? (
              <Input
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-eve-200 mb-2">
                  Project Name
                </label>
                <p className="px-4 py-2 text-white opacity-70">{projectName}</p>
              </div>
            )}

            {/* Slug (always read-only) */}
            <div>
              <label className="block text-sm font-medium text-eve-200 mb-2">
                Slug
              </label>
              <p className="px-4 py-2 text-eve-400 font-mono text-sm opacity-70">
                {projectSlug}
              </p>
            </div>

            {/* Repo URL */}
            {canManage ? (
              <Input
                label="Repository URL"
                value={editRepoUrl}
                onChange={(e) => setEditRepoUrl(e.target.value)}
                fullWidth
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-eve-200 mb-2">
                  Repository URL
                </label>
                <p className="px-4 py-2 text-eve-300 font-mono text-sm opacity-70">
                  {repoUrl || 'Not set'}
                </p>
              </div>
            )}

            {/* Branch */}
            {canManage ? (
              <Input
                label="Branch"
                value={editBranch}
                onChange={(e) => setEditBranch(e.target.value)}
                fullWidth
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-eve-200 mb-2">
                  Branch
                </label>
                <p className="px-4 py-2 text-eve-300 font-mono text-sm opacity-70">
                  {branch || 'main'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-3 pt-4 border-t border-eve-700">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              loading={updateProject.isPending}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={handleSync}
              loading={syncManifest.isPending}
            >
              Sync Manifest
            </Button>
          </div>
        )}

        {/* Mutation feedback */}
        {updateProject.isSuccess && (
          <p className="text-sm text-success-400">Settings saved.</p>
        )}
        {updateProject.isError && (
          <p className="text-sm text-error-400">
            Failed to save:{' '}
            {updateProject.error instanceof Error
              ? updateProject.error.message
              : 'Unknown error'}
          </p>
        )}
        {syncManifest.isSuccess && (
          <p className="text-sm text-success-400">Manifest synced.</p>
        )}
        {syncManifest.isError && (
          <p className="text-sm text-error-400">
            Failed to sync manifest:{' '}
            {syncManifest.error instanceof Error
              ? syncManifest.error.message
              : 'Unknown error'}
          </p>
        )}
      </div>
    </Card>
  );
}

// --- Members Tab ---

function MembersTab({
  projectId,
  canManage,
}: {
  projectId: string;
  canManage: boolean;
}) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const addMember = useAddProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  return (
    <MembersTable
      members={members || []}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={(email, role) =>
        addMember.mutate({ email, role: role as 'admin' | 'member' })
      }
      onRemove={(userId) => removeMember.mutate(userId)}
    />
  );
}

// --- Events Tab ---

function EventsTab({ projectId }: { projectId: string }) {
  const [filterType, setFilterType] = useState('');
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useProjectEvents(projectId, filterType ? { type: filterType } : undefined);

  const getEventVariant = (
    type: string
  ): 'success' | 'warning' | 'error' | 'info' => {
    if (type.includes('error') || type.includes('failed')) return 'error';
    if (type.includes('warning')) return 'warning';
    if (type.includes('success') || type.includes('created')) return 'success';
    return 'info';
  };

  // Collect unique event types for the filter
  const eventTypes = events
    ? [...new Set(events.map((e: ProjectEvent) => e.type))]
    : [];

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

  return (
    <div className="space-y-4">
      {/* Filter */}
      {eventTypes.length > 0 && (
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-eve-900 border border-eve-700 rounded-lg text-white hover:border-eve-600 focus:outline-none focus:ring-2 focus:ring-eve-600"
          >
            <option value="">All types</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Events list */}
      {!events || events.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">No events found.</p>
        </Card>
      ) : (
        <Card>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {events.map((event: ProjectEvent) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-eve-900/50 border border-eve-700/50 hover:border-eve-600 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <Badge variant={getEventVariant(event.type)}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white break-words">
                    {event.source || event.type}
                    {event.status && (
                      <span className="text-eve-400 ml-2">
                        [{event.status}]
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-eve-400 mt-1">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// --- Main Page ---

export function ProjectSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { currentProject, isLoading: projectLoading } = useProjectContext();
  const { canManageProject } = useRoleContext();

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Project Settings</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Please select a project to manage settings.
          </p>
        </Card>
      </div>
    );
  }

  const projectId = String(currentProject.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Project Settings</h1>
        <div className="text-sm text-eve-400">
          Project: <span className="text-white">{currentProject.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-eve-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-eve-500 text-eve-200'
                    : 'border-transparent text-eve-400 hover:text-eve-200 hover:border-eve-600'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <GeneralTab
          projectId={projectId}
          projectName={currentProject.name}
          projectSlug={currentProject.slug}
          repoUrl={currentProject.repo_url}
          branch={currentProject.branch}
          canManage={canManageProject}
        />
      )}

      {activeTab === 'members' && (
        <MembersTab projectId={projectId} canManage={canManageProject} />
      )}

      {activeTab === 'secrets' && (
        <SecretsManager
          scopeType="project"
          scopeId={projectId}
          canManage={canManageProject}
          showValidate
        />
      )}

      {activeTab === 'events' && <EventsTab projectId={projectId} />}
    </div>
  );
}
