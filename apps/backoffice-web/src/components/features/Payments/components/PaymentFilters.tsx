import React from 'react';
import { Card } from '../../../common/UI';
import { Input, Select, DatePicker } from '../../../common/Forms';

const PaymentFilters = ({ filters, onFilterChange, onReset, onApply }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  const handleReset = () => {
    onReset();
  };

  const handleApply = () => {
    onApply();
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by member, transaction ID, or reference..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <Select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'deposit', label: 'Deposits' },
                { value: 'withdrawal', label: 'Withdrawals' },
                { value: 'bonus', label: 'Bonuses' },
                { value: 'refund', label: 'Refunds' }
              ]}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <Select
              value={filters.method || 'all'}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'e_wallet', label: 'E-Wallet' },
                { value: 'cryptocurrency', label: 'Cryptocurrency' },
                { value: 'check', label: 'Check' }
              ]}
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                value={filters.dateFrom || ''}
                onChange={(date) => handleFilterChange('dateFrom', date)}
                placeholder="From Date"
              />
              <DatePicker
                value={filters.dateTo || ''}
                onChange={(date) => handleFilterChange('dateTo', date)}
                placeholder="To Date"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Amount"
                value={filters.amountFrom || ''}
                onChange={(e) => handleFilterChange('amountFrom', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Amount"
                value={filters.amountTo || ''}
                onChange={(e) => handleFilterChange('amountTo', e.target.value)}
              />
            </div>
          </div>

          {/* Member Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Type
            </label>
            <Select
              value={filters.memberType || 'all'}
              onChange={(e) => handleFilterChange('memberType', e.target.value)}
              options={[
                { value: 'all', label: 'All Members' },
                { value: 'regular', label: 'Regular' },
                { value: 'vip', label: 'VIP' },
                { value: 'premium', label: 'Premium' }
              ]}
            />
          </div>

          {/* VIP Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIP Level
            </label>
            <Select
              value={filters.vipLevel || 'all'}
              onChange={(e) => handleFilterChange('vipLevel', e.target.value)}
              options={[
                { value: 'all', label: 'All Levels' },
                { value: 'bronze', label: 'Bronze' },
                { value: 'silver', label: 'Silver' },
                { value: 'gold', label: 'Gold' },
                { value: 'platinum', label: 'Platinum' },
                { value: 'diamond', label: 'Diamond' }
              ]}
            />
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <Select
              value={filters.riskLevel || 'all'}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              options={[
                { value: 'all', label: 'All Risk Levels' },
                { value: 'low', label: 'Low Risk' },
                { value: 'medium', label: 'Medium Risk' },
                { value: 'high', label: 'High Risk' }
              ]}
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <Select
              value={filters.currency || 'all'}
              onChange={(e) => handleFilterChange('currency', e.target.value)}
              options={[
                { value: 'all', label: 'All Currencies' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'BTC', label: 'Bitcoin' },
                { value: 'ETH', label: 'Ethereum' }
              ]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentFilters; 