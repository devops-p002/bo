import React, { useMemo, useState } from 'react';
import { Card, Table, Button } from '../../../common/UI';
import { Select } from '../../../common/Forms';
import useRisk from '../hooks/useRisk';

// Real backend fields only: User.vipLevel/totalDeposits/totalBets/
// totalWithdrawals/totalWins and the per-user RiskAssessment (via
// User.riskAssessment). There's no dedicated "high roller" concept, betting
// history time series, or game-preference breakdown on the backend - GOLD/
// PLATINUM/DIAMOND members are treated as high rollers and ranked by real
// deposit/bet volume instead.
const VIP_BADGE_COLORS = {
  DIAMOND: 'bg-purple-100 text-purple-800',
  PLATINUM: 'bg-gray-200 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
};

const VipBadge = ({ level }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${VIP_BADGE_COLORS[level] || 'bg-gray-100 text-gray-800'}`}>
    {level}
  </span>
);

const RiskBadge = ({ level }) => {
  if (!level) return <span className="text-gray-400 text-xs">Not assessed</span>;
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-red-200 text-red-900',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}`}>{level}</span>;
};

const HighRollerMonitoring = () => {
  const { highRollers, highRollersLoading, highRollersError, refetch } = useRisk();
  const [vipFilter, setVipFilter] = useState('all');

  const filtered = useMemo(
    () => (vipFilter === 'all' ? highRollers : highRollers.filter((u) => u.vipLevel === vipFilter)),
    [highRollers, vipFilter]
  );

  const columns = [
    { header: 'Member', accessor: 'username' },
    { header: 'VIP Level', accessor: 'vipLevel' },
    { header: 'Balance', accessor: 'balance' },
    { header: 'Total Deposits', accessor: 'totalDeposits' },
    { header: 'Total Bets', accessor: 'totalBets' },
    { header: 'Risk', accessor: 'risk' },
  ];

  const rows = filtered.map((u) => ({
    id: u.id,
    username: u.username,
    vipLevel: <VipBadge level={u.vipLevel} />,
    balance: `${(u.balance ?? 0).toLocaleString()} ${u.currency || ''}`.trim(),
    totalDeposits: (u.totalDeposits ?? 0).toLocaleString(),
    totalBets: (u.totalBets ?? 0).toLocaleString(),
    risk: <RiskBadge level={u.riskAssessment?.riskLevel} />,
  }));

  const counts = {
    diamond: highRollers.filter((u) => u.vipLevel === 'DIAMOND').length,
    platinum: highRollers.filter((u) => u.vipLevel === 'PLATINUM').length,
    gold: highRollers.filter((u) => u.vipLevel === 'GOLD').length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">High Roller Monitoring</h2>
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Gold, Platinum and Diamond VIP members, ranked by total deposits. Betting history charts and
            game-preference breakdowns aren&apos;t tracked on the backend, so only real fields are shown.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-600">Diamond</p>
              <p className="text-2xl font-bold text-purple-800">{counts.diamond}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Platinum</p>
              <p className="text-2xl font-bold text-gray-800">{counts.platinum}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Gold</p>
              <p className="text-2xl font-bold text-yellow-800">{counts.gold}</p>
            </div>
          </div>

          <div className="mb-4 max-w-xs">
            <Select
              name="vipLevelFilter"
              label="VIP Level"
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All High Rollers' },
                { value: 'DIAMOND', label: 'Diamond' },
                { value: 'PLATINUM', label: 'Platinum' },
                { value: 'GOLD', label: 'Gold' },
              ]}
            />
          </div>

          {highRollersLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : highRollersError ? (
            <div className="text-red-500">{highRollersError}</div>
          ) : (
            <Table columns={columns} data={rows} emptyMessage="No Gold/Platinum/Diamond members found." />
          )}
        </div>
      </Card>
    </div>
  );
};

export default HighRollerMonitoring;
