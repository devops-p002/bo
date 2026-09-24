import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Breadcrumb from '../../components/common/UI/Breadcrumb';
import { useMemberSearch } from '../../components/features/Members/hooks/useMemberSearch';
import AddMemberModal from '../../components/features/Members/components/AddMemberModal';
import AccountSearchForm from '../../components/features/Members/components/SearchForms/AccountSearchForm';
import ProviderAccountSearchForm from '../../components/features/Members/components/SearchForms/ProviderAccountSearchForm';
import ColumnVisibilityDropdown from '../../components/features/Members/components/SearchForms/ColumnVisibilityDropdown';
import SearchResultsTable from '../../components/features/Members/components/SearchForms/SearchResultsTable';

// Same numbered-pagination shape as the Dashboard drill-down pages
// (DepositDetailsPage etc.) - 1 ... currentPage-2..currentPage+2 ... last.
const getPaginationNumbers = (currentPage: number, totalPages: number) => {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

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

const MemberSearchPage = () => {
  const { isDarkTheme } = useTheme();
  
  // Use custom hook for all state management and handlers
  const {
    activeTab,
    isConditionPanelOpen,
    searchData,
    providerData,
    recordsPerPage,
    showColumnsDropdown,
    visibleAccountColumns,
    visibleProviderColumns,
    setActiveTab,
    setIsConditionPanelOpen,
    setShowColumnsDropdown,
    setVisibleAccountColumns,
    setVisibleProviderColumns,
    handleInputChange,
    handleProviderInputChange,
    handleRecordsPerPageChange,
    handleExport,
    handleColumnToggle,
    handleSave,
    handleSearch,
    resetForm,
    handleUsernameClick,
    results,
    resultsLoading,
    resultsError,
    totalCount,
    currentPage,
    totalPages,
    goToPage,
    isAddModalOpen,
    addFormData,
    addSaving,
    addError,
    openAddModal,
    closeAddModal,
    handleAddInputChange,
    handleAddSubmit
  } = useMemberSearch();

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Breadcrumb */}
      <div className="mb-3">
        <Breadcrumb />
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className={`text-lg font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
          Search
        </h1>
        <button
          onClick={openAddModal}
          className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-3">
        <div className="flex space-x-1">
          {['Account', 'Provider Account'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? isDarkTheme
                    ? 'bg-gray-800 text-gray-100 border-b-2 border-blue-500'
                    : 'bg-white text-gray-900 border-b-2 border-blue-500'
                  : isDarkTheme
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
        {/* Condition Panel Header */}
        <div 
          className={`flex items-center justify-between p-3 border-b cursor-pointer ${
            isDarkTheme ? 'border-gray-700' : 'border-gray-200'
          }`}
          onClick={() => setIsConditionPanelOpen(!isConditionPanelOpen)}
        >
          <div className="flex items-center">
            <span className={`mr-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>≡</span>
            <h2 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
              Condition Panel
            </h2>
          </div>
          <span className={`transform transition-transform text-xs ${isConditionPanelOpen ? 'rotate-180' : ''} ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ▼
          </span>
        </div>

        {/* Condition Panel Content */}
        {isConditionPanelOpen && (
          <div className="p-3">
            {activeTab === 'Account' ? (
              <AccountSearchForm 
                searchData={searchData}
                onInputChange={handleInputChange}
              />
            ) : (
              <ProviderAccountSearchForm 
                providerData={providerData}
                onInputChange={handleProviderInputChange}
              />
            )}

            {/* Search Button */}
            <div className="mt-3 flex justify-start">
              <button
                onClick={handleSearch}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className={`rounded-lg border ${
        isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Results Header */}
        <div className={`p-3 border-b relative ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className={`text-sm font-semibold ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Search Results
              </h3>
            </div>
            <div className="flex items-center space-x-2 columns-dropdown-container">
              <button className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`} onClick={handleExport}>
                Export
              </button>
              <select className={`px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDarkTheme 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-white border-gray-300'
              }`} value={recordsPerPage} onChange={(e) => handleRecordsPerPageChange(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`} onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                Columns
              </button>
              <button className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
          
          {/* Columns Dropdown */}
          <ColumnVisibilityDropdown
            activeTab={activeTab}
            showColumnsDropdown={showColumnsDropdown}
            visibleAccountColumns={visibleAccountColumns}
            visibleProviderColumns={visibleProviderColumns}
            setVisibleAccountColumns={setVisibleAccountColumns}
            setVisibleProviderColumns={setVisibleProviderColumns}
            onClose={() => setShowColumnsDropdown(false)}
          />
        </div>

        {/* Results Table */}
        <SearchResultsTable
          activeTab={activeTab}
          visibleAccountColumns={visibleAccountColumns}
          visibleProviderColumns={visibleProviderColumns}
          onUsernameClick={handleUsernameClick}
          results={results}
          resultsLoading={resultsLoading}
          resultsError={resultsError}
        />

        {/* Pagination */}
        <div className={`p-3 border-t flex items-center justify-between ${
          isDarkTheme ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-xs ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {activeTab === 'Account'
              ? (totalCount === 0
                ? 'Showing 0 of 0 entries'
                : `Showing ${(currentPage - 1) * recordsPerPage + 1} to ${Math.min(currentPage * recordsPerPage, totalCount)} of ${totalCount} entries`)
              : 'Showing 1 to 5 of 5 entries (sample data)'}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={activeTab !== 'Account' || currentPage <= 1}
              className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                (activeTab !== 'Account' || currentPage <= 1)
                  ? isDarkTheme
                    ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : isDarkTheme
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ← Previous
            </button>

            {activeTab === 'Account' &&
              getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                    page === currentPage
                      ? isDarkTheme
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-blue-500 border-blue-500 text-white'
                      : page === '...'
                        ? isDarkTheme
                          ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-default'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
                        : isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={activeTab !== 'Account' || currentPage >= totalPages}
              className={`px-2 py-1 text-xs border rounded-md transition-colors ${
                (activeTab !== 'Account' || currentPage >= totalPages)
                  ? isDarkTheme
                    ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : isDarkTheme
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        formData={addFormData}
        onChange={handleAddInputChange}
        onSubmit={handleAddSubmit}
        saving={addSaving}
        error={addError}
      />
    </div>
  );
};

export default MemberSearchPage;
