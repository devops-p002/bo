import React, { useState } from 'react';
import { Card, Breadcrumb } from '../../common/UI';
import { useTheme } from '../../../context/ThemeContext';
import MessageCenter from './components/MessageCenter';
import CustomerService from './components/CustomerService';
import ChatInterface from './components/ChatInterface';
import TicketManager from './components/TicketManager';
import useCRM from './hooks/useCRM';

const CRM = () => {
  const { isDarkTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('tickets');
  const { loading, error, getTicketStats } = useCRM();
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    setStats(getTicketStats());
  }, [getTicketStats]);

  const tabs = [
    { id: 'tickets', label: 'Tickets' },
    { id: 'messages', label: 'Messages' },
    { id: 'chat', label: 'Live Chat' },
    { id: 'service', label: 'Customer Service' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return <TicketManager />;
      case 'messages':
        return <MessageCenter />;
      case 'chat':
        return <ChatInterface />;
      case 'service':
        return <CustomerService />;
      default:
        return <TicketManager />;
    }
  };

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">CRM Dashboard</h2>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">Total Tickets</h3>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-sm text-blue-600">
                  {stats.open} open, {stats.resolved} resolved
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Response Time</h3>
                <p className="text-2xl font-bold text-green-900">{stats.avgResponseTime}</p>
                <p className="text-sm text-green-600">Average response time</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">Customer Satisfaction</h3>
                <p className="text-2xl font-bold text-purple-900">{stats.satisfactionRate}</p>
                <p className="text-sm text-purple-600">Based on {stats.total} tickets</p>
              </div>
            </div>
          ) : null}

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4">
            {renderContent()}
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default CRM;