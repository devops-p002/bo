// Configuration Index - Centralized exports for Aura Gaming Platform

// Import all configuration modules
import apolloConfig from './apollo';
import routesConfig, { 
  routes, 
  navigationMenu, 
  getRouteByPath, 
  getPublicRoutes, 
  getProtectedRoutes, 
  getRoutesByPermission, 
  getNavigationByPermission, 
  generateBreadcrumb, 
  requiresAuth, 
  requiresPermission, 
  defaultRedirects 
} from './routes';
import constantsConfig, {
  API_CONFIG as CONSTANTS_API_CONFIG,
  AUTH_CONFIG as CONSTANTS_AUTH_CONFIG,
  USER_ROLES,
  USER_STATUS,
  VIP_LEVELS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  PAYMENT_METHODS,
  GAME_CATEGORIES,
  GAME_STATUS,
  BET_STATUS,
  BET_TYPES,
  BONUS_TYPES,
  BONUS_STATUS,
  RISK_LEVELS,
  ALERT_TYPES,
  ALERT_STATUS,
  CURRENCIES,
  LANGUAGES,
  TIME_ZONES,
  DATE_FORMATS,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION_RULES,
  CACHE_KEYS,
  CACHE_TTL,
  WS_EVENTS,
  NOTIFICATION_TYPES,
  THEME_CONFIG,
  CHART_COLORS,
  EXPORT_FORMATS,
  REPORT_TYPES,
  GAMING_LIMITS,
  RESPONSIBLE_GAMING,
  SYSTEM_STATUS,
  FEATURE_FLAGS as CONSTANTS_FEATURE_FLAGS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DEFAULTS
} from './constants';
import permissionsConfig, {
  PERMISSION_CATEGORIES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsByCategory,
  getRolePermissions,
  getPermissionDetails,
  validatePermissions,
  getPermissionHierarchy
} from './permissions';
import environmentConfig, {
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_STAGING,
  IS_TEST,
  APP_CONFIG,
  API_CONFIG,
  AUTH_CONFIG,
  FEATURE_FLAGS,
  LOGGING_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  ANALYTICS_CONFIG,
  SERVICES_CONFIG,
  DATABASE_CONFIG,
  REDIS_CONFIG,
  EMAIL_CONFIG,
  UPLOAD_CONFIG,
  I18N_CONFIG,
  GAMING_CONFIG,
  COMPLIANCE_CONFIG,
  ENVIRONMENT_CONFIGS,
  getCurrentEnvironmentConfig,
  validateEnvironment
} from './environment';

// Re-export Apollo configuration
export { default as apolloClient } from './apollo';
export {
  clearCache,
  resetCache,
  refetchQueries,
  updateUserCache,
  updateTransactionCache,
  subscribeToUserUpdates,
  subscribeToTransactionUpdates,
  subscribeToGameUpdates,
  handleApolloError
} from './apollo';

// Re-export Routes configuration
export {
  routes,
  navigationMenu,
  getRouteByPath,
  getPublicRoutes,
  getProtectedRoutes,
  getRoutesByPermission,
  getNavigationByPermission,
  generateBreadcrumb,
  requiresAuth,
  requiresPermission,
  defaultRedirects
};

// Re-export Constants
export {
  USER_ROLES,
  USER_STATUS,
  VIP_LEVELS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  PAYMENT_METHODS,
  GAME_CATEGORIES,
  GAME_STATUS,
  BET_STATUS,
  BET_TYPES,
  BONUS_TYPES,
  BONUS_STATUS,
  RISK_LEVELS,
  ALERT_TYPES,
  ALERT_STATUS,
  CURRENCIES,
  LANGUAGES,
  TIME_ZONES,
  DATE_FORMATS,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION_RULES,
  CACHE_KEYS,
  CACHE_TTL,
  WS_EVENTS,
  NOTIFICATION_TYPES,
  THEME_CONFIG,
  CHART_COLORS,
  EXPORT_FORMATS,
  REPORT_TYPES,
  GAMING_LIMITS,
  RESPONSIBLE_GAMING,
  SYSTEM_STATUS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DEFAULTS
};

// Re-export Permissions
export {
  PERMISSION_CATEGORIES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsByCategory,
  getRolePermissions,
  getPermissionDetails,
  validatePermissions,
  getPermissionHierarchy
};

// Re-export Environment configuration
export {
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_STAGING,
  IS_TEST,
  APP_CONFIG,
  API_CONFIG,
  AUTH_CONFIG,
  FEATURE_FLAGS,
  LOGGING_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  ANALYTICS_CONFIG,
  SERVICES_CONFIG,
  DATABASE_CONFIG,
  REDIS_CONFIG,
  EMAIL_CONFIG,
  UPLOAD_CONFIG,
  I18N_CONFIG,
  GAMING_CONFIG,
  COMPLIANCE_CONFIG,
  ENVIRONMENT_CONFIGS,
  getCurrentEnvironmentConfig,
  validateEnvironment
};

// Merged configurations for convenience
export const config = {
  app: APP_CONFIG,
  api: API_CONFIG,
  auth: AUTH_CONFIG,
  features: FEATURE_FLAGS,
  logging: LOGGING_CONFIG,
  performance: PERFORMANCE_CONFIG,
  security: SECURITY_CONFIG,
  analytics: ANALYTICS_CONFIG,
  services: SERVICES_CONFIG,
  database: DATABASE_CONFIG,
  redis: REDIS_CONFIG,
  email: EMAIL_CONFIG,
  upload: UPLOAD_CONFIG,
  i18n: I18N_CONFIG,
  gaming: GAMING_CONFIG,
  compliance: COMPLIANCE_CONFIG,
  environment: getCurrentEnvironmentConfig(),
};

// Configuration utilities
export const configUtils = {
  // Environment utilities
  isDevelopment: () => IS_DEVELOPMENT,
  isProduction: () => IS_PRODUCTION,
  isStaging: () => IS_STAGING,
  isTest: () => IS_TEST,
  
  // Feature flag utilities
  isFeatureEnabled: (featureName) => {
    return FEATURE_FLAGS[featureName] || false;
  },
  
  // API utilities
  getApiUrl: (endpoint = '') => {
    return `${API_CONFIG.baseUrl}${endpoint}`;
  },
  
  getGraphQLUrl: () => {
    return `${API_CONFIG.baseUrl}${API_CONFIG.graphqlEndpoint}`;
  },
  
  getWebSocketUrl: () => {
    return API_CONFIG.websocketUrl;
  },
  
  // Authentication utilities
  getTokenStorageKey: () => AUTH_CONFIG.tokenStorageKey,
  getRefreshTokenKey: () => AUTH_CONFIG.refreshTokenKey,
  getUserStorageKey: () => AUTH_CONFIG.userStorageKey,
  
  // Validation utilities
  validateConfig: () => {
    const envValidation = validateEnvironment();
    const errors = [...envValidation.errors];
    
    // Additional configuration validations
    if (!API_CONFIG.baseUrl) {
      errors.push('API base URL is not configured');
    }
    
    if (!API_CONFIG.websocketUrl) {
      errors.push('WebSocket URL is not configured');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  // Theme utilities
  getDefaultTheme: () => THEME_CONFIG.DEFAULT_THEME,
  getSupportedThemes: () => THEME_CONFIG.THEMES,
  
  // Currency utilities
  getDefaultCurrency: () => DEFAULTS.CURRENCY,
  getSupportedCurrencies: () => Object.values(CURRENCIES),
  
  // Language utilities
  getDefaultLanguage: () => DEFAULTS.LANGUAGE,
  getSupportedLanguages: () => Object.values(LANGUAGES),
  
  // Gaming utilities
  getGameCategories: () => Object.values(GAME_CATEGORIES),
  getVIPLevels: () => Object.values(VIP_LEVELS),
  getPaymentMethods: () => Object.values(PAYMENT_METHODS),
  
  // Permission utilities
  getUserRoles: () => Object.values(USER_ROLES),
  getAllPermissions: () => Object.keys(PERMISSIONS),
  
  // Route utilities
  getPublicPaths: () => getPublicRoutes().map(route => route.path),
  getProtectedPaths: () => getProtectedRoutes().map(route => route.path),
  
  // Cache utilities
  getCacheKey: (key) => CACHE_KEYS[key],
  getCacheTTL: (duration) => CACHE_TTL[duration],
  
  // Error handling utilities
  getErrorMessage: (code) => ERROR_MESSAGES[code] || ERROR_MESSAGES.GENERIC,
  getSuccessMessage: (code) => SUCCESS_MESSAGES[code],
  
  // File upload utilities
  getMaxFileSize: () => FILE_UPLOAD.MAX_SIZE,
  getAllowedImageTypes: () => FILE_UPLOAD.ALLOWED_TYPES.IMAGES,
  getAllowedDocumentTypes: () => FILE_UPLOAD.ALLOWED_TYPES.DOCUMENTS,
  
  // Date/Time utilities
  getDefaultDateFormat: () => DEFAULTS.DATE_FORMAT,
  getDefaultTimezone: () => DEFAULTS.TIMEZONE,
  getSupportedTimezones: () => Object.values(TIME_ZONES),
  
  // Pagination utilities
  getDefaultPageSize: () => PAGINATION.DEFAULT_PAGE_SIZE,
  getPageSizeOptions: () => PAGINATION.PAGE_SIZE_OPTIONS,
  getMaxPageSize: () => PAGINATION.MAX_PAGE_SIZE,
  
  // Chart utilities
  getChartColors: () => CHART_COLORS.GRADIENT,
  getPrimaryColor: () => CHART_COLORS.PRIMARY,
  
  // Export utilities
  getSupportedExportFormats: () => Object.values(EXPORT_FORMATS),
  
  // WebSocket utilities
  getWebSocketEvents: () => Object.values(WS_EVENTS),
  
  // Notification utilities
  getNotificationTypes: () => Object.values(NOTIFICATION_TYPES),
  
  // System status utilities
  getSystemStatuses: () => Object.values(SYSTEM_STATUS),
  
  // Risk level utilities
  getRiskLevels: () => Object.values(RISK_LEVELS),
  
  // Alert type utilities
  getAlertTypes: () => Object.values(ALERT_TYPES),
  
  // Transaction utilities
  getTransactionTypes: () => Object.values(TRANSACTION_TYPES),
  getTransactionStatuses: () => Object.values(TRANSACTION_STATUS),
  
  // Bet utilities
  getBetTypes: () => Object.values(BET_TYPES),
  getBetStatuses: () => Object.values(BET_STATUS),
  
  // Bonus utilities
  getBonusTypes: () => Object.values(BONUS_TYPES),
  getBonusStatuses: () => Object.values(BONUS_STATUS),
  
  // Gaming limit utilities
  getGamingLimits: () => GAMING_LIMITS,
  getResponsibleGamingOptions: () => RESPONSIBLE_GAMING,
};

// Configuration validation on module load
if (IS_DEVELOPMENT) {
  const validation = configUtils.validateConfig();
  if (!validation.isValid) {
    console.warn('Configuration validation warnings:', validation.errors);
  }
}

// Default export with all configurations
export default {
  apollo: apolloConfig,
  routes: routesConfig,
  constants: constantsConfig,
  permissions: permissionsConfig,
  environment: environmentConfig,
  config,
  utils: configUtils,
}; 