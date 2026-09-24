import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, Modal, Breadcrumb } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
import { useTheme } from '../../../../context/ThemeContext';
import { BetLimitSettings, BetSettlement, BettingPatterns, PendingBets, BetHistory } from '../components';
import useBets from '../hooks/useBets';

// Maps each routed path under /bets to the tab it should open on
const TAB_BY_PATH = {
  '/bets': 'pending',
  '/bets/pending': 'pending',
  '/bets/settlement': 'settlement',
  '/bets/patterns': 'patterns',
  '/bets/limit-set': 'limits',
};

const formatMoney = (value) => `$${Number(value ?? 0).toLocaleString()}`;

const BetsPage = () => {
  const { isDarkTheme } = useTheme();
  const { pendingBets, bets, betsTotalCount, settleBet, refetch } = useBets();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(TAB_BY_PATH[location.pathname] || 'pending');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [settlementForm, setSettlementForm] = useState({ outcome: '', winAmount: '', notes: '' });

  const tabs = [
    { id: 'pending', label: 'Pending Bets', icon: '⏳' },
    { id: 'history', label: 'Bet History', icon: '📋' },
    { id: 'patterns', label: 'Betting Patterns', icon: '📊' },
    { id: 'limits', label: 'Bet Limits', icon: '⚙️' },
    { id: 'settlement', label: 'Settlement', icon: '✅' },
  ];

  const handleSettleBet = async (e) => {
    e.preventDefault();
    if (!selectedBet) return;
    try {
      await settleBet(selectedBet.id, settlementForm.outcome, {
        winAmount: settlementForm.winAmount,
        notes: settlementForm.notes,
      });
      setShowSettlementModal(false);
      setSelectedBet(null);
      setSettlementForm({ outcome: '', winAmount: '', notes: '' });
    } catch (error) {
      console.error('Failed to settle bet:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <PendingBets
            onSettleBet={(bet) => {
              setSelectedBet(bet);
              setSettlementForm({ outcome: '', winAmount: (bet.potentialWin ?? '').toString(), notes: '' });
              setShowSettlementModal(true);
            }}
          />
        );
      case 'history':
        return <BetHistory />;
      case 'patterns':
        return <BettingPatterns />;
      case 'limits':
        return <BetLimitSettings />;
      case 'settlement':
        return <BetSettlement />;
      default:
        return <PendingBets />;
    }
  };

  // Real, derived stats from the currently loaded bets/pendingBets pages
  // (not the full dataset - Query.bets/pendingBets are paginated and there
  // is no dedicated bet-stats query on the backend).
  const pendingVolume = pendingBets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const settledBets = bets.filter((b) => b.status === 'SETTLED');
  const wonBets = settledBets.filter((b) => (b.winAmount ?? 0) > 0);
  const winRate = settledBets.length ? ((wonBets.length / settledBets.length) * 100).toFixed(1) : '0.0';
  const totalVolume = bets.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bet Management</h1>
          <p className="text-gray-600">Manage bets, limits, and settlements</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setActiveTab('limits')} variant="outline">
            Configure Limits
          </Button>
          <Button onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bets</p>
                <p className="text-2xl font-bold text-orange-600">{pendingBets.length}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600">⏳</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Total value: {formatMoney(pendingVolume)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bets Loaded</p>
                <p className="text-2xl font-bold text-blue-600">{bets.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">{betsTotalCount} total in system</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-green-600">{formatMoney(totalVolume)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">💰</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Across loaded bets</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-purple-600">{winRate}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">🎯</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Of {settledBets.length} settled bets</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>

      {/* Settlement Modal (shared by the Pending Bets tab's "Settle" action) */}
      <Modal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        title="Settle Bet"
        size="md"
      >
        {selectedBet && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Bet Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bet ID:</span>
                  <span className="ml-2 font-medium">{selectedBet.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">{formatMoney(selectedBet.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Player:</span>
                  <span className="ml-2 font-medium">{selectedBet.user?.username ?? selectedBet.userId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Game:</span>
                  <span className="ml-2 font-medium">{selectedBet.gameName || selectedBet.gameCategory}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSettleBet}>
              <Select
                name="outcome"
                label="Settlement Outcome"
                required
                value={settlementForm.outcome}
                onChange={(e) => setSettlementForm(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="Select an outcome"
                options={[
                  { value: 'won', label: 'Player Won' },
                  { value: 'lost', label: 'Player Lost' },
                  { value: 'push', label: 'Push/Tie' },
                  { value: 'cancelled', label: 'Cancel Bet' },
                ]}
              />

              <Input
                name="winAmount"
                label="Win Amount (if applicable)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={settlementForm.winAmount}
                onChange={(e) => setSettlementForm(prev => ({ ...prev, winAmount: e.target.value }))}
              />

              <Input
                name="notes"
                label="Settlement Notes"
                placeholder="Additional notes about the settlement..."
                value={settlementForm.notes}
                onChange={(e) => setSettlementForm(prev => ({ ...prev, notes: e.target.value }))}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSettlementModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Settle Bet
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default BetsPage;
