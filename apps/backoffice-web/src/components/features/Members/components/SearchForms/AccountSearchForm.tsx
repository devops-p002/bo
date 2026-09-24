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

      {/* Full Name - matches players.first_name/last_name (see
          players.service.ts). Real data only for players who've filled in
          apps/player-web's "Complete your profile" page - registration
          itself stays email+username+password only. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Full Name
        </label>
        <input
          type="text"
          value={searchData.fullName}
          onChange={(e) => onInputChange('fullName', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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

      {/* Last Deposit Since - real: matches players who have at least one
          COMPLETED-or-not deposit transaction on/after this date (an
          EXISTS check against transactions.type='DEPOSIT' - see
          players.service.ts's list()). */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Deposit Since
        </label>
        <DateTimePicker
          value={searchData.lastDepositSince}
          onChange={(date) => onInputChange('lastDepositSince', date)}
          placeholder="Last Deposit Since"
          className="w-full text-xs"
        />
      </div>

      {/* Last Bet Time Since - real: matches players with at least one bet
          on/after this date (same EXISTS pattern as Last Deposit Since,
          against the bets table). */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Bet Time Since
        </label>
        <DateTimePicker
          value={searchData.lastBetTimeSince}
          onChange={(date) => onInputChange('lastBetTimeSince', date)}
          placeholder="Last Bet Time Since"
          className="w-full text-xs"
        />
      </div>

      {/* No Login Since - filters on last_login_at (players who haven't
          logged in since this date, or never have). Real: last_login_at
          is populated on every login by services/player-api's
          PlayerAuthService and now has a real backend filter for it. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          No Login Since
        </label>
        <DateTimePicker
          value={searchData.noLoginSince}
          onChange={(date) => onInputChange('noLoginSince', date)}
          placeholder="No Login Since"
          className="w-full text-xs"
        />
      </div>

      {/* Last Login IP - real column, captured server-side from the login
          request (never client-reported - see
          services/player-api/src/main.ts's trustProxy comment for why the
          server, not the browser, has to be the one deciding this). */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Login IP
        </label>
        <input
          type="text"
          value={searchData.lastLoginIP}
          onChange={(e) => onInputChange('lastLoginIP', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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

      {/* Phone Number - matches players.phone (see players.service.ts).
          phoneNumberType stays disabled - there's no Mobile/Landline
          distinction on that column, just a single free-text field. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Phone Number
        </label>
        <div className="flex space-x-1">
          <select
            value={searchData.phoneNumberType}
            onChange={(e) => onInputChange('phoneNumberType', e.target.value)}
            disabled
            title="Not supported by backend - phone has no Mobile/Landline distinction"
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
            className={`flex-1 px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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

      {/* Date of Birth Range - date_of_birth is a real column (populated
          via apps/player-web's "Complete your profile" page), just needed
          a filter wired to it. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Date of Birth Range
        </label>
        <div className="flex space-x-1">
          <div className="flex-1">
            <DateTimePicker
              value={searchData.dateOfBirthFrom}
              onChange={(date) => onInputChange('dateOfBirthFrom', date)}
              placeholder="From"
              className="w-full text-xs"
            />
          </div>
          <div className="flex-1">
            <DateTimePicker
              value={searchData.dateOfBirthTo}
              onChange={(date) => onInputChange('dateOfBirthTo', date)}
              placeholder="To"
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Last Login Since - filters on last_login_at (players who have
          logged in on or after this date). Same real column as "No Login
          Since" above, opposite direction. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Last Login Since
        </label>
        <DateTimePicker
          value={searchData.lastLoginSince}
          onChange={(date) => onInputChange('lastLoginSince', date)}
          placeholder="Last Login Since"
          className="w-full text-xs"
        />
      </div>

      {/* Search Type - changes how the Username/Email search matches, not
          what it matches against: Normal is the original partial (ILIKE)
          match; Exact is a case-insensitive equality match; Advanced
          widens the match to Full Name/Phone too. See
          players.service.ts's list(). */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Search Type
        </label>
        <select
          value={searchData.searchType}
          onChange={(e) => onInputChange('searchType', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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

      {/* Currency Type - real field (players.currency, set at
          registration), now has a real filter for it. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Currency Type
        </label>
        <select
          value={searchData.currencyType}
          onChange={(e) => onInputChange('currencyType', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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

      {/* Channel Type - real: signup_channel is set once, at
          registration, from whether apps/player-web's register page saw a
          ?ref=<code> URL param (AFFILIATE) or not (DIRECT) - see the
          add-signup-channel migration's own comment. No "Referral" value:
          that would be a genuinely separate player-to-player referral
          subsystem this signup flow doesn't build, so it's not offered as
          a selectable value that could never match a real row. */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Channel Type
        </label>
        <select
          value={searchData.channelType}
          onChange={(e) => onInputChange('channelType', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-gray-300'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="All">All</option>
          <option value="DIRECT">Direct</option>
          <option value="AFFILIATE">Affiliate</option>
        </select>
      </div>
    </div>
  );
};

export default AccountSearchForm; 