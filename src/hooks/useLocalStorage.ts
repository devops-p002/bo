import { useState, useEffect, useCallback } from 'react';

// Custom hook for localStorage with JSON serialization
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for localStorage with expiration
export const useLocalStorageWithExpiry = (key, initialValue, ttl = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = JSON.parse(item);
      
      // Check if item has expiry
      if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsedItem.value !== undefined ? parsedItem.value : parsedItem;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value, customTtl = ttl) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        const item = customTtl 
          ? { value: valueToStore, expiry: Date.now() + customTtl }
          : valueToStore;
        
        window.localStorage.setItem(key, JSON.stringify(item));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, ttl]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for managing multiple localStorage keys as an object
export const useLocalStorageState = (keys, initialState = {}) => {
  const [state, setState] = useState(() => {
    const savedState = {};
    
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key);
        savedState[key] = item ? JSON.parse(item) : initialState[key];
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        savedState[key] = initialState[key];
      }
    });
    
    return savedState;
  });

  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Save each updated key to localStorage
      Object.entries(updates).forEach(([key, value]) => {
        try {
          if (value === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      });
      
      return newState;
    });
  }, []);

  const clearState = useCallback(() => {
    keys.forEach(key => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    });
    
    setState(initialState);
  }, [keys, initialState]);

  return [state, updateState, clearState];
};

// Hook for localStorage with validation
export const useValidatedLocalStorage = (key, initialValue, validator) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsedItem = JSON.parse(item);
      
      // Validate the stored value
      if (validator && !validator(parsedItem)) {
        console.warn(`Invalid localStorage value for key "${key}", using initial value`);
        return initialValue;
      }
      
      return parsedItem;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Validate before storing
      if (validator && !validator(valueToStore)) {
        throw new Error(`Invalid value for localStorage key "${key}"`);
      }
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      throw error;
    }
  }, [key, storedValue, validator]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for localStorage with sync across tabs
export const useSyncedLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Utility functions for localStorage management
export const localStorageUtils = {
  // Get all localStorage keys
  getAllKeys: () => {
    return Object.keys(localStorage);
  },

  // Get all localStorage items
  getAllItems: () => {
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        items[key] = JSON.parse(localStorage.getItem(key));
      } catch (error) {
        items[key] = localStorage.getItem(key);
      }
    }
    return items;
  },

  // Clear all localStorage items
  clearAll: () => {
    localStorage.clear();
  },

  // Clear items by prefix
  clearByPrefix: (prefix) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get localStorage size in bytes
  getSize: () => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Export localStorage data
  exportData: () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return JSON.stringify(data, null, 2);
  },

  // Import localStorage data
  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        localStorage.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error importing localStorage data:', error);
      return false;
    }
  }
};

export default useLocalStorage; 