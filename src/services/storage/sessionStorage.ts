// Session Storage Service with enhanced functionality
class SessionStorageService {
  prefix: string;
  isSupported: boolean;

  constructor() {
    this.prefix = 'aura_gaming_session_';
    this.isSupported = this.checkSupport();
  }

  // Check if sessionStorage is supported
  checkSupport() {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('sessionStorage is not supported');
      return false;
    }
  }

  // Generate prefixed key
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Set item with optional expiration (within session)
  setItem(key, value, expirationInMinutes = null) {
    if (!this.isSupported) return false;

    try {
      const prefixedKey = this.getKey(key);
      const data = {
        value,
        timestamp: Date.now(),
        expiration: expirationInMinutes ? Date.now() + (expirationInMinutes * 60 * 1000) : null
      };

      sessionStorage.setItem(prefixedKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
      return false;
    }
  }

  // Get item with expiration check
  getItem(key, defaultValue = null) {
    if (!this.isSupported) return defaultValue;

    try {
      const prefixedKey = this.getKey(key);
      const item = sessionStorage.getItem(prefixedKey);
      
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // Check if item has expired
      if (data.expiration && Date.now() > data.expiration) {
        this.removeItem(key);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue;
    }
  }

  // Remove item
  removeItem(key) {
    if (!this.isSupported) return false;

    try {
      const prefixedKey = this.getKey(key);
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
      return false;
    }
  }

  // Check if item exists
  hasItem(key) {
    if (!this.isSupported) return false;

    const prefixedKey = this.getKey(key);
    return sessionStorage.getItem(prefixedKey) !== null;
  }

  // Clear all items with our prefix
  clear() {
    if (!this.isSupported) return false;

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }

  // Get all keys with our prefix
  getKeys() {
    if (!this.isSupported) return [];

    try {
      const keys = Object.keys(sessionStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting sessionStorage keys:', error);
      return [];
    }
  }

  // Get storage size in bytes
  getSize() {
    if (!this.isSupported) return 0;

    try {
      let total = 0;
      const keys = Object.keys(sessionStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = sessionStorage.getItem(key);
          total += key.length + (value ? value.length : 0);
        }
      });
      
      return total;
    } catch (error) {
      console.error('Error calculating sessionStorage size:', error);
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
      console.error('Error exporting sessionStorage data:', error);
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
      console.error('Error importing sessionStorage data:', error);
      return false;
    }
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

  // Session-specific methods
  
  // Set temporary data that expires when tab is closed
  setTemporary(key, value) {
    return this.setItem(key, value);
  }

  // Get temporary data
  getTemporary(key, defaultValue = null) {
    return this.getItem(key, defaultValue);
  }

  // Store form data for recovery
  storeFormData(formId, formData) {
    return this.setItem(`form_${formId}`, formData);
  }

  // Retrieve form data
  getFormData(formId, defaultValue = {}) {
    return this.getItem(`form_${formId}`, defaultValue);
  }

  // Clear form data
  clearFormData(formId) {
    return this.removeItem(`form_${formId}`);
  }

  // Store navigation state
  storeNavigationState(state) {
    return this.setItem('navigation_state', state);
  }

  // Get navigation state
  getNavigationState(defaultValue = {}) {
    return this.getItem('navigation_state', defaultValue);
  }

  // Store user preferences for session
  storeSessionPreferences(preferences) {
    return this.setItem('session_preferences', preferences);
  }

  // Get user preferences for session
  getSessionPreferences(defaultValue = {}) {
    return this.getItem('session_preferences', defaultValue);
  }

  // Store search history
  addToSearchHistory(query, maxItems = 10) {
    const history = this.getArray('search_history', []);
    
    // Remove if already exists
    const filteredHistory = history.filter(item => item !== query);
    
    // Add to beginning
    filteredHistory.unshift(query);
    
    // Limit to maxItems
    const limitedHistory = filteredHistory.slice(0, maxItems);
    
    return this.setArray('search_history', limitedHistory);
  }

  // Get search history
  getSearchHistory() {
    return this.getArray('search_history', []);
  }

  // Clear search history
  clearSearchHistory() {
    return this.removeItem('search_history');
  }

  // Store filter state
  storeFilterState(filterId, filterState) {
    return this.setItem(`filter_${filterId}`, filterState);
  }

  // Get filter state
  getFilterState(filterId, defaultValue = {}) {
    return this.getItem(`filter_${filterId}`, defaultValue);
  }

  // Store table state (sorting, pagination, etc.)
  storeTableState(tableId, tableState) {
    return this.setItem(`table_${tableId}`, tableState);
  }

  // Get table state
  getTableState(tableId, defaultValue = {}) {
    return this.getItem(`table_${tableId}`, defaultValue);
  }

  // Store wizard/multi-step form progress
  storeWizardProgress(wizardId, step, data) {
    const wizardData = this.getObject(`wizard_${wizardId}`, {});
    wizardData.currentStep = step;
    wizardData.data = { ...wizardData.data, ...data };
    return this.setObject(`wizard_${wizardId}`, wizardData);
  }

  // Get wizard progress
  getWizardProgress(wizardId) {
    return this.getObject(`wizard_${wizardId}`, { currentStep: 0, data: {} });
  }

  // Clear wizard progress
  clearWizardProgress(wizardId) {
    return this.removeItem(`wizard_${wizardId}`);
  }
}

// Create and export singleton instance
const sessionStorageService = new SessionStorageService();
export default sessionStorageService;

// Export class for custom instances
export { SessionStorageService }; 