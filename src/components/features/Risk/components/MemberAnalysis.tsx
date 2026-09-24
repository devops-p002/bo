import React, { useState } from 'react';
import { Card, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useRiskAnalysis from '../hooks/useRiskAnalysis';

// Real backend data only: userRiskAssessment(userId) -> riskScore/riskLevel/
// factors/recommendations/notes, plus createRiskAssessment/
// updateRiskAssessment. The old mock hook fabricated trust/behavior/
// compliance scores, an activity-pattern time series and peer comparisons -
// none of that exists on the backend, so it's dropped rather than faked.
const LEVEL_COLORS = {
  LOW: 'text-green-600 bg-green-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  HIGH: 'text-red-600 bg-red-100',
  CRITICAL: 'text-red-800 bg-red-200',
};

const MemberAnalysis = () => {
  const { member, memberAnalysis, loading, error, searchMembers, fetchMemberAnalysis, runAssessment, updateAssessment } =
    useRiskAnalysis();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editScore, setEditScore] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setActionError('');
    try {
      const results = await searchMembers(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setActionError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const selectMember = async (user) => {
    setSearchResults([]);
    setSearchTerm(user.username);
    await fetchMemberAnalysis(user.id);
  };

  const handleRunAssessment = async () => {
    if (!member) return;
    setActionBusy(true);
    setActionError('');
    try {
      await runAssessment(member.id, actionNotes || null);
      setActionNotes('');
    } catch (err) {
      setActionError(err.message || 'Failed to run assessment');
    } finally {
      setActionBusy(false);
    }
  };

  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    if (!memberAnalysis) return;
    setActionBusy(true);
    setActionError('');
    try {
      const input: any = {};
      if (editScore !== '') input.riskScore = parseInt(editScore, 10);
      if (editLevel) input.riskLevel = editLevel;
      if (Object.keys(input).length === 0) return;
      await updateAssessment(memberAnalysis.id, input);
      setEditScore('');
      setEditLevel('');
    } catch (err) {
      setActionError(err.message || 'Failed to update assessment');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Member Analysis</h2>
          <form onSubmit={handleSearch} className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <Input
                name="memberSearch"
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

          {actionError && <div className="text-red-500 text-sm mb-4">{actionError}</div>}

          {loading && <div className="text-center py-8 text-gray-500">Loading member risk analysis...</div>}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </Card>

      {member && !loading && (
        <>
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">{member.username}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">Email:</span> <span className="ml-1">{member.email}</span></div>
                <div><span className="text-gray-500">VIP Level:</span> <span className="ml-1">{member.vipLevel}</span></div>
                <div><span className="text-gray-500">KYC Verified:</span> <span className="ml-1">{member.isKYCVerified ? 'Yes' : 'No'}</span></div>
                <div><span className="text-gray-500">Total Deposits:</span> <span className="ml-1">{(member.totalDeposits ?? 0).toLocaleString()}</span></div>
                <div><span className="text-gray-500">Total Withdrawals:</span> <span className="ml-1">{(member.totalWithdrawals ?? 0).toLocaleString()}</span></div>
                <div><span className="text-gray-500">Total Bets:</span> <span className="ml-1">{(member.totalBets ?? 0).toLocaleString()}</span></div>
                <div><span className="text-gray-500">Total Wins:</span> <span className="ml-1">{(member.totalWins ?? 0).toLocaleString()}</span></div>
              </div>
            </div>
          </Card>

          {memberAnalysis ? (
            <>
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Latest Risk Assessment</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[memberAnalysis.riskLevel] || 'bg-gray-100 text-gray-800'}`}>
                      {memberAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Risk Score</div>
                      <div className="text-2xl font-bold text-gray-900">{memberAnalysis.riskScore}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Assessed At</div>
                      <div className="text-sm font-medium">{new Date(memberAnalysis.assessedAt).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Assessed By</div>
                      <div className="text-sm font-medium">{memberAnalysis.assessedByUser?.username || 'System'}</div>
                    </div>
                  </div>

                  {memberAnalysis.factors?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {memberAnalysis.factors.map((f, i) => (
                          <div key={i} className="border-l-4 border-red-400 pl-3 text-sm">
                            <span className="font-medium">{f.type}</span> - {f.description} (score: {f.score}, {f.severity})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberAnalysis.recommendations?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {memberAnalysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {memberAnalysis.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Notes</h4>
                      <p className="text-sm text-gray-700">{memberAnalysis.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <h4 className="font-medium mb-3">Update Assessment</h4>
                  <form onSubmit={handleUpdateAssessment} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input
                      name="editScore"
                      label="Risk Score (0-100)"
                      type="number"
                      min="0"
                      max="100"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                    />
                    <Select
                      name="editLevel"
                      label="Risk Level"
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      placeholder="Keep current"
                      options={[
                        { value: 'LOW', label: 'Low' },
                        { value: 'MEDIUM', label: 'Medium' },
                        { value: 'HIGH', label: 'High' },
                        { value: 'CRITICAL', label: 'Critical' },
                      ]}
                    />
                    <Button type="submit" isLoading={actionBusy}>Save Update</Button>
                  </form>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="p-4 text-center text-gray-500">
                No risk assessment has been run for this member yet.
              </div>
            </Card>
          )}

          <Card>
            <div className="p-4">
              <h4 className="font-medium mb-3">Run New Assessment</h4>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="assessmentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    id="assessmentNotes"
                    name="assessmentNotes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Notes for this assessment..."
                    rows={2}
                  />
                </div>
                <Button onClick={handleRunAssessment} isLoading={actionBusy}>Run Assessment</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recomputes the member&apos;s risk score from their real KYC/login-attempt state and records a new assessment.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default MemberAnalysis;
