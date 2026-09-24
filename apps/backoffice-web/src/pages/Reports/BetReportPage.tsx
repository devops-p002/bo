import React from 'react';
import { Card } from '../../components/common/UI';
import BetReport from '../../components/features/Reports/components/BetReport';

const BetReportPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bet Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive betting analytics and wagering performance metrics
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">🎲</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bets</p>
              <p className="text-2xl font-semibold text-gray-900">47,832</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-semibold text-gray-900">$3.2M</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-semibold text-gray-900">42.3%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">House Edge</p>
              <p className="text-2xl font-semibold text-gray-900">4.2%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Report Component */}
      <BetReport filters={{}} />
    </div>
  );
};

export default BetReportPage; 