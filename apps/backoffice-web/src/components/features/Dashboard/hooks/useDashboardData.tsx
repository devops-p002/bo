import { useState, useEffect } from 'react';

// This is a mock implementation of the hook. In a real application,
// this would likely use Apollo Client to fetch data from a GraphQL API.
export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Simulate a data fetching function
  const fetchData = async ({ timeRange = 'today' } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be a GraphQL query
      // Here we're just returning mock data immediately
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data with some variation based on timeRange
      const mockData = {
        stats: [
          {
            id: 'total-deposits',
            title: 'Total Deposits',
            value: timeRange === 'today' ? '$5,240' : timeRange === 'week' ? '$32,580' : '$124,950',
            change: timeRange === 'today' ? '+12.5%' : timeRange === 'week' ? '+8.2%' : '+15.3%',
            changeType: 'positive',
            description: `vs. previous ${timeRange}`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ),
          },
          {
            id: 'total-withdrawals',
            title: 'Total Withdrawals',
            value: timeRange === 'today' ? '$3,120' : timeRange === 'week' ? '$18,940' : '$72,310',
            change: timeRange === 'today' ? '+5.2%' : timeRange === 'week' ? '-3.4%' : '+7.8%',
            changeType: timeRange === 'week' ? 'negative' : 'positive',
            description: `vs. previous ${timeRange}`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ),
          },
          {
            id: 'active-users',
            title: 'Active Users',
            value: timeRange === 'today' ? '1,254' : timeRange === 'week' ? '8,732' : '24,519',
            change: timeRange === 'today' ? '+8.3%' : timeRange === 'week' ? '+12.7%' : '+9.5%',
            changeType: 'positive',
            description: `vs. previous ${timeRange}`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            ),
          },
          {
            id: 'total-bets',
            title: 'Total Bets',
            value: timeRange === 'today' ? '7,892' : timeRange === 'week' ? '54,210' : '189,654',
            change: timeRange === 'today' ? '+15.7%' : timeRange === 'week' ? '+9.3%' : '+11.2%',
            changeType: 'positive',
            description: `vs. previous ${timeRange}`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            ),
          },
        ],
        // Other mock data would be provided here
        recentActivities: [], // Will be populated by the RecentActivity component's default data
        transactions: [], // Will be populated by the DepositWithdrawTable component's default data
        registrations: [], // Will be populated by the UserRegistrationTable component's default data
        bonuses: [], // Will be populated by the BonusTable component's default data
      };
      
      setData(mockData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to refetch data with options
  const refetch = (options = {}) => {
    return fetchData(options);
  };
  
  return {
    loading,
    data,
    error,
    refetch,
  };
}; 