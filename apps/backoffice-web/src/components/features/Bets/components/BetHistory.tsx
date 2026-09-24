import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
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

const getProfitLossDisplay = (bet) => {
  if (bet.status !== 'SETTLED' && bet.status !== 'PARTIALLY_SETTLED') {
    return <span className="text-gray-400">-</span>;
  }
  const profitLoss = (bet.winAmount ?? 0) - bet.amount;
  const color = profitLoss > 0 ? 'text-green-600' : profitLoss < 0 ? 'text-red-600' : 'text-gray-600';
  return (
    <span className={`font-medium ${color}`}>
      {profitLoss > 0 ? '+' : ''}{formatMoney(profitLoss)}
    </span>
  );
};

const toCsv = (rows) => {
  const header = ['Bet ID', 'Player', 'Game', 'Type', 'Amount', 'Win Amount', 'Status', 'Placed At', 'Settled At'];
  const lines = rows.map((bet) => [
    bet.id,
    bet.user?.username ?? bet.userId,
    bet.gameName || bet.gameCategory || '',
    bet.type,
    bet.amount,
    bet.winAmount ?? '',
    bet.status,
    bet.createdAt,
    bet.settledAt || '',
  ].join(','));
  return [header.join(','), ...lines].join('\n');
};

const BetHistory = ({ filters: externalFilters }: { filters?: any } = {}) => {
  const [filters, setFilters] = useState({
    status: 'all',
    gameCategory: 'all',
    playerUsername: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });
  const [selectedBet, setSelectedBet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { bets, betsTotalCount, loading, error, fetchBets } = useBets();

  useEffect(() => {
    const backendFilter: any = {};
    if (filters.status !== 'all') backendFilter.status = filters.status;
    if (filters.minAmount !== '') backendFilter.minAmount = parseFloat(filters.minAmount);
    if (filters.maxAmount !== '') backendFilter.maxAmount = parseFloat(filters.maxAmount);
    if (filters.dateFrom && filters.dateTo) {
      backendFilter.dateRange = {
        start: new Date(filters.dateFrom).toISOString(),
        end: new Date(filters.dateTo + 'T23:59:59').toISOString(),
      };
    }
    fetchBets(backendFilter, { page: currentPage, limit: pageSize });
  }, [filters, currentPage, pageSize, fetchBets]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: 'all', gameCategory: 'all', playerUsername: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' });
    setCurrentPage(1);
  };

  const handleBetClick = (bet) => {
    setSelectedBet(bet);
    setShowModal(true);
  };

  // Client-side filters for fields the backend doesn't filter on
  // (BetFilterInput has no gameCategory / username search).
  const visibleBets = useMemo(() => {
    return (bets || []).filter((bet) => {
      if (filters.gameCategory !== 'all' && bet.gameCategory !== filters.gameCategory) return false;
      if (filters.playerUsername && !(bet.user?.username || '').toLowerCase().includes(filters.playerUsername.toLowerCase())) return false;
      return true;
    });
  }, [bets, filters.gameCategory, filters.playerUsername]);

  const handleExport = () => {
    const csv = toCsv(visibleBets);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bet-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalVolume = visibleBets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalPayout = visibleBets.reduce((sum, b) => sum + (b.status === 'SETTLED' || b.status === 'PARTIALLY_SETTLED' ? (b.winAmount || 0) : 0), 0);
  const netProfit = totalVolume - totalPayout;
  const houseEdge = totalVolume > 0 ? ((netProfit / totalVolume) * 100).toFixed(1) : '0.0';

  const columns = [
    { key: 'id', label: 'Bet ID' },
    { key: 'player', label: 'Player' },
    { key: 'gameBadge', label: 'Game', sortable: false },
    { key: 'type', label: 'Type' },
    { key: 'amountLabel', label: 'Amount' },
    { key: 'payoutLabel', label: 'Payout' },
    { key: 'profitLoss', label: 'Profit/Loss', sortable: false },
    { key: 'placedAt', label: 'Placed At' },
    { key: 'settledAt', label: 'Settled At' },
    { key: 'statusBadge', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const processedData = visibleBets.map((bet) => ({
    id: bet.id,
    player: bet.user?.username ?? bet.userId,
    gameBadge: getGameBadge(bet.gameCategory),
    type: bet.type,
    amountLabel: formatMoney(bet.amount),
    payoutLabel: bet.winAmount != null ? formatMoney(bet.winAmount) : '-',
    profitLoss: getProfitLossDisplay(bet),
    placedAt: new Date(bet.createdAt).toLocaleString(),
    settledAt: bet.settledAt ? new Date(bet.settledAt).toLocaleString() : '-',
    statusBadge: getStatusBadge(bet.status),
    actions: (
      <button onClick={() => handleBetClick(bet)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
        View Details
      </button>
    ),
  }));

  const totalPages = Math.max(1, Math.ceil(betsTotalCount / pageSize));

  const renderBetModal = () => {
    if (!selectedBet) return null;
    return (
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Bet History Details: ${selectedBet.id}`} size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Bet Amount</div>
              <div className="text-2xl font-bold text-blue-800">{formatMoney(selectedBet.amount)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-600">Win Amount</div>
              <div className="text-2xl font-bold text-green-800">{selectedBet.winAmount != null ? formatMoney(selectedBet.winAmount) : 'N/A'}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-purple-600">Profit/Loss</div>
              <div className="text-2xl font-bold text-purple-800">{getProfitLossDisplay(selectedBet)}</div>
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
                <div><span className="font-medium">Player:</span><span className="ml-2">{selectedBet.user?.username ?? selectedBet.userId}</span></div>
                <div><span className="font-medium">Game:</span><span className="ml-2">{selectedBet.gameName || selectedBet.gameCategory}</span></div>
                <div><span className="font-medium">Bet Type:</span><span className="ml-2">{selectedBet.type}</span></div>
                <div><span className="font-medium">Odds:</span><span className="ml-2">{selectedBet.odds}</span></div>
                <div><span className="font-medium">Placed At:</span><span className="ml-2">{new Date(selectedBet.createdAt).toLocaleString()}</span></div>
                <div><span className="font-medium">Settled At:</span><span className="ml-2">{selectedBet.settledAt ? new Date(selectedBet.settledAt).toLocaleString() : 'Not settled'}</span></div>
                <div><span className="font-medium">IP Address:</span><span className="ml-2">{selectedBet.ipAddress || 'N/A'}</span></div>
                <div><span className="font-medium">Risk Score:</span><span className="ml-2">{selectedBet.riskScore ?? 0}/100</span></div>
              </div>
            </div>
          </Card>

          {selectedBet.voidReason && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Void Reason</h3>
                <p className="text-gray-700 text-sm">{selectedBet.voidReason}</p>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bet History</h2>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
              <Button variant="primary" onClick={handleExport}>Export CSV</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select name="status" label="Status" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} options={STATUS_OPTIONS} />
            <Select
              name="gameCategory"
              label="Game Category"
              value={filters.gameCategory}
              onChange={(e) => handleFilterChange('gameCategory', e.target.value)}
              options={[
                { value: 'all', label: 'All Games' },
                { value: 'SLOTS', label: 'Slots' },
                { value: 'TABLE_GAMES', label: 'Table Games' },
                { value: 'LIVE_CASINO', label: 'Live Casino' },
                { value: 'SPORTS', label: 'Sports' },
                { value: 'VIRTUAL_SPORTS', label: 'Virtual Sports' },
                { value: 'LOTTERY', label: 'Lottery' },
              ]}
            />
            <Input name="playerUsername" label="Player Username" value={filters.playerUsername} onChange={(e) => handleFilterChange('playerUsername', e.target.value)} placeholder="Search by username..." />
            <div className="grid grid-cols-2 gap-2">
              <Input name="dateFrom" label="From" type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} />
              <Input name="dateTo" label="To" type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input name="minAmount" label="Min Amount ($)" type="number" value={filters.minAmount} onChange={(e) => handleFilterChange('minAmount', e.target.value)} />
            <Input name="maxAmount" label="Max Amount ($)" type="number" value={filters.maxAmount} onChange={(e) => handleFilterChange('maxAmount', e.target.value)} />
            <Select
              name="pageSize"
              label="Show"
              value={pageSize.toString()}
              onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
              options={[
                { value: '10', label: '10 per page' },
                { value: '25', label: '25 per page' },
                { value: '50', label: '50 per page' },
                { value: '100', label: '100 per page' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Bets</p>
              <p className="text-2xl font-bold text-blue-800">{betsTotalCount.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Total Volume</p>
              <p className="text-2xl font-bold text-green-800">{formatMoney(totalVolume)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-600">Total Payout</p>
              <p className="text-2xl font-bold text-purple-800">{formatMoney(totalPayout)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">House Edge</p>
              <p className="text-2xl font-bold text-yellow-800">{houseEdge}%</p>
            </div>
            <div className={`p-4 rounded ${netProfit > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit > 0 ? 'text-green-800' : 'text-red-800'}`}>{formatMoney(netProfit)}</p>
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
            <>
              <Table columns={columns} data={processedData} emptyMessage="No bets found" />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({betsTotalCount} total)
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage <= 1} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {renderBetModal()}
    </div>
  );
};

export default BetHistory;
