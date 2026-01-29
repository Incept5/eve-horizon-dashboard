import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { getOrgs, getOrgMembers, getSystemEvents } from '../api';
import type { Organization, Member, SystemEvent } from '../api';

type TabType = 'organizations' | 'members' | 'events';

export function SystemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('organizations');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load organizations
  useEffect(() => {
    if (activeTab === 'organizations') {
      loadOrgs();
    }
  }, [activeTab]);

  // Load members when org is selected
  useEffect(() => {
    if (activeTab === 'members' && selectedOrgId) {
      loadMembers(selectedOrgId);
    }
  }, [activeTab, selectedOrgId]);

  // Load events
  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  const loadOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrgs();
      setOrgs(data);
      // Auto-select first org for members tab
      if (data.length > 0 && !selectedOrgId) {
        setSelectedOrgId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrgMembers(orgId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter((event) =>
    event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { id: TabType; label: string }[] = [
    { id: 'organizations', label: 'Organizations' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: 'Events' },
  ];

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
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
                setError(null);
              }}
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

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {activeTab === 'members' && orgs.length > 0 && (
          <select
            value={selectedOrgId || ''}
            onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            className="px-4 py-2 bg-eve-900 border border-eve-700 rounded-lg text-white hover:border-eve-600 focus:outline-none focus:ring-2 focus:ring-eve-600"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error-900/20 border border-error-700 rounded-lg p-4">
          <p className="text-error-300 text-sm">{error}</p>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'organizations' && (
        <OrganizationsTab
          orgs={filteredOrgs}
          loading={loading}
          members={members}
        />
      )}

      {activeTab === 'members' && (
        <MembersTab
          members={filteredMembers}
          loading={loading}
        />
      )}

      {activeTab === 'events' && (
        <EventsTab
          events={filteredEvents}
          loading={loading}
        />
      )}
    </div>
  );
}

// Organizations Tab Component
function OrganizationsTab({
  orgs,
  loading,
  members,
}: {
  orgs: Organization[];
  loading: boolean;
  members: Member[];
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <Card>
        <p className="text-eve-300 text-center py-8">
          No organizations found.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orgs.map((org) => {
        const orgMemberCount = members.filter((m) => m.org_id === org.id).length;
        return (
          <Card key={org.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {org.name}
                  </h3>
                  <p className="text-sm text-eve-400">/{org.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-eve-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>{orgMemberCount} members</span>
              </div>
              <div className="pt-3 border-t border-eve-700">
                <Button variant="ghost" size="sm" fullWidth>
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Members Tab Component
function MembersTab({
  members,
  loading,
}: {
  members: Member[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <p className="text-eve-300 text-center py-8">
          No members found.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-eve-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-eve-200">
                Joined
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-eve-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-eve-700/50 hover:bg-eve-800/30">
                <td className="py-3 px-4 text-sm text-white">
                  {member.email}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={member.role === 'admin' ? 'warning' : 'default'}>
                    {member.role}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-eve-300">
                  {member.created_at
                    ? new Date(member.created_at).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Events Tab Component
function EventsTab({
  events,
  loading,
}: {
  events: SystemEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <p className="text-eve-300 text-center py-8">
          No events found.
        </p>
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
    <Card>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {events.map((event) => (
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
                {event.message}
              </p>
              <p className="text-xs text-eve-400 mt-1">
                {new Date(event.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
