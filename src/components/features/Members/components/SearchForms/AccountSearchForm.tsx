import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';
import DateTimePicker from '../../../../common/UI/DateTimePicker';

const AccountSearchForm = ({ 
  searchData, 
  onInputChange 
}) => {
  const { isDarkTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Username */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Username
        </label>
        <input
          type="text"
          value={searchData.username}
          onChange={(e) => onInputChange('username', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300'
          }`}
          placeholder="Enter username"
        />
      </div>

      {/* Full Name - no backend filter for this (UserFilterInput has no
          name field; the generic `search` filter only matches
          username/email/firstName/lastName, and is already used by the
          Username/Email fields below) */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Full Name <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <input
          type="text"
          value={searchData.fullName}
          onChange={(e) => onInputChange('fullName', e.target.value)}
          disabled
          className={`w-full px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
          placeholder="Full Name"
        />
      </div>

      {/* VIP - real field (User.vipLevel), real enum values */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          VIP
        </label>
        <select
          value={searchData.vip}
          onChange={(e) => onInputChange('vip', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="All">All</option>
          <option value="BRONZE">Bronze</option>
          <option value="SILVER">Silver</option>
          <option value="GOLD">Gold</option>
          <option value="PLATINUM">Platinum</option>
          <option value="DIAMOND">Diamond</option>
        </select>
      </div>

      {/* Last Deposit Since - no backend equivalent (User has no
          per-transaction-type "last deposit at" field) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Last Deposit Since <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <DateTimePicker
          value={searchData.lastDepositSince}
          onChange={(date) => onInputChange('lastDepositSince', date)}
          placeholder="Last Deposit Since"
          disabled
          className="w-full text-xs opacity-50"
        />
      </div>

      {/* Last Bet Time Since - no backend equivalent */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Last Bet Time Since <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <DateTimePicker
          value={searchData.lastBetTimeSince}
          onChange={(date) => onInputChange('lastBetTimeSince', date)}
          placeholder="Last Bet Time Since"
          disabled
          className="w-full text-xs opacity-50"
        />
      </div>

      {/* No Login Since - no backend equivalent (no filter for lastLoginAt) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          No Login Since <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <DateTimePicker
          value={searchData.noLoginSince}
          onChange={(date) => onInputChange('noLoginSince', date)}
          placeholder="No Login Since"
          disabled
          className="w-full text-xs opacity-50"
        />
      </div>

      {/* Last Login IP - lastLoginIP is a real column on User, but there's
          no filter for it in UserFilterInput */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Login IP <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <input
          type="text"
          value={searchData.lastLoginIP}
          onChange={(e) => onInputChange('lastLoginIP', e.target.value)}
          disabled
          className={`w-full px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
          placeholder="Last Login IP"
        />
      </div>

      {/* Email */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Email
        </label>
        <input
          type="email"
          value={searchData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300'
          }`}
          placeholder="Email"
        />
      </div>

      {/* Phone Number - no backend filter for phone (not in
          UserFilterInput, and the `search` filter doesn't match it) */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Phone Number <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <div className="flex space-x-1">
          <select
            value={searchData.phoneNumberType}
            onChange={(e) => onInputChange('phoneNumberType', e.target.value)}
            disabled
            className={`px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-gray-300'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="All">All</option>
            <option value="Mobile">Mobile</option>
            <option value="Landline">Landline</option>
          </select>
          <input
            type="text"
            value={searchData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            disabled
            className={`flex-1 px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
              isDarkTheme
                ? 'bg-gray-700 border-gray-600 text-gray-300'
                : 'bg-white border-gray-300'
            }`}
            placeholder="Phone Number"
          />
        </div>
      </div>

      {/* Registered Date Range */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Registered Date Range
        </label>
        <div className="flex space-x-1">
          <div className="flex-1">
            <DateTimePicker
              value={searchData.registeredDateFrom}
              onChange={(date) => onInputChange('registeredDateFrom', date)}
              placeholder="From"
              className="w-full text-xs"
            />
          </div>
          <div className="flex-1">
            <DateTimePicker
              value={searchData.registeredDateTo}
              onChange={(date) => onInputChange('registeredDateTo', date)}
              placeholder="To"
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Date of Birth Range - no backend filter for this */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Date of Birth Range <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <div className="flex space-x-1">
          <div className="flex-1">
            <DateTimePicker
              value={searchData.dateOfBirthFrom}
              onChange={(date) => onInputChange('dateOfBirthFrom', date)}
              placeholder="From"
              disabled
              className="w-full text-xs opacity-50"
            />
          </div>
          <div className="flex-1">
            <DateTimePicker
              value={searchData.dateOfBirthTo}
              onChange={(date) => onInputChange('dateOfBirthTo', date)}
              placeholder="To"
              disabled
              className="w-full text-xs opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Last Login Since - no backend filter for lastLoginAt */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Login Since <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <DateTimePicker
          value={searchData.lastLoginSince}
          onChange={(date) => onInputChange('lastLoginSince', date)}
          placeholder="Last Login Since"
          disabled
          className="w-full text-xs opacity-50"
        />
      </div>

      {/* Search Type - the backend only offers one generic ILIKE `search`
          match; there's no Normal/Advanced/Exact mode to select */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Search Type <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <select
          value={searchData.searchType}
          onChange={(e) => onInputChange('searchType', e.target.value)}
          disabled
          className={`w-full px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="Normal">Normal</option>
          <option value="Advanced">Advanced</option>
          <option value="Exact">Exact</option>
        </select>
      </div>

      {/* Currency Type - User.currency is a real field, but there's no
          filter for it in UserFilterInput */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Currency Type <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <select
          value={searchData.currencyType}
          onChange={(e) => onInputChange('currencyType', e.target.value)}
          disabled
          className={`w-full px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="All">All</option>
          <option value="BDT">BDT</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="INR">INR</option>
        </select>
      </div>

      {/* Account Status - real field (User.status), real enum values */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Account Status
        </label>
        <select
          value={searchData.accountStatus}
          onChange={(e) => onInputChange('accountStatus', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="All">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Channel Type - no affiliate/referral/channel concept on the
          backend at all */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Channel Type <span className="italic font-normal">(not supported by backend)</span>
        </label>
        <select
          value={searchData.channelType}
          onChange={(e) => onInputChange('channelType', e.target.value)}
          disabled
          className={`w-full px-2 py-1 text-xs border rounded-md cursor-not-allowed opacity-50 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="All">All</option>
          <option value="Direct">Direct</option>
          <option value="Affiliate">Affiliate</option>
          <option value="Refferal">Refferal</option>
        </select>
      </div>
    </div>
  );
};

export default AccountSearchForm; 