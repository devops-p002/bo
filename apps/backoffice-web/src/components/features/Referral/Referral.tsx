import React, { useState } from 'react';
import { Card, Breadcrumb } from '../../common/UI';
import { useTheme } from '../../../context/ThemeContext';
import CommissionReport from './components/CommissionReport';
import ReferralReport from './components/ReferralReport';
import ReferralTree from './components/ReferralTree';
import CommissionSettings from './components/CommissionSettings';

const Referral = () => {
  const { isDarkTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'commissions', label: 'Commission Report', icon: '💰' },
    { id: 'referrals', label: 'Referral Report', icon: '👥' },
    { id: 'tree', label: 'Referral Tree', icon: '🌳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'commissions':
        return <CommissionReport />;
      case 'referrals':
        return <ReferralReport />;
      case 'tree':
        return <ReferralTree />;
      case 'settings':
        return <CommissionSettings />;
      default:
        return <OverviewTab />;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold">1,247</p>
              <p className="text-blue-100 text-sm mt-1">+12% this month</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Commissions</p>
              <p className="text-3xl font-bold">$125.7K</p>
              <p className="text-green-100 text-sm mt-1">+8% this month</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Referrers</p>
              <p className="text-3xl font-bold">245</p>
              <p className="text-purple-100 text-sm mt-1">+5% this month</p>
            </div>
            <div className="text-4xl opacity-80">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">71.5%</p>
              <p className="text-orange-100 text-sm mt-1">+2.3% this month</p>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Referral Activity</h3>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  action: 'New Referral',
                  user: 'john_doe',
                  referred: 'jane_smith',
                  time: '2 minutes ago',
                  commission: '$10',
                  type: 'registration'
                },
                {
                  id: 2,
                  action: 'Commission Paid',
                  user: 'alice_brown',
                  referred: 'bob_wilson',
                  time: '15 minutes ago',
                  commission: '$25',
                  type: 'revenue_share'
                },
                {
                  id: 3,
                  action: 'First Deposit',
                  user: 'mike_jones',
                  referred: 'charlie_davis',
                  time: '1 hour ago',
                  commission: '$5',
                  type: 'deposit'
                },
                {
                  id: 4,
                  action: 'New Referral',
                  user: 'diana_white',
                  referred: 'eva_green',
                  time: '3 hours ago',
                  commission: '$10',
                  type: 'registration'
                }
              ].map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      activity.type === 'registration' ? 'bg-blue-500' :
                      activity.type === 'deposit' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {activity.type === 'registration' ? '👤' :
                       activity.type === 'deposit' ? '💳' : '💰'}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.user} → {activity.referred}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{activity.commission}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Referrers</h3>
            <div className="space-y-4">
              {[
                { rank: 1, username: 'john_doe', referrals: 45, commissions: '$1,250', growth: '+8%' },
                { rank: 2, username: 'alice_brown', referrals: 38, commissions: '$980', growth: '+12%' },
                { rank: 3, username: 'mike_jones', referrals: 32, commissions: '$850', growth: '+5%' },
                { rank: 4, username: 'diana_white', referrals: 28, commissions: '$720', growth: '+15%' },
                { rank: 5, username: 'charlie_davis', referrals: 24, commissions: '$650', growth: '+3%' }
              ].map((performer) => (
                <div key={performer.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      performer.rank === 1 ? 'bg-yellow-500' :
                      performer.rank === 2 ? 'bg-gray-400' :
                      performer.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {performer.rank}
                    </div>
                    <div>
                      <p className="font-medium">{performer.username}</p>
                      <p className="text-sm text-gray-600">{performer.referrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{performer.commissions}</p>
                    <p className={`text-xs ${performer.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {performer.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Commission Settings Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Commission Settings Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Registration</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">$10</p>
              <p className="text-sm text-blue-600">Fixed amount</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800">Deposit</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-600">5%</p>
              <p className="text-sm text-green-600">Percentage</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-800">Revenue Share</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">25%</p>
              <p className="text-sm text-purple-600">Multi-level</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-orange-800">CPA</h4>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">$100</p>
              <p className="text-sm text-orange-600">Per acquisition</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('commissions')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-blue-800">View Commission Report</h4>
                <p className="text-sm text-blue-600 mt-1">Detailed commission analytics</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🌳</div>
                <h4 className="font-medium text-green-800">Explore Referral Tree</h4>
                <p className="text-sm text-green-600 mt-1">Visualize referral networks</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-purple-800">Manage Settings</h4>
                <p className="text-sm text-purple-600 mt-1">Configure commission rules</p>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600 mt-1">Manage referrals, commissions, and network structures</p>
        </div>
      </div>

      {/* Tab Navigation */}
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
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
      </div>
    </div>
  );
};

export default Referral;