import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, DatePicker } from '../../../common/Forms';
import { LineChart, BarChart, PieChart } from '../../../common/Charts';
import useCommissions from '../hooks/useCommissions';

const CommissionReport = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    referrer: '',
    commissionType: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { 
    commissions, 
    commissionSummary, 
    commissionCharts, 
    loading, 
    error, 
    fetchCommissions, 
    fetchCommissionSummary,
    exportCommissionReport 
  } = useCommissions();

  useEffect(() => {
    fetchCommissions(filters);
    fetchCommissionSummary(filters);
  }, [filters, fetchCommissions, fetchCommissionSummary]);

  const columns = [
    { header: 'Commission ID', accessor: 'id' },
    { header: 'Referrer', accessor: 'referrerUsername' },
    { header: 'Referred User', accessor: 'referredUsername' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Rate', accessor: 'rate' },
    { header: 'Source Amount', accessor: 'sourceAmount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created', accessor: 'createdAt' },
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

  const handleCommissionClick = (commission) => {
    setSelectedCommission(commission);
    setShowModal(true);
  };

  const handleExport = async () => {
    try {
      await exportCommissionReport(filters);
    } catch (error) {
      console.error('Error exporting commission report:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      referrer: '',
      commissionType: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  const getCommissionTypeBadge = (type) => {
    const typeColors = {
      registration: 'bg-blue-100 text-blue-800',
      deposit: 'bg-green-100 text-green-800',
      revenue_share: 'bg-purple-100 text-purple-800',
      cpa: 'bg-orange-100 text-orange-800',
      bonus: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const renderActions = (commission) => (
    <button
      onClick={() => handleCommissionClick(commission)}
      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
    >
      View Details
    </button>
  );

  const processedData = commissions?.map(commission => ({
    ...commission,
    type: getCommissionTypeBadge(commission.type),
    amount: `$${commission.amount.toLocaleString()}`,
    rate: `${commission.rate}%`,
    sourceAmount: `$${commission.sourceAmount.toLocaleString()}`,
    status: getStatusBadge(commission.status),
    createdAt: new Date(commission.createdAt).toLocaleDateString(),
    actions: renderActions(commission)
  })) || [];

  const renderSummaryView = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      {commissionSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-600">Total Commissions</p>
            <p className="text-2xl font-bold text-blue-800">
              ${commissionSummary.totalCommissions.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-green-600">Paid Commissions</p>
            <p className="text-2xl font-bold text-green-800">
              ${commissionSummary.paidCommissions.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-yellow-600">Pending Commissions</p>
            <p className="text-2xl font-bold text-yellow-800">
              ${commissionSummary.pendingCommissions.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-purple-600">Total Referrers</p>
            <p className="text-2xl font-bold text-purple-800">
              {commissionSummary.totalReferrers.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {commissionCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Commission Trends</h3>
              <LineChart
                data={commissionCharts.trends}
                xKey="date"
                yKey="amount"
                title="Daily Commission Amount"
              />
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Commission by Type</h3>
              <PieChart
                data={commissionCharts.byType}
                nameKey="type"
                valueKey="amount"
                title="Commission Distribution"
              />
            </div>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {commissionSummary?.topPerformers && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Top Performing Referrers</h3>
            <div className="space-y-3">
              {commissionSummary.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{performer.username}</p>
                      <p className="text-sm text-gray-600">{performer.referrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${performer.totalCommissions.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4">
      {/* Commission Table */}
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

  const renderCommissionModal = () => {
    if (!selectedCommission) return null;

    return (
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Commission Details: ${selectedCommission.id}`}
        size="large"
      >
        <div className="space-y-6">
          {/* Commission Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Commission Amount</div>
              <div className="text-2xl font-bold text-blue-800">${selectedCommission.amount.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-600">Commission Rate</div>
              <div className="text-2xl font-bold text-green-800">{selectedCommission.rate}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-purple-600">Source Amount</div>
              <div className="text-2xl font-bold text-purple-800">${selectedCommission.sourceAmount.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-yellow-600">Status</div>
              <div className="text-lg font-bold text-yellow-800">{selectedCommission.status.toUpperCase()}</div>
            </div>
          </div>

          {/* Commission Details */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Commission Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Referrer:</span>
                  <span className="ml-2">{selectedCommission.referrerUsername}</span>
                </div>
                <div>
                  <span className="font-medium">Referred User:</span>
                  <span className="ml-2">{selectedCommission.referredUsername}</span>
                </div>
                <div>
                  <span className="font-medium">Commission Type:</span>
                  <span className="ml-2">{selectedCommission.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{new Date(selectedCommission.createdAt).toLocaleString()}</span>
                </div>
                {selectedCommission.paidAt && (
                  <div>
                    <span className="font-medium">Paid At:</span>
                    <span className="ml-2">{new Date(selectedCommission.paidAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedCommission.description && (
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-700 mt-1">{selectedCommission.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Payment History */}
          {selectedCommission.paymentHistory && selectedCommission.paymentHistory.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="space-y-3">
                  {selectedCommission.paymentHistory.map((payment, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{payment.action}</span>
                        <span className="text-sm text-gray-500">{new Date(payment.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{payment.notes}</p>
                      <p className="text-xs text-gray-500">By: {payment.processedBy}</p>
                    </div>
                  ))}
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
            <h2 className="text-xl font-semibold">Commission Report</h2>
            <div className="flex space-x-2">
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { value: 'summary', label: 'Summary View' },
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
              label="Commission Type"
              value={filters.commissionType}
              onChange={(e) => handleFilterChange('commissionType', e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'registration', label: 'Registration' },
                { value: 'deposit', label: 'Deposit' },
                { value: 'revenue_share', label: 'Revenue Share' },
                { value: 'cpa', label: 'CPA' },
                { value: 'bonus', label: 'Bonus' }
              ]}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'paid', label: 'Paid' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'on_hold', label: 'On Hold' }
              ]}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                placeholder="$0"
              />
              <Input
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                placeholder="$999999"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {reportType === 'summary' ? renderSummaryView() : renderDetailedView()}

      {/* Commission Detail Modal */}
      {renderCommissionModal()}
    </div>
  );
};

export default CommissionReport; 