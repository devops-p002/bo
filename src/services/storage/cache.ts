// Cache Service with memory and storage caching
class CacheService {
  memoryCache: Map<string, any>;
  storagePrefix: string;
  defaultTTL: number;
  maxMemoryItems: number;
  isStorageSupported: boolean;
  cleanupInterval: any;

  constructor() {
    this.memoryCache = new Map();
    this.storagePrefix = 'aura_gaming_cache_';
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxMemoryItems = 100;
    this.isStorageSupported = this.checkStorageSupport();
  }

  // Check if localStorage is supported
  checkStorageSupport() {
    try {
      const test = '__cache_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not supported for caching');
      return false;
    }
  }

  // Generate cache key
  generateKey(key, namespace = 'default') {
    return `${namespace}:${key}`;
  }

  // Generate storage key
  getStorageKey(key) {
    return `${this.storagePrefix}${key}`;
  }

  // Set item in cache
  set(key, value, ttl = this.defaultTTL, namespace = 'default', useStorage = false) {
    const cacheKey = this.generateKey(key, namespace);
    const expiresAt = Date.now() + ttl;
    
    const cacheItem = {
      value,
      expiresAt,
      createdAt: Date.now(),
      namespace,
      key: cacheKey
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, cacheItem);

    // Clean up memory cache if it gets too large
    if (this.memoryCache.size > this.maxMemoryItems) {
      this.cleanupMemoryCache();
    }

    // Store in localStorage if requested and supported
    if (useStorage && this.isStorageSupported) {
      try {
        const storageKey = this.getStorageKey(cacheKey);
        localStorage.setItem(storageKey, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to store cache item in localStorage:', error);
      }
    }

    return true;
  }

  // Get item from cache
  get(key, namespace = 'default', checkStorage = false) {
    const cacheKey = this.generateKey(key, namespace);
    
    // Check memory cache first
    let cacheItem = this.memoryCache.get(cacheKey);
    
    // If not in memory and checkStorage is true, check localStorage
    if (!cacheItem && checkStorage && this.isStorageSupported) {
      try {
        const storageKey = this.getStorageKey(cacheKey);
        const storedItem = localStorage.getItem(storageKey);
        
        if (storedItem) {
          cacheItem = JSON.parse(storedItem);
          // Put back in memory cache
          this.memoryCache.set(cacheKey, cacheItem);
        }
      } catch (error) {
        console.warn('Failed to retrieve cache item from localStorage:', error);
      }
    }

    // Check if item exists and is not expired
    if (cacheItem) {
      if (Date.now() < cacheItem.expiresAt) {
        return cacheItem.value;
      } else {
        // Item expired, remove it
        this.delete(key, namespace);
        return null;
      }
    }

    return null;
  }

  // Check if item exists in cache
  has(key, namespace = 'default', checkStorage = false) {
    return this.get(key, namespace, checkStorage) !== null;
  }

  // Delete item from cache
  delete(key, namespace = 'default') {
    const cacheKey = this.generateKey(key, namespace);
    
    // Remove from memory cache
    const deleted = this.memoryCache.delete(cacheKey);

    // Remove from localStorage if supported
    if (this.isStorageSupported) {
      try {
        const storageKey = this.getStorageKey(cacheKey);
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to remove cache item from localStorage:', error);
      }
    }

    return deleted;
  }

  // Clear all cache items
  clear(namespace = null) {
    if (namespace) {
      // Clear specific namespace
      const keysToDelete = [];
      
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.namespace === namespace) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        this.memoryCache.delete(key);
        
        if (this.isStorageSupported) {
          try {
            const storageKey = this.getStorageKey(key);
            localStorage.removeItem(storageKey);
          } catch (error) {
            console.warn('Failed to remove cache item from localStorage:', error);
          }
        }
      });
    } else {
      // Clear all cache
      this.memoryCache.clear();
      
      if (this.isStorageSupported) {
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.warn('Failed to clear cache from localStorage:', error);
        }
      }
    }
  }

  // Clean up expired items
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    // Check memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now >= item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    // Remove expired items
    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
      
      if (this.isStorageSupported) {
        try {
          const storageKey = this.getStorageKey(key);
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.warn('Failed to remove expired cache item from localStorage:', error);
        }
      }
    });

    return expiredKeys.length;
  }

  // Clean up memory cache when it gets too large
  cleanupMemoryCache() {
    const items = Array.from(this.memoryCache.entries());
    
    // Sort by creation time (oldest first)
    items.sort((a, b) => a[1].createdAt - b[1].createdAt);
    
    // Remove oldest items until we're under the limit
    const itemsToRemove = items.length - this.maxMemoryItems + 10; // Remove extra to avoid frequent cleanup
    
    for (let i = 0; i < itemsToRemove && i < items.length; i++) {
      this.memoryCache.delete(items[i][0]);
    }
  }

  // Get cache statistics
  getStats() {
    const memoryStats = {
      size: this.memoryCache.size,
      maxSize: this.maxMemoryItems
    };

    const storageStats = {
      size: 0,
      totalSize: 0
    };

    if (this.isStorageSupported) {
      try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.storagePrefix));
        
        storageStats.size = cacheKeys.length;
        
        let totalBytes = 0;
        cacheKeys.forEach(key => {
          const value = localStorage.getItem(key);
          totalBytes += key.length + (value ? value.length : 0);
        });
        
        storageStats.totalSize = totalBytes;
      } catch (error) {
        console.warn('Failed to get storage cache stats:', error);
      }
    }

    return {
      memory: memoryStats,
      storage: storageStats,
      isStorageSupported: this.isStorageSupported
    };
  }

  // Get or set pattern (cache-aside)
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL, namespace = 'default', useStorage = false) {
    // Try to get from cache first
    let value = this.get(key, namespace, useStorage);
    
    if (value !== null) {
      return value;
    }

    // Not in cache, fetch the value
    try {
      value = await fetchFunction();
      
      // Store in cache
      this.set(key, value, ttl, namespace, useStorage);
      
      return value;
    } catch (error) {
      console.error('Error fetching value for cache:', error);
      throw error;
    }
  }

  // Memoize function calls
  memoize(fn, keyGenerator = null, ttl = this.defaultTTL, namespace = 'memoize') {
    return async (...args) => {
      // Generate cache key
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      return await this.getOrSet(key, () => fn(...args), ttl, namespace);
    };
  }

  // Cache with tags for group invalidation
  setWithTags(key, value, tags = [], ttl = this.defaultTTL, namespace = 'default') {
    // Store the main item
    this.set(key, value, ttl, namespace);
    
    // Store tag mappings
    tags.forEach(tag => {
      const tagKey = `tag:${tag}`;
      const taggedItems = this.get(tagKey, namespace) || [];
      
      if (!taggedItems.includes(key)) {
        taggedItems.push(key);
        this.set(tagKey, taggedItems, ttl * 2, namespace); // Tags live longer
      }
    });
  }

  // Invalidate by tags
  invalidateByTags(tags, namespace = 'default') {
    tags.forEach(tag => {
      const tagKey = `tag:${tag}`;
      const taggedItems = this.get(tagKey, namespace) || [];
      
      // Delete all items with this tag
      taggedItems.forEach(itemKey => {
        this.delete(itemKey, namespace);
      });
      
      // Delete the tag itself
      this.delete(tagKey, namespace);
    });
  }

  // Batch operations
  setMany(items, ttl = this.defaultTTL, namespace = 'default', useStorage = false) {
    const results = {};
    
    items.forEach(({ key, value }) => {
      results[key] = this.set(key, value, ttl, namespace, useStorage);
    });
    
    return results;
  }

  getMany(keys, namespace = 'default', checkStorage = false) {
    const results = {};
    
    keys.forEach(key => {
      results[key] = this.get(key, namespace, checkStorage);
    });
    
    return results;
  }

  deleteMany(keys, namespace = 'default') {
    const results = {};
    
    keys.forEach(key => {
      results[key] = this.delete(key, namespace);
    });
    
    return results;
  }

  // Auto cleanup interval
  startAutoCleanup(intervalMs = 5 * 60 * 1000) { // 5 minutes
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }

  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create and export singleton instance
const cacheService = new CacheService();

// Start auto cleanup
cacheService.startAutoCleanup();

export default cacheService;

// Export class for custom instances
export { CacheService }; 