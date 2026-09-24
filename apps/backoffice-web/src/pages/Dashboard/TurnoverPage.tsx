import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';
import { useSearchParams } from 'react-router-dom';

// userBettingLeaderboard returns a plain [UserBettingSummary!]! array, not a
// Connection - there's no totalCount/pageInfo, so we can't show a real
// "of N entries" grand total or numbered page list. We still pass
// `pagination` through (page/limit) so paging works, but the footer below
// just shows the current page and enables/disables Next based on whether
// this page came back full (a heuristic: if we got fewer rows than the
// page size, there's nothing more to fetch).
const GET_LEADERBOARD_PAGE = gql`
  query TurnoverPage($pagination: PaginationInput, $dateRange: DateRangeInput) {
    userBettingLeaderboard(pagination: $pagination, dateRange: $dateRange) {
      userId
      username
      turnoverAmount
    }
  }
`;

// Turns a dashboard period key ("today", "this-week", ...) into a
// DateRangeInput for the userBettingLeaderboard(dateRange) query.
// (Same helper as RegisteredUsersPage.js.)
const getDateRangeForPeriod = (period) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ranges = {
    today: [startOfToday, now],
    yesterday: [new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000), startOfToday],
    'this-week': [new Date(startOfToday.getTime() - startOfToday.getDay() * 24 * 60 * 60 * 1000), now],
    'last-week': [
      new Date(startOfToday.getTime() - (startOfToday.getDay() + 7) * 24 * 60 * 60 * 1000),
      new Date(startOfToday.getTime() - startOfToday.getDay() * 24 * 60 * 60 * 1000),
    ],
    'this-month': [new Date(now.getFullYear(), now.getMonth(), 1), now],
    'last-month': [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)],
  };
  const [start, end] = ranges[period] || ranges.today;
  return { start: start.toISOString(), end: end.toISOString() };
};

const TurnoverPage = () => {
  const { isDarkTheme } = useTheme();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the period from URL params (today, yesterday, this-week, etc.)
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period') || 'today';

  // Convert period to display title
  const getDisplayTitle = (period) => {
    const titles = {
      'today': 'Today Turnover',
      'yesterday': 'Yesterday Turnover',
      'this-week': 'This Week Turnover',
      'last-week': 'Last Week Turnover',
      'this-month': 'This Month Turnover',
      'last-month': 'Last Month Turnover'
    };
    return titles[period] || 'Today Turnover';
  };

  // Memoized so useQuery gets a stable `variables` reference across renders
  // (see RegisteredUsersPage.js - an inline object literal here would give
  // Apollo a new reference every render, causing an infinite refetch loop).
  const queryVariables = useMemo(() => ({
    pagination: { page: currentPage, limit: recordsPerPage },
    dateRange: getDateRangeForPeriod(period),
  }), [currentPage, recordsPerPage, period]);

  const { data, loading, error } = useQuery(GET_LEADERBOARD_PAGE, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const currentPageData = data?.userBettingLeaderboard ?? [];
  const startEntry = currentPageData.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endEntry = currentPageData.length === 0 ? 0 : startEntry + currentPageData.length - 1;
  // No totalCount from this query - only enable Next when the page came
  // back full (there may be more rows behind it).
  const hasNextPage = currentPageData.length === recordsPerPage;

  // Reset to page 1 when records per page or period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, period]);

  // CSV Export functionality - exports the currently loaded page only
  const handleExport = () => {
    const headers = ['#', 'Username', 'Turnover Amount(৳)'];
    const csvContent = [
      headers.join(','),
      ...currentPageData.map((row, index) => [
        startEntry + index,
        row.username,
        row.turnoverAmount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `turnover_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save functionality (placeholder)
  const handleSave = () => {
    console.log('Save functionality to be implemented');
  };

  const goToPage = (page) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto p-4">
        <div className="mb-3">
          <Breadcrumb />
        </div>
        {/* Page Title */}
        <div className="text-center mb-4">
          <h1 className={`text-lg font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            {getDisplayTitle(period)}
          </h1>
        </div>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Left side controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className={`px-3 py-1 text-xs font-medium rounded ${
                isDarkTheme
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors`}
            >
              Export
            </button>

            <div className="flex items-center gap-2">
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className={`text-xs border rounded px-2 py-1 ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-600 text-gray-300'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                records per page
              </span>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-xs font-medium rounded border ${
                isDarkTheme
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Columns
            </button>
            <button
              onClick={handleSave}
              className={`px-3 py-1 text-xs font-medium rounded ${
                isDarkTheme
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } transition-colors`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-lg border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>#</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Username</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-3`}>
                    Turnover (৳)
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center text-xs p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={3} className="text-center text-xs p-4 text-red-500">Failed to load: {error.message}</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-xs p-4 text-gray-500">No betting activity in this period.</td></tr>
                ) : currentPageData.map((row, index) => (
                  <tr
                    key={row.userId}
                    className={`border-t ${isDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                      {startEntry + index}
                    </td>
                    <td
                      className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} underline cursor-pointer`}
                      onClick={() => window.open(`/members/profile/${row.username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                    >
                      {row.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 text-right`}>
                      {row.turnoverAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - no grand total available from this query, so we
            just show the current page and a Previous/Next pair. */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentPageData.length === 0 ? 'No entries' : `Showing ${startEntry} to ${endEntry} (page ${currentPage})`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-xs border rounded ${
                currentPage === 1
                  ? isDarkTheme
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : isDarkTheme
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Previous
            </button>

            <span className={`px-2 py-1 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {currentPage}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              className={`px-2 py-1 text-xs border rounded ${
                !hasNextPage
                  ? isDarkTheme
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : isDarkTheme
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnoverPage;
