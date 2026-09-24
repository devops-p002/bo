import { useState, useEffect, useCallback, useRef } from 'react';

// Main debounce hook for values
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for debouncing functions
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Flush function (execute immediately)
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    callback(...args);
  }, [callback]);

  return [debouncedCallback, cancel, flush];
};

// Hook for debounced search
export const useDebouncedSearch = (searchFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults || []);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch
  };
};

// Hook for debounced API calls
export const useDebouncedApi = (apiFunction, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const [debouncedApiCall, cancelApiCall] = useDebouncedCallback(
    async (...args) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args, {
          signal: abortControllerRef.current.signal
        });
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    delay
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    cancelApiCall();
  }, [cancelApiCall]);

  return {
    data,
    loading,
    error,
    call: debouncedApiCall,
    cancel: cancelApiCall,
    reset
  };
};

// Hook for debounced form validation
export const useDebouncedValidation = (validationFunction, delay = 300) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});

  const debouncedValues = useDebounce(values, delay);

  useEffect(() => {
    const validateFields = async () => {
      const fieldsToValidate = Object.keys(debouncedValues);
      
      if (fieldsToValidate.length === 0) return;

      // Set validating state for all fields
      setValidating(prev => {
        const newValidating = { ...prev };
        fieldsToValidate.forEach(field => {
          newValidating[field] = true;
        });
        return newValidating;
      });

      try {
        const validationResults = await validationFunction(debouncedValues);
        
        setErrors(validationResults || {});
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        // Clear validating state
        setValidating(prev => {
          const newValidating = { ...prev };
          fieldsToValidate.forEach(field => {
            newValidating[field] = false;
          });
          return newValidating;
        });
      }
    };

    validateFields();
  }, [debouncedValues, validationFunction]);

  const setValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setAllValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  const clearField = useCallback((field) => {
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAll = useCallback(() => {
    setValues({});
    setErrors({});
    setValidating({});
  }, []);

  return {
    values,
    errors,
    validating,
    setValue,
    setValues: setAllValues,
    clearField,
    clearAll,
    isValid: Object.keys(errors).length === 0,
    isValidating: Object.values(validating).some(Boolean)
  };
};

// Hook for debounced state updates
export const useDebouncedState = (initialValue, delay = 300) => {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const debouncedSetValue = useDebouncedCallback(
    (value) => {
      setDebouncedValue(value);
    },
    delay,
    []
  );

  const setValue = useCallback((value) => {
    setImmediateValue(value);
    debouncedSetValue[0](value);
  }, [debouncedSetValue]);

  const cancel = useCallback(() => {
    debouncedSetValue[1](); // Cancel debounced update
    setDebouncedValue(immediateValue); // Sync debounced with immediate
  }, [debouncedSetValue, immediateValue]);

  const flush = useCallback(() => {
    debouncedSetValue[2](immediateValue); // Flush immediately
  }, [debouncedSetValue, immediateValue]);

  return [
    immediateValue,
    debouncedValue,
    setValue,
    { cancel, flush }
  ];
};

// Hook for debounced window resize
export const useDebouncedWindowSize = (delay = 100) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const [debouncedUpdateSize] = useDebouncedCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, delay);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.addEventListener('resize', debouncedUpdateSize);

    return () => {
      window.removeEventListener('resize', debouncedUpdateSize);
    };
  }, [debouncedUpdateSize]);

  return windowSize;
};

// Hook for debounced scroll position
export const useDebouncedScroll = (delay = 100) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0
  });

  const [debouncedUpdateScroll] = useDebouncedCallback(() => {
    setScrollPosition({
      x: window.pageXOffset,
      y: window.pageYOffset
    });
  }, delay);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.addEventListener('scroll', debouncedUpdateScroll);

    return () => {
      window.removeEventListener('scroll', debouncedUpdateScroll);
    };
  }, [debouncedUpdateScroll]);

  return scrollPosition;
};

// Utility functions
export const debounceUtils = {
  // Create a debounced function
  debounce: (func, delay = 300) => {
    let timeoutId;
    
    const debounced = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };

    debounced.cancel = () => {
      clearTimeout(timeoutId);
    };

    debounced.flush = (...args) => {
      clearTimeout(timeoutId);
      func(...args);
    };

    return debounced;
  },

  // Create a throttled function
  throttle: (func, delay = 300) => {
    let lastCall = 0;
    
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  // Debounce with leading edge
  debounceLeading: (func, delay = 300) => {
    let timeoutId;
    let lastCall = 0;
    
    return (...args) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        func(...args);
        lastCall = now;
      }
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (Date.now() - lastCall >= delay) {
          func(...args);
        }
      }, delay);
    };
  }
};

export default useDebounce; 