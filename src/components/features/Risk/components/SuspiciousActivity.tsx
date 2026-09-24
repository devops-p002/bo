import React, { useState } from 'react';
import { Card, Table, Button } from '../../../common/UI';
import useRisk from '../hooks/useRisk';

// Real backend fields only: Bet.riskScore/riskFlags and Transaction.riskScore
// /riskFlags via Query.highRiskBets / Query.highRiskTransactions (both
// already filter for riskScore >= 70 server-side). There's no
// "detectionMethod"/"evidence"/"confidence"/"status" case-management concept
// on the backend, so this shows the real flagged records instead of the old
// fabricated workflow.
const RiskScoreBadge = ({ score }) => {
  let colorClass = 'bg-green-100 text-green-800';
  if (score >= 90) colorClass = 'bg-red-100 text-red-800';
  else if (score >= 80) colorClass = 'bg-yellow-100 text-yellow-800';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{score}</span>;
};

const FlagsList = ({ flags }) => {
  if (!flags || flags.length === 0) return <span className="text-gray-400 text-xs">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f, i) => (
        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">{f}</span>
      ))}
    </div>
  );
};

const SuspiciousActivity = () => {
  const {
    highRiskBets,
    highRiskBetsTotalCount,
    highRiskTransactions,
    highRiskTransactionsTotalCount,
    suspiciousLoading,
    suspiciousError,
    refetch,
  } = useRisk();
  const [tab, setTab] = useState('bets');

  const betColumns = [
    { header: 'Member', accessor: 'member' },
    { header: 'Game', accessor: 'gameName' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Risk Score', accessor: 'riskScore' },
    { header: 'Risk Flags', accessor: 'riskFlags' },
    { header: 'Created', accessor: 'createdAt' },
  ];

  const transactionColumns = [
    { header: 'Member', accessor: 'member' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Risk Score', accessor: 'riskScore' },
    { header: 'Risk Flags', accessor: 'riskFlags' },
    { header: 'Created', accessor: 'createdAt' },
  ];

  const betRows = highRiskBets.map((b) => ({
    id: b.id,
    member: b.user?.username || b.userId,
    gameName: b.gameName || '-',
    amount: `${(b.amount ?? 0).toLocaleString()} ${b.currency || ''}`.trim(),
    status: b.status,
    riskScore: <RiskScoreBadge score={b.riskScore} />,
    riskFlags: <FlagsList flags={b.riskFlags} />,
    createdAt: new Date(b.createdAt).toLocaleString(),
  }));

  const transactionRows = highRiskTransactions.map((t) => ({
    id: t.id,
    member: t.user?.username || t.userId,
    type: t.type,
    amount: `${(t.amount ?? 0).toLocaleString()} ${t.currency || ''}`.trim(),
    status: t.status,
    riskScore: <RiskScoreBadge score={t.riskScore} />,
    riskFlags: <FlagsList flags={t.riskFlags} />,
    createdAt: new Date(t.createdAt).toLocaleString(),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Suspicious Activity</h2>
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">High-Risk Bets (score &ge; 70)</p>
              <p className="text-2xl font-bold text-red-800">{highRiskBetsTotalCount}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="text-sm text-orange-600">High-Risk Transactions (score &ge; 70)</p>
              <p className="text-2xl font-bold text-orange-800">{highRiskTransactionsTotalCount}</p>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setTab('bets')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  tab === 'bets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                High-Risk Bets ({highRiskBets.length})
              </button>
              <button
                onClick={() => setTab('transactions')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  tab === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                High-Risk Transactions ({highRiskTransactions.length})
              </button>
            </nav>
          </div>

          {suspiciousLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : suspiciousError ? (
            <div className="text-red-500">{suspiciousError}</div>
          ) : tab === 'bets' ? (
            <Table columns={betColumns} data={betRows} emptyMessage="No high-risk bets found." />
          ) : (
            <Table columns={transactionColumns} data={transactionRows} emptyMessage="No high-risk transactions found." />
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuspiciousActivity;
