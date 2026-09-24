import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';
import { useSearchParams } from 'react-router-dom';

// NOTE / documented compromise: "first deposit only" (each user's first
// deposit, and only that one) is not a concept the backend can filter for -
// Query.transactions(filter: { type: DEPOSIT }) returns ALL deposit
// transactions in the period, not just each user's first. There is no
// per-user "first of type" aggregation in the schema today. Until the
// backend adds that (e.g. a `firstDepositsOnly` filter flag or a dedicated
// query), this page shows the same all-deposits list as DepositDetailsPage.
const GET_DEPOSITS_PAGE = gql`
  query FirstDepositPage($pagination: PaginationInput, $filter: TransactionFilterInput) {
    transactions(pagination: $pagination, filter: $filter) {
      totalCount
      nodes {
        id
        amount
        currency
        status
        paymentMethod
        createdAt
        processedAt
        user {
          username
        }
      }
    }
  }
`;

// Turns a dashboard period key ("today", "this-week", ...) into a
// DateRangeInput for the transactions(filter: { dateRange }) query.
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

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

const formatEnumLabel = (value) =>
  value
    ? value
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')
    : '';

const FirstDepositPage = () => {
  const { isDarkTheme } = useTheme();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the period from URL params (today, yesterday, this-week, etc.)
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period') || 'today';

  // Convert period to display title
  const getDisplayTitle = (period) => {
    const titles = {
      'today': 'Today First Deposit',
      'yesterday': 'Yesterday First Deposit',
      'this-week': 'This Week First Deposit',
      'last-week': 'Last Week First Deposit',
      'this-month': 'This Month First Deposit',
      'last-month': 'Last Month First Deposit'
    };
    return titles[period] || 'Today First Deposit';
  };

  // Memoized so useQuery gets a stable `variables` reference across renders
  // (see RegisteredUsersPage.js - an inline object literal here would give
  // Apollo a new reference every render, causing an infinite refetch loop).
  const queryVariables = useMemo(() => ({
    pagination: { page: currentPage, limit: recordsPerPage },
    filter: { type: 'DEPOSIT', dateRange: getDateRangeForPeriod(period) },
  }), [currentPage, recordsPerPage, period]);

  const { data, loading, error } = useQuery(GET_DEPOSITS_PAGE, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const currentPageData = data?.transactions?.nodes ?? [];
  const totalEntries = data?.transactions?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / recordsPerPage));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endEntry = Math.min(currentPage * recordsPerPage, totalEntries);

  // Reset to page 1 when records per page or period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, period]);

  // CSV Export functionality - exports the currently loaded page only
  const handleExport = () => {
    const headers = ['#', 'First Deposit Date', 'Transaction ID', 'Username', 'Deposit Amount(৳)', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...currentPageData.map((deposit, index) => [
        startEntry + index,
        formatDate(deposit.processedAt || deposit.createdAt),
        deposit.id,
        deposit.user?.username || '',
        deposit.amount,
        deposit.paymentMethod || '',
        formatEnumLabel(deposit.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `first_deposit_${period}_${new Date().toISOString().split('T')[0]}.csv`);
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
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
          <p className={`text-[11px] mt-1 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
            Showing all deposits in this period (&quot;first deposit only&quot; filtering isn&apos;t available server-side yet)
          </p>
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
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Deposit Date</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Transaction ID</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Username</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Deposit Amount(৳)</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>Payment Method</th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-3`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-red-500">Failed to load: {error.message}</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">No deposits in this period.</td></tr>
                ) : currentPageData.map((deposit, index) => (
                  <tr
                    key={deposit.id}
                    className={`border-t ${isDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                      {startEntry + index}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                      {formatDate(deposit.processedAt || deposit.createdAt)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                      {deposit.id}
                    </td>
                    <td
                      className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} underline cursor-pointer`}
                      onClick={() => window.open(`/members/profile/${deposit.user?.username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                    >
                      {deposit.user?.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} text-right`}>
                      {deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3 border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                      {deposit.paymentMethod || '—'}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-3`}>
                      {formatEnumLabel(deposit.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {startEntry} to {endEntry} of {totalEntries.toLocaleString()} entries
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

            {getPaginationNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && goToPage(page)}
                disabled={page === '...'}
                className={`px-2 py-1 text-xs border rounded ${
                  page === currentPage
                    ? isDarkTheme
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-blue-500 border-blue-500 text-white'
                    : page === '...'
                      ? isDarkTheme
                        ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : isDarkTheme
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-xs border rounded ${
                currentPage === totalPages
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

export default FirstDepositPage;
