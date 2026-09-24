import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
import useBettingLimits from '../hooks/useBettingLimits';

// There is no dedicated "bet limits" model on the backend - this tab edits
// the real per-game minBet/maxBet/maxWin fields on Game via updateGame().
// See useBettingLimits.js.

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'SLOTS', label: 'Slots' },
  { value: 'TABLE_GAMES', label: 'Table Games' },
  { value: 'LIVE_CASINO', label: 'Live Casino' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'VIRTUAL_SPORTS', label: 'Virtual Sports' },
  { value: 'LOTTERY', label: 'Lottery' },
];

const formatMoney = (value) => (value == null ? 'N/A' : `$${Number(value).toLocaleString()}`);

const getCategoryBadge = (category) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {category ? category.replace(/_/g, ' ') : 'Unknown'}
  </span>
);

const getStatusBadge = (status) => {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    COMING_SOON: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const BetLimitSettings = () => {
  const [filters, setFilters] = useState({ category: 'all' });
  const [editingGame, setEditingGame] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ minBet: '', maxBet: '', maxWin: '' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const { betLimits: games, loading, error, fetchBetLimits, updateBetLimit } = useBettingLimits();

  useEffect(() => {
    fetchBetLimits({ category: filters.category !== 'all' ? filters.category : undefined });
  }, [filters, fetchBetLimits]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditClick = (game) => {
    setEditingGame(game);
    setForm({
      minBet: game.minBet ?? '',
      maxBet: game.maxBet ?? '',
      maxWin: game.maxWin ?? '',
    });
    setSaveError('');
    setShowEditModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateBetLimit(editingGame.id, form);
      setShowEditModal(false);
    } catch (err) {
      setSaveError(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Game' },
    { key: 'categoryBadge', label: 'Category', sortable: false },
    { key: 'provider', label: 'Provider' },
    { key: 'minBetLabel', label: 'Min Bet' },
    { key: 'maxBetLabel', label: 'Max Bet' },
    { key: 'maxWinLabel', label: 'Max Win' },
    { key: 'statusBadge', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const processedData = (games || []).map((game) => ({
    id: game.id,
    name: game.name,
    categoryBadge: getCategoryBadge(game.category),
    provider: game.provider,
    minBetLabel: formatMoney(game.minBet),
    maxBetLabel: formatMoney(game.maxBet),
    maxWinLabel: formatMoney(game.maxWin),
    statusBadge: getStatusBadge(game.status),
    actions: (
      <button onClick={() => handleEditClick(game)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
        Edit Limits
      </button>
    ),
  }));

  const categoriesCount = new Set((games || []).map((g) => g.category)).size;
  const gamesWithLimits = (games || []).filter((g) => g.minBet != null || g.maxBet != null).length;

  const renderEditModal = () => (
    <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Limits: ${editingGame?.name || ''}`}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {saveError && <div className="text-sm text-red-600">{saveError}</div>}
        <Input
          name="minBet"
          label="Minimum Bet ($)"
          type="number"
          step="0.01"
          value={form.minBet}
          onChange={(e) => setForm((prev) => ({ ...prev, minBet: e.target.value }))}
          required
        />
        <Input
          name="maxBet"
          label="Maximum Bet ($)"
          type="number"
          step="0.01"
          value={form.maxBet}
          onChange={(e) => setForm((prev) => ({ ...prev, maxBet: e.target.value }))}
          required
        />
        <Input
          name="maxWin"
          label="Maximum Win ($)"
          type="number"
          step="0.01"
          value={form.maxWin}
          onChange={(e) => setForm((prev) => ({ ...prev, maxWin: e.target.value }))}
        />
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Limits'}</Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bet Limit Settings</h2>
            <p className="text-sm text-gray-500">Per-game min/max bet and max win, stored on the Game record</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select name="category" label="Category" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} options={CATEGORY_OPTIONS} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Games</p>
              <p className="text-2xl font-bold text-blue-800">{(games || []).length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Games With Limits Set</p>
              <p className="text-2xl font-bold text-green-800">{gamesWithLimits}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Categories</p>
              <p className="text-2xl font-bold text-yellow-800">{categoriesCount}</p>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4" />
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded mb-2" />)}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table columns={columns} data={processedData} emptyMessage="No games found" />
          )}
        </div>
      </Card>

      {renderEditModal()}
    </div>
  );
};

export default BetLimitSettings;
