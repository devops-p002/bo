import { useState, useEffect } from 'react';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isMonitorMode, setIsMonitorMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Check if opened in a new window (monitor mode)
  useEffect(() => {
    const isNewWindow = window.opener !== null;
    setIsMonitorMode(isNewWindow);
    
    if (isNewWindow) {
      // Auto-refresh every 30 seconds in monitor mode
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // In real implementation, this would fetch new notifications
      }, 30000);
      
      return () => clearInterval(interval);
    }

    return undefined;
  }, []);
  const [notifications] = useState([
    {
      id: 1,
      type: 'deposit',
      title: 'New Deposit Request',
      message: 'Member John_Doe has submitted a deposit request of $500.00',
      amount: 500.00,
      member: 'John_Doe',
      timestamp: '2024-12-15 14:30:25',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      type: 'withdrawal',
      title: 'Withdrawal Request Approved',
      message: 'Withdrawal request for $250.00 has been approved for member Jane_Smith',
      amount: 250.00,
      member: 'Jane_Smith',
      timestamp: '2024-12-15 14:15:10',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'deposit',
      title: 'Large Deposit Alert',
      message: 'High value deposit of $2,500.00 from VIP member Mike_Johnson requires review',
      amount: 2500.00,
      member: 'Mike_Johnson',
      timestamp: '2024-12-15 13:45:00',
      status: 'review_required',
      priority: 'high'
    },
    {
      id: 4,
      type: 'withdrawal',
      title: 'Withdrawal Request Failed',
      message: 'Withdrawal request for $100.00 failed due to insufficient balance - member Sarah_Wilson',
      amount: 100.00,
      member: 'Sarah_Wilson',
      timestamp: '2024-12-15 13:20:15',
      status: 'failed',
      priority: 'low'
    },
    {
      id: 5,
      type: 'deposit',
      title: 'Deposit Confirmed',
      message: 'Deposit of $150.00 has been successfully processed for member David_Brown',
      amount: 150.00,
      member: 'David_Brown',
      timestamp: '2024-12-15 12:55:30',
      status: 'completed',
      priority: 'low'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      review_required: { bg: 'bg-red-100', text: 'text-red-800', label: 'Review Required' },
      failed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'deposit') {
      return (
        <div className="bg-green-100 p-2 rounded-lg">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      );
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real implementation, this would fetch new notifications
  };

  return (
    <div className={`${isMonitorMode ? 'p-4' : 'p-6'}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isMonitorMode ? 'Notifications Monitor' : 'Notifications'}
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {isMonitorMode 
                ? 'Real-time monitoring for gaming platform back office' 
                : 'Monitor deposit and withdrawal notifications'
              }
            </p>
          </div>
          
          {isMonitorMode && (
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>
        
        {isMonitorMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-800">
                Monitor Mode Active - Auto-refreshing every 30 seconds
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className={`border-b border-gray-200 ${isMonitorMode ? 'mb-4' : 'mb-6'}`}>
        <nav className={`-mb-px flex ${isMonitorMode ? 'space-x-4' : 'space-x-8'}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-xs ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Notifications
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 px-1 border-b-2 font-medium text-xs ${
              activeTab === 'deposit'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Deposits
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {notifications.filter(n => n.type === 'deposit').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`py-2 px-1 border-b-2 font-medium text-xs ${
              activeTab === 'withdrawal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Withdrawals
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {notifications.filter(n => n.type === 'withdrawal').length}
            </span>
          </button>
        </nav>
      </div>

      {/* Quick Stats for Monitor Mode */}
      {isMonitorMode && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-800">
                {notifications.filter(n => n.status === 'pending').length}
              </div>
              <div className="text-xs text-yellow-600">Pending</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-800">
                {notifications.filter(n => n.status === 'review_required').length}
              </div>
              <div className="text-xs text-red-600">Review Required</div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-800">
                {notifications.filter(n => n.status === 'completed').length}
              </div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-800">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-xs text-blue-600">High Priority</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className={`${isMonitorMode ? 'space-y-2' : 'space-y-4'}`}>
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white border border-gray-200 rounded-lg ${isMonitorMode ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start space-x-4">
              {/* Type Icon */}
              {getTypeIcon(notification.type)}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(notification.priority)}
                    <h3 className="text-xs font-medium text-gray-900">
                      {notification.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(notification.status)}
                    <span className="text-xs text-gray-500">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-600">
                  {notification.message}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      Member: <span className="font-medium text-gray-900">{notification.member}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Amount: <span className="font-medium text-gray-900">${notification.amount.toFixed(2)}</span>
                    </span>
                  </div>

                  {notification.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        Reject
                      </button>
                    </div>
                  )}

                  {notification.status === 'review_required' && (
                    <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-2 text-xs font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-xs text-gray-500">
              {activeTab === 'all' 
                ? 'No notifications available.' 
                : `No ${activeTab} notifications available.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 