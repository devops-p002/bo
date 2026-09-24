import { useState, useCallback } from 'react';

const useReferral = () => {
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [referralCharts, setReferralCharts] = useState(null);
  const [referralTree, setReferralTree] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for referrals
  const mockReferrals = [
    {
      id: 'REF001',
      referrerUsername: 'john_doe',
      referrerId: 'user001',
      referredUsername: 'jane_smith',
      referredEmail: 'jane.smith@email.com',
      registrationDate: '2024-01-15T10:30:00Z',
      firstDeposit: 100,
      totalDeposits: 500,
      totalBets: 2500,
      totalCommissions: 75,
      status: 'active',
      daysActive: 45,
      country: 'US',
      source: 'social_media',
      activityTimeline: [
        {
          action: 'Registration',
          description: 'User registered through referral link',
          timestamp: '2024-01-15T10:30:00Z',
          amount: null
        },
        {
          action: 'First Deposit',
          description: 'Made first deposit',
          timestamp: '2024-01-16T14:20:00Z',
          amount: 100
        },
        {
          action: 'Commission Earned',
          description: 'Registration commission earned',
          timestamp: '2024-01-16T14:21:00Z',
          amount: 10
        }
      ],
      commissionHistory: [
        {
          date: '2024-01-16T14:21:00Z',
          type: 'registration',
          amount: 10,
          status: 'paid'
        },
        {
          date: '2024-01-16T14:21:00Z',
          type: 'deposit',
          amount: 5,
          status: 'paid'
        }
      ]
    },
    {
      id: 'REF002',
      referrerUsername: 'mike_jones',
      referrerId: 'user002',
      referredUsername: 'bob_wilson',
      referredEmail: 'bob.wilson@email.com',
      registrationDate: '2024-01-20T16:45:00Z',
      firstDeposit: null,
      totalDeposits: 0,
      totalBets: 0,
      totalCommissions: 10,
      status: 'pending',
      daysActive: 10,
      country: 'CA',
      source: 'direct',
      activityTimeline: [
        {
          action: 'Registration',
          description: 'User registered through referral link',
          timestamp: '2024-01-20T16:45:00Z',
          amount: null
        }
      ],
      commissionHistory: [
        {
          date: '2024-01-20T16:46:00Z',
          type: 'registration',
          amount: 10,
          status: 'pending'
        }
      ]
    }
  ];

  // Mock referral tree data
  const mockReferralTree = {
    id: 'user001',
    username: 'john_doe',
    email: 'john.doe@email.com',
    registrationDate: '2023-12-01T10:00:00Z',
    status: 'active',
    totalDeposits: 2500,
    totalBets: 15000,
    totalCommissions: 1250,
    isVip: true,
    children: [
      {
        id: 'user003',
        username: 'alice_brown',
        email: 'alice.brown@email.com',
        registrationDate: '2024-01-10T12:00:00Z',
        status: 'active',
        totalDeposits: 800,
        totalBets: 4000,
        totalCommissions: 120,
        referrerUsername: 'john_doe',
        children: [
          {
            id: 'user005',
            username: 'charlie_davis',
            email: 'charlie.davis@email.com',
            registrationDate: '2024-01-25T15:30:00Z',
            status: 'active',
            totalDeposits: 300,
            totalBets: 1500,
            totalCommissions: 45,
            referrerUsername: 'alice_brown',
            children: []
          }
        ]
      },
      {
        id: 'user004',
        username: 'diana_white',
        email: 'diana.white@email.com',
        registrationDate: '2024-01-15T09:15:00Z',
        status: 'inactive',
        totalDeposits: 150,
        totalBets: 200,
        totalCommissions: 15,
        referrerUsername: 'john_doe',
        children: []
      }
    ],
    levelStats: [
      { level: 1, members: 2, totalCommissions: 135 },
      { level: 2, members: 1, totalCommissions: 45 }
    ]
  };

  // Mock users data
  const mockUsers = [
    { id: 'user001', username: 'john_doe', email: 'john.doe@email.com' },
    { id: 'user002', username: 'mike_jones', email: 'mike.jones@email.com' },
    { id: 'user003', username: 'alice_brown', email: 'alice.brown@email.com' },
    { id: 'user004', username: 'diana_white', email: 'diana.white@email.com' },
    { id: 'user005', username: 'charlie_davis', email: 'charlie.davis@email.com' }
  ];

  const fetchReferrals = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredReferrals = [...mockReferrals];
      
      // Apply filters
      if (filters.dateFrom) {
        filteredReferrals = filteredReferrals.filter(
          referral => new Date(referral.registrationDate) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredReferrals = filteredReferrals.filter(
          referral => new Date(referral.registrationDate) <= new Date(filters.dateTo)
        );
      }
      
      if (filters.referrer) {
        filteredReferrals = filteredReferrals.filter(
          referral => referral.referrerUsername.toLowerCase().includes(filters.referrer.toLowerCase())
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredReferrals = filteredReferrals.filter(
          referral => referral.status === filters.status
        );
      }
      
      setReferrals(filteredReferrals);
    } catch (err) {
      setError('Failed to fetch referrals');
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferralStats = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const stats = {
        totalReferrals: 1247,
        activeReferrals: 892,
        conversionRate: 71.5,
        avgReferralValue: 285,
        performanceMetrics: {
          firstDepositRate: 68.3,
          avgDaysToFirstDeposit: 3.2,
          avgLifetimeValue: 1250,
          retentionRate30: 65.8,
          sources: [
            { name: 'Social Media', referrals: 456, conversionRate: 72.1 },
            { name: 'Direct Links', referrals: 321, conversionRate: 69.8 },
            { name: 'Email Campaign', referrals: 289, conversionRate: 74.5 },
            { name: 'Affiliate Sites', referrals: 181, conversionRate: 67.4 }
          ]
        }
      };
      
      setReferralStats(stats);
      
      // Generate chart data
      const chartData = {
        trends: generateDailyTrends(30),
        statusDistribution: [
          { status: 'Active', count: 892 },
          { status: 'Inactive', count: 245 },
          { status: 'Pending', count: 110 }
        ],
        topReferrers: [
          { username: 'john_doe', referrals: 45 },
          { username: 'mike_jones', referrals: 38 },
          { username: 'alice_brown', referrals: 32 },
          { username: 'diana_white', referrals: 28 },
          { username: 'charlie_davis', referrals: 24 }
        ],
        conversionTrends: generateMonthlyConversion(12)
      };
      
      setReferralCharts(chartData);
    } catch (err) {
      setError('Failed to fetch referral statistics');
      console.error('Error fetching referral stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferralTree = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // In a real app, this would fetch the tree for the specific user
      if (userId === 'user001') {
        setReferralTree(mockReferralTree);
      } else {
        // Generate a simple tree for other users
        const simpleTree = {
          id: userId,
          username: mockUsers.find(u => u.id === userId)?.username || 'Unknown',
          email: mockUsers.find(u => u.id === userId)?.email || 'unknown@email.com',
          registrationDate: '2024-01-01T10:00:00Z',
          status: 'active',
          totalDeposits: 500,
          totalBets: 2500,
          totalCommissions: 125,
          isVip: false,
          children: [],
          levelStats: []
        };
        setReferralTree(simpleTree);
      }
    } catch (err) {
      setError('Failed to fetch referral tree');
      console.error('Error fetching referral tree:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUsers);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReferralTree = useCallback(async (userId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would update the tree data
      console.log('Updating referral tree for user:', userId, 'with updates:', updates);
      
      // Re-fetch the tree
      await fetchReferralTree(userId);
    } catch (err) {
      setError('Failed to update referral tree');
      console.error('Error updating referral tree:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchReferralTree]);

  const exportReferralReport = useCallback(async (filters = {}) => {
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const csvContent = generateCSVContent(mockReferrals, filters);
      downloadCSV(csvContent, 'referral-report.csv');
      
      return { success: true, message: 'Report exported successfully' };
    } catch (err) {
      console.error('Error exporting referral report:', err);
      throw new Error('Failed to export report');
    }
  }, []);

  // Helper functions
  const generateDailyTrends = (days) => {
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return trends;
  };

  const generateMonthlyConversion = (months) => {
    const conversion = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      conversion.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        conversionRate: Math.floor(Math.random() * 20) + 60
      });
    }
    
    return conversion;
  };

  const generateCSVContent = (data, filters) => {
    const headers = [
      'Referral ID',
      'Referrer Username',
      'Referred Username',
      'Referred Email',
      'Registration Date',
      'First Deposit',
      'Total Deposits',
      'Total Bets',
      'Total Commissions',
      'Status',
      'Days Active',
      'Country'
    ];
    
    const rows = data.map(referral => [
      referral.id,
      referral.referrerUsername,
      referral.referredUsername,
      referral.referredEmail,
      new Date(referral.registrationDate).toLocaleDateString(),
      referral.firstDeposit || 'None',
      referral.totalDeposits,
      referral.totalBets,
      referral.totalCommissions,
      referral.status,
      referral.daysActive,
      referral.country
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    referrals,
    referralStats,
    referralCharts,
    referralTree,
    users,
    loading,
    error,
    fetchReferrals,
    fetchReferralStats,
    fetchReferralTree,
    fetchUsers,
    updateReferralTree,
    exportReferralReport
  };
};

export default useReferral; 