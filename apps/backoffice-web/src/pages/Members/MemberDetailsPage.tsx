import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Breadcrumb } from '../../components/common/UI';
import { useTheme } from '../../context/ThemeContext';
import MemberProfile from '../../components/features/Members/components/MemberProfile';

// NOTE: the route is `/members/:id` (see src/config/routes.js), so useParams()
// returns `{ id }`. The previous version of this file destructured
// `{ memberId }` here, which was always undefined - `loadMember()` never ran
// and the page was stuck on its loading skeleton forever. Fixed by reading
// the actual `id` param.
const GET_MEMBER_DETAILS = gql`
  query GetMemberDetails($id: ID!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      fullName
      status
      vipLevel
      balance
      totalDeposits
      totalWithdrawals
      totalBets
      totalWins
      createdAt
    }
  }
`;

const formatCurrency = (n) => `$${(n ?? 0).toLocaleString()}`;

const MemberDetailsPage = () => {
  const { isDarkTheme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const { data, loading, error } = useQuery(GET_MEMBER_DETAILS, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  // Normalize the SCREAMING_CASE enums the backend returns to lowercase so
  // the existing status-badge logic below (`member.status === 'active'`)
  // keeps working (see gotcha #2 - AuthContext does the same for the
  // logged-in user, but data fetched fresh here needs its own pass).
  const member = data?.user
    ? {
        ...data.user,
        status: data.user.status?.toLowerCase(),
        vipLevel: data.user.vipLevel?.toLowerCase(),
      }
    : null;

  const handleBack = () => {
    navigate('/members');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'details', label: 'Details', icon: '📊' },
    { id: 'activity', label: 'Activity', icon: '📈' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <MemberProfile memberId={id} />;
      case 'details':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Member Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Member ID</label>
                <p className="mt-1 text-sm text-gray-900">{member?.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{member?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{member?.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Join Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {member?.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </Card>
        );
      case 'activity':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity History</h3>
            <p className="text-gray-500">
              No activity feed exists on the backend yet (no user-activity-log model) - leaving this
              as a placeholder rather than fabricating events.
            </p>
          </Card>
        );
      case 'transactions':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <p className="text-gray-500">
              See the member&apos;s Profile tab / Payments section for real transaction data
              (<code>user.transactions</code> is wired there). Kept as a placeholder here to avoid
              duplicating a second live query for the same data on this page.
            </p>
          </Card>
        );
      default:
        return <MemberProfile memberId={id} />;
    }
  };

  if (loading) {
    return (
      <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="mb-3">
          <Breadcrumb />
        </div>
        <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="mb-3">
          <Breadcrumb />
        </div>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handleBack}>
            ← Back to Members
          </Button>
        </div>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            {error ? `Failed to load: ${error.message}` : 'Member Not Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            The requested member could not be found or there was an error loading the data.
          </p>
          <Button variant="primary" onClick={handleBack}>
            Return to Members List
          </Button>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={handleBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {member.fullName || member.username}
            </h1>
            <p className="text-gray-600">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            member.status === 'active'
              ? 'bg-green-100 text-green-800'
              : member.status === 'suspended'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {member.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Member Summary Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(member.balance)}</div>
            <div className="text-sm text-gray-600">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(member.totalDeposits)}</div>
            <div className="text-sm text-gray-600">Total Deposits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{(member.totalBets ?? 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Bets (Amount)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}
            </div>
            <div className="text-sm text-gray-600">Member Since</div>
          </div>
        </div>
      </Card>

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
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
      </div>
    </div>
  );
};

export default MemberDetailsPage;
