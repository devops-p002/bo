// Storage services
import localStorageService, { LocalStorageService } from './localStorage';
import sessionStorageService, { SessionStorageService } from './sessionStorage';
import cacheService, { CacheService } from './cache';
export { LocalStorageService, SessionStorageService, CacheService };

// Unified storage interface
class StorageManager {
  localStorage: LocalStorageService;
  sessionStorage: SessionStorageService;
  cache: CacheService;

  constructor() {
    this.localStorage = localStorageService;
    this.sessionStorage = sessionStorageService;
    this.cache = cacheService;
  }

  // Get appropriate storage based on persistence needs
  getStorage(type = 'local'): any {
    switch (type) {
      case 'local':
        return this.localStorage;
      case 'session':
        return this.sessionStorage;
      case 'cache':
        return this.cache;
      default:
        return this.localStorage;
    }
  }

  // Store data with automatic storage selection
  store(key, value, options: any = {}) {
    const {
      type = 'local',
      expiration = null,
      namespace = 'default',
      useStorage = false,
      ttl = null
    } = options;

    if (type === 'cache') {
      return this.cache.set(key, value, ttl || this.cache.defaultTTL, namespace, useStorage);
    } else {
      const storage = this.getStorage(type);
      return storage.setItem(key, value, expiration);
    }
  }

  // Retrieve data from any storage
  retrieve(key, options: any = {}) {
    const {
      type = 'local',
      defaultValue = null,
      namespace = 'default',
      checkStorage = false
    } = options;

    if (type === 'cache') {
      return this.cache.get(key, namespace, checkStorage);
    } else {
      const storage = this.getStorage(type);
      return storage.getItem(key, defaultValue);
    }
  }

  // Remove data from storage
  remove(key, options: any = {}) {
    const {
      type = 'local',
      namespace = 'default'
    } = options;

    if (type === 'cache') {
      return this.cache.delete(key, namespace);
    } else {
      const storage = this.getStorage(type);
      return storage.removeItem(key);
    }
  }

  // Check if data exists
  exists(key, options: any = {}) {
    const {
      type = 'local',
      namespace = 'default',
      checkStorage = false
    } = options;

    if (type === 'cache') {
      return this.cache.has(key, namespace, checkStorage);
    } else {
      const storage = this.getStorage(type);
      return storage.hasItem(key);
    }
  }

  // Clear storage
  clear(options: any = {}) {
    const {
      type = 'local',
      namespace = null
    } = options;

    if (type === 'cache') {
      return this.cache.clear(namespace);
    } else {
      const storage = this.getStorage(type);
      return storage.clear();
    }
  }

  // Get storage statistics
  getStats(type = null): any {
    if (type) {
      const storage = this.getStorage(type);
      return storage.getStats();
    }

    return {
      localStorage: this.localStorage.getStats(),
      sessionStorage: this.sessionStorage.getStats(),
      cache: this.cache.getStats()
    };
  }

  // Cleanup expired items across all storages
  cleanup() {
    const results = {
      localStorage: this.localStorage.cleanExpired(),
      sessionStorage: this.sessionStorage.cleanExpired(),
      cache: this.cache.cleanup()
    };

    return results;
  }

  // Export all data
  exportAll() {
    return {
      localStorage: this.localStorage.exportData(),
      sessionStorage: this.sessionStorage.exportData(),
      timestamp: new Date().toISOString()
    };
  }

  // Import data
  importAll(data, overwrite = false) {
    const results: any = {};

    if (data.localStorage) {
      results.localStorage = this.localStorage.importData(data.localStorage, overwrite);
    }

    if (data.sessionStorage) {
      results.sessionStorage = this.sessionStorage.importData(data.sessionStorage, overwrite);
    }

    return results;
  }
}

// Create and export singleton instance
const storageManager = new StorageManager();
export default storageManager;

// Export class for custom instances
export { StorageManager };

// Convenience exports
export {
  localStorageService,
  sessionStorageService,
  cacheService,
  storageManager
};

// Storage utilities
export const storageUtils = {
  // Check if any storage is supported
  isSupported: () => {
    return localStorageService.isSupported || sessionStorageService.isSupported;
  },

  // Get best available storage
  getBestStorage: () => {
    if (localStorageService.isSupported) return localStorageService;
    if (sessionStorageService.isSupported) return sessionStorageService;
    return null;
  },

  // Migrate data between storages
  migrate: (fromType, toType, keys = null) => {
    const fromStorage = storageManager.getStorage(fromType);
    const toStorage = storageManager.getStorage(toType);

    if (!fromStorage || !toStorage) return false;

    const keysToMigrate = keys || fromStorage.getKeys();
    let migratedCount = 0;

    keysToMigrate.forEach(key => {
      const value = fromStorage.getItem(key);
      if (value !== null) {
        if (toStorage.setItem(key, value)) {
          fromStorage.removeItem(key);
          migratedCount++;
        }
      }
    });

    return migratedCount;
  },

  // Sync data between storages
  sync: (sourceType, targetType, keys = null) => {
    const sourceStorage = storageManager.getStorage(sourceType);
    const targetStorage = storageManager.getStorage(targetType);

    if (!sourceStorage || !targetStorage) return false;

    const keysToSync = keys || sourceStorage.getKeys();
    let syncedCount = 0;

    keysToSync.forEach(key => {
      const value = sourceStorage.getItem(key);
      if (value !== null) {
        if (targetStorage.setItem(key, value)) {
          syncedCount++;
        }
      }
    });

    return syncedCount;
  },

  // Get total storage usage
  getTotalUsage: () => {
    const stats = storageManager.getStats();
    return {
      localStorage: stats.localStorage.totalSize || 0,
      sessionStorage: stats.sessionStorage.totalSize || 0,
      cache: stats.cache.storage.totalSize || 0,
      total: (stats.localStorage.totalSize || 0) + 
             (stats.sessionStorage.totalSize || 0) + 
             (stats.cache.storage.totalSize || 0)
    };
  },

  // Format bytes to human readable
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}; 