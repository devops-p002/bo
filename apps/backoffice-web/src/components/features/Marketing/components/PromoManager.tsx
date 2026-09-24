import React, { useState } from 'react';

export const PromoManager = () => {
  const [promos] = useState([
    {
      id: '1',
      name: 'Welcome100',
      description: '100% Welcome Bonus up to $100',
      type: 'code',
      code: 'WELCOME100',
      usageLimit: 1000,
      usageCount: 453,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      active: true,
    },
    {
      id: '2',
      name: 'Weekend50',
      description: '50% Weekend Reload Bonus up to $50',
      type: 'code',
      code: 'WEEKEND50',
      usageLimit: 5000,
      usageCount: 1243,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      active: true,
    },
    {
      id: '3',
      name: 'Summer Madness',
      description: 'Special summer promotion with free spins',
      type: 'automatic',
      code: null,
      usageLimit: null,
      usageCount: 3456,
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      active: true,
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Promo Codes & Offers</h2>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          + New Promo
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promos.map((promo) => (
              <tr key={promo.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{promo.name}</div>
                  <div className="text-xs text-gray-500">
                    {promo.startDate} to {promo.endDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{promo.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {promo.type === 'code' ? 'Promo Code' : 'Automatic'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {promo.code ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {promo.code}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded-full ${promo.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-sm text-gray-500">{promo.active ? 'Yes' : 'No'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 