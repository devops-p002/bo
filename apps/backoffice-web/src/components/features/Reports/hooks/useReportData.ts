import { useState, useEffect, useCallback } from 'react';

export const useReportData = (reportType = 'general', filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchReportData = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - replace with actual GraphQL query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData(reportType, { ...filters, ...newFilters });
      
      setData(mockData.data);
      setPagination(mockData.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [reportType, filters]);

  const exportData = useCallback((format = 'csv') => {
    // Export functionality
    const exportData = {
      data,
      filters: { ...filters, reportType },
      timestamp: new Date().toISOString(),
      format,
    };
    
    console.log('Exporting report data:', exportData);
    
    // In a real implementation, this would trigger a download
    return exportData;
  }, [data, filters, reportType]);

  const refreshData = useCallback(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return {
    data,
    loading,
    error,
    pagination,
    fetchReportData,
    exportData,
    refreshData,
  };
};

// Mock data generator
const generateMockData = (reportType, filters) => {
  const { page = 1, pageSize = 20 } = filters;
  
  let mockData = [];
  
  switch (reportType) {
    case 'bonus':
      mockData = generateBonusData();
      break;
    case 'payment':
      mockData = generatePaymentData();
      break;
    case 'turnover':
      mockData = generateTurnoverData();
      break;
    case 'bet':
      mockData = generateBetData();
      break;
    case 'daily':
      mockData = generateDailyData();
      break;
    case 'vip':
      mockData = generateVIPData();
      break;
    default:
      mockData = generateGeneralData();
  }

  // Apply pagination
  const total = mockData.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = mockData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

const generateBonusData = () => [
  {
    id: 1,
    bonusType: 'Welcome Bonus',
    amount: 100,
    playersEligible: 50,
    playersRedeemed: 35,
    totalCost: 3500,
    date: '2024-06-15',
  },
  {
    id: 2,
    bonusType: 'Reload Bonus',
    amount: 50,
    playersEligible: 200,
    playersRedeemed: 120,
    totalCost: 6000,
    date: '2024-06-14',
  },
];

const generatePaymentData = () => [
  {
    id: 1,
    transactionId: 'TXN001',
    playerId: 'PLR001',
    type: 'Deposit',
    amount: 500,
    method: 'Credit Card',
    status: 'Completed',
    date: '2024-06-15',
  },
  {
    id: 2,
    transactionId: 'TXN002',
    playerId: 'PLR002',
    type: 'Withdrawal',
    amount: 300,
    method: 'Bank Transfer',
    status: 'Pending',
    date: '2024-06-14',
  },
];

const generateTurnoverData = () => [
  {
    id: 1,
    playerId: 'PLR001',
    playerName: 'John Doe',
    deposits: 1000,
    withdrawals: 500,
    bets: 2000,
    wins: 1800,
    netTurnover: 200,
    date: '2024-06-15',
  },
];

const generateBetData = () => [
  {
    id: 1,
    betId: 'BET001',
    playerId: 'PLR001',
    gameType: 'Slots',
    betAmount: 25,
    winAmount: 50,
    status: 'Won',
    date: '2024-06-15',
  },
];

const generateDailyData = () => [
  {
    id: 1,
    date: '2024-06-15',
    totalDeposits: 10000,
    totalWithdrawals: 7500,
    totalBets: 50000,
    totalWins: 45000,
    activeUsers: 150,
    newRegistrations: 12,
  },
];

const generateVIPData = () => [
  {
    id: 1,
    playerId: 'PLR001',
    playerName: 'John Doe',
    vipLevel: 'Gold',
    pointsEarned: 1250,
    pointsSpent: 800,
    pointsBalance: 450,
  },
];

const generateGeneralData = () => [
  {
    id: 1,
    metric: 'Total Users',
    value: 1250,
    change: '+5.2%',
    period: 'This Month',
  },
  {
    id: 2,
    metric: 'Revenue',
    value: 125000,
    change: '+12.8%',
    period: 'This Month',
  },
];

export default useReportData; 