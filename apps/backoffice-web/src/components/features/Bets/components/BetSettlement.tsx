import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useBets from '../hooks/useBets';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'PARTIALLY_SETTLED', label: 'Partially Settled' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'VOID', label: 'Void' },
];

const formatMoney = (value) => `$${Number(value ?? 0).toLocaleString()}`;

const getGameBadge = (gameCategory) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {gameCategory ? gameCategory.replace(/_/g, ' ') : 'Unknown'}
  </span>
);

const STATUS_COLORS = {
  SETTLED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  VOID: 'bg-gray-100 text-gray-800',
  PARTIALLY_SETTLED: 'bg-blue-100 text-blue-800',
};

const getStatusBadge = (status) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
    {status}
  </span>
);

const BetSettlement = () => {
  const [filters, setFilters] = useState({
    status: 'PENDING',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedBet, setSelectedBet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementData, setSettlementData] = useState({ result: '', winAmount: '', notes: '' });

  const { bets, loading, error, fetchBets, settleBet, voidBet } = useBets();

  useEffect(() => {
    const backendFilter: any = {};
    if (filters.status !== 'all') backendFilter.status = filters.status;
    if (filters.dateFrom && filters.dateTo) {
      backendFilter.dateRange = {
        start: new Date(filters.dateFrom).toISOString(),
        end: new Date(filters.dateTo + 'T23:59:59').toISOString(),
      };
    }
    fetchBets(backendFilter, { page: 1, limit: 100 });
  }, [filters, fetchBets]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleBetClick = (bet) => {
    setSelectedBet(bet);
    setShowModal(true);
  };

  const handleSettleClick = (bet) => {
    setSelectedBet(bet);
    setSettlementData({ result: '', winAmount: (bet.potentialWin ?? '').toString(), notes: '' });
    setShowSettlementModal(true);
  };

  const handleVoidClick = async (betId) => {
     
    if (window.confirm('Are you sure you want to void this bet?')) {
      try {
        await voidBet(betId, 'Voided by administrator');
      } catch (err) {
        console.error('Error voiding bet:', err);
      }
    }
  };

  const handleSettlementSubmit = async (e) => {
    e.preventDefault();
    try {
      await settleBet(selectedBet.id, settlementData.result, {
        winAmount: settlementData.winAmount,
        notes: settlementData.notes,
      });
      setShowSettlementModal(false);
    } catch (err) {
      console.error('Error settling bet:', err);
    }
  };

  const renderActions = (bet) => (
    <div className="flex space-x-2">
      <button onClick={() => handleBetClick(bet)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">View</button>
      {bet.status === 'PENDING' && (
        <>
          <button onClick={() => handleSettleClick(bet)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Settle</button>
          <button onClick={() => handleVoidClick(bet.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Void</button>
        </>
      )}
    </div>
  );

  const columns = [
    { key: 'id', label: 'Bet ID' },
    { key: 'player', label: 'Player' },
    { key: 'gameBadge', label: 'Game', sortable: false },
    { key: 'type', label: 'Type' },
    { key: 'amountLabel', label: 'Amount' },
    { key: 'potentialWinLabel', label: 'Potential Payout' },
    { key: 'placedAt', label: 'Placed At' },
    { key: 'statusBadge', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const processedData = (bets || []).map((bet) => ({
    id: bet.id,
    player: bet.username,
    gameBadge: getGameBadge(bet.gameCategory),
    type: bet.type,
    amountLabel: formatMoney(bet.amount),
    potentialWinLabel: formatMoney(bet.potentialWin),
    placedAt: new Date(bet.createdAt).toLocaleString(),
    statusBadge: getStatusBadge(bet.status),
    actions: renderActions(bet),
  }));

  const pendingCount = (bets || []).filter((b) => b.status === 'PENDING').length;
  const settledCount = (bets || []).filter((b) => b.status === 'SETTLED').length;
  const voidCount = (bets || []).filter((b) => b.status === 'VOID' || b.status === 'CANCELLED').length;
  const totalVolume = (bets || []).reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalPayout = (bets || []).filter((b) => b.status === 'SETTLED').reduce((sum, b) => sum + (b.winAmount || 0), 0);

  const renderBetModal = () => {
    if (!selectedBet) return null;
    return (
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Bet Details: ${selectedBet.id}`} size="lg">
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
              <div className="text-sm text-purple-600">Odds</div>
              <div className="text-2xl font-bold text-purple-800">{selectedBet.odds}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-yellow-600">Status</div>
              <div className="text-lg font-bold text-yellow-800">{selectedBet.status}</div>
            </div>
          </div>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Bet Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Player:</span><span className="ml-2">{selectedBet.username}</span></div>
                <div><span className="font-medium">Game:</span><span className="ml-2">{selectedBet.gameName || selectedBet.gameCategory}</span></div>
                <div><span className="font-medium">Bet Type:</span><span className="ml-2">{selectedBet.type}</span></div>
                <div><span className="font-medium">Placed At:</span><span className="ml-2">{new Date(selectedBet.createdAt).toLocaleString()}</span></div>
                {selectedBet.settledAt && (
                  <div><span className="font-medium">Settled At:</span><span className="ml-2">{new Date(selectedBet.settledAt).toLocaleString()}</span></div>
                )}
                {selectedBet.winAmount != null && (
                  <div><span className="font-medium">Win Amount:</span><span className="ml-2">{formatMoney(selectedBet.winAmount)}</span></div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            {selectedBet.status === 'PENDING' && (
              <>
                <Button variant="success" onClick={() => handleSettleClick(selectedBet)}>Settle Bet</Button>
                <Button variant="danger" onClick={() => handleVoidClick(selectedBet.id)}>Void Bet</Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const renderSettlementModal = () => (
    <Modal isOpen={showSettlementModal} onClose={() => setShowSettlementModal(false)} title={`Settle Bet: ${selectedBet?.id}`}>
      <form onSubmit={handleSettlementSubmit} className="space-y-4">
        <Select
          name="result"
          label="Settlement Result"
          value={settlementData.result}
          onChange={(e) => setSettlementData((prev) => ({ ...prev, result: e.target.value }))}
          placeholder="Select an outcome"
          options={[
            { value: 'won', label: 'Won' },
            { value: 'lost', label: 'Lost' },
            { value: 'push', label: 'Push/Tie' },
            { value: 'cancelled', label: 'Cancel Bet' },
          ]}
          required
        />

        <Input
          name="winAmount"
          label="Win Amount ($)"
          type="number"
          step="0.01"
          value={settlementData.winAmount}
          onChange={(e) => setSettlementData((prev) => ({ ...prev, winAmount: e.target.value }))}
        />

        <Textarea
          label="Settlement Notes"
          value={settlementData.notes}
          onChange={(e) => setSettlementData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional notes about the settlement..."
          rows={3}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => setShowSettlementModal(false)}>Cancel</Button>
          <Button type="submit" variant="primary">Settle Bet</Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Bet Settlement</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select name="status" label="Status" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} options={STATUS_OPTIONS} />
            <Input name="dateFrom" label="From Date" type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} />
            <Input name="dateTo" label="To Date" type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Pending Bets</p>
              <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Settled Bets</p>
              <p className="text-2xl font-bold text-green-800">{settledCount}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Void/Cancelled</p>
              <p className="text-2xl font-bold text-gray-800">{voidCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Volume</p>
              <p className="text-2xl font-bold text-blue-800">{formatMoney(totalVolume)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-600">Total Payout</p>
              <p className="text-2xl font-bold text-purple-800">{formatMoney(totalPayout)}</p>
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
            <Table columns={columns} data={processedData} emptyMessage="No bets match the current filters" />
          )}
        </div>
      </Card>

      {renderBetModal()}
      {renderSettlementModal()}
    </div>
  );
};

export default BetSettlement;
