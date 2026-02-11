import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal, ModalFooter } from '../components/ui/Modal';
import {
  useSystemHealth,
  useHarnesses,
  useInviteUser,
} from '../hooks/useSystem';
import { useOrgs, useCreateOrg } from '../hooks/useOrgs';
import { getSystemEvents } from '../api/system';
import type { Organization, SystemEvent, Harness, InviteUserRequest } from '../api/types';

type TabType = 'health' | 'organizations' | 'users' | 'harnesses' | 'events';

const tabs: { id: TabType; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'users', label: 'Users' },
  { id: 'harnesses', label: 'Harnesses' },
  { id: 'events', label: 'Events' },
];

export function SystemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('health');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">System Administration</h1>
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

      {/* Tab content */}
      {activeTab === 'health' && <HealthTab />}
      {activeTab === 'organizations' && <OrganizationsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'harnesses' && <HarnessesTab />}
      {activeTab === 'events' && <EventsTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health Tab
// ---------------------------------------------------------------------------

function HealthTab() {
  const { data: health, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-error-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm">Failed to load system health.</p>
        </div>
      </Card>
    );
  }

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';
  const dbStatus = health?.database ?? 'unknown';
  const details = health?.details ?? {};

  return (
    <div className="space-y-6">
      {/* Overall status */}
      <Card>
        <div className="flex items-center gap-4">
          <span
            className={`inline-block h-4 w-4 rounded-full ${
              isHealthy ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-error-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <div>
            <h2 className="text-lg font-semibold text-white">
              System {isHealthy ? 'Healthy' : 'Unhealthy'}
            </h2>
            <p className="text-sm text-eve-400 mt-0.5">
              Status: <span className="text-eve-200">{health?.status ?? 'unknown'}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Database */}
      <Card>
        <h3 className="text-sm font-semibold text-eve-300 uppercase tracking-wider mb-3">Database</h3>
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              dbStatus === 'ok' || dbStatus === 'connected'
                ? 'bg-success-500'
                : dbStatus === 'unknown'
                ? 'bg-eve-500'
                : 'bg-error-500'
            }`}
          />
          <span className="text-eve-200 text-sm capitalize">{dbStatus}</span>
        </div>
      </Card>

      {/* Additional details */}
      {Object.keys(details).length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-eve-300 uppercase tracking-wider mb-3">Details</h3>
          <div className="space-y-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-sm text-eve-400">{key}</span>
                <span className="text-sm text-eve-200">{String(value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Organizations Tab
// ---------------------------------------------------------------------------

function OrganizationsTab() {
  const { data: orgs, isLoading, error } = useOrgs();
  const createOrg = useCreateOrg();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    createOrg.mutate(
      { name: newOrgName.trim() },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewOrgName('');
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

  if (error) {
    return (
      <Card>
        <p className="text-error-400 text-sm">Failed to load organizations.</p>
      </Card>
    );
  }

  const filteredOrgs = (orgs ?? []).filter(
    (org: Organization) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => setShowCreateModal(true)}>
          Create Organization
        </Button>
      </div>

      {filteredOrgs.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">No organizations found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org: Organization) => (
            <Card
              key={org.id}
              className="cursor-pointer hover:border-eve-600 transition-colors"
              onClick={() => navigate(`/orgs/${org.id}`)}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                  <p className="text-sm text-eve-400">/{org.slug}</p>
                </div>
                <div className="pt-3 border-t border-eve-700">
                  <span className="text-xs text-eve-400">
                    Click to view details
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewOrgName(''); }}
        title="Create Organization"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="My Organization"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            fullWidth
            error={createOrg.isError ? 'Failed to create organization. Please try again.' : undefined}
          />
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => { setShowCreateModal(false); setNewOrgName(''); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              loading={createOrg.isPending}
              disabled={!newOrgName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Users Tab (replaces Members)
// ---------------------------------------------------------------------------

function UsersTab() {
  const inviteUser = useInviteUser();
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInvite = () => {
    if (!email.trim()) return;
    const data: InviteUserRequest = { email: email.trim() };
    if (githubUsername.trim()) {
      data.github_username = githubUsername.trim();
    }
    inviteUser.mutate(data, {
      onSuccess: () => {
        setFeedback({ type: 'success', message: `Invitation sent to ${email}.` });
        setEmail('');
        setGithubUsername('');
      },
      onError: (err) => {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Failed to invite user.',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Invite User</h3>
        <div className="space-y-4 max-w-lg">
          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Input
            label="GitHub Username (optional)"
            type="text"
            placeholder="octocat"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            fullWidth
          />
          <Button
            onClick={handleInvite}
            loading={inviteUser.isPending}
            disabled={!email.trim()}
          >
            Invite
          </Button>

          {feedback && (
            <div
              className={`rounded-lg p-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-success-900/20 border border-success-700 text-success-300'
                  : 'bg-error-900/20 border border-error-700 text-error-300'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Harnesses Tab
// ---------------------------------------------------------------------------

function HarnessesTab() {
  const { data: harnesses, isLoading, error } = useHarnesses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-error-400 text-sm">Failed to load harnesses.</p>
      </Card>
    );
  }

  const items: Harness[] = harnesses ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <p className="text-eve-300 text-center py-8">No harnesses found.</p>
      </Card>
    );
  }

  const authBadgeVariant = (status?: string): 'success' | 'warning' | 'default' => {
    if (status === 'ready' || status === 'configured') return 'success';
    if (status === 'missing' || status === 'unconfigured') return 'warning';
    return 'default';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((harness) => (
        <Card key={harness.name}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-white">{harness.name}</h3>
              {harness.auth_status && (
                <Badge variant={authBadgeVariant(harness.auth_status)}>
                  {harness.auth_status}
                </Badge>
              )}
            </div>
            {harness.description && (
              <p className="text-sm text-eve-300">{harness.description}</p>
            )}
            {harness.aliases && harness.aliases.length > 0 && (
              <p className="text-xs text-eve-400">
                Aliases: {harness.aliases.join(', ')}
              </p>
            )}
            {harness.variants && harness.variants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {harness.variants.map((variant) => (
                  <Badge key={variant} variant="default">
                    {variant}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Events Tab (legacy, kept working with getSystemEvents)
// ---------------------------------------------------------------------------

function EventsTab() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load events on mount
  useEffect(() => {
    setLoading(true);
    getSystemEvents()
      .then((data) => setEvents(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load events')
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-error-400 text-sm">{error}</p>
      </Card>
    );
  }

  const getEventVariant = (type: string): 'success' | 'warning' | 'error' | 'info' => {
    if (type.includes('error') || type.includes('failed')) return 'error';
    if (type.includes('warning')) return 'warning';
    if (type.includes('success') || type.includes('created')) return 'success';
    return 'info';
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {filteredEvents.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">No events found.</p>
        </Card>
      ) : (
        <Card>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-eve-900/50 border border-eve-700/50 hover:border-eve-600 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <Badge variant={getEventVariant(event.type)}>{event.type}</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white break-words">{event.message}</p>
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
