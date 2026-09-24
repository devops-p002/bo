import { useState, useCallback, useRef, useEffect } from 'react';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// HTTP methods
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Request interceptor
const requestInterceptor = (config) => {
  // Add auth token
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }

  // Add default headers
  config.headers = {
    'Content-Type': 'application/json',
    ...config.headers
  };

  return config;
};

// Response interceptor
const responseInterceptor = async (response) => {
  // Handle different response types
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
};

// Main useApi hook
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generic request function
  const request = useCallback(async (url, options = {}) => {
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      // Prepare request config
      const config = {
        method: HTTP_METHODS.GET,
        timeout: DEFAULT_TIMEOUT,
        ...options,
        signal: abortControllerRef.current.signal
      };

      // Apply request interceptor
      const interceptedConfig = requestInterceptor(config);

      // Build full URL
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

      // Make request
      const response = await fetch(fullUrl, interceptedConfig);

      // Apply response interceptor
      const data = await responseInterceptor(response);

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return null;
      }
      
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET request
  const get = useCallback((url, options = {}) => {
    return request(url, { ...options, method: HTTP_METHODS.GET });
  }, [request]);

  // POST request
  const post = useCallback((url, data, options = {}) => {
    return request(url, {
      ...options,
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data)
    });
  }, [request]);

  // PUT request
  const put = useCallback((url, data, options = {}) => {
    return request(url, {
      ...options,
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data)
    });
  }, [request]);

  // PATCH request
  const patch = useCallback((url, data, options = {}) => {
    return request(url, {
      ...options,
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(data)
    });
  }, [request]);

  // DELETE request
  const del = useCallback((url, options = {}) => {
    return request(url, { ...options, method: HTTP_METHODS.DELETE });
  }, [request]);

  // Upload file
  const upload = useCallback((url, file, options: any = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional fields if provided
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]: [string, any]) => {
        formData.append(key, value);
      });
    }

    return request(url, {
      ...options,
      method: HTTP_METHODS.POST,
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...options.headers,
        'Content-Type': undefined
      }
    });
  }, [request]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    cancel
  };
};

// Hook for specific API endpoints with caching
export const useApiEndpoint = (url, options: any = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useApi();
  
  const {
    immediate = false,
    cache = true,
    cacheKey = url,
    cacheDuration = 5 * 60 * 1000 // 5 minutes
  } = options;

  // Fetch data
  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (cache) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Build URL with params
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const result = await get(fullUrl);
      setData(result);

      // Cache the result
      if (cache) {
        setCachedData(cacheKey, result, cacheDuration);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, get, cache, cacheKey, cacheDuration]);

  // Refresh data
  const refresh = useCallback(() => {
    if (cache) {
      clearCachedData(cacheKey);
    }
    return fetchData();
  }, [fetchData, cache, cacheKey]);

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    fetch: fetchData,
    refresh
  };
};

// Cache utilities
const cache = new Map();

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const { data, timestamp, duration } = cached;
  const now = Date.now();

  if (now - timestamp > duration) {
    cache.delete(key);
    return null;
  }

  return data;
};

const setCachedData = (key, data, duration) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  });
};

const clearCachedData = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Hook for paginated API calls
export const usePaginatedApi = (url, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useApi();

  const fetchPage = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        ...filters
      };

      const result = await get(url, { params });
      
      setData(result.data || []);
      setPagination({
        page: result.page || page,
        limit: result.limit || limit,
        total: result.total || 0,
        totalPages: result.totalPages || Math.ceil((result.total || 0) / limit)
      });

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, get]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      return fetchPage(pagination.page + 1, pagination.limit);
    }
    return undefined;
  }, [fetchPage, pagination]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      return fetchPage(pagination.page - 1, pagination.limit);
    }
    return undefined;
  }, [fetchPage, pagination]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      return fetchPage(page, pagination.limit);
    }
    return undefined;
  }, [fetchPage, pagination]);

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    goToPage
  };
};

// Hook for infinite scroll API calls
export const useInfiniteApi = (url, options: any = {}) => {
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useApi();

  const { limit = 20 } = options;
  const pageRef = useRef(1);

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const page = reset ? 1 : pageRef.current;
      const params = { page, limit };

      const result = await get(url, { params });
      const newData = result.data || [];

      if (reset) {
        setData(newData);
        pageRef.current = 2;
      } else {
        setData(prev => [...prev, ...newData]);
        pageRef.current += 1;
      }

      setHasMore(newData.length === limit);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, get, limit, loading]);

  const reset = useCallback(() => {
    pageRef.current = 1;
    setData([]);
    setHasMore(true);
    return loadMore(true);
  }, [loadMore]);

  return {
    data,
    hasMore,
    loading,
    error,
    loadMore,
    reset
  };
};

export default useApi; 