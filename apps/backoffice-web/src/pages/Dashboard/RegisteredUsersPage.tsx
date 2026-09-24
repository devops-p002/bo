import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';
import { useSearchParams } from 'react-router-dom';

const GET_USERS_PAGE = gql`
  query RegisteredUsersPage($pagination: PaginationInput, $filter: UserFilterInput) {
    users(pagination: $pagination, filter: $filter) {
      totalCount
      nodes {
        id
        username
        fullName
        email
        country
        totalDeposits
        createdAt
      }
    }
  }
`;

// Turns a dashboard period key ("today", "this-week", ...) into a
// DateRangeInput for the users(filter: { dateRange }) query.
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

const RegisteredUsersPage = () => {
  const { isDarkTheme } = useTheme();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the period from URL params (today, yesterday, this-week, etc.)
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period') || 'today';

  // Convert period to display title
  const getDisplayTitle = (p) => {
    const titles = {
      'today': 'Today Registered User',
      'yesterday': 'Yesterday Registered User',
      'this-week': 'This Week Registered User',
      'last-week': 'Last Week Registered User',
      'this-month': 'This Month Registered User',
      'last-month': 'Last Month Registered User'
    };
    return titles[p] || 'Today Registered User';
  };

  // Memoized so the variables object keeps a stable reference across
  // re-renders (an inline object literal here would give useQuery a new
  // `variables` reference every render, which it treats as "variables
  // changed" and refetches forever).
  const queryVariables = useMemo(() => ({
    pagination: { page: currentPage, limit: recordsPerPage },
    filter: { dateRange: getDateRangeForPeriod(period) },
  }), [currentPage, recordsPerPage, period]);

  const { data, loading, error } = useQuery(GET_USERS_PAGE, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const currentPageData = data?.users?.nodes ?? [];
  const totalEntries = data?.users?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / recordsPerPage));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endEntry = Math.min(currentPage * recordsPerPage, totalEntries);

  // Reset to page 1 when records per page or period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, period]);

  // CSV Export functionality - exports the currently loaded page only
  // (real pagination means we don't have the full result set client-side).
  const handleExport = () => {
    const headers = ['#', 'Username', 'Name', 'Date Registered', 'Country', 'Deposit Amount(৳)', 'Email'];
    const csvContent = [
      headers.join(','),
      ...currentPageData.map((user, index) => [
        startEntry + index,
        user.username,
        user.fullName || '',
        formatDate(user.createdAt),
        user.country || '',
        user.totalDeposits,
        user.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registered_users_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-3 max-w-7xl mx-auto">
        <div className="mb-3">
          <Breadcrumb />
        </div>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className={`text-lg font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            {getDisplayTitle(period)}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-2">
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className={`border rounded px-2 py-1 text-xs ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-600 text-gray-300'
                    : 'bg-white border-gray-300'
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
        </div>

        {/* Table */}
        <div className={`rounded-lg border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    #
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Username
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Name
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Date Registered
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Country
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>
                    Deposit Amount(৳)
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkTheme ? 'bg-gray-900' : 'bg-white'} divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-red-500">Failed to load: {error.message}</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">No users registered in this period.</td></tr>
                ) : currentPageData.map((user, index) => (
                  <tr key={user.id} className={`hover:${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} transition-colors ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'} border-t`}>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {startEntry + index}
                    </td>
                    <td
                      className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline cursor-pointer p-2`}
                      onClick={() => window.open(`/members/profile/${user.id}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                    >
                      {user.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.fullName || '—'}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.country || '—'}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>
                      {(user.totalDeposits ?? 0).toLocaleString()}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with pagination */}
        <div className="flex items-center justify-between mt-3">
          <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {startEntry} to {endEntry} of {totalEntries.toLocaleString()} entries
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === 1
                  ? isDarkTheme ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDarkTheme ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              ← Previous
            </button>

            {getPaginationNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? goToPage(page) : null}
                disabled={page === '...'}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  page === currentPage
                    ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : page === '...'
                    ? isDarkTheme ? 'text-gray-600 cursor-default' : 'text-gray-400 cursor-default'
                    : isDarkTheme ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === totalPages
                  ? isDarkTheme ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDarkTheme ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsersPage;
