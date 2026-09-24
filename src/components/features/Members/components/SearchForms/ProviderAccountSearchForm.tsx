import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';
import DateTimePicker from '../../../../common/UI/DateTimePicker';

const ProviderAccountSearchForm = ({ 
  providerData, 
  onInputChange 
}) => {
  const { isDarkTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Provider */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Provider
        </label>
        <select
          value={providerData.provider}
          onChange={(e) => onInputChange('provider', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="AWC">AWC</option>
          <option value="Evolution">Evolution</option>
          <option value="Pragmatic">Pragmatic</option>
          <option value="NetEnt">NetEnt</option>
          <option value="Microgaming">Microgaming</option>
        </select>
      </div>

      {/* Provider Account */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Provider Account
        </label>
        <input
          type="text"
          value={providerData.providerAccount}
          onChange={(e) => onInputChange('providerAccount', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300'
          }`}
          placeholder="Provider Account"
        />
      </div>

      {/* Currency Type */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Currency Type
        </label>
        <select
          value={providerData.currencyType}
          onChange={(e) => onInputChange('currencyType', e.target.value)}
          className={`w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="BDT">BDT</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="INR">INR</option>
        </select>
      </div>

      {/* Created Time Range spanning full width */}
      <div className="lg:col-span-3">
        <label className={`block text-xs font-medium mb-1 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Created Time Range
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <DateTimePicker
              value={providerData.createdTimeFrom}
              onChange={(date) => onInputChange('createdTimeFrom', date)}
              placeholder="From"
              className="w-full text-xs"
            />
          </div>
          <div className="flex-1">
            <DateTimePicker
              value={providerData.createdTimeTo}
              onChange={(date) => onInputChange('createdTimeTo', date)}
              placeholder="To"
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAccountSearchForm; 