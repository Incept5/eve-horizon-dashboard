/**
 * MembersTable - Reusable members management component
 * Used across Org, Project Settings, and System pages for
 * listing, searching, adding, and removing members.
 */

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Modal, ModalFooter } from './ui/Modal';

export interface MembersTableMember {
  user_id?: string;
  id?: number;
  email: string;
  role: string;
  created_at?: string;
}

export interface MembersTableProps {
  members: MembersTableMember[];
  isLoading: boolean;
  canManage: boolean;
  onAdd?: (email: string, role: string) => void;
  onRemove?: (userId: string) => void;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

export function MembersTable({
  members,
  isLoading,
  canManage,
  onAdd,
  onRemove,
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const filteredMembers = members.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (onAdd && addEmail.trim()) {
      onAdd(addEmail.trim(), addRole);
      setAddEmail('');
      setAddRole('member');
      setShowAddModal(false);
    }
  };

  const handleRemove = (userId: string) => {
    if (onRemove) {
      onRemove(userId);
      setConfirmRemoveId(null);
    }
  };

  const getMemberId = (member: MembersTableMember): string =>
    member.user_id || String(member.id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eve-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: search + add button */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search members by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {canManage && onAdd && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        )}
      </div>

      {/* Table */}
      {filteredMembers.length === 0 ? (
        <Card>
          <p className="text-eve-300 text-center py-8">
            {searchQuery ? 'No members match your search.' : 'No members found.'}
          </p>
        </Card>
      ) : (
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
                  {canManage && (
                    <th className="text-right py-3 px-4 text-sm font-semibold text-eve-200">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const memberId = getMemberId(member);
                  return (
                    <tr
                      key={memberId || member.email}
                      className="border-b border-eve-700/50 hover:bg-eve-800/30"
                    >
                      <td className="py-3 px-4 text-sm text-white">
                        {member.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            member.role === 'admin' || member.role === 'owner'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-eve-300">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      {canManage && (
                        <td className="py-3 px-4 text-right">
                          {confirmRemoveId === memberId ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-xs text-eve-400">
                                Confirm?
                              </span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemove(memberId)}
                              >
                                Yes
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmRemoveId(null)}
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmRemoveId(memberId)}
                            >
                              Remove
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddEmail('');
          setAddRole('member');
        }}
        title="Add Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            fullWidth
          />
          <Select
            label="Role"
            options={roleOptions}
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddModal(false);
              setAddEmail('');
              setAddRole('member');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!addEmail.trim()}>
            Add
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
