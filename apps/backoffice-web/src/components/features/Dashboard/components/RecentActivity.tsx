import React, { useState } from 'react';
import { Card } from '../../../common/UI';

const RecentActivity = ({ activities = [], loading = false }) => {
  const [data] = useState(activities || getDefaultActivities());
  
  // Function to get appropriate icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
          </div>
        );
      case 'bet':
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        );
      case 'deposit':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="bg-red-100 text-red-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
          </div>
        );
      case 'bonus':
        return (
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
            </svg>
          </div>
        );
      case 'setting':
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start mb-5">
                <div className="bg-gray-200 h-10 w-10 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-5">
          {data.map((activity) => (
            <div key={activity.id} className="flex items-start">
              {getActivityIcon(activity.type)}
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="mr-2">{activity.user}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-500 mr-2"></span>
                  <span>{activity.details}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
        
        <div className="mt-5 pt-5 border-t border-gray-200">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View all activity
          </button>
        </div>
      </div>
    </Card>
  );
};

// Default data for demonstration
function getDefaultActivities() {
  return [
    {
      id: 1,
      type: 'login',
      title: 'User Login',
      user: 'john_doe',
      details: 'Logged in from United States',
      time: '10 mins ago',
    },
    {
      id: 2,
      type: 'bet',
      title: 'New Bet Placed',
      user: 'alice_smith',
      details: 'Placed a bet of $100 on Slots',
      time: '25 mins ago',
    },
    {
      id: 3,
      type: 'deposit',
      title: 'Deposit Made',
      user: 'bob_jones',
      details: 'Deposited $500 via PayPal',
      time: '40 mins ago',
    },
    {
      id: 4,
      type: 'withdrawal',
      title: 'Withdrawal Request',
      user: 'emma_wilson',
      details: 'Requested withdrawal of $300',
      time: '1 hour ago',
    },
    {
      id: 5,
      type: 'bonus',
      title: 'Bonus Issued',
      user: 'mike_brown',
      details: 'Received Welcome Bonus of $50',
      time: '2 hours ago',
    },
    {
      id: 6,
      type: 'setting',
      title: 'Settings Changed',
      user: 'sarah_taylor',
      details: 'Updated account preferences',
      time: '3 hours ago',
    },
  ];
}

export default RecentActivity; 