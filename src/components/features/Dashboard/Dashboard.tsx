import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTheme } from '../../../context/ThemeContext';
import Breadcrumb from '../../common/UI/Breadcrumb';

// Live counterparts for the two stat cards that have a real backend field
// (dashboardStats). The rest of this page (deposit/withdrawal breakdowns,
// online users, bonus total, ...) has no equivalent in the GraphQL schema
// yet, so it stays on the mock data below.
const GET_DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalUsers
      revenue
    }
  }
`;

const Dashboard = () => {
  const { isDarkTheme } = useTheme();
  const [selectedCurrency] = useState('BDT'); // Currency selector
  const { data: liveStats, loading: liveStatsLoading, error: liveStatsError } = useQuery(GET_DASHBOARD_STATS);
  
  // Collapsed state for different card sections
  const [collapsedCards, setCollapsedCards] = useState({
    topStats: {},      // For top 4 stat cards
    deposit: false,    // For deposit table
    withdrawal: false, // For withdrawal table
    bottomTables: {}   // For bottom 8 tables
  });

  // Toggle collapse function
  const toggleCollapse = (section, id = null) => {
    setCollapsedCards(prev => {
      if (section === 'topStats' || section === 'bottomTables') {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [id]: !prev[section][id]
          }
        };
      } else {
        return {
          ...prev,
          [section]: !prev[section]
        };
      }
    });
  };

  // Reusable period mapping
  const periodMap = {
    'Today': 'today',
    'Yesterday': 'yesterday',
    'This Week': 'this-week',
    'Last Week': 'last-week',
    'This Month': 'this-month',
    'Last Month': 'last-month'
  };

  // Centralized table row click handler
  const handleTableRowClick = (tableName, period) => {
    const urlPeriod = periodMap[period] || 'today';
    
    // Define routing and window configurations
    const tableConfigs = {
      'DEPOSIT': { route: '/deposit-details', width: 1400, height: 700 },
      'WITHDRAWAL': { route: '/withdrawal-details', width: 1200, height: 700 },
      'REGISTERED USER': { route: '/registered-users', width: 1200, height: 600 },
      'FIRST DEPOSIT': { route: '/first-deposit', width: 1400, height: 700 },
      'BONUS': { route: '/bonus', width: 1200, height: 600 },
      'COMPANY WIN / LOSS': { route: '/company-profit', width: 1400, height: 700 },
      'TURNOVER': { route: '/turnover', width: 1400, height: 700 }
    };

    const config = tableConfigs[tableName];
    if (config) {
      window.open(
        `${config.route}?period=${urlPeriod}`, 
        '_blank', 
        `width=${config.width},height=${config.height},scrollbars=yes,resizable=yes`
      );
    }
  };

  // Handle VIEW MORE click for stat cards
  const handleViewMore = (cardTitle) => {
    const viewMoreConfigs = {
      'BONUS': { route: '/bonus', width: 800, height: 600 },
      'ONLINE USER': { route: '/online-users', width: 1000, height: 600 },
      'REGISTERED USER': { route: '/registered-users', width: 1200, height: 600 },
      'COMPANY TOTAL WIN LOSS': { route: '/company-profit', width: 1000, height: 600 }
    };

    const config = viewMoreConfigs[cardTitle];
    if (config) {
      window.open(config.route, '_blank', `width=${config.width},height=${config.height},scrollbars=yes,resizable=yes`);
    }
  };

  // Reusable table component
  const renderTable = (table, index) => {
    const isClickable = ['REGISTERED USER', 'FIRST DEPOSIT', 'BONUS', 'COMPANY WIN / LOSS', 'TURNOVER'].includes(table.title);
  
  return (
      <div key={index} className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg transition-all duration-300`}>
        <div className={`p-3 ${!collapsedCards.bottomTables[index] ? 'border-b' : ''} ${isDarkTheme ? 'border-gray-700 bg-blue-900 bg-opacity-60' : 'border-gray-200 bg-blue-100'} flex items-center justify-between`}>
          <h3 className={`text-xs font-semibold ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
            <span className="mr-2">≡</span> {table.title}
          </h3>
          <button
            onClick={() => toggleCollapse('bottomTables', index)}
            className={`text-xs ${isDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'} transition-transform duration-200 ${collapsedCards.bottomTables[index] ? 'rotate-180' : ''}`}
          >
            ⌄
          </button>
        </div>
        
        {!collapsedCards.bottomTables[index] && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>Period</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>
                    {table.title === 'VIP Point To Cash' ? 'Uid' : 'Count'}
                  </th>
                  {table.data[0].amount && (
                    <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Amount(৳)</th>
                  )}
                  {table.data[0].percent && (
                    <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Margin</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    onClick={isClickable ? () => handleTableRowClick(table.title, row.period) : undefined}
                    className={`${isDarkTheme ? 'border-gray-700' : 'border-gray-100'} border-t ${
                      isClickable ? `cursor-pointer transition-colors hover:${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}` : ''
                    }`}
                  >
                    <td className={`text-xs p-2 ${
                      isClickable 
                        ? `${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium`
                        : `${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`
                    }`}>
                      {row.period}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>
                      {row.count || row.uid}
                    </td>
                    {row.amount && (
                      <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.amount}</td>
                    )}
                    {row.percent && (
                      <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.percent}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Mock data matching the image structure
  const topStats = [
    {
      title: 'BONUS',
      amount: '1,927,595.73',
      icon: '💰',
      color: 'bg-blue-500',
      viewMore: true
    },
    {
      title: 'ONLINE USER',
      amount: '44,211',
      subtitle: 'OF 3,650,675',
      icon: '👤',
      color: 'bg-green-500',
      viewMore: true
    },
    {
      title: 'REGISTERED USER',
      amount: liveStatsLoading
        ? '…'
        : liveStatsError
          ? 'N/A'
          : (liveStats?.dashboardStats?.totalUsers ?? 0).toLocaleString(),
      subtitle: liveStatsError ? 'live data failed to load' : 'LIVE from dashboardStats',
      icon: '📈',
      color: 'bg-orange-500',
      viewMore: true
    },
    {
      title: 'COMPANY TOTAL WIN LOSS',
      amount: liveStatsLoading
        ? '…'
        : liveStatsError
          ? 'N/A'
          : (liveStats?.dashboardStats?.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      subtitle: liveStatsError ? 'live data failed to load' : 'LIVE from dashboardStats',
      icon: '💵',
      color: 'bg-yellow-500',
      viewMore: true
    }
  ];

  const depositData = {
    totalPendingAmount: '948,585.00',
    totalPendingCount: '313',
    details: [
      { period: 'Today', count: '38,532', amount: '58,480,545.69' },
      { period: 'Yesterday', count: '98,649', amount: '159,465,840.06' },
      { period: 'This Week', count: '304,313', amount: '502,004,801.30' },
      { period: 'Last Week', count: '635,623', amount: '927,307,708.25' },
      { period: 'This Month', count: '391,501', amount: '654,280,141.58' },
      { period: 'Last Month', count: '3,203,387', amount: '4,412,801,090.41' }
    ]
  };

  const withdrawalData = {
    totalPendingAmount: '420,800.00',
    totalPendingCount: '60',
    details: [
      { period: 'Today', count: '10,959', amount: '47,300,900.00' },
      { period: 'Yesterday', count: '43,413', amount: '173,230,400.00' },
      { period: 'This Week', count: '120,467', amount: '487,072,576.00' },
      { period: 'Last Week', count: '231,378', amount: '807,897,300.00' },
      { period: 'This Month', count: '148,640', amount: '591,826,476.00' },
      { period: 'Last Month', count: '1,155,448', amount: '4,014,160,199.00' }
    ]
  };

  const bottomTables = [
    {
      title: 'REGISTERED USER',
      data: [
        { period: 'Today', count: '858', amount: null },
        { period: 'Yesterday', count: '2,568', amount: null },
        { period: 'This Week', count: '8,241', amount: null },
        { period: 'Last Week', count: '19,141', amount: null },
        { period: 'This Month', count: '10,670', amount: null },
        { period: 'Last Month', count: '108,283', amount: null }
      ]
    },
    {
      title: 'FIRST DEPOSIT',
      data: [
        { period: 'Today', count: '504', amount: '503,766.00' },
        { period: 'Yesterday', count: '1,654', amount: '1,786,542.47' },
        { period: 'This Week', count: '4,796', amount: '5,089,015.47' },
        { period: 'Last Week', count: '11,506', amount: '10,975,378.53' },
        { period: 'This Month', count: '6,234', amount: '6,708,327.47' },
        { period: 'Last Month', count: '62,828', amount: '54,920,817.62' }
      ]
    },
    {
      title: 'BONUS',
      data: [
        { period: 'Today', count: '15,023', amount: '1,927,595.73' },
        { period: 'Yesterday', count: '217,076', amount: '32,250,904.98' },
        { period: 'This Week', count: '467,127', amount: '61,091,276.85' },
        { period: 'Last Week', count: '793,467', amount: '112,892,257.76' },
        { period: 'This Month', count: '593,092', amount: '74,384,126.74' },
        { period: 'Last Month', count: '4,004,860', amount: '586,191,654.29' }
      ]
    },
    {
      title: 'VIP Point To Cash',
      data: [
        { period: 'Today', uid: '23,636', amount: '3,896,167.00' },
        { period: 'Yesterday', uid: '46,390', amount: '8,671,634.00' },
        { period: 'This Week', uid: '145,008', amount: '26,316,358.00' },
        { period: 'Last Week', uid: '289,668', amount: '48,804,019.00' },
        { period: 'This Month', uid: '182,149', amount: '32,889,272.00' },
        { period: 'Last Month', uid: '1,448,956', amount: '242,769,955.00' }
      ]
    },
    {
      title: 'REFERRAL COMMISSION',
      data: [
        { period: 'Today', count: '11,223', amount: '324,375.39' },
        { period: 'Yesterday', count: '28,735', amount: '683,556.14' },
        { period: 'This Week', count: '93,432', amount: '2,272,766.89' },
        { period: 'Last Week', count: '217,579', amount: '4,878,230.87' },
        { period: 'This Month', count: '122,222', amount: '2,945,881.20' },
        { period: 'Last Month', count: '976,941', amount: '22,451,678.78' }
      ]
    },
    {
      title: 'COMPANY WIN / LOSS',
      data: [
        { period: 'Today', count: '70,248', amount: '27,280,820.59' },
        { period: 'Yesterday', count: '129,700', amount: '45,349,280.95' },
        { period: 'This Week', count: '182,690', amount: '129,301,770.28' },
        { period: 'Last Week', count: '253,596', amount: '287,570,777.97' },
        { period: 'This Month', count: '196,926', amount: '173,544,091.74' },
        { period: 'Last Month', count: '486,717', amount: '1,256,054,583.56' }
      ]
    },
    {
      title: 'TURNOVER',
      data: [
        { period: 'Today', count: '70,248', amount: '756,318,016.06' },
        { period: 'Yesterday', count: '129,700', amount: '1,751,488,078.06' },
        { period: 'This Week', count: '182,690', amount: '5,272,367,021.97' },
        { period: 'Last Week', count: '253,596', amount: '9,315,529,711.04' },
        { period: 'This Month', count: '196,926', amount: '6,507,300,507.81' },
        { period: 'Last Month', count: '486,717', amount: '46,238,118,333.61' }
      ]
    },
    {
      title: 'GROSS MARGIN',
      data: [
        { period: 'Today', count: '70,248', percent: '3.61%' },
        { period: 'Yesterday', count: '129,700', percent: '2.59%' },
        { period: 'This Week', count: '182,690', percent: '2.45%' },
        { period: 'Last Week', count: '253,596', percent: '3.09%' },
        { period: 'This Month', count: '196,926', percent: '2.67%' },
        { period: 'Last Month', count: '486,717', percent: '2.72%' }
      ]
    }
  ];

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Breadcrumb and Currency Selector */}
      <div className="flex items-center justify-between mb-3">
        <Breadcrumb />
        
        {/* Currency Type */}
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Currency Type</span>
          <select className={`text-xs border rounded px-2 py-1 ${isDarkTheme ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300'}`}>
            <option value="BDT">BDT</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      
      {/* Dashboard Title */}
      <h1 className={`text-lg font-semibold mb-3 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>Dashboard</h1>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {topStats.map((stat, index) => (
          <div key={index} className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex flex-col ${collapsedCards.topStats[index] ? 'pb-3' : ''}`}>
            <div className={`flex items-center justify-between mb-2 p-3 ${isDarkTheme ? 'bg-blue-900 bg-opacity-60' : 'bg-blue-100'} rounded-t-lg`}>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-sm">{stat.icon}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'} uppercase font-semibold`}>{stat.title}</span>
                <button 
                  onClick={() => toggleCollapse('topStats', index)}
                  className={`text-xs ${isDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'} transition-transform duration-200 ${collapsedCards.topStats[index] ? 'rotate-180' : ''}`}
                >
                  ⌄
                </button>
              </div>
            </div>
            
            {!collapsedCards.topStats[index] && (
              <div className="flex flex-col flex-grow">
                <div className={`px-3 pb-3 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                  <div className={`text-lg font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'} mb-1 text-right`}>
                    {(stat.title === 'REGISTERED USER' || stat.title === 'ONLINE USER') ? stat.amount : `৳${stat.amount}`}
                  </div>
                  <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'} min-h-[16px] text-right`}>
                    {stat.subtitle || ''}
                  </div>
                </div>
                {stat.viewMore && (
                  <div className="px-3 py-2">
                    <button className={`text-xs ${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`} onClick={() => handleViewMore(stat.title)}>
                      VIEW MORE
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        </div>

      {/* Deposit and Withdrawal Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Deposit Table */}
        <div className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg transition-all duration-300`}>
          <div className={`p-3 ${!collapsedCards.deposit ? 'border-b' : ''} ${isDarkTheme ? 'border-gray-700 bg-blue-900 bg-opacity-60' : 'border-gray-200 bg-blue-100'} flex items-center justify-between`}>
            <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
              <span className="mr-2">≡</span> DEPOSIT
            </h3>
            <button
              onClick={() => toggleCollapse('deposit')}
              className={`text-xs ${isDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'} transition-transform duration-200 ${collapsedCards.deposit ? 'rotate-180' : ''}`}
            >
              ⌄
            </button>
          </div>
          
          {!collapsedCards.deposit && (
            <div className="p-3">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
                  ৳{depositData.totalPendingAmount}
                </div>
                <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Pending Amount
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
                  {depositData.totalPendingCount}
                </div>
                <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Pending Count
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>Period</th>
                    <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Count</th>
                    <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Amount(৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {depositData.details.map((row, index) => (
                    <tr 
                      key={index} 
                      onClick={() => handleTableRowClick('DEPOSIT', row.period)}
                      className={`${isDarkTheme ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} border-t cursor-pointer transition-colors`}
                    >
                      <td className={`text-xs ${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} p-2 font-medium`}>{row.period}</td>
                      <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.count}</td>
                      <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>

        {/* Withdrawal Table */}
        <div className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg transition-all duration-300`}>
          <div className={`p-3 ${!collapsedCards.withdrawal ? 'border-b' : ''} ${isDarkTheme ? 'border-gray-700 bg-blue-900 bg-opacity-60' : 'border-gray-200 bg-blue-100'} flex items-center justify-between`}>
            <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'} flex items-center`}>
              <span className="mr-2">≡</span> WITHDRAWAL
            </h3>
            <button 
              onClick={() => toggleCollapse('withdrawal')}
              className={`text-xs ${isDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'} transition-transform duration-200 ${collapsedCards.withdrawal ? 'rotate-180' : ''}`}
            >
              ⌄
            </button>
          </div>
          
          {!collapsedCards.withdrawal && (
            <div className="p-3">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
                    ৳{withdrawalData.totalPendingAmount}
                  </div>
                  <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Pending Amount
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
                    {withdrawalData.totalPendingCount}
                  </div>
                  <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Pending Count
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>Period</th>
                      <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Count</th>
                      <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>Amount(৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalData.details.map((row, index) => (
                      <tr 
                        key={index} 
                        onClick={() => handleTableRowClick('WITHDRAWAL', row.period)}
                        className={`${isDarkTheme ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} border-t cursor-pointer transition-colors`}
                      >
                        <td className={`text-xs ${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} p-2 font-medium`}>{row.period}</td>
                        <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.count}</td>
                        <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tables Grid - 2-3-3-2 Layout */}
      <div className="space-y-4">
        {/* First Row: 2 tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bottomTables.slice(0, 2).map((table, index) => renderTable(table, index))}
        </div>

        {/* Second Row: 3 tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bottomTables.slice(2, 5).map((table, index) => renderTable(table, index + 2))}
          </div>
          
        {/* Third Row: 3 tables (only showing first 2 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bottomTables.slice(5, 8).map((table, index) => renderTable(table, index + 5))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 