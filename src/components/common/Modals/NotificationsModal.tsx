import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const NotificationsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [popupEnabled, setPopupEnabled] = useState(true); // Default to enabled

  // Mock data for demonstration
  const [reportList] = useState([
    {
      id: 1,
      name: 'Member Report - December 2024',
      type: 'CSV',
      size: '2.3 MB',
      createdAt: '2024-12-15 14:30:00',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Payment Transaction Report',
      type: 'Excel',
      size: '5.7 MB',
      createdAt: '2024-12-15 13:15:00',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Daily Activity Report',
      type: 'PDF',
      size: '1.8 MB',
      createdAt: '2024-12-15 12:00:00',
      status: 'processing'
    },
    {
      id: 4,
      name: 'VIP Member Analysis',
      type: 'Excel',
      size: '3.2 MB',
      createdAt: '2024-12-14 16:45:00',
      status: 'ready'
    }
  ]);

  const handleViewAllNotifications = () => {
    onClose();
    
    // Calculate half screen width and half screen height
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = Math.floor(screenWidth / 2);
    const windowHeight = Math.floor(screenHeight / 2);
    
    // Position window in the center-right of screen
    const windowLeft = screenWidth - windowWidth;
    const windowTop = Math.floor((screenHeight - windowHeight) / 2);
    
    // Open notifications page in new window with half screen dimensions
    const notificationWindow = window.open(
      '/notifications',
      'notificationsMonitor',
      `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );
    
    // Focus the new window
    if (notificationWindow) {
      notificationWindow.focus();
    }
  };

  const handleDownloadReport = (report) => {
    if (report.status === 'ready') {
      // TODO: Implement actual download functionality
      console.log(`Downloading report: ${report.name}`);
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Replace with actual download URL
      link.download = report.name;
      link.click();
    }
  };

  const togglePopup = () => {
    setPopupEnabled(!popupEnabled);
    // TODO: Save popup preference to user settings/localStorage
    console.log(`Popup notifications ${!popupEnabled ? 'enabled' : 'disabled'}`);
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'csv':
        return (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
            <path d="M6 7h2v2H6V7zm4 0h2v2h-2V7zm-4 4h2v2H6v-2zm4 0h2v2h-2v-2z"/>
          </svg>
        );
      case 'excel':
        return (
          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
            <path d="M7 8l2 2-2 2m4-4h2"/>
          </svg>
        );
      case 'pdf':
        return (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
            <path d="M6 7h8M6 9h8M6 11h5"/>
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Notifications & Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* View All Notifications */}
            <button
              onClick={handleViewAllNotifications}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-900">Open Notifications Monitor</h3>
                  <p className="text-xs text-gray-500 mt-1">Half-screen monitor for real-time alerts</p>
                </div>
              </div>
            </button>

            {/* Popup Toggle */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${popupEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <svg className={`h-4 w-4 ${popupEnabled ? 'text-green-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2m-6 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-900">Popup Notifications</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {popupEnabled ? 'Currently enabled' : 'Currently disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={togglePopup}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    popupEnabled ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      popupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Report List Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-900">Exported Reports</h3>
              <span className="text-xs text-gray-500">{reportList.length} reports available</span>
            </div>

            <div className="space-y-2">
              {reportList.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(report.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        {report.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{report.type}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{report.size}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{report.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {report.status === 'processing' ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs text-blue-600">Processing</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {reportList.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-xs text-gray-500">No exported reports available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal; 