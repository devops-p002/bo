import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';

const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : '-');
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '-');

const SearchResultsTable = ({
  activeTab,
  visibleAccountColumns,
  visibleProviderColumns,
  onUsernameClick,
  results = [],
  resultsLoading = false,
  resultsError = null
}) => {
  const { isDarkTheme } = useTheme();

  // Provider account table data - mock only. There is no game-provider-
  // account linkage anywhere in the backend schema/database (no model, no
  // resolver), so this tab is a clearly-labeled placeholder rather than a
  // forced/fake mapping onto real users.
  const providerAccountData = [
    {
      id: 1,
      createTime: '2025/06/02 23:59:33',
      provider: 'AWC',
      providerAccount: 'jbpm20000239Z961',
      username: 'rashedbabub79',
      name: 'Rashedbabub',
      email: 'mdrashedkhanbabu621@gmail.com',
      phone: '880-1723870979',
      dateOfBirth: '1979/08/19',
      vip: 'Normal',
      vipExperience: '11438',
      affiliateUrl: 'j00gp25aff2024.com',
      status: 'Active',
      totalBalance: '212.30',
      signUp: 'Dhaka - Dhaka',
      lastLoginIp: '43.245.120.37 (43.245.120.37)'
    },
    {
      id: 2,
      createTime: '2025/06/02 23:59:01',
      provider: 'AWC',
      providerAccount: 'jbpm20000239Z939',
      username: 'moman1979',
      name: 'Momen',
      email: 'momenmia9870@gmail.com',
      phone: '880-1856548531',
      dateOfBirth: '1979/09/01',
      vip: 'Normal',
      vipExperience: '13607',
      affiliateUrl: 'www.jeetbuzz.com',
      status: 'Active',
      totalBalance: '507.42',
      signUp: 'Dhaka - Faridpur',
      lastLoginIp: '103.147.163.26 (103.147.163.26)'
    },
    {
      id: 3,
      createTime: '2025/06/02 23:58:24',
      provider: 'AWC',
      providerAccount: 'jbpm20001232B509',
      username: 'g1329031587',
      name: 'Sojib khan',
      email: 'islammdilani326@gmail.com',
      phone: '880-1325031587',
      dateOfBirth: '1998/08/25',
      vip: 'Normal',
      vipExperience: '66715',
      affiliateUrl: 'www.jb11p29aff2023.com',
      status: 'Active',
      totalBalance: '0.50',
      signUp: 'Rangpur - Saidpur',
      lastLoginIp: '104.28.240.86 (103.25.249.238)'
    },
    {
      id: 4,
      createTime: '2025/06/02 23:58:21',
      provider: 'AWC',
      providerAccount: 'jbpm20000239Z949',
      username: 'ridoy2480',
      name: 'Ridoy Hossen',
      email: 'mdhrridoy000@gmail.com',
      phone: '880-1764652480',
      dateOfBirth: '2000/01/30',
      vip: 'Elite IV',
      vipExperience: '226209.2',
      affiliateUrl: 'jeetbuzz.co',
      status: 'Active',
      totalBalance: '2.15',
      signUp: 'Chattogram - Chhagalnaiya',
      lastLoginIp: '43.246.201.111 (43.246.201.111)'
    },
    {
      id: 5,
      createTime: '2025/06/02 23:57:33',
      provider: 'AWC',
      providerAccount: 'jbpm20000239Z935',
      username: 'chelau123',
      name: 'Chelaumog',
      email: 'chelau195@gmail.com',
      phone: '880-1603681659',
      dateOfBirth: '2007/06/01',
      vip: 'Normal',
      vipExperience: '2132',
      affiliateUrl: 'www.jeetbuzz.com',
      status: 'Active',
      totalBalance: '0.27',
      signUp: 'Chattogram - Chattogram',
      lastLoginIp: '104.28.208.31 (58.145.190.197)'
    }
  ];

  const renderAccountTable = () => {
    if (resultsLoading && results.length === 0) {
      return <div className="text-xs text-center p-4 text-gray-500">Loading…</div>;
    }
    if (resultsError) {
      return <div className="text-xs text-center p-4 text-red-500">Failed to load: {resultsError.message}</div>;
    }
    if (results.length === 0) {
      return <div className="text-xs text-center p-4 text-gray-500">No members match this search.</div>;
    }

    return (
      <table className={`w-full text-xs ${
        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <thead>
          <tr className={`${
            isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          } border-b`}>
            <th className="px-2 py-2 text-left font-medium border-r border-gray-300">#</th>
            {visibleAccountColumns.registrationTime && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Registration Time</th>}
            {visibleAccountColumns.username && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Username</th>}
            {visibleAccountColumns.name && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Name</th>}
            {visibleAccountColumns.email && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Email</th>}
            {visibleAccountColumns.phone && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Phone</th>}
            {visibleAccountColumns.dateOfBirth && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Date of Birth</th>}
            {visibleAccountColumns.vip && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">VIP</th>}
            {visibleAccountColumns.status && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Status</th>}
            {visibleAccountColumns.totalBalance && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Total Balance</th>}
            {visibleAccountColumns.lastLoginIp && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Last Login IP</th>}
            {visibleAccountColumns.lastLoginTime && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Last Login Time</th>}
            {visibleAccountColumns.currencyType && <th className="px-2 py-2 text-left font-medium">Currency Type</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={row.id} className={`border-b ${
              isDarkTheme ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
            } transition-colors`}>
              <td className="px-2 py-2 border-r border-gray-300">{index + 1}</td>
              {visibleAccountColumns.registrationTime && <td className="px-2 py-2 border-r border-gray-300">{formatDateTime(row.createdAt)}</td>}
              {visibleAccountColumns.username && <td className="px-2 py-2 border-r border-gray-300">
                {/* Navigates using the member's real id, not their username
                    (the profile route looks members up by id). Username is
                    optional (identity/login is email-only) - falls back to
                    email so this cell is never blank. */}
                <span className="text-primary-500 hover:text-primary-600 cursor-pointer" onClick={() => onUsernameClick(row.id)}>{row.username || row.email}</span>
              </td>}
              {visibleAccountColumns.name && <td className="px-2 py-2 border-r border-gray-300">{row.fullName || '-'}</td>}
              {visibleAccountColumns.email && <td className="px-2 py-2 border-r border-gray-300">{row.email}</td>}
              {visibleAccountColumns.phone && <td className="px-2 py-2 border-r border-gray-300">{row.phone || '-'}</td>}
              {visibleAccountColumns.dateOfBirth && <td className="px-2 py-2 border-r border-gray-300">{formatDate(row.dateOfBirth)}</td>}
              {visibleAccountColumns.vip && <td className="px-2 py-2 border-r border-gray-300">
                <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">{row.vipLevel}</span>
              </td>}
              {visibleAccountColumns.status && <td className="px-2 py-2 border-r border-gray-300">
                <span className={`px-1 py-0.5 text-xs rounded ${
                  row.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
                    : row.status === 'SUSPENDED' || row.status === 'BANNED' ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>{row.status}</span>
              </td>}
              {visibleAccountColumns.totalBalance && <td className="px-2 py-2 border-r border-gray-300">{(row.balance ?? 0).toLocaleString()}</td>}
              {visibleAccountColumns.lastLoginIp && <td className="px-2 py-2 border-r border-gray-300">{row.lastLoginIP || '-'}</td>}
              {visibleAccountColumns.lastLoginTime && <td className="px-2 py-2 border-r border-gray-300">{formatDateTime(row.lastLoginAt)}</td>}
              {visibleAccountColumns.currencyType && <td className="px-2 py-2">{row.currency}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderProviderAccountTable = () => (
    <div>
      <div className={`m-2 p-2 text-xs rounded ${isDarkTheme ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
        Provider-account linkage is not implemented on the backend (no such model/resolver exists).
        The rows below are sample data only and do not reflect real members.
      </div>
      <table className={`w-full text-xs ${
        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <thead>
          <tr className={`${
            isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          } border-b`}>
            <th className="px-2 py-2 text-left font-medium border-r border-gray-300">#</th>
            {visibleProviderColumns.createTime && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Create Time</th>}
            {visibleProviderColumns.provider && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Provider</th>}
            {visibleProviderColumns.providerAccount && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Provider Account</th>}
            {visibleProviderColumns.username && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Username</th>}
            {visibleProviderColumns.name && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Name</th>}
            {visibleProviderColumns.email && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Email</th>}
            {visibleProviderColumns.phone && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Phone</th>}
            {visibleProviderColumns.dateOfBirth && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Date of Birth</th>}
            {visibleProviderColumns.vip && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">VIP</th>}
            {visibleProviderColumns.vipExperience && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">VIP Experience</th>}
            {visibleProviderColumns.affiliateUrl && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Affiliate URL</th>}
            {visibleProviderColumns.status && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Status</th>}
            {visibleProviderColumns.totalBalance && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Total Balance</th>}
            {visibleProviderColumns.signUp && <th className="px-2 py-2 text-left font-medium border-r border-gray-300">Sign Up</th>}
            {visibleProviderColumns.lastLoginIp && <th className="px-2 py-2 text-left font-medium">Last Login IP</th>}
          </tr>
        </thead>
        <tbody>
          {providerAccountData.map((row) => (
            <tr key={row.id} className={`border-b ${
              isDarkTheme ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
            } transition-colors`}>
              <td className="px-2 py-2 border-r border-gray-300">{row.id}</td>
              {visibleProviderColumns.createTime && <td className="px-2 py-2 border-r border-gray-300">{row.createTime}</td>}
              {visibleProviderColumns.provider && <td className="px-2 py-2 border-r border-gray-300">{row.provider}</td>}
              {visibleProviderColumns.providerAccount && <td className="px-2 py-2 border-r border-gray-300">{row.providerAccount}</td>}
              {visibleProviderColumns.username && <td className="px-2 py-2 border-r border-gray-300">{row.username}</td>}
              {visibleProviderColumns.name && <td className="px-2 py-2 border-r border-gray-300">{row.name}</td>}
              {visibleProviderColumns.email && <td className="px-2 py-2 border-r border-gray-300">{row.email}</td>}
              {visibleProviderColumns.phone && <td className="px-2 py-2 border-r border-gray-300">{row.phone}</td>}
              {visibleProviderColumns.dateOfBirth && <td className="px-2 py-2 border-r border-gray-300">{row.dateOfBirth}</td>}
              {visibleProviderColumns.vip && <td className="px-2 py-2 border-r border-gray-300">{row.vip}</td>}
              {visibleProviderColumns.vipExperience && <td className="px-2 py-2 border-r border-gray-300">{row.vipExperience}</td>}
              {visibleProviderColumns.affiliateUrl && <td className="px-2 py-2 border-r border-gray-300">{row.affiliateUrl}</td>}
              {visibleProviderColumns.status && <td className="px-2 py-2 border-r border-gray-300">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{row.status}</span>
              </td>}
              {visibleProviderColumns.totalBalance && <td className="px-2 py-2 border-r border-gray-300">{row.totalBalance}</td>}
              {visibleProviderColumns.signUp && <td className="px-2 py-2 border-r border-gray-300">{row.signUp}</td>}
              {visibleProviderColumns.lastLoginIp && <td className="px-2 py-2">{row.lastLoginIp}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      {activeTab === 'Account' ? renderAccountTable() : renderProviderAccountTable()}
    </div>
  );
};

export default SearchResultsTable;
