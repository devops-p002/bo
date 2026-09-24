import React, { useState } from 'react';
import { Card } from '../../components/common/UI';
import BonusReport from '../../components/features/Reports/components/BonusReport';

const BonusReportPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonus Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive bonus analytics and performance metrics
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">🎁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bonuses</p>
              <p className="text-2xl font-semibold text-gray-900">2,847</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bonus Value</p>
              <p className="text-2xl font-semibold text-gray-900">$148,520</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">68.4%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bonuses</p>
              <p className="text-2xl font-semibold text-gray-900">1,247</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Report Component */}
      <BonusReport filters={{}} />
    </div>
  );
};

export default BonusReportPage; 