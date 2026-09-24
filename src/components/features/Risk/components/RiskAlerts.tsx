import React, { useMemo, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Select } from '../../../common/Forms';
import useRisk from '../hooks/useRisk';

// Real backend field: RiskAssessment.riskLevel (LOW/MEDIUM/HIGH/CRITICAL).
// There is no separate alert "status" (open/investigating/resolved) or
// "category"/"actions" workflow on the backend - this surfaces real
// assessments as an alert feed, sorted with the riskiest members first,
// rather than fabricating a case-management workflow.
const LEVEL_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

const LEVEL_RANK = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

const LevelBadge = ({ level }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[level] || 'bg-gray-100 text-gray-800'}`}>
    {level}
  </span>
);

const RiskAlerts = () => {
  const { riskAssessments, assessmentsLoading, assessmentsError, refetch } = useRisk();
  const [levelFilter, setLevelFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(
    () =>
      [...riskAssessments]
        .filter((a) => levelFilter === 'all' || a.riskLevel === levelFilter)
        .sort(
          (a, b) =>
            (LEVEL_RANK[b.riskLevel] ?? -1) - (LEVEL_RANK[a.riskLevel] ?? -1) ||
            new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
        ),
    [riskAssessments, levelFilter]
  );

  const counts = useMemo(
    () => ({
      critical: riskAssessments.filter((a) => a.riskLevel === 'CRITICAL').length,
      high: riskAssessments.filter((a) => a.riskLevel === 'HIGH').length,
      medium: riskAssessments.filter((a) => a.riskLevel === 'MEDIUM').length,
      low: riskAssessments.filter((a) => a.riskLevel === 'LOW').length,
    }),
    [riskAssessments]
  );

  const rows = sorted.map((a) => ({
    id: a.id,
    member: a.user?.username || a.userId,
    riskScore: a.riskScore,
    riskLevel: <LevelBadge level={a.riskLevel} />,
    factorCount: a.factors?.length ?? 0,
    assessedAt: new Date(a.assessedAt).toLocaleString(),
    _raw: a,
  }));

  const columns = [
    { header: 'Member', accessor: 'member' },
    { header: 'Risk Score', accessor: 'riskScore' },
    { header: 'Risk Level', accessor: 'riskLevel' },
    { header: 'Factors', accessor: 'factorCount' },
    { header: 'Assessed At', accessor: 'assessedAt' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Risk Alerts</h2>
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-sm text-red-700">Critical</p>
              <p className="text-2xl font-bold text-red-900">{counts.critical}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">High</p>
              <p className="text-2xl font-bold text-red-800">{counts.high}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-800">{counts.medium}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Low</p>
              <p className="text-2xl font-bold text-green-800">{counts.low}</p>
            </div>
          </div>

          <div className="mb-4 max-w-xs">
            <Select
              name="riskLevelFilter"
              label="Risk Level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Levels' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>

          {assessmentsLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : assessmentsError ? (
            <div className="text-red-500">{assessmentsError}</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No risk assessments recorded yet.</div>
          ) : (
            <Table
              columns={columns}
              data={rows}
              onRowClick={(row) => setSelected(row._raw)}
            />
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Risk Assessment: ${selected.user?.username || selected.userId}` : ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded">
                <div className="text-sm text-red-600">Risk Score</div>
                <div className="text-2xl font-bold text-red-800">{selected.riskScore}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-blue-600">Risk Level</div>
                <div className="text-lg font-bold text-blue-800"><LevelBadge level={selected.riskLevel} /></div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Assessed At</div>
                <div className="text-sm font-medium text-gray-800">{new Date(selected.assessedAt).toLocaleString()}</div>
              </div>
            </div>

            {selected.factors?.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Risk Factors</h3>
                  <div className="space-y-3">
                    {selected.factors.map((f, i) => (
                      <div key={i} className="border-l-4 border-red-400 pl-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{f.type}</span>
                          <LevelBadge level={f.severity} />
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{f.description}</p>
                        <p className="text-xs text-gray-500">Score: {f.score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selected.recommendations?.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {selected.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </Card>
            )}

            {selected.notes && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiskAlerts;
