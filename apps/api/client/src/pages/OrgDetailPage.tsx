/**
 * OrgDetailPage - Tabbed organization administration page
 * Tabs: Overview | Members | Projects | Secrets
 * Accessed via /orgs/:orgId route.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal, ModalFooter } from '../components/ui/Modal';
import { MembersTable } from '../components/MembersTable';
import { SecretsManager } from '../components/SecretsManager';
import { useRoleContext } from '../contexts/RoleContext';
import {
  useOrg,
  useOrgMembers,
  useAddOrgMember,
  useRemoveOrgMember,
  useUpdateOrg,
  useProjects,
  useCreateProject,
} from '../hooks';

type TabType = 'overview' | 'members' | 'projects' | 'secrets';

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'projects', label: 'Projects' },
  { id: 'secrets', label: 'Secrets' },
];

// --- Overview Tab ---

function OverviewTab({
  orgId,
  orgName,
  orgSlug,
  createdAt,
  canManage,
}: {
  orgId: string;
  orgName: string;
  orgSlug: string;
  createdAt?: string;
  canManage: boolean;
}) {
  const [name, setName] = useState(orgName);
  const updateOrg = useUpdateOrg();

  const handleSave = () => {
    if (name !== orgName) {
      updateOrg.mutate({ orgId, data: { name } });
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">
          Organization Details
        </h3>

        <div className="space-y-4">
          {/* Name */}
          {canManage ? (
            <Input
              label="Organization Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-eve-200 mb-2">
                Organization Name
              </label>
              <p className="px-4 py-2 text-white opacity-70">{orgName}</p>
            </div>
          )}

          {/* Slug (always read-only) */}
          <div>
            <label className="block text-sm font-medium text-eve-200 mb-2">
              Slug
            </label>
            <p className="px-4 py-2 text-eve-400 font-mono text-sm opacity-70">
              {orgSlug}
            </p>
          </div>

          {/* Created */}
          {createdAt && (
            <div>
              <label className="block text-sm font-medium text-eve-200 mb-2">
                Created
              </label>
              <p className="px-4 py-2 text-eve-300 text-sm opacity-70">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-3 pt-4 border-t border-eve-700">
            <Button
              onClick={handleSave}
              disabled={name === orgName}
              loading={updateOrg.isPending}
            >
              Save
            </Button>
          </div>
        )}

        {updateOrg.isSuccess && (
          <p className="text-sm text-success-400">Organization updated.</p>
        )}
        {updateOrg.isError && (
          <p className="text-sm text-error-400">
            Failed to update:{' '}
            {updateOrg.error instanceof Error
              ? updateOrg.error.message
              : 'Unknown error'}
          </p>
        )}
      </div>
    </Card>
  );
}

// --- Members Tab ---

function MembersTab({
  orgId,
  canManage,
}: {
  orgId: string;
  canManage: boolean;
}) {
  const { data: members, isLoading } = useOrgMembers(orgId);
  const addMember = useAddOrgMember(orgId);
  const removeMember = useRemoveOrgMember(orgId);

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

// --- Projects Tab ---

function ProjectsTab({
  orgId,
  canManage,
}: {
  orgId: string;
  canManage: boolean;
}) {
  const { data: allProjects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newBranch, setNewBranch] = useState('main');

  const orgIdNum = Number(orgId);
  const orgProjects = (allProjects || []).filter(
    (p) => p.org_id === orgIdNum
  );

  const handleCreate = () => {
    if (!newName.trim() || !newSlug.trim() || !newRepoUrl.trim()) return;

    createProject.mutate(
      {
        name: newName.trim(),
        slug: newSlug.trim(),
        repo_url: newRepoUrl.trim(),
        branch: newBranch.trim() || 'main',
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewName('');
          setNewSlug('');
          setNewRepoUrl('');
          setNewBranch('main');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {canManage && (
        <div>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            Create Project
          </Button>
        </div>
      )}

      {/* Projects Grid */}
      {orgProjects.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">
            No projects in this organization.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgProjects.map((project) => (
            <Card key={project.id}>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-eve-400 font-mono">
                    /{project.slug}
                  </p>
                </div>
                {project.repo_url && (
                  <p className="text-xs text-eve-300 font-mono truncate">
                    {project.repo_url}
                  </p>
                )}
                <div className="text-xs text-eve-400">
                  Branch:{' '}
                  <code className="text-eve-200 bg-eve-950 px-1.5 py-0.5 rounded font-mono">
                    {project.branch || 'main'}
                  </code>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewName('');
          setNewSlug('');
          setNewRepoUrl('');
          setNewBranch('main');
        }}
        title="Create Project"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="My Project"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <Input
            label="Slug"
            placeholder="my-project"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            fullWidth
          />
          <Input
            label="Repository URL"
            placeholder="https://github.com/org/repo"
            value={newRepoUrl}
            onChange={(e) => setNewRepoUrl(e.target.value)}
            fullWidth
          />
          <Input
            label="Branch"
            placeholder="main"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false);
              setNewName('');
              setNewSlug('');
              setNewRepoUrl('');
              setNewBranch('main');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !newName.trim() || !newSlug.trim() || !newRepoUrl.trim()
            }
            loading={createProject.isPending}
          >
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// --- Main Page ---

export function OrgDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { canManageOrg } = useRoleContext();

  const {
    data: org,
    isLoading,
    error,
    refetch,
  } = useOrg(orgId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Organization</h1>
        <ErrorState
          error={error as Error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!org || !orgId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Organization</h1>
        <Card>
          <p className="text-eve-300 text-center py-8">
            Organization not found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{org.name}</h1>
        <span className="text-sm text-eve-400 font-mono">/{org.slug}</span>
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
      {activeTab === 'overview' && (
        <OverviewTab
          orgId={orgId}
          orgName={org.name}
          orgSlug={org.slug}
          canManage={canManageOrg}
        />
      )}

      {activeTab === 'members' && (
        <MembersTab orgId={orgId} canManage={canManageOrg} />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab orgId={orgId} canManage={canManageOrg} />
      )}

      {activeTab === 'secrets' && (
        <SecretsManager
          scopeType="org"
          scopeId={orgId}
          canManage={canManageOrg}
        />
      )}
    </div>
  );
}
