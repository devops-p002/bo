// Utility services
import validationService from './validation';
import formattingService from './formatting';
import constants from './constants';
export { default as validationService, ValidationService } from './validation';
export { default as formattingService, FormattingService } from './formatting';
export { default as constants } from './constants';

// Re-export all constants for convenience
export * from './constants';

// Utility functions
export const utils = {
  // Debounce function
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Deep clone object
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => utils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = utils.deepClone(obj[key]);
      });
      return clonedObj;
    }
  },

  // Deep merge objects
  deepMerge: (target, source) => {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = utils.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  },

  // Generate unique ID
  generateId: (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
  },

  // Generate UUID v4
  generateUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Check if object is empty
  isEmpty: (obj) => {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    if (typeof obj === 'string') return obj.trim().length === 0;
    return false;
  },

  // Get nested object property safely
  get: (obj, path, defaultValue = undefined) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result;
  },

  // Set nested object property
  set: (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
    return obj;
  },

  // Remove duplicates from array
  unique: (array, key = null) => {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = utils.get(item, key);
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  },

  // Group array by key
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = utils.get(item, key);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  // Sort array by key
  sortBy: (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = utils.get(a, key);
      const bVal = utils.get(b, key);
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Filter array by multiple conditions
  filterBy: (array, filters) => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const itemValue = utils.get(item, key);
        
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'function') {
          return value(itemValue, item);
        }
        
        return itemValue === value;
      });
    });
  },

  // Paginate array
  paginate: (array, page = 1, pageSize = 20) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        pageSize,
        total: array.length,
        totalPages: Math.ceil(array.length / pageSize),
        hasNext: endIndex < array.length,
        hasPrev: page > 1
      }
    };
  },

  // Calculate percentage
  percentage: (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },

  // Calculate percentage change
  percentageChange: (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Round to decimal places
  round: (number, decimals = 2) => {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  // Clamp number between min and max
  clamp: (number, min, max) => {
    return Math.min(Math.max(number, min), max);
  },

  // Random number between min and max
  random: (min = 0, max = 1) => {
    return Math.random() * (max - min) + min;
  },

  // Random integer between min and max (inclusive)
  randomInt: (min = 0, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Shuffle array
  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Pick random item from array
  sample: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Sleep/delay function
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Retry function with exponential backoff
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        await utils.sleep(delay * Math.pow(2, attempt - 1));
      }
    }
  },

  // Convert string to camelCase
  camelCase: (str) => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  },

  // Convert string to kebab-case
  kebabCase: (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  // Convert string to snake_case
  snakeCase: (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  },

  // Capitalize first letter
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Check if value is a valid number
  isNumber: (value) => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  // Check if value is a valid date
  isDate: (value) => {
    return value instanceof Date && !isNaN(value.getTime());
  },

  // Check if value is a plain object
  isPlainObject: (value) => {
    return value !== null && typeof value === 'object' && value.constructor === Object;
  },

  // Check if code is running in browser
  isBrowser: () => {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },

  // Check if device is mobile
  isMobile: () => {
    if (!utils.isBrowser()) return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Get browser info
  getBrowserInfo: () => {
    if (!utils.isBrowser()) return null;
    
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';
    
    return {
      browser,
      userAgent: ua,
      isMobile: utils.isMobile()
    };
  },

  // Copy text to clipboard
  copyToClipboard: async (text) => {
    if (!utils.isBrowser()) return false;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  // Download data as file
  downloadFile: (data, filename, type = 'text/plain') => {
    if (!utils.isBrowser()) return false;
    
    try {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to download file:', error);
      return false;
    }
  },

  // Convert object to query string
  toQueryString: (obj: any) => {
    const params = new URLSearchParams();
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, value as string);
        }
      }
    });
    
    return params.toString();
  },

  // Parse query string to object
  parseQueryString: (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    
    for (const [key, value] of params.entries()) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
};

// Export everything
export default {
  validationService,
  formattingService,
  constants,
  utils
}; 