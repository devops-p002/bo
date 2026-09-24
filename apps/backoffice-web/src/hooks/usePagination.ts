import { useState, useCallback, useMemo } from 'react';

// Main pagination hook
export const usePagination = (options: any = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems = 0,
    pageSizeOptions = [10, 25, 50, 100],
    maxVisiblePages = 5
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  // Calculate start and end indices for current page
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);

  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Page size functions
  const changePageSize = useCallback((newPageSize) => {
    const newTotalPages = Math.ceil(totalItems / newPageSize) || 1;
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setPageSize(newPageSize);
    setCurrentPage(newCurrentPage);
  }, [currentPage, totalItems]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Check if navigation is possible
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Get pagination info text
  const getPaginationInfo = useCallback(() => {
    if (totalItems === 0) {
      return 'No items to display';
    }
    
    const start = startIndex + 1;
    const end = Math.min(endIndex + 1, totalItems);
    
    return `Showing ${start}-${end} of ${totalItems} items`;
  }, [startIndex, endIndex, totalItems]);

  return {
    // Current state
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    visiblePages,
    
    // Navigation
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    
    // Page size
    changePageSize,
    pageSizeOptions,
    
    // Utilities
    reset,
    canGoNext,
    canGoPrevious,
    getPaginationInfo
  };
};

// Hook for client-side pagination of data arrays
export const useClientPagination = (data = [], options: any = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100]
  } = options;

  const totalItems = data.length;
  
  const pagination = usePagination({
    initialPage,
    initialPageSize,
    totalItems,
    pageSizeOptions
  });

  // Get current page data
  const currentPageData = useMemo(() => {
    const start = pagination.startIndex;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination.startIndex, pagination.pageSize]);

  return {
    ...pagination,
    data: currentPageData,
    allData: data
  };
};

// Hook for server-side pagination
export const useServerPagination = (fetchFunction, options: any = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    immediate = true
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const pagination = usePagination({
    initialPage,
    initialPageSize,
    totalItems,
    pageSizeOptions
  });

  // Fetch data function
  const fetchData = useCallback(async (page = pagination.currentPage, size = pagination.pageSize, filters = {}) => {
    if (!fetchFunction) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction({
        page,
        pageSize: size,
        offset: (page - 1) * size,
        limit: size,
        ...filters
      });

      setData(result.data || []);
      setTotalItems(result.total || 0);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.currentPage, pagination.pageSize]);

  // Override pagination functions to trigger data fetch
  const goToPage = useCallback(async (page) => {
    pagination.goToPage(page);
    await fetchData(page, pagination.pageSize);
  }, [pagination, fetchData]);

  const changePageSize = useCallback(async (newPageSize) => {
    pagination.changePageSize(newPageSize);
    await fetchData(1, newPageSize); // Reset to first page with new size
  }, [pagination, fetchData]);

  const refresh = useCallback(() => {
    return fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  // Initial fetch
  useState(() => {
    if (immediate) {
      fetchData();
    }
  });

  return {
    ...pagination,
    data,
    loading,
    error,
    fetchData,
    goToPage,
    changePageSize,
    refresh
  };
};

// Hook for infinite scroll pagination
export const useInfinitePagination = (fetchFunction, options: any = {}) => {
  const {
    initialPageSize = 20,
    threshold = 0.8 // Trigger load when 80% scrolled
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load more data
  const loadMore = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const result = await fetchFunction({
        page: currentPage,
        pageSize: initialPageSize,
        offset: (currentPage - 1) * initialPageSize,
        limit: initialPageSize
      });

      const newData = result.data || [];
      
      if (reset) {
        setData(newData);
        setPage(2);
      } else {
        setData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }

      setHasMore(newData.length === initialPageSize);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialPageSize, loading, hasMore, page]);

  // Reset and reload
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    return loadMore(true);
  }, [loadMore]);

  // Scroll handler for infinite scroll
  const handleScroll = useCallback((element) => {
    if (!element || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      loadMore();
    }
  }, [loading, hasMore, threshold, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    handleScroll,
    page: page - 1, // Current page (0-based for display)
    totalLoaded: data.length
  };
};

// Utility functions for pagination
export const paginationUtils = {
  // Calculate pagination range
  calculateRange: (currentPage, totalPages, maxVisible = 5) => {
    const halfVisible = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, currentPage + halfVisible);
    
    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisible - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
    }
    
    return { start, end };
  },

  // Generate page numbers array
  generatePageNumbers: (currentPage, totalPages, maxVisible = 5) => {
    const { start, end } = paginationUtils.calculateRange(currentPage, totalPages, maxVisible);
    const pages = [];
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  },

  // Calculate offset for server-side pagination
  calculateOffset: (page, pageSize) => {
    return (page - 1) * pageSize;
  },

  // Calculate page from offset
  calculatePageFromOffset: (offset, pageSize) => {
    return Math.floor(offset / pageSize) + 1;
  },

  // Get pagination info text
  getPaginationText: (currentPage, pageSize, totalItems) => {
    if (totalItems === 0) return 'No items';
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    return `${start}-${end} of ${totalItems}`;
  }
};

export default usePagination; 