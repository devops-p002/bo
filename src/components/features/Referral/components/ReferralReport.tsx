import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, DatePicker } from '../../../common/Forms';
import { LineChart, BarChart, PieChart } from '../../../common/Charts';
import useReferral from '../hooks/useReferral';

const ReferralReport = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    referrer: '',
    status: 'all',
    registrationStatus: 'all',
    minReferrals: '',
    maxReferrals: ''
  });
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { 
    referrals, 
    referralStats, 
    referralCharts, 
    loading, 
    error, 
    fetchReferrals, 
    fetchReferralStats,
    exportReferralReport 
  } = useReferral();

  useEffect(() => {
    fetchReferrals(filters);
    fetchReferralStats(filters);
  }, [filters, fetchReferrals, fetchReferralStats]);

  const columns = [
    { header: 'Referral ID', accessor: 'id' },
    { header: 'Referrer', accessor: 'referrerUsername' },
    { header: 'Referred User', accessor: 'referredUsername' },
    { header: 'Email', accessor: 'referredEmail' },
    { header: 'Registration Date', accessor: 'registrationDate' },
    { header: 'First Deposit', accessor: 'firstDeposit' },
    { header: 'Status', accessor: 'status' },
    { header: 'Total Deposits', accessor: 'totalDeposits' },
    { header: 'Total Bets', accessor: 'totalBets' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleReferralClick = (referral) => {
    setSelectedReferral(referral);
    setShowModal(true);
  };

  const handleExport = async () => {
    try {
      await exportReferralReport(filters);
    } catch (error) {
      console.error('Error exporting referral report:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      referrer: '',
      status: 'all',
      registrationStatus: 'all',
      minReferrals: '',
      maxReferrals: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      verified: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const renderActions = (referral) => (
    <button
      onClick={() => handleReferralClick(referral)}
      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
    >
      View Details
    </button>
  );

  const processedData = referrals?.map(referral => ({
    ...referral,
    firstDeposit: referral.firstDeposit ? `$${referral.firstDeposit.toLocaleString()}` : 'None',
    status: getStatusBadge(referral.status),
    totalDeposits: `$${referral.totalDeposits.toLocaleString()}`,
    totalBets: `$${referral.totalBets.toLocaleString()}`,
    registrationDate: new Date(referral.registrationDate).toLocaleDateString(),
    actions: renderActions(referral)
  })) || [];

  const renderOverviewView = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {referralStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-600">Total Referrals</p>
            <p className="text-2xl font-bold text-blue-800">
              {referralStats.totalReferrals.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-green-600">Active Referrals</p>
            <p className="text-2xl font-bold text-green-800">
              {referralStats.activeReferrals.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-purple-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-purple-800">
              {referralStats.conversionRate}%
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <p className="text-sm text-orange-600">Avg. Referral Value</p>
            <p className="text-2xl font-bold text-orange-800">
              ${referralStats.avgReferralValue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {referralCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Referral Trends</h3>
              <LineChart
                data={referralCharts.trends}
                xKey="date"
                yKey="count"
                title="Daily Referrals"
              />
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Referral Status Distribution</h3>
              <PieChart
                data={referralCharts.statusDistribution}
                nameKey="status"
                valueKey="count"
                title="Status Breakdown"
              />
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Referrers Performance</h3>
              <BarChart
                data={referralCharts.topReferrers}
                xKey="username"
                yKey="referrals"
                title="Referrals by User"
              />
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Monthly Conversion Rate</h3>
              <LineChart
                data={referralCharts.conversionTrends}
                xKey="month"
                yKey="conversionRate"
                title="Conversion Rate %"
              />
            </div>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {referralStats?.performanceMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">First Deposit Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {referralStats.performanceMetrics.firstDepositRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Avg. Days to First Deposit</span>
                  <span className="text-lg font-bold text-blue-600">
                    {referralStats.performanceMetrics.avgDaysToFirstDeposit} days
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Avg. Lifetime Value</span>
                  <span className="text-lg font-bold text-purple-600">
                    ${referralStats.performanceMetrics.avgLifetimeValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Retention Rate (30 days)</span>
                  <span className="text-lg font-bold text-orange-600">
                    {referralStats.performanceMetrics.retentionRate30}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Referral Sources</h3>
              <div className="space-y-3">
                {referralStats.performanceMetrics.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-gray-600">{source.referrals} referrals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{source.conversionRate}%</p>
                      <p className="text-sm text-gray-600">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4">
      {/* Referral Table */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={processedData}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      )}
    </div>
  );

  const renderReferralModal = () => {
    if (!selectedReferral) return null;

    return (
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Referral Details: ${selectedReferral.referredUsername}`}
        size="large"
      >
        <div className="space-y-6">
          {/* Referral Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Total Deposits</div>
              <div className="text-2xl font-bold text-blue-800">${selectedReferral.totalDeposits.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-600">Total Bets</div>
              <div className="text-2xl font-bold text-green-800">${selectedReferral.totalBets.toLocaleString()}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-purple-600">Total Commissions</div>
              <div className="text-2xl font-bold text-purple-800">${selectedReferral.totalCommissions.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-yellow-600">Days Active</div>
              <div className="text-2xl font-bold text-yellow-800">{selectedReferral.daysActive}</div>
            </div>
          </div>

          {/* Referral Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Referral Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Referrer:</span>
                  <span className="ml-2">{selectedReferral.referrerUsername}</span>
                </div>
                <div>
                  <span className="font-medium">Referred User:</span>
                  <span className="ml-2">{selectedReferral.referredUsername}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{selectedReferral.referredEmail}</span>
                </div>
                <div>
                  <span className="font-medium">Registration Date:</span>
                  <span className="ml-2">{new Date(selectedReferral.registrationDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">First Deposit:</span>
                  <span className="ml-2">
                    {selectedReferral.firstDeposit ? `$${selectedReferral.firstDeposit.toLocaleString()}` : 'None'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">{selectedReferral.status}</span>
                </div>
                <div>
                  <span className="font-medium">Referral Source:</span>
                  <span className="ml-2">{selectedReferral.source || 'Direct'}</span>
                </div>
                <div>
                  <span className="font-medium">Country:</span>
                  <span className="ml-2">{selectedReferral.country || 'N/A'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          {selectedReferral.activityTimeline && selectedReferral.activityTimeline.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                <div className="space-y-3">
                  {selectedReferral.activityTimeline.map((activity, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-green-600 font-medium text-sm">Amount: ${activity.amount.toLocaleString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Commission History */}
          {selectedReferral.commissionHistory && selectedReferral.commissionHistory.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Commission History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReferral.commissionHistory.map((commission, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{new Date(commission.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{commission.type}</td>
                          <td className="px-4 py-2">${commission.amount.toLocaleString()}</td>
                          <td className="px-4 py-2">{getStatusBadge(commission.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
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
            <h2 className="text-xl font-semibold">Referral Report</h2>
            <div className="flex space-x-2">
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { value: 'overview', label: 'Overview' },
                  { value: 'detailed', label: 'Detailed View' }
                ]}
                className="w-40"
              />
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="primary" onClick={handleExport}>
                Export Report
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Input
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
            <Input
              label="Referrer Username"
              value={filters.referrer}
              onChange={(e) => handleFilterChange('referrer', e.target.value)}
              placeholder="Search referrer..."
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'verified', label: 'Verified' }
              ]}
            />
            <Select
              label="Registration Status"
              value={filters.registrationStatus}
              onChange={(e) => handleFilterChange('registrationStatus', e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'deposited', label: 'Has Deposited' },
                { value: 'not_deposited', label: 'No Deposit' },
                { value: 'verified', label: 'Verified' }
              ]}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Referrals"
                type="number"
                value={filters.minReferrals}
                onChange={(e) => handleFilterChange('minReferrals', e.target.value)}
                placeholder="0"
              />
              <Input
                label="Max Referrals"
                type="number"
                value={filters.maxReferrals}
                onChange={(e) => handleFilterChange('maxReferrals', e.target.value)}
                placeholder="999"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {reportType === 'overview' ? renderOverviewView() : renderDetailedView()}

      {/* Referral Detail Modal */}
      {renderReferralModal()}
    </div>
  );
};

export default ReferralReport; 