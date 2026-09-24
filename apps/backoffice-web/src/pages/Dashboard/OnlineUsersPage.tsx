import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumb } from '../../components/common/UI';

const OnlineUsersPage = () => {
  const { isDarkTheme } = useTheme();
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock online users data matching the screenshot
  const onlineUsersDataFull = [
    {
      id: 1,
      username: 'nirab111',
      name: 'MD:Nirab111',
      lastLoginTime: '2025/06/05 10:52:20',
      website: 'jeetbuzz66.site',
      ip: '103.130.175.138',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 2,
      username: 'minrul25',
      name: 'Minrul',
      lastLoginTime: '2025/06/05 10:52:17',
      website: 'jeetbuzz666.com',
      ip: '103.180.54.247',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 3,
      username: '01793852311',
      name: 'G forid',
      lastLoginTime: '2025/06/05 10:52:16',
      website: 'www.jeetbuzz.com',
      ip: '103.72.61.244',
      city: 'Thakurgaon',
      country: 'BD'
    },
    {
      id: 4,
      username: '01833533034',
      name: 'MD Ashik',
      lastLoginTime: '2025/06/05 10:52:16',
      website: 'jeetbuzz8.xyz',
      ip: '103.156.180.43',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 5,
      username: 'janil55',
      name: 'Hfjkg',
      lastLoginTime: '2025/06/05 10:52:16',
      website: 'jeetbuzz.net',
      ip: '37.111.225.158',
      city: 'Shahzadpur',
      country: 'BD'
    },
    {
      id: 6,
      username: 'budu9009',
      name: 'md budu',
      lastLoginTime: '2025/06/05 10:52:15',
      website: 'jeetbuzz.com',
      ip: '118.179.23.18',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 7,
      username: 'far7272',
      name: 'Farzul islam',
      lastLoginTime: '2025/06/05 10:52:14',
      website: 'www.jeetbuzz88.net',
      ip: '43.245.120.165',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 8,
      username: 'emran7311',
      name: 'Md Emran',
      lastLoginTime: '2025/06/05 10:52:14',
      website: 'jeetbuzz.com',
      ip: '103.167.17.195',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 9,
      username: 'usern55',
      name: 'Arif',
      lastLoginTime: '2025/06/05 10:52:14',
      website: '112233jb.online',
      ip: '37.111.212.55',
      city: 'Dhaka',
      country: 'BD'
    },
    {
      id: 10,
      username: '01879347010',
      name: 'Mohan10',
      lastLoginTime: '2025/06/05 10:52:14',
      website: 'jeetbuzz66.site',
      ip: '37.111.212.246',
      city: 'Dhaka',
      country: 'BD'
    },
    // Add more dummy data for pagination testing
    ...Array.from({ length: 40 }, (_, i) => ({
      id: i + 11,
      username: `user${i + 11}`,
      name: `User ${i + 11}`,
      lastLoginTime: `2025/06/05 10:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      website: ['jeetbuzz.com', 'jeetbuzz66.site', 'www.jeetbuzz.com', 'jeetbuzz8.xyz'][Math.floor(Math.random() * 4)],
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      city: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'][Math.floor(Math.random() * 5)],
      country: 'BD'
    }))
  ];

  const totalEntries = 44255; // As shown in screenshot
  const totalPages = Math.ceil(totalEntries / recordsPerPage);
  const startEntry = (currentPage - 1) * recordsPerPage + 1;
  const endEntry = Math.min(currentPage * recordsPerPage, totalEntries);

  // Get current page data
  const currentPageData = onlineUsersDataFull.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Reset to page 1 when records per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage]);

  // CSV Export functionality
  const handleExport = () => {
    const headers = ['#', 'Username', 'Name', 'Last Login Time', 'Website', 'IP', 'City', 'Country'];
    const csvContent = [
      headers.join(','),
      ...onlineUsersDataFull.map((user, index) => [
        index + 1,
        user.username,
        `"${user.name}"`, // Wrap in quotes for CSV safety
        user.lastLoginTime,
        user.website,
        user.ip,
        user.city,
        user.country
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `online_users_${new Date().toISOString().split('T')[0]}.csv`);
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
            Online Now
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
                    Username
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Name
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Last Login Time ⌄
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Website
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    IP
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    City
                  </th>
                  <th className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} text-left p-2`}>
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkTheme ? 'bg-gray-900' : 'bg-white'} divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {currentPageData.map((user, index) => (
                  <tr key={user.id} className={`hover:${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} transition-colors ${isDarkTheme ? 'border-gray-700' : 'border-gray-100'} border-t`}>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {startEntry + index}
                    </td>
                    <td 
                      className={`text-xs ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} hover:underline cursor-pointer p-2`}
                      onClick={() => window.open(`/members/profile/${user.username}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                    >
                      {user.username}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.name}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.lastLoginTime}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.website}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.ip}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.city}
                    </td>
                    <td className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} p-2`}>
                      {user.country}
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

export default OnlineUsersPage; 