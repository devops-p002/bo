import React, { useState } from 'react';
import { BonusTemplateForm } from './components/BonusTemplateForm';
import { BonusIssueForm } from './components/BonusIssueForm';
import { CampaignList } from './components/CampaignList';
import { PromoManager } from './components/PromoManager';

/**
 * Marketing main component for managing bonuses, campaigns and promotions
 */
const Marketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return <CampaignList />;
      case 'templates':
        return <BonusTemplateForm />;
      case 'issue':
        return <BonusIssueForm />;
      case 'promos':
        return <PromoManager />;
      default:
        return <CampaignList />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketing Management</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bonus Templates
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'issue'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Issue Bonus
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'promos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Promo Manager
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Marketing; 