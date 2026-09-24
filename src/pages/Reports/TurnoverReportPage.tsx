import React from 'react';
import { Card } from '../../components/common/UI';
import TurnoverReport from '../../components/features/Reports/components/TurnoverReport';

const TurnoverReportPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnover Reports</h1>
          <p className="text-gray-600 mt-1">
            Player activity and turnover analysis across all gaming products
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Turnover</p>
              <p className="text-2xl font-semibold text-gray-900">$12.8M</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-semibold text-gray-900">$425K</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Players</p>
              <p className="text-2xl font-semibold text-gray-900">8,247</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">💎</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ARPU</p>
              <p className="text-2xl font-semibold text-gray-900">$156</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Report Component */}
      <TurnoverReport filters={{}} />
    </div>
  );
};

export default TurnoverReportPage; 