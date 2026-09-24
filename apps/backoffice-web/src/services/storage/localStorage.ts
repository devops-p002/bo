// Local Storage Service with enhanced functionality
class LocalStorageService {
  prefix: string;
  isSupported: boolean;

  constructor() {
    this.prefix = 'aura_gaming_';
    this.isSupported = this.checkSupport();
  }

  // Check if localStorage is supported
  checkSupport() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not supported');
      return false;
    }
  }

  // Generate prefixed key
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Set item with optional expiration
  setItem(key, value, expirationInMinutes = null) {
    if (!this.isSupported) return false;

    try {
      const prefixedKey = this.getKey(key);
      const data = {
        value,
        timestamp: Date.now(),
        expiration: expirationInMinutes ? Date.now() + (expirationInMinutes * 60 * 1000) : null
      };

      localStorage.setItem(prefixedKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }

  // Get item with expiration check
  getItem(key, defaultValue = null) {
    if (!this.isSupported) return defaultValue;

    try {
      const prefixedKey = this.getKey(key);
      const item = localStorage.getItem(prefixedKey);
      
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // Check if item has expired
      if (data.expiration && Date.now() > data.expiration) {
        this.removeItem(key);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }

  // Remove item
  removeItem(key) {
    if (!this.isSupported) return false;

    try {
      const prefixedKey = this.getKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }

  // Check if item exists
  hasItem(key) {
    if (!this.isSupported) return false;

    const prefixedKey = this.getKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }

  // Clear all items with our prefix
  clear() {
    if (!this.isSupported) return false;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Get all keys with our prefix
  getKeys() {
    if (!this.isSupported) return [];

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  // Get storage size in bytes
  getSize() {
    if (!this.isSupported) return 0;

    try {
      let total = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          total += key.length + (value ? value.length : 0);
        }
      });
      
      return total;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  }

  // Get formatted storage size
  getFormattedSize() {
    const bytes = this.getSize();
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Clean expired items
  cleanExpired() {
    if (!this.isSupported) return 0;

    let cleanedCount = 0;
    const keys = this.getKeys();

    keys.forEach(key => {
      const item = this.getItem(key);
      if (item === null) {
        cleanedCount++;
      }
    });

    return cleanedCount;
  }

  // Export data
  exportData() {
    if (!this.isSupported) return null;

    try {
      const data = {};
      const keys = this.getKeys();

      keys.forEach(key => {
        data[key] = this.getItem(key);
      });

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting localStorage data:', error);
      return null;
    }
  }

  // Import data
  importData(jsonData, overwrite = false) {
    if (!this.isSupported) return false;

    try {
      const data = JSON.parse(jsonData);

      Object.entries(data).forEach(([key, value]) => {
        if (overwrite || !this.hasItem(key)) {
          this.setItem(key, value);
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing localStorage data:', error);
      return false;
    }
  }

  // Backup data to file
  backupToFile(filename = 'localStorage_backup.json') {
    const data = this.exportData();
    if (!data) return false;

    try {
      const blob = new Blob([data], { type: 'application/json' });
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
      console.error('Error backing up localStorage to file:', error);
      return false;
    }
  }

  // Restore data from file
  restoreFromFile(file, overwrite = false) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const success = this.importData(e.target.result, overwrite);
          resolve(success);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  // Watch for changes (using storage event)
  watch(key, callback) {
    if (!this.isSupported) return null;

    const prefixedKey = this.getKey(key);
    
    const handler = (e) => {
      if (e.key === prefixedKey) {
        const oldValue = e.oldValue ? JSON.parse(e.oldValue).value : null;
        const newValue = e.newValue ? JSON.parse(e.newValue).value : null;
        callback(newValue, oldValue, key);
      }
    };

    window.addEventListener('storage', handler);

    // Return unwatch function
    return () => {
      window.removeEventListener('storage', handler);
    };
  }

  // Get storage statistics
  getStats() {
    return {
      isSupported: this.isSupported,
      totalKeys: this.getKeys().length,
      totalSize: this.getSize(),
      formattedSize: this.getFormattedSize(),
      prefix: this.prefix
    };
  }

  // Utility methods for common data types
  setObject(key, obj, expiration = null) {
    return this.setItem(key, obj, expiration);
  }

  getObject(key, defaultValue = {}) {
    return this.getItem(key, defaultValue);
  }

  setArray(key, arr, expiration = null) {
    return this.setItem(key, arr, expiration);
  }

  getArray(key, defaultValue = []) {
    return this.getItem(key, defaultValue);
  }

  setString(key, str, expiration = null) {
    return this.setItem(key, str, expiration);
  }

  getString(key, defaultValue = '') {
    return this.getItem(key, defaultValue);
  }

  setNumber(key, num, expiration = null) {
    return this.setItem(key, num, expiration);
  }

  getNumber(key, defaultValue = 0) {
    return this.getItem(key, defaultValue);
  }

  setBoolean(key, bool, expiration = null) {
    return this.setItem(key, bool, expiration);
  }

  getBoolean(key, defaultValue = false) {
    return this.getItem(key, defaultValue);
  }
}

// Create and export singleton instance
const localStorageService = new LocalStorageService();
export default localStorageService;

// Export class for custom instances
export { LocalStorageService }; 