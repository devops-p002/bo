import { useState, useEffect } from 'react';

/**
 * Hook for fetching and managing dashboard statistics
 * @returns {Object} Dashboard statistics and loading state
 */
const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    depositAmount: 0,
    withdrawalAmount: 0,
    netRevenue: 0,
    bonusAmount: 0,
    registrationsToday: 0,
    registrationsWeek: 0,
    registrationsMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Mock data - in a real app, this would be a GraphQL query
        setTimeout(() => {
          setStats({
            totalUsers: 15427,
            activeUsers: 8542,
            totalDeposits: 35689,
            totalWithdrawals: 28754,
            depositAmount: 5842760,
            withdrawalAmount: 4923450,
            netRevenue: 919310,
            bonusAmount: 248950,
            registrationsToday: 127,
            registrationsWeek: 854,
            registrationsMonth: 3275,
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const calculatePercentChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getHistoricalStats = () => {
    // Mock historical data for trends
    return {
      userGrowth: [
        { period: 'Jan', value: 12850 },
        { period: 'Feb', value: 13420 },
        { period: 'Mar', value: 13980 },
        { period: 'Apr', value: 14520 },
        { period: 'May', value: 14980 },
        { period: 'Jun', value: 15427 },
      ],
      depositTrend: [
        { period: 'Jan', value: 4123450 },
        { period: 'Feb', value: 4358760 },
        { period: 'Mar', value: 4892340 },
        { period: 'Apr', value: 5125680 },
        { period: 'May', value: 5487920 },
        { period: 'Jun', value: 5842760 },
      ],
      revenueTrend: [
        { period: 'Jan', value: 687450 },
        { period: 'Feb', value: 712890 },
        { period: 'Mar', value: 784560 },
        { period: 'Apr', value: 824970 },
        { period: 'May', value: 876430 },
        { period: 'Jun', value: 919310 },
      ],
    };
  };

  return {
    stats,
    loading,
    error,
    getHistoricalStats,
    calculatePercentChange,
  };
};

export default useDashboardStats; 