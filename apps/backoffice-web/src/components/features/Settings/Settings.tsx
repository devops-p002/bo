import React, { useState } from 'react';
import { Card, Breadcrumb } from '../../common/UI';
import { useTheme } from '../../../context/ThemeContext';
import StaffManagement from './components/StaffManagement';
import SystemSettings from './components/SystemSettings';
import PermissionSettings from './components/PermissionSettings';
import GameSettings from './components/GameSettings';
import GeneralSettings from './components/GeneralSettings';

const Settings = () => {
  const { isDarkTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: '⚙️',
      description: 'Platform configuration and branding'
    },
    {
      id: 'system',
      label: 'System',
      icon: '🖥️',
      description: 'Technical system configuration'
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: '👥',
      description: 'Staff and role management'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: '🔐',
      description: 'Access control and permissions'
    },
    {
      id: 'games',
      label: 'Games',
      icon: '🎮',
      description: 'Game and category configuration'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'system':
        return <SystemSettings />;
      case 'staff':
        return <StaffManagement />;
      case 'permissions':
        return <PermissionSettings />;
      case 'games':
        return <GameSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your gaming platform settings and preferences
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
      </div>
    </div>
  );
};

export default Settings;