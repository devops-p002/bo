import { useState, useCallback } from 'react';

const useCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [commissionCharts, setCommissionCharts] = useState(null);
  const [commissionSettings, setCommissionSettings] = useState(null);
  const [commissionRulesData, setCommissionRulesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock commission data
  const mockCommissions = [
    {
      id: 'COM001',
      referrerUsername: 'john_doe',
      referredUsername: 'jane_smith',
      type: 'registration',
      amount: 10,
      rate: 100,
      sourceAmount: 10,
      status: 'paid',
      createdAt: '2024-01-15T10:30:00Z',
      paidAt: '2024-01-16T14:20:00Z',
      description: 'Registration commission for new user signup',
      paymentHistory: [
        {
          action: 'Commission Generated',
          timestamp: '2024-01-15T10:30:00Z',
          notes: 'Commission generated for new user registration',
          processedBy: 'system'
        },
        {
          action: 'Commission Approved',
          timestamp: '2024-01-16T09:15:00Z',
          notes: 'Commission approved by admin',
          processedBy: 'admin_user'
        },
        {
          action: 'Commission Paid',
          timestamp: '2024-01-16T14:20:00Z',
          notes: 'Commission paid to referrer account',
          processedBy: 'payment_system'
        }
      ]
    },
    {
      id: 'COM002',
      referrerUsername: 'john_doe',
      referredUsername: 'jane_smith',
      type: 'deposit',
      amount: 5,
      rate: 5,
      sourceAmount: 100,
      status: 'paid',
      createdAt: '2024-01-16T14:20:00Z',
      paidAt: '2024-01-17T10:00:00Z',
      description: 'Deposit commission for first deposit',
      paymentHistory: [
        {
          action: 'Commission Generated',
          timestamp: '2024-01-16T14:20:00Z',
          notes: 'Commission generated for first deposit',
          processedBy: 'system'
        },
        {
          action: 'Commission Paid',
          timestamp: '2024-01-17T10:00:00Z',
          notes: 'Commission automatically paid',
          processedBy: 'payment_system'
        }
      ]
    },
    {
      id: 'COM003',
      referrerUsername: 'mike_jones',
      referredUsername: 'bob_wilson',
      type: 'registration',
      amount: 10,
      rate: 100,
      sourceAmount: 10,
      status: 'pending',
      createdAt: '2024-01-20T16:45:00Z',
      description: 'Registration commission pending approval',
      paymentHistory: [
        {
          action: 'Commission Generated',
          timestamp: '2024-01-20T16:45:00Z',
          notes: 'Commission generated for new user registration',
          processedBy: 'system'
        }
      ]
    },
    {
      id: 'COM004',
      referrerUsername: 'alice_brown',
      referredUsername: 'charlie_davis',
      type: 'revenue_share',
      amount: 25,
      rate: 25,
      sourceAmount: 100,
      status: 'approved',
      createdAt: '2024-01-25T08:30:00Z',
      description: 'Revenue share commission from gameplay',
      paymentHistory: [
        {
          action: 'Commission Generated',
          timestamp: '2024-01-25T08:30:00Z',
          notes: 'Revenue share commission calculated',
          processedBy: 'system'
        },
        {
          action: 'Commission Approved',
          timestamp: '2024-01-25T12:00:00Z',
          notes: 'Commission approved for payment',
          processedBy: 'admin_user'
        }
      ]
    }
  ];

  // Mock commission rules
  const mockCommissionRules = [
    {
      id: 'RULE001',
      name: 'VIP Registration Bonus',
      type: 'fixed',
      value: 25,
      conditions: {
        minDeposit: 100,
        maxDeposit: null,
        timeFrame: 7,
        gameCategories: [],
        userTiers: ['vip', 'platinum']
      },
      isActive: true,
      description: 'Enhanced commission for VIP user registrations'
    },
    {
      id: 'RULE002',
      name: 'High Roller Deposit Commission',
      type: 'percentage',
      value: 10,
      conditions: {
        minDeposit: 1000,
        maxDeposit: null,
        timeFrame: null,
        gameCategories: [],
        userTiers: ['gold', 'platinum', 'vip']
      },
      isActive: true,
      description: 'Higher commission rate for large deposits'
    },
    {
      id: 'RULE003',
      name: 'Weekend Special',
      type: 'percentage',
      value: 7,
      conditions: {
        minDeposit: 50,
        maxDeposit: 500,
        timeFrame: null,
        gameCategories: ['slots', 'table_games'],
        userTiers: []
      },
      isActive: false,
      description: 'Special weekend commission rate'
    }
  ];

  const fetchCommissions = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredCommissions = [...mockCommissions];
      
      // Apply filters
      if (filters.dateFrom) {
        filteredCommissions = filteredCommissions.filter(
          commission => new Date(commission.createdAt) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredCommissions = filteredCommissions.filter(
          commission => new Date(commission.createdAt) <= new Date(filters.dateTo)
        );
      }
      
      if (filters.referrer) {
        filteredCommissions = filteredCommissions.filter(
          commission => commission.referrerUsername.toLowerCase().includes(filters.referrer.toLowerCase())
        );
      }
      
      if (filters.commissionType && filters.commissionType !== 'all') {
        filteredCommissions = filteredCommissions.filter(
          commission => commission.type === filters.commissionType
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredCommissions = filteredCommissions.filter(
          commission => commission.status === filters.status
        );
      }
      
      if (filters.minAmount) {
        filteredCommissions = filteredCommissions.filter(
          commission => commission.amount >= parseFloat(filters.minAmount)
        );
      }
      
      if (filters.maxAmount) {
        filteredCommissions = filteredCommissions.filter(
          commission => commission.amount <= parseFloat(filters.maxAmount)
        );
      }
      
      setCommissions(filteredCommissions);
    } catch (err) {
      setError('Failed to fetch commissions');
      console.error('Error fetching commissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommissionSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const summary = {
        totalCommissions: 125750,
        paidCommissions: 89500,
        pendingCommissions: 23750,
        rejectedCommissions: 2500,
        totalReferrers: 245,
        topPerformers: [
          {
            username: 'john_doe',
            referrals: 45,
            totalCommissions: 1250
          },
          {
            username: 'alice_brown',
            referrals: 38,
            totalCommissions: 980
          },
          {
            username: 'mike_jones',
            referrals: 32,
            totalCommissions: 850
          },
          {
            username: 'diana_white',
            referrals: 28,
            totalCommissions: 720
          },
          {
            username: 'charlie_davis',
            referrals: 24,
            totalCommissions: 650
          }
        ]
      };
      
      setCommissionSummary(summary);
      
      // Generate chart data
      const chartData = {
        trends: generateCommissionTrends(30),
        byType: [
          { type: 'Registration', amount: 45250 },
          { type: 'Deposit', amount: 32800 },
          { type: 'Revenue Share', amount: 35900 },
          { type: 'CPA', amount: 8750 },
          { type: 'Bonus', amount: 3050 }
        ]
      };
      
      setCommissionCharts(chartData);
    } catch (err) {
      setError('Failed to fetch commission summary');
      console.error('Error fetching commission summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommissionSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const settings = {
        registrationCommission: {
          enabled: true,
          amount: 10,
          type: 'fixed',
          currency: 'USD'
        },
        depositCommission: {
          enabled: true,
          rate: 5,
          type: 'percentage',
          minDeposit: 20,
          maxCommission: 500
        },
        revenueShare: {
          enabled: true,
          rate: 25,
          levels: [
            { level: 1, rate: 25 },
            { level: 2, rate: 15 },
            { level: 3, rate: 10 },
            { level: 4, rate: 5 },
            { level: 5, rate: 2 }
          ]
        },
        cpa: {
          enabled: false,
          amount: 100,
          requirements: {
            minDeposit: 50,
            timeFrame: 30
          }
        }
      };
      
      setCommissionSettings(settings);
      setCommissionRulesData(mockCommissionRules);
    } catch (err) {
      setError('Failed to fetch commission settings');
      console.error('Error fetching commission settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommissionSettings = useCallback(async (newSettings) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCommissionSettings(newSettings);
      return { success: true, message: 'Settings updated successfully' };
    } catch (err) {
      setError('Failed to update commission settings');
      console.error('Error updating commission settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommissionRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newRule = {
        ...ruleData,
        id: `RULE${String(mockCommissionRules.length + 1).padStart(3, '0')}`
      };
      
      setCommissionRulesData(prev => [...prev, newRule]);
      return newRule;
    } catch (err) {
      setError('Failed to create commission rule');
      console.error('Error creating commission rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommissionRule = useCallback(async (ruleId, ruleData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCommissionRulesData(prev => 
        prev.map(rule => rule.id === ruleId ? { ...rule, ...ruleData } : rule)
      );
      
      return { success: true, message: 'Rule updated successfully' };
    } catch (err) {
      setError('Failed to update commission rule');
      console.error('Error updating commission rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCommissionRule = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setCommissionRulesData(prev => prev.filter(rule => rule.id !== ruleId));
      return { success: true, message: 'Rule deleted successfully' };
    } catch (err) {
      setError('Failed to delete commission rule');
      console.error('Error deleting commission rule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (settings) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCommissionSettings(settings);
      return { success: true, message: 'Settings saved successfully' };
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportCommissionReport = useCallback(async (filters = {}) => {
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const csvContent = generateCommissionCSV(mockCommissions, filters);
      downloadCSV(csvContent, 'commission-report.csv');
      
      return { success: true, message: 'Report exported successfully' };
    } catch (err) {
      console.error('Error exporting commission report:', err);
      throw new Error('Failed to export report');
    }
  }, []);

  // Helper functions
  const generateCommissionTrends = (days) => {
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 1000) + 200
      });
    }
    
    return trends;
  };

  const generateCommissionCSV = (data, filters) => {
    const headers = [
      'Commission ID',
      'Referrer Username',
      'Referred Username',
      'Commission Type',
      'Amount',
      'Rate (%)',
      'Source Amount',
      'Status',
      'Created Date',
      'Paid Date',
      'Description'
    ];
    
    const rows = data.map(commission => [
      commission.id,
      commission.referrerUsername,
      commission.referredUsername,
      commission.type,
      commission.amount,
      commission.rate,
      commission.sourceAmount,
      commission.status,
      new Date(commission.createdAt).toLocaleDateString(),
      commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : 'Not Paid',
      commission.description || ''
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
    commissions,
    commissionSummary,
    commissionCharts,
    commissionSettings,
    commissionRulesData,
    loading,
    error,
    fetchCommissions,
    fetchCommissionSummary,
    fetchCommissionSettings,
    updateCommissionSettings,
    createCommissionRule,
    updateCommissionRule,
    deleteCommissionRule,
    saveSettings,
    exportCommissionReport
  };
};

export default useCommissions; 