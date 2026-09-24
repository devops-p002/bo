import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const PopupLayout = ({ children }) => {
  const { isDarkTheme } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Popup-specific sidebar */}
      <div className="flex">
        {/* Left Sidebar for Popup - Match main sidebar proportions */}
        <div className="w-64 min-h-screen bg-gray-800 text-white">
          {/* Fixed Logo Header - Match main sidebar header */}
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center">
              <h1 className="text-sm font-bold text-white">Member Portal</h1>
            </div>
          </div>
          
          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="p-4">
              {/* Navigation Menu */}
              <nav className="space-y-1">
                <div className="flex items-center px-4 py-2 rounded-md bg-gray-700 text-white">
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs">OVERVIEW</span>
                </div>
                
                <div className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors">
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs">DOCUMENT</span>
                </div>
                
                <div className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors">
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs">SETTING</span>
                </div>
                
                <div className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors">
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                  </svg>
                  <span className="text-xs">REPORT</span>
                </div>
                
                <div className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors">
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs">COMMISSION</span>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupLayout; 