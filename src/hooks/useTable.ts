import { useState, useCallback, useMemo } from 'react';
import { usePagination } from './usePagination';

// Main table hook with sorting, filtering, selection, and pagination
export const useTable = (data = [], options: any = {}) => {
  const {
    initialSortBy = null,
    initialSortOrder = 'asc',
    initialFilters = {},
    initialSelectedRows = [],
    pageSize = 10,
    searchFields = [],
    filterFunctions = {}
  } = options;

  // Sorting state
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // Filtering state
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedRows, setSelectedRows] = useState(new Set(initialSelectedRows));

  // Process data: filter, search, sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (filterFunctions[key]) {
          result = result.filter(item => filterFunctions[key](item, value));
        } else {
          result = result.filter(item => {
            const itemValue = item[key];
            if (typeof value === 'string') {
              return String(itemValue).toLowerCase().includes(value.toLowerCase());
            }
            return itemValue === value;
          });
        }
      }
    });

    // Apply search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
        if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder === 'asc' ? (aValue as any) - (bValue as any) : (bValue as any) - (aValue as any);
        }

        // Default string comparison
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, searchQuery, searchFields, sortBy, sortOrder, filterFunctions]);

  // Pagination
  const pagination = usePagination({
    totalItems: processedData.length,
    initialPageSize: pageSize
  });

  // Get current page data
  const currentPageData = useMemo(() => {
    const start = pagination.startIndex;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination.startIndex, pagination.pageSize]);

  // Sorting functions
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    pagination.goToPage(1); // Reset to first page when sorting
  }, [sortBy, pagination]);

  const clearSort = useCallback(() => {
    setSortBy(null);
    setSortOrder('asc');
  }, []);

  // Filtering functions
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    pagination.goToPage(1); // Reset to first page when filtering
  }, [pagination]);

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    pagination.goToPage(1);
  }, [pagination]);

  // Search functions
  const setSearch = useCallback((query) => {
    setSearchQuery(query);
    pagination.goToPage(1); // Reset to first page when searching
  }, [pagination]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Selection functions
  const selectRow = useCallback((id) => {
    setSelectedRows(prev => new Set([...prev, id]));
  }, []);

  const deselectRow = useCallback((id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleRowSelection = useCallback((id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    const allIds = currentPageData.map(row => row.id);
    setSelectedRows(new Set(allIds));
  }, [currentPageData]);

  const selectAllFilteredRows = useCallback(() => {
    const allIds = processedData.map(row => row.id);
    setSelectedRows(new Set(allIds));
  }, [processedData]);

  const deselectAllRows = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const isRowSelected = useCallback((id) => {
    return selectedRows.has(id);
  }, [selectedRows]);

  const isAllRowsSelected = useMemo(() => {
    if (currentPageData.length === 0) return false;
    return currentPageData.every(row => selectedRows.has(row.id));
  }, [currentPageData, selectedRows]);

  const isIndeterminate = useMemo(() => {
    if (currentPageData.length === 0) return false;
    const selectedCount = currentPageData.filter(row => selectedRows.has(row.id)).length;
    return selectedCount > 0 && selectedCount < currentPageData.length;
  }, [currentPageData, selectedRows]);

  // Reset functions
  const resetTable = useCallback(() => {
    clearSort();
    clearFilters();
    clearSearch();
    deselectAllRows();
    pagination.reset();
  }, [clearSort, clearFilters, clearSearch, deselectAllRows, pagination]);

  // Export functions
  const exportData = useCallback((format = 'csv', includeHeaders = true) => {
    const dataToExport = selectedRows.size > 0 
      ? processedData.filter(row => selectedRows.has(row.id))
      : processedData;

    if (format === 'csv') {
      return exportToCSV(dataToExport, includeHeaders);
    } else if (format === 'json') {
      return JSON.stringify(dataToExport, null, 2);
    }
    
    return dataToExport;
  }, [processedData, selectedRows]);

  // Get table statistics
  const getStats = useCallback(() => {
    return {
      totalRows: data.length,
      filteredRows: processedData.length,
      selectedRows: selectedRows.size,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      hasFilters: Object.keys(filters).length > 0 || searchQuery.length > 0,
      hasSorting: sortBy !== null
    };
  }, [data.length, processedData.length, selectedRows.size, pagination, filters, searchQuery, sortBy]);

  return {
    // Data
    data: currentPageData,
    allData: processedData,
    originalData: data,

    // Pagination
    pagination,

    // Sorting
    sortBy,
    sortOrder,
    handleSort,
    clearSort,

    // Filtering
    filters,
    setFilter,
    removeFilter,
    clearFilters,

    // Search
    searchQuery,
    setSearch,
    clearSearch,

    // Selection
    selectedRows: Array.from(selectedRows),
    selectedRowsSet: selectedRows,
    selectRow,
    deselectRow,
    toggleRowSelection,
    selectAllRows,
    selectAllFilteredRows,
    deselectAllRows,
    isRowSelected,
    isAllRowsSelected,
    isIndeterminate,

    // Utilities
    resetTable,
    exportData,
    getStats
  };
};

// Hook for server-side table operations
export const useServerTable = (fetchFunction, options: any = {}) => {
  const {
    initialSortBy = null,
    initialSortOrder = 'asc',
    initialFilters = {},
    pageSize = 10
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // State
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Pagination
  const pagination = usePagination({
    totalItems,
    initialPageSize: pageSize
  });

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!fetchFunction) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        sortBy,
        sortOrder,
        filters,
        search: searchQuery
      };

      const result = await fetchFunction(params);
      
      setData(result.data || []);
      setTotalItems(result.total || 0);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.currentPage, pagination.pageSize, sortBy, sortOrder, filters, searchQuery]);

  // Sorting
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    pagination.goToPage(1);
  }, [sortBy, pagination]);

  // Filtering
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    pagination.goToPage(1);
  }, [pagination]);

  // Search
  const setSearch = useCallback((query) => {
    setSearchQuery(query);
    pagination.goToPage(1);
  }, [pagination]);

  // Refresh data when dependencies change
  useState(() => {
    fetchData();
  });

  return {
    // Data
    data,
    loading,
    error,
    totalItems,

    // Pagination
    pagination,

    // Sorting
    sortBy,
    sortOrder,
    handleSort,

    // Filtering
    filters,
    setFilter,

    // Search
    searchQuery,
    setSearch,

    // Selection
    selectedRows: Array.from(selectedRows),
    setSelectedRows,

    // Actions
    fetchData,
    refresh: fetchData
  };
};

// Utility functions
const exportToCSV = (data, includeHeaders = true) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [];

  if (includeHeaders) {
    csvContent.push(headers.join(','));
  }

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent.push(values.join(','));
  });

  return csvContent.join('\n');
};

// Table column utilities
export const tableUtils = {
  // Create sortable column header
  createSortableHeader: (column, label, sortBy, sortOrder, onSort) => ({
    key: column,
    label,
    sortable: true,
    sorted: sortBy === column,
    sortOrder: sortBy === column ? sortOrder : null,
    onClick: () => onSort(column)
  }),

  // Format cell value based on type
  formatCellValue: (value, type = 'text') => {
    if (value == null) return '-';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        return new Date(value).toLocaleString();
      
      case 'boolean':
        return value ? 'Yes' : 'No';
      
      default:
        return String(value);
    }
  },

  // Create filter options from data
  createFilterOptions: (data, column) => {
    const uniqueValues = [...new Set(data.map(item => item[column]))];
    return uniqueValues
      .filter(value => value != null)
      .sort()
      .map(value => ({ label: String(value), value }));
  }
};

export default useTable; 