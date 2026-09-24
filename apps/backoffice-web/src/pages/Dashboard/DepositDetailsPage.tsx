import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';
import { useSearchParams } from 'react-router-dom';
import { listTransactions } from '../../services/api/transactions';

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

const DepositDetailsPage = () => {
  const { isDarkTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get the period from URL params (today, yesterday, this-week, etc.)
  const period = searchParams.get('period') || 'today';

  // Convert period to display title
  const getDisplayTitle = (period) => {
    const titles = {
      'today': 'Today-Confirmed Deposit',
      'yesterday': 'Yesterday-Confirmed Deposit',
      'this-week': 'This Week-Confirmed Deposit',
      'last-week': 'Last Week-Confirmed Deposit',
      'this-month': 'This Month-Confirmed Deposit',
      'last-month': 'Last Month-Confirmed Deposit'
    };
    return titles[period] || 'Today-Confirmed Deposit';
  };

  const [currentPageData, setCurrentPageData] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const dateRange = getDateRangeForPeriod(period);
    listTransactions(
      { type: 'DEPOSIT', dateRangeStart: dateRange.start, dateRangeEnd: dateRange.end },
      { page: currentPage, limit: recordsPerPage },
    )
      .then((data) => {
        if (cancelled) return;
        setCurrentPageData(data.nodes);
        setTotalEntries(data.totalCount);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPage, recordsPerPage, period]);

  useEffect(() => fetchPage(), [fetchPage]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / recordsPerPage));
  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
  const endEntry = Math.min(currentPage * recordsPerPage, totalEntries);

  // Reset to page 1 when records per page or period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, period]);

  // CSV Export functionality - exports the currently loaded page only
  const handleExport = () => {
    const headers = ['#', 'Approved Date', 'Transaction ID', 'Username', 'Deposit Amount(৳)', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...currentPageData.map((deposit, index) => [
        startEntry + index,
        formatDate(deposit.updatedAt || deposit.createdAt),
        deposit.id,
        deposit.username || '',
        deposit.amount,
        deposit.paymentMethod || '',
        formatEnumLabel(deposit.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${period}_deposits_${new Date().toISOString().split('T')[0]}.csv`);
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
                    Approved Date
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Transaction ID
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Username
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-right p-2`}>
                    Deposit Amount(৳)
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Payment Method
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkTheme ? 'bg-gray-900' : 'bg-white'} divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-red-500">Failed to load: {error}</td></tr>
                ) : currentPageData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-xs p-4 text-gray-500">No deposits in this period.</td></tr>
                ) : currentPageData.map((deposit, index) => (
                  <tr key={deposit.id} className={`hover:${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} transition-colors ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'} border-t`}>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {startEntry + index}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatDate(deposit.updatedAt || deposit.createdAt)}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {deposit.id}
                    </td>
                    <td
                      className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline cursor-pointer p-2`}
                      onClick={() => window.open(`/members/profile/${deposit.username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                    >
                      {deposit.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-right p-2`}>
                      {deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {deposit.paymentMethod || '—'}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {formatEnumLabel(deposit.status)}
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

export default DepositDetailsPage;
