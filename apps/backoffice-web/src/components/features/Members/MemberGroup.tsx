import React, { useCallback, useEffect, useState } from 'react';
import ComponentTemplate from '../ComponentTemplate';
import { Modal, Button, Breadcrumb } from '../../common/UI';
import { Input, Select } from '../../common/Forms';
import { useNotification } from '../../../context/NotificationContext';
import {
  addGroupMember,
  createMemberGroup,
  deleteMemberGroup,
  listGroupMembers,
  listMemberGroups,
  removeGroupMember,
  updateMemberGroup,
  type MemberGroup as MemberGroupRow,
  type MemberGroupMember,
} from '../../../services/api/member-groups';
import { listPlayers } from '../../../services/api/players';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const EMPTY_FORM = { name: '', category: '', status: 'ACTIVE' };

const MemberGroup = () => {
  const { success, error: notifyError } = useNotification();
  const [groups, setGroups] = useState<MemberGroupRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MemberGroupRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [membersModalGroup, setMembersModalGroup] = useState<MemberGroupRow | null>(null);
  const [currentMembers, setCurrentMembers] = useState<MemberGroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerResults, setPlayerResults] = useState<any[]>([]);
  const [playerSearchLoading, setPlayerSearchLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listMemberGroups();
      setGroups(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openAddModal = () => {
    setEditingGroup(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (group: MemberGroupRow) => {
    setEditingGroup(group);
    setForm({ name: group.name, category: group.category || '', status: group.status });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingGroup) {
        await updateMemberGroup(editingGroup.id, form);
      } else {
        await createMemberGroup(form);
      }
      setModalOpen(false);
      await fetchGroups();
      success(editingGroup ? 'Group updated' : 'Group created');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: MemberGroupRow) => {
    if (!window.confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    try {
      await deleteMemberGroup(group.id);
      await fetchGroups();
      success(`"${group.name}" deleted`);
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  const loadMembers = useCallback(async (groupId: string) => {
    setMembersLoading(true);
    try {
      const data = await listGroupMembers(groupId);
      setCurrentMembers(data);
    } catch (err: any) {
      notifyError(err.message);
    } finally {
      setMembersLoading(false);
    }
  }, [notifyError]);

  const openMembersModal = (group: MemberGroupRow) => {
    setMembersModalGroup(group);
    setPlayerSearch('');
    setPlayerResults([]);
    loadMembers(group.id);
  };

  // Debounced player search over the real /players endpoint, so adding a
  // member doesn't require loading every player up front.
  useEffect(() => {
    if (!membersModalGroup || !playerSearch.trim()) {
      setPlayerResults([]);
      return undefined;
    }
    let cancelled = false;
    setPlayerSearchLoading(true);
    const timer = setTimeout(() => {
      listPlayers({ search: playerSearch.trim() }, { page: 1, limit: 10 })
        .then((data) => {
          if (cancelled) return;
          const existingIds = new Set(currentMembers.map((m) => m.id));
          setPlayerResults((data.nodes ?? []).filter((p: any) => !existingIds.has(p.id)));
        })
        .catch((err) => {
          if (!cancelled) notifyError(err.message);
        })
        .finally(() => {
          if (!cancelled) setPlayerSearchLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [playerSearch, membersModalGroup, currentMembers, notifyError]);

  const handleAddMember = async (playerId: string) => {
    if (!membersModalGroup) return;
    try {
      await addGroupMember(membersModalGroup.id, playerId);
      setPlayerSearch('');
      setPlayerResults([]);
      await loadMembers(membersModalGroup.id);
      await fetchGroups();
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  const handleRemoveMember = async (playerId: string) => {
    if (!membersModalGroup) return;
    try {
      await removeGroupMember(membersModalGroup.id, playerId);
      await loadMembers(membersModalGroup.id);
      await fetchGroups();
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  const stats = [
    { label: 'Total Groups', value: groups.length.toLocaleString() },
    { label: 'Active Groups', value: groups.filter((g) => g.status === 'ACTIVE').length.toLocaleString() },
    { label: 'Total Members', value: groups.reduce((sum, g) => sum + g.memberCount, 0).toLocaleString() },
  ];

  const columns = ['Group Name', 'Members', 'Category', 'Status'];
  const rowKeys = ['name', 'memberCount', 'category', 'status'];
  const actions = [
    { label: 'Members', color: 'green', onClick: openMembersModal },
    { label: 'Edit', color: 'blue', onClick: openEditModal },
    { label: 'Delete', color: 'red', onClick: handleDelete },
  ];

  return (
    <>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <ComponentTemplate
        title="Member Groups"
        description="Organize members into groups for targeted management"
        data={groups}
        columns={columns}
        rowKeys={rowKeys}
        stats={stats}
        actions={actions}
        hasAddButton
        addButtonText="Create Group"
        onAdd={openAddModal}
        loading={loading}
        error={loadError ? `Failed to load groups: ${loadError}` : null}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? 'Edit Group' : 'Create Group'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600">{formError}</div>}
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!membersModalGroup}
        onClose={() => setMembersModalGroup(null)}
        title={membersModalGroup ? `Members - ${membersModalGroup.name}` : ''}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Add a member"
              name="playerSearch"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Search by username or email…"
            />
            {playerSearchLoading ? (
              <div className="text-sm text-gray-500">Searching…</div>
            ) : playerResults.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {playerResults.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-900">
                      {p.username || p.email} <span className="text-gray-500">({p.email})</span>
                    </span>
                    <button
                      onClick={() => handleAddMember(p.id)}
                      className="text-sm text-primary-600 hover:text-primary-900"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {membersLoading ? (
            <div className="text-sm text-gray-500">Loading members…</div>
          ) : currentMembers.length === 0 ? (
            <div className="text-sm text-gray-500">No members in this group yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {currentMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">
                    {m.username || m.email} <span className="text-gray-500">({m.email})</span>
                  </span>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MemberGroup;
