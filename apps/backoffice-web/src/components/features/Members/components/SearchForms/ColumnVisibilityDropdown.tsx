import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';

const ColumnVisibilityDropdown = ({
  activeTab,
  showColumnsDropdown,
  visibleAccountColumns,
  visibleProviderColumns,
  setVisibleAccountColumns,
  setVisibleProviderColumns,
  onClose
}) => {
  const { isDarkTheme } = useTheme();

  // vipExperience, vipPoint, affiliateUrl, signUp, lastDeposit, lastBetTime,
  // channelType and channelName were dropped - no equivalent field exists
  // on the backend's User type (see report).
  const accountColumns = {
    registrationTime: 'Registration Time',
    username: 'Username',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    vip: 'VIP',
    status: 'Status',
    totalBalance: 'Total Balance',
    lastLoginIp: 'Last Login IP',
    lastLoginTime: 'Last Login Time',
    lastLoginLocation: 'Last Login Location',
    lastLoginDevice: 'Last Login Device',
    currencyType: 'Currency Type'
  };

  const providerColumns = {
    createTime: 'Create Time',
    provider: 'Provider',
    providerAccount: 'Provider Account',
    username: 'Username',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    vip: 'VIP',
    vipExperience: 'VIP Experience',
    affiliateUrl: 'Affiliate URL',
    status: 'Status',
    totalBalance: 'Total Balance',
    signUp: 'Sign Up',
    lastLoginIp: 'Last Login IP'
  };

  const handleSelectAll = () => {
    console.log('Select All clicked for tab:', activeTab);
    if (activeTab === 'Account') {
      const allTrueState = Object.keys(accountColumns).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {});
      console.log('Setting all Account columns to true:', allTrueState);
      setVisibleAccountColumns(allTrueState);
    } else {
      const allTrueState = Object.keys(providerColumns).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {});
      console.log('Setting all Provider columns to true:', allTrueState);
      setVisibleProviderColumns(allTrueState);
    }
  };

  const handleDeselectAll = () => {
    console.log('Deselect All clicked for tab:', activeTab);
    if (activeTab === 'Account') {
      const allFalseState = Object.keys(accountColumns).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {});
      console.log('Setting all Account columns to false:', allFalseState);
      setVisibleAccountColumns(allFalseState);
    } else {
      const allFalseState = Object.keys(providerColumns).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {});
      console.log('Setting all Provider columns to false:', allFalseState);
      setVisibleProviderColumns(allFalseState);
    }
  };

  const handleColumnToggle = (key, checked) => {
    console.log('Checkbox clicked:', key, 'New value:', checked);
    if (activeTab === 'Account') {
      setVisibleAccountColumns(prev => {
        const newState = { ...prev, [key]: checked };
        console.log('Setting new Account state:', newState);
        return newState;
      });
    } else {
      setVisibleProviderColumns(prev => {
        const newState = { ...prev, [key]: checked };
        console.log('Setting new Provider state:', newState);
        return newState;
      });
    }
  };

  const currentColumns = activeTab === 'Account' ? accountColumns : providerColumns;
  const currentVisibleColumns = activeTab === 'Account' ? visibleAccountColumns : visibleProviderColumns;

  if (!showColumnsDropdown) return null;

  return (
    <div className={`absolute right-0 top-full mt-1 w-64 border rounded-md shadow-lg z-50 columns-dropdown-content ${
      isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="p-3">
        <h4 className={`text-xs font-semibold mb-2 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Show/Hide Columns
        </h4>
        <div className="max-h-64 overflow-y-auto">
          {Object.entries(currentColumns).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2 py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
              <input
                type="checkbox"
                id={`${activeTab.toLowerCase().replace(' ', '-')}-${key}`}
                checked={currentVisibleColumns[key] || false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleColumnToggle(key, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4"
              />
              <label 
                htmlFor={`${activeTab.toLowerCase().replace(' ', '-')}-${key}`}
                className={`text-xs cursor-pointer ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 ${
              isDarkTheme 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Deselect All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnVisibilityDropdown;
