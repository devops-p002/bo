import React, { useState } from 'react';
import { Card, Table, Button } from '../../../common/UI';
import { Input } from '../../../common/Forms';
import useRisk from '../hooks/useRisk';

// Real backend data only: a per-member activity trail built from their real
// bets + transactions (User.bets / User.transactions), merged and sorted by
// createdAt. There's no login/device/IP/location activity log on the
// backend, so those fields have been dropped rather than fabricated.
const RiskScoreBadge = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-gray-400 text-xs">-</span>;
  let colorClass = 'bg-green-100 text-green-800';
  if (score >= 70) colorClass = 'bg-red-100 text-red-800';
  else if (score >= 40) colorClass = 'bg-yellow-100 text-yellow-800';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{score}</span>;
};

const KindBadge = ({ kind }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${kind === 'Bet' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
    {kind}
  </span>
);

const MemberTrace = () => {
  const { traceUser, memberTrace, traceLoading, traceError, searchMembers, fetchMemberTrace } = useRisk();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const results = await searchMembers(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const selectMember = async (user) => {
    setSearchResults([]);
    setSearchTerm(user.username);
    await fetchMemberTrace(user.id);
  };

  const columns = [
    { header: 'Type', accessor: 'kind' },
    { header: 'Description', accessor: 'description' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Risk Score', accessor: 'riskScore' },
    { header: 'When', accessor: 'when' },
  ];

  const rows = memberTrace.map((item) => ({
    id: item.id,
    kind: <KindBadge kind={item.kind} />,
    description: item.description,
    amount: `${(item.amount ?? 0).toLocaleString()} ${item.currency || ''}`.trim(),
    status: item.status,
    riskScore: <RiskScoreBadge score={item.riskScore} />,
    when: new Date(item.createdAt).toLocaleString(),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Member Trace</h2>
          <form onSubmit={handleSearch} className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <Input
                name="traceSearch"
                label="Search Member"
                placeholder="Username, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" isLoading={searching}>Search</Button>
          </form>

          {searchResults.length > 0 && (
            <div className="border rounded mb-4 divide-y">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectMember(u)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center"
                >
                  <span>{u.username} <span className="text-gray-500 text-sm">({u.email})</span></span>
                  <span className="text-xs text-gray-500">{u.vipLevel}</span>
                </button>
              ))}
            </div>
          )}

          {searchError && <div className="text-red-500 text-sm">{searchError}</div>}
        </div>
      </Card>

      {traceUser && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{traceUser.username}</h3>
                <p className="text-sm text-gray-500">{traceUser.email} - {traceUser.vipLevel}</p>
              </div>
              {traceUser.riskAssessment && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current Risk</div>
                  <div className="text-lg font-bold">{traceUser.riskAssessment.riskScore} ({traceUser.riskAssessment.riskLevel})</div>
                </div>
              )}
            </div>

            {traceLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            ) : traceError ? (
              <div className="text-red-500">{traceError}</div>
            ) : (
              <Table columns={columns} data={rows} emptyMessage="No bets or transactions found for this member." />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MemberTrace;
