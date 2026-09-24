import React, { useCallback, useEffect, useState } from 'react';
import ComponentTemplate from '../ComponentTemplate';
import { Modal, Button, Breadcrumb } from '../../common/UI';
import { Input, Select } from '../../common/Forms';
import { useNotification } from '../../../context/NotificationContext';
import { createBulkOperation, listBulkOperations, type BulkOperation } from '../../../services/api/bulk-operations';
import { listPlayers } from '../../../services/api/players';

const OPERATION_TYPE_OPTIONS = [
  { value: 'STATUS_CHANGE', label: 'Status Change' },
  { value: 'VIP_LEVEL_UPDATE', label: 'VIP Level Update' },
  { value: 'BALANCE_ADJUSTMENT', label: 'Balance Adjustment' },
];

const STATUS_VALUE_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'BANNED', label: 'Banned' },
  { value: 'PENDING', label: 'Pending' },
];

const VIP_VALUE_OPTIONS = [
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'DIAMOND', label: 'Diamond' },
];

const OPERATION_TYPE_LABELS: Record<string, string> = {
  STATUS_CHANGE: 'Status Change',
  VIP_LEVEL_UPDATE: 'VIP Level Update',
  BALANCE_ADJUSTMENT: 'Balance Adjustment',
};

const MemberMassUpdate = () => {
  const { success, error: notifyError } = useNotification();
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [operationType, setOperationType] = useState('STATUS_CHANGE');
  const [value, setValue] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<{ id: string; label: string }[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerResults, setPlayerResults] = useState<any[]>([]);
  const [playerSearchLoading, setPlayerSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listBulkOperations();
      setOperations(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const openModal = () => {
    setOperationType('STATUS_CHANGE');
    setValue('');
    setSelectedPlayers([]);
    setPlayerSearch('');
    setPlayerResults([]);
    setFormError('');
    setModalOpen(true);
  };

  // Debounced player search, same pattern as MemberGroup's member picker.
  useEffect(() => {
    if (!modalOpen || !playerSearch.trim()) {
      setPlayerResults([]);
      return undefined;
    }
    let cancelled = false;
    setPlayerSearchLoading(true);
    const timer = setTimeout(() => {
      listPlayers({ search: playerSearch.trim() }, { page: 1, limit: 10 })
        .then((data) => {
          if (cancelled) return;
          const selectedIds = new Set(selectedPlayers.map((p) => p.id));
          setPlayerResults((data.nodes ?? []).filter((p: any) => !selectedIds.has(p.id)));
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
  }, [playerSearch, modalOpen, selectedPlayers, notifyError]);

  const addPlayer = (player: any) => {
    setSelectedPlayers((prev) => [...prev, { id: player.id, label: `${player.username || player.email} (${player.email})` }]);
    setPlayerSearch('');
    setPlayerResults([]);
  };

  const removePlayer = (id: string) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length === 0) {
      setFormError('Select at least one member.');
      return;
    }
    if (!value) {
      setFormError('A value is required for this operation.');
      return;
    }
    if (!window.confirm(`Apply this operation to ${selectedPlayers.length} member(s)? This cannot be undone.`)) return;

    setSaving(true);
    setFormError('');
    try {
      const result = await createBulkOperation({
        operationType,
        playerIds: selectedPlayers.map((p) => p.id),
        value,
      });
      setModalOpen(false);
      await fetchOperations();
      success(`Operation completed - ${result.affectedCount ?? 0} member(s) updated`);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Total Operations', value: operations.length.toLocaleString() },
    { label: 'Completed', value: operations.filter((o) => o.status === 'COMPLETED').length.toLocaleString() },
    { label: 'Failed', value: operations.filter((o) => o.status === 'FAILED').length.toLocaleString() },
    {
      label: 'Members Affected',
      value: operations.reduce((sum, o) => sum + o.affectedCount, 0).toLocaleString(),
    },
  ];

  const historyData = operations.map((o) => ({
    id: o.id,
    operation: OPERATION_TYPE_LABELS[o.operationType] || o.operationType,
    affected: o.affectedCount,
    status: o.status,
    date: new Date(o.createdAt).toLocaleString(),
  }));

  const columns = ['Operation Type', 'Members Affected', 'Status', 'Date'];
  const rowKeys = ['operation', 'affected', 'status', 'date'];

  const valueField = () => {
    if (operationType === 'STATUS_CHANGE') {
      return (
        <Select
          label="New Status"
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Select a status"
          options={STATUS_VALUE_OPTIONS}
        />
      );
    }
    if (operationType === 'VIP_LEVEL_UPDATE') {
      return (
        <Select
          label="New VIP Level"
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Select a VIP level"
          options={VIP_VALUE_OPTIONS}
        />
      );
    }
    return (
      <Input
        label="Balance Adjustment"
        name="value"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 50 or -20"
        required
      />
    );
  };

  return (
    <>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <ComponentTemplate
        title="Mass Update Operations"
        description="Perform bulk operations on multiple member accounts simultaneously"
        data={historyData}
        columns={columns}
        rowKeys={rowKeys}
        stats={stats}
        hasAddButton
        addButtonText="New Bulk Operation"
        onAdd={openModal}
        loading={loading}
        error={loadError ? `Failed to load operations: ${loadError}` : null}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Bulk Operation"
        size="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Running…' : 'Run Operation'}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600">{formError}</div>}

          <Select
            label="Operation Type"
            name="operationType"
            value={operationType}
            onChange={(e) => {
              setOperationType(e.target.value);
              setValue('');
            }}
            options={OPERATION_TYPE_OPTIONS}
          />

          {valueField()}

          <div>
            <Input
              label={`Members (${selectedPlayers.length} selected)`}
              name="playerSearch"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Search by username or email…"
              required
            />
            {playerSearchLoading ? (
              <div className="text-sm text-gray-500">Searching…</div>
            ) : playerResults.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-40 overflow-y-auto mb-2">
                {playerResults.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-900">
                      {p.username || p.email} <span className="text-gray-500">({p.email})</span>
                    </span>
                    <button onClick={() => addPlayer(p)} className="text-sm text-primary-600 hover:text-primary-900">
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {selectedPlayers.length > 0 && (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {selectedPlayers.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-900">{p.label}</span>
                    <button onClick={() => removePlayer(p.id)} className="text-sm text-red-600 hover:text-red-900">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MemberMassUpdate;
