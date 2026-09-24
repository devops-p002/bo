import React, { useMemo, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
import useBets from '../hooks/useBets';

const GAME_CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Games' },
  { value: 'SLOTS', label: 'Slots' },
  { value: 'LIVE_CASINO', label: 'Live Casino' },
  { value: 'GAME_SHOWS', label: 'Game Shows' },
  { value: 'TABLE_GAMES', label: 'Table Games' },
  { value: 'ORIGINALS', label: 'Originals' },
];

const TIME_RANGE_MS = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const formatMoney = (value) => `$${Number(value ?? 0).toLocaleString()}`;

const getGameTypeBadge = (gameCategory) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {gameCategory ? gameCategory.replace(/_/g, ' ') : 'Unknown'}
  </span>
);

const getRiskBadge = (riskScore) => {
  const score = riskScore ?? 0;
  const level = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  const color =
    level === 'High' ? 'bg-red-100 text-red-800' : level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {level} ({score})
    </span>
  );
};

const getTimePending = (createdAt) => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const PendingBets = ({ onSettleBet }: { onSettleBet?: any } = {}) => {
  const [filters, setFilters] = useState({
    gameCategory: 'all',
    minAmount: '',
    maxAmount: '',
    timeRange: '30d',
  });
  const [selectedBet, setSelectedBet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const { pendingBets, loading, error, settleBet, voidBet, bulkSettleBets } = useBets();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredBets = useMemo(() => {
    const min = filters.minAmount !== '' ? parseFloat(filters.minAmount) : null;
    const max = filters.maxAmount !== '' ? parseFloat(filters.maxAmount) : null;
    const cutoff = TIME_RANGE_MS[filters.timeRange] ? Date.now() - TIME_RANGE_MS[filters.timeRange] : null;
    return (pendingBets || []).filter((bet) => {
      if (filters.gameCategory !== 'all' && bet.gameCategory !== filters.gameCategory) return false;
      if (min !== null && bet.amount < min) return false;
      if (max !== null && bet.amount > max) return false;
      if (cutoff !== null && new Date(bet.createdAt).getTime() < cutoff) return false;
      return true;
    });
  }, [pendingBets, filters]);

  const handleBetClick = (bet) => {
    setSelectedBet(bet);
    setShowModal(true);
  };

  const handleSelectBet = (betId) => {
    setSelectedBets((prev) => (prev.includes(betId) ? prev.filter((id) => id !== betId) : [...prev, betId]));
  };

  const handleSelectAll = () => {
    if (selectedBets.length === filteredBets.length) {
      setSelectedBets([]);
    } else {
      setSelectedBets(filteredBets.map((bet) => bet.id));
    }
  };

  const handleQuickSettle = async (bet, outcome) => {
    try {
      if (outcome === 'void') {
        await voidBet(bet.id, 'Voided from Pending Bets list');
      } else {
        await settleBet(bet.id, outcome);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error settling bet:', err);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedBets.length === 0) return;
    try {
      await bulkSettleBets(selectedBets, bulkAction);
      setSelectedBets([]);
      setShowBulkModal(false);
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  const renderActions = (bet) => (
    <div className="flex space-x-1">
      <button onClick={() => handleBetClick(bet)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
        View
      </button>
      {onSettleBet ? (
        <button
          onClick={() => onSettleBet(bet)}
          className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
        >
          Settle
        </button>
      ) : (
        <>
          <button onClick={() => handleQuickSettle(bet, 'won')} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
            Win
          </button>
          <button onClick={() => handleQuickSettle(bet, 'lost')} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
            Lose
          </button>
        </>
      )}
      <button onClick={() => handleQuickSettle(bet, 'void')} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
        Void
      </button>
    </div>
  );

  const renderSelectCheckbox = (bet) => (
    <input
      type="checkbox"
      checked={selectedBets.includes(bet.id)}
      onChange={() => handleSelectBet(bet.id)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  );

  const columns = [
    { key: 'select', label: 'Select', sortable: false },
    { key: 'id', label: 'Bet ID' },
    { key: 'player', label: 'Player' },
    { key: 'gameBadge', label: 'Game', sortable: false },
    { key: 'type', label: 'Type' },
    { key: 'amountLabel', label: 'Amount' },
    { key: 'potentialWinLabel', label: 'Potential Payout' },
    { key: 'placedAt', label: 'Placed At' },
    { key: 'timePending', label: 'Time Pending' },
    { key: 'riskBadge', label: 'Risk', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const processedData = filteredBets.map((bet) => ({
    id: bet.id,
    select: renderSelectCheckbox(bet),
    player: bet.username,
    gameBadge: getGameTypeBadge(bet.gameCategory),
    type: bet.type,
    amountLabel: formatMoney(bet.amount),
    potentialWinLabel: formatMoney(bet.potentialWin),
    placedAt: new Date(bet.createdAt).toLocaleString(),
    timePending: getTimePending(bet.createdAt),
    riskBadge: getRiskBadge(bet.riskScore),
    actions: renderActions(bet),
    _bet: bet,
  }));

  const totalVolume = filteredBets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalPotential = filteredBets.reduce((sum, b) => sum + (b.potentialWin || 0), 0);
  const highRiskCount = filteredBets.filter((b) => (b.riskScore ?? 0) >= 70).length;
  const avgTimePending = filteredBets.length
    ? Math.round(filteredBets.reduce((sum, b) => sum + (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60), 0) / filteredBets.length)
    : 0;

  const renderBetModal = () => {
    if (!selectedBet) return null;
    return (
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Pending Bet Details: ${selectedBet.id}`} size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Bet Amount</div>
              <div className="text-2xl font-bold text-blue-800">{formatMoney(selectedBet.amount)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-600">Potential Payout</div>
              <div className="text-2xl font-bold text-green-800">{formatMoney(selectedBet.potentialWin)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-purple-600">Time Pending</div>
              <div className="text-2xl font-bold text-purple-800">{getTimePending(selectedBet.createdAt)}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-yellow-600">Risk Score</div>
              <div className="text-lg font-bold text-yellow-800">{selectedBet.riskScore ?? 0}/100</div>
            </div>
          </div>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Bet Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Player:</span><span className="ml-2">{selectedBet.username}</span></div>
                <div><span className="font-medium">Game:</span><span className="ml-2">{selectedBet.gameName || selectedBet.game?.name || selectedBet.gameCategory}</span></div>
                <div><span className="font-medium">Bet Type:</span><span className="ml-2">{selectedBet.type}</span></div>
                <div><span className="font-medium">Odds:</span><span className="ml-2">{selectedBet.odds}</span></div>
                <div><span className="font-medium">Placed At:</span><span className="ml-2">{new Date(selectedBet.createdAt).toLocaleString()}</span></div>
                <div><span className="font-medium">IP Address:</span><span className="ml-2">{selectedBet.ipAddress || 'N/A'}</span></div>
              </div>
            </div>
          </Card>

          {selectedBet.riskFlags && selectedBet.riskFlags.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Risk Flags</h3>
                <p className="text-gray-700 text-sm">{selectedBet.riskFlags.join(', ')}</p>
              </div>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="success" onClick={() => handleQuickSettle(selectedBet, 'won')}>Mark as Won</Button>
            <Button variant="danger" onClick={() => handleQuickSettle(selectedBet, 'lost')}>Mark as Lost</Button>
            <Button variant="warning" onClick={() => handleQuickSettle(selectedBet, 'void')}>Void Bet</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderBulkModal = () => (
    <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title={`Bulk Action: ${selectedBets.length} bets selected`}>
      <div className="space-y-4">
        <Select
          name="bulkAction"
          label="Action"
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          placeholder="Select Action"
          options={[
            { value: 'won', label: 'Mark as Won' },
            { value: 'lost', label: 'Mark as Lost' },
            { value: 'void', label: 'Void All' },
          ]}
          required
        />
        <div className="bg-yellow-50 p-4 rounded">
          <p className="text-sm text-yellow-800">
            This action will be applied to {selectedBets.length} selected bets. This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleBulkAction} disabled={!bulkAction}>Apply Action</Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Bets</h2>
            {selectedBets.length > 0 && (
              <Button variant="primary" onClick={() => setShowBulkModal(true)}>
                Bulk Action ({selectedBets.length})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select
              name="gameCategory"
              label="Game Category"
              value={filters.gameCategory}
              onChange={(e) => handleFilterChange('gameCategory', e.target.value)}
              options={GAME_CATEGORY_OPTIONS}
            />
            <Input
              name="minAmount"
              label="Min Amount ($)"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />
            <Input
              name="maxAmount"
              label="Max Amount ($)"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
            <Select
              name="timeRange"
              label="Time Range"
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              options={[
                { value: '1h', label: 'Last Hour' },
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{filteredBets.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">High Risk</p>
              <p className="text-2xl font-bold text-red-800">{highRiskCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Volume</p>
              <p className="text-2xl font-bold text-blue-800">{formatMoney(totalVolume)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Potential Payout</p>
              <p className="text-2xl font-bold text-green-800">{formatMoney(totalPotential)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-600">Avg Time Pending</p>
              <p className="text-2xl font-bold text-purple-800">{avgTimePending}m</p>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={selectedBets.length === filteredBets.length && filteredBets.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
              <Table columns={columns} data={processedData} emptyMessage="No pending bets" />
            </div>
          )}
        </div>
      </Card>

      {renderBetModal()}
      {renderBulkModal()}
    </div>
  );
};

export default PendingBets;
