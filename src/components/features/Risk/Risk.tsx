import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../../common/UI';
import MemberTrace from './components/MemberTrace';
import MemberAnalysis from './components/MemberAnalysis';
import HighRollerMonitoring from './components/HighRollerMonitoring';
import RiskAlerts from './components/RiskAlerts';
import SuspiciousActivity from './components/SuspiciousActivity';
import useRisk from './hooks/useRisk';

// Maps each routed path under /risk to the tab it should open on.
const TAB_BY_PATH = {
  '/risk': 'alerts',
  '/risk/member-trace': 'trace',
  '/risk/member-analysis': 'analysis',
  '/risk/high-roller-monitoring': 'highrollers',
};

const Risk = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(TAB_BY_PATH[location.pathname] || 'alerts');

  const { riskAssessments, highRollers, highRiskBets, highRiskTransactions } = useRisk();

  const tabs = [
    { id: 'alerts', label: 'Risk Alerts', component: RiskAlerts },
    { id: 'suspicious', label: 'Suspicious Activity', component: SuspiciousActivity },
    { id: 'highrollers', label: 'High Roller Monitoring', component: HighRollerMonitoring },
    { id: 'analysis', label: 'Member Analysis', component: MemberAnalysis },
    { id: 'trace', label: 'Member Trace', component: MemberTrace },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || RiskAlerts;

  // Real, derived overview numbers from the currently loaded data - no
  // fabricated counts (see the tab components for what backs each of these).
  const criticalAndHigh = useMemo(
    () => riskAssessments.filter((a) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length,
    [riskAssessments]
  );
  const avgRiskScore = useMemo(() => {
    if (riskAssessments.length === 0) return 0;
    return Math.round(riskAssessments.reduce((sum, a) => sum + (a.riskScore || 0), 0) / riskAssessments.length);
  }, [riskAssessments]);
  const flaggedActivityCount = highRiskBets.length + highRiskTransactions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-600">Monitor and manage platform risks, suspicious activities, and high-value players</p>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High/Critical Assessments</dt>
                  <dd className="text-lg font-medium text-gray-900">{criticalAndHigh}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Flagged Bets/Transactions</dt>
                  <dd className="text-lg font-medium text-gray-900">{flaggedActivityCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Rollers</dt>
                  <dd className="text-lg font-medium text-gray-900">{highRollers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Risk Score Avg</dt>
                  <dd className="text-lg font-medium text-gray-900">{avgRiskScore}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Active Tab Content */}
      <ActiveComponent />
    </div>
  );
};

export default Risk;
