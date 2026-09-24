import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';

export const SectionHeader = ({ title, isExpanded, onToggle, editButton = false, onEdit = null, extraButton = null }) => {
  const { isDarkTheme } = useTheme();
  
  return (
    <div 
      className={`flex items-center justify-between p-1.5 border-b cursor-pointer ${
        isDarkTheme ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center">
        <span className={`mr-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>≡</span>
        <h3 className={`text-xs font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h3>
        {editButton && (
          <button 
            className="ml-1.5 px-1 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit();
            }}
          >
            Edit
          </button>
        )}
        {extraButton && (
          <button 
            className="ml-1.5 px-1 py-0.5 text-xs bg-blue-600 text-white rounded"
            onClick={(e) => {
              e.stopPropagation();
              if (extraButton.onClick) extraButton.onClick();
            }}
          >
            {extraButton.text}
          </button>
        )}
      </div>
      <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-180' : ''} ${
        isDarkTheme ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
};

export const DataRow = ({ label, value, updatedBy = null, highlighted = false, centerAlign = false, customContent = null }) => {
  const { isDarkTheme } = useTheme();
  
  if (customContent) {
    return customContent;
  }
  
  return (
    <div className={`grid grid-cols-12 border-b transition-colors duration-200 ${
      highlighted 
        ? 'bg-blue-50 hover:bg-blue-100' 
        : isDarkTheme ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-blue-50'
    }`}>
      <div className={`col-span-2 px-1.5 py-1 text-xs font-medium ${
        highlighted 
          ? 'text-gray-700 bg-blue-100'
          : isDarkTheme ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
      }`}>
        {label}
      </div>
      {updatedBy ? (
        <>
          <div className={`col-span-4 px-1.5 py-1 text-xs ${centerAlign ? 'text-center' : ''} ${
            highlighted ? 'text-gray-700' : isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {value}
          </div>
          <div className={`col-span-3 px-1.5 py-1 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Updated By {updatedBy.date}
          </div>
          <div className={`col-span-3 px-1.5 py-1 text-xs text-right ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            {updatedBy.by}
          </div>
        </>
      ) : (
        <div className={`col-span-10 px-1.5 py-1 text-xs ${centerAlign ? 'text-center' : ''} ${
          highlighted ? 'text-gray-700' : isDarkTheme ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {value}
        </div>
      )}
    </div>
  );
};

export const SummaryRow = ({ label, value, isNegative = false }) => {
  const { isDarkTheme } = useTheme();
  
  return (
    <div className={`flex justify-between items-center py-0.5 px-1.5 border-b transition-colors duration-200 hover:bg-gray-50 ${
      isDarkTheme ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200'
    }`}>
      <div className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </div>
      <div className={`text-xs ${
        isNegative 
          ? 'text-red-600' 
          : isDarkTheme ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {value}
      </div>
    </div>
  );
}; 