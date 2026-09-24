import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';
import { useSearchParams } from 'react-router-dom';

// NOTE: Query.bonuses only accepts `pagination`, not a `filter`/`dateRange`
// arg (see server/src/graphql/schema/index.js). There is no server-side way
// to restrict bonuses to a given period today, so the period selector in the
// URL only drives the page title here - the table shows all bonuses
// (paginated) regardless of the selected period. If/when the backend grows a
// BonusFilterInput with a dateRange, wire it the same way RegisteredUsersPage
// wires UserFilterInput.
const GET_BONUSES_PAGE = gql`
  query BonusPage($pagination: PaginationInput) {
    bonuses(pagination: $pagination) {
      totalCount
      nodes {
        id
        type
        status
        amount
        currency
        createdAt
        user {
          username
        }
      }
    }
  }
`;

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

// SCREAMING_CASE enum -> "Free Spins" style label
const formatEnumLabel = (value) =>
  value
    ? value
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')
    : '';

const BonusPage = () => {
  const { isDarkTheme } = useTheme();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the period from URL params (today, yesterday, this-week, etc.)
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period') || 'today';

  // Convert period to display title
  const getDisplayTitle = (p) => {
    const titles = {
      'today': 'Today Bonus',
      'yesterday': 'Yesterday Bonus',
      'this-week': 'This Week Bonus',
      'last-week': 'Last Week Bonus',
      'this-month': 'This Month Bonus',
      'last-month': 'Last Month Bonus'
    };
    return titles[p] || 'Today Bonus';
  };

  // Memoized so useQuery gets a stable `variables` reference across renders
  // (an inline object literal here would give it a new reference every
  // render, which Apollo treats as "variables changed" and refetches
  // forever - see RegisteredUsersPage.js for the same pattern).
  const queryVariables = useMemo(() => ({
    pagination: { page: currentPage, limit: recordsPerPage },
  }), [currentPage, recordsPerPage]);

  const { data, loading, error } = useQuery(GET_BONUSES_PAGE, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const currentPageData = data?.bonuses?.nodes ?? [];
  const totalEntries = data?.bonuses?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / recordsPerPage));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endEntry = Math.min(currentPage * recordsPerPage, totalEntries);

  // Reset to page 1 when records per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage]);

  // CSV Export functionality - exports the currently loaded page only
  const handleExport = () => {
    const headers = ['#', 'Date Time', 'Username', 'Bonus Type', 'Status', 'Bonus Amount(৳)'];
    const csvContent = [
      headers.join(','),
      ...currentPageData.map((bonus, index) => [
        startEntry + index,
        formatDate(bonus.createdAt),
        bonus.user?.username || '',
        formatEnumLabel(bonus.type),
        formatEnumLabel(bonus.status),
        bonus.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${period}_bonus_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    // Save functionality
    console.log('Save clicked');
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
          <div className="flex items-center space-x-3">
            <button className={`text-xs ${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              Columns ⌄
            </button>
            <button
              onClick={handleSave}
              className={`px-3 py-1 text-xs font-medium rounded ${
                isDarkTheme
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
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
              <thead className={`${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    #
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Date Time
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Username
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Bonus Type
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Status
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>
                    Bonus Amount(৳)
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkTheme ? 'bg-gray-900' : 'bg-white'} divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-xs p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="text-center text-xs p-4 text-red-500">Failed to load: {error.message}</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-xs p-4 text-gray-500">No bonuses found.</td></tr>
                ) : currentPageData.map((bonus, index) => (
                  <tr key={bonus.id} className={`hover:${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} transition-colors ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'} border-t`}>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {startEntry + index}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatDate(bonus.createdAt)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline cursor-pointer p-2`} onClick={() => window.open(`/members/profile/${bonus.user?.username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}>
                      {bonus.user?.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatEnumLabel(bonus.type)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatEnumLabel(bonus.status)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>
                      {bonus.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default BonusPage;
