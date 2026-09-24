// Environment Configuration for Aura Gaming Platform

// Get environment variables with fallbacks
const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

const getEnvBool = (key, defaultValue = false) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const getEnvNumber = (key, defaultValue = 0) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Current environment
export const NODE_ENV = getEnvVar('NODE_ENV', 'development');
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_STAGING = NODE_ENV === 'staging';
export const IS_TEST = NODE_ENV === 'test';

// Application Configuration
export const APP_CONFIG = {
  name: getEnvVar('REACT_APP_NAME', 'Aura Gaming Admin'),
  version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  description: getEnvVar('REACT_APP_DESCRIPTION', 'Gaming Platform Administration Dashboard'),
  author: getEnvVar('REACT_APP_AUTHOR', 'Aura Gaming'),
  homepage: getEnvVar('REACT_APP_HOMEPAGE', 'https://auragaming.com'),
  supportEmail: getEnvVar('REACT_APP_SUPPORT_EMAIL', 'support@auragaming.com'),
  buildDate: getEnvVar('REACT_APP_BUILD_DATE', new Date().toISOString()),
  gitCommit: getEnvVar('REACT_APP_GIT_COMMIT', 'unknown'),
  gitBranch: getEnvVar('REACT_APP_GIT_BRANCH', 'unknown'),
};

// API Configuration
export const API_CONFIG = {
  baseUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:4000'),
  graphqlEndpoint: getEnvVar('REACT_APP_GRAPHQL_ENDPOINT', '/graphql'),
  websocketUrl: getEnvVar('REACT_APP_WS_URL', 'ws://localhost:4000/graphql'),
  timeout: getEnvNumber('REACT_APP_API_TIMEOUT', 30000),
  retryAttempts: getEnvNumber('REACT_APP_API_RETRY_ATTEMPTS', 3),
  retryDelay: getEnvNumber('REACT_APP_API_RETRY_DELAY', 1000),
};

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenStorageKey: getEnvVar('REACT_APP_TOKEN_KEY', 'authToken'),
  refreshTokenKey: getEnvVar('REACT_APP_REFRESH_TOKEN_KEY', 'refreshToken'),
  userStorageKey: getEnvVar('REACT_APP_USER_KEY', 'currentUser'),
  sessionTimeout: getEnvNumber('REACT_APP_SESSION_TIMEOUT', 3600000), // 1 hour
  refreshThreshold: getEnvNumber('REACT_APP_REFRESH_THRESHOLD', 300000), // 5 minutes
  rememberMeDuration: getEnvNumber('REACT_APP_REMEMBER_ME_DURATION', 2592000000), // 30 days
  maxLoginAttempts: getEnvNumber('REACT_APP_MAX_LOGIN_ATTEMPTS', 5),
  lockoutDuration: getEnvNumber('REACT_APP_LOCKOUT_DURATION', 900000), // 15 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableLiveChat: getEnvBool('REACT_APP_ENABLE_LIVE_CHAT', true),
  enableCryptoPayments: getEnvBool('REACT_APP_ENABLE_CRYPTO_PAYMENTS', false),
  enableSportsBetting: getEnvBool('REACT_APP_ENABLE_SPORTS_BETTING', true),
  enableLiveCasino: getEnvBool('REACT_APP_ENABLE_LIVE_CASINO', true),
  enableMobileApp: getEnvBool('REACT_APP_ENABLE_MOBILE_APP', false),
  enableReferralProgram: getEnvBool('REACT_APP_ENABLE_REFERRAL_PROGRAM', true),
  enableDarkMode: getEnvBool('REACT_APP_ENABLE_DARK_MODE', true),
  enableNotifications: getEnvBool('REACT_APP_ENABLE_NOTIFICATIONS', true),
  enableRealTimeUpdates: getEnvBool('REACT_APP_ENABLE_REAL_TIME_UPDATES', true),
  enableAdvancedReports: getEnvBool('REACT_APP_ENABLE_ADVANCED_REPORTS', true),
  enableAuditLogs: getEnvBool('REACT_APP_ENABLE_AUDIT_LOGS', true),
  enableTwoFactorAuth: getEnvBool('REACT_APP_ENABLE_2FA', false),
  enableGeoBlocking: getEnvBool('REACT_APP_ENABLE_GEO_BLOCKING', true),
  enableResponsibleGaming: getEnvBool('REACT_APP_ENABLE_RESPONSIBLE_GAMING', true),
  enableKYCVerification: getEnvBool('REACT_APP_ENABLE_KYC_VERIFICATION', true),
  enableAMLCompliance: getEnvBool('REACT_APP_ENABLE_AML_COMPLIANCE', true),
};

// Logging Configuration
export const LOGGING_CONFIG = {
  level: getEnvVar('REACT_APP_LOG_LEVEL', IS_PRODUCTION ? 'error' : 'debug'),
  enableConsoleLogging: getEnvBool('REACT_APP_ENABLE_CONSOLE_LOGGING', !IS_PRODUCTION),
  enableRemoteLogging: getEnvBool('REACT_APP_ENABLE_REMOTE_LOGGING', IS_PRODUCTION),
  remoteLoggingUrl: getEnvVar('REACT_APP_REMOTE_LOGGING_URL', ''),
  maxLogEntries: getEnvNumber('REACT_APP_MAX_LOG_ENTRIES', 1000),
  logRetentionDays: getEnvNumber('REACT_APP_LOG_RETENTION_DAYS', 7),
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  enableServiceWorker: getEnvBool('REACT_APP_ENABLE_SERVICE_WORKER', IS_PRODUCTION),
  enableCodeSplitting: getEnvBool('REACT_APP_ENABLE_CODE_SPLITTING', true),
  enableLazyLoading: getEnvBool('REACT_APP_ENABLE_LAZY_LOADING', true),
  enableCaching: getEnvBool('REACT_APP_ENABLE_CACHING', true),
  cacheTimeout: getEnvNumber('REACT_APP_CACHE_TIMEOUT', 300000), // 5 minutes
  enableCompression: getEnvBool('REACT_APP_ENABLE_COMPRESSION', IS_PRODUCTION),
  enableMinification: getEnvBool('REACT_APP_ENABLE_MINIFICATION', IS_PRODUCTION),
};

// Security Configuration
export const SECURITY_CONFIG = {
  enableCSP: getEnvBool('REACT_APP_ENABLE_CSP', IS_PRODUCTION),
  enableHSTS: getEnvBool('REACT_APP_ENABLE_HSTS', IS_PRODUCTION),
  enableXSSProtection: getEnvBool('REACT_APP_ENABLE_XSS_PROTECTION', true),
  enableClickjackingProtection: getEnvBool('REACT_APP_ENABLE_CLICKJACKING_PROTECTION', true),
  enableMIMETypeSniffing: getEnvBool('REACT_APP_ENABLE_MIME_TYPE_SNIFFING', false),
  sessionSecure: getEnvBool('REACT_APP_SESSION_SECURE', IS_PRODUCTION),
  sessionSameSite: getEnvVar('REACT_APP_SESSION_SAME_SITE', 'strict'),
  passwordMinLength: getEnvNumber('REACT_APP_PASSWORD_MIN_LENGTH', 8),
  passwordRequireUppercase: getEnvBool('REACT_APP_PASSWORD_REQUIRE_UPPERCASE', true),
  passwordRequireLowercase: getEnvBool('REACT_APP_PASSWORD_REQUIRE_LOWERCASE', true),
  passwordRequireNumbers: getEnvBool('REACT_APP_PASSWORD_REQUIRE_NUMBERS', true),
  passwordRequireSpecialChars: getEnvBool('REACT_APP_PASSWORD_REQUIRE_SPECIAL_CHARS', true),
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enableGoogleAnalytics: getEnvBool('REACT_APP_ENABLE_GOOGLE_ANALYTICS', IS_PRODUCTION),
  googleAnalyticsId: getEnvVar('REACT_APP_GOOGLE_ANALYTICS_ID', ''),
  enableHotjar: getEnvBool('REACT_APP_ENABLE_HOTJAR', false),
  hotjarId: getEnvVar('REACT_APP_HOTJAR_ID', ''),
  enableMixpanel: getEnvBool('REACT_APP_ENABLE_MIXPANEL', false),
  mixpanelToken: getEnvVar('REACT_APP_MIXPANEL_TOKEN', ''),
  enableCustomAnalytics: getEnvBool('REACT_APP_ENABLE_CUSTOM_ANALYTICS', false),
  customAnalyticsUrl: getEnvVar('REACT_APP_CUSTOM_ANALYTICS_URL', ''),
};

// Third-party Services Configuration
export const SERVICES_CONFIG = {
  // Payment Providers
  stripePublicKey: getEnvVar('REACT_APP_STRIPE_PUBLIC_KEY', ''),
  paypalClientId: getEnvVar('REACT_APP_PAYPAL_CLIENT_ID', ''),
  
  // Communication Services
  twilioAccountSid: getEnvVar('REACT_APP_TWILIO_ACCOUNT_SID', ''),
  sendgridApiKey: getEnvVar('REACT_APP_SENDGRID_API_KEY', ''),
  
  // File Storage
  awsS3Bucket: getEnvVar('REACT_APP_AWS_S3_BUCKET', ''),
  awsRegion: getEnvVar('REACT_APP_AWS_REGION', 'us-east-1'),
  cloudinaryCloudName: getEnvVar('REACT_APP_CLOUDINARY_CLOUD_NAME', ''),
  
  // Maps and Location
  googleMapsApiKey: getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY', ''),
  
  // Social Media
  facebookAppId: getEnvVar('REACT_APP_FACEBOOK_APP_ID', ''),
  twitterApiKey: getEnvVar('REACT_APP_TWITTER_API_KEY', ''),
  
  // Gaming Providers
  evolutionApiKey: getEnvVar('REACT_APP_EVOLUTION_API_KEY', ''),
  netentApiKey: getEnvVar('REACT_APP_NETENT_API_KEY', ''),
  microgamingApiKey: getEnvVar('REACT_APP_MICROGAMING_API_KEY', ''),
};

// Database Configuration (for reference)
export const DATABASE_CONFIG = {
  host: getEnvVar('DB_HOST', 'localhost'),
  port: getEnvNumber('DB_PORT', 5432),
  name: getEnvVar('DB_NAME', 'aura_gaming'),
  user: getEnvVar('DB_USER', 'postgres'),
  ssl: getEnvBool('DB_SSL', IS_PRODUCTION),
  poolMin: getEnvNumber('DB_POOL_MIN', 2),
  poolMax: getEnvNumber('DB_POOL_MAX', 10),
};

// Redis Configuration (for reference)
export const REDIS_CONFIG = {
  host: getEnvVar('REDIS_HOST', 'localhost'),
  port: getEnvNumber('REDIS_PORT', 6379),
  password: getEnvVar('REDIS_PASSWORD', ''),
  db: getEnvNumber('REDIS_DB', 0),
  ttl: getEnvNumber('REDIS_TTL', 3600),
};

// Email Configuration
export const EMAIL_CONFIG = {
  provider: getEnvVar('EMAIL_PROVIDER', 'sendgrid'),
  fromEmail: getEnvVar('EMAIL_FROM', 'noreply@auragaming.com'),
  fromName: getEnvVar('EMAIL_FROM_NAME', 'Aura Gaming'),
  replyToEmail: getEnvVar('EMAIL_REPLY_TO', 'support@auragaming.com'),
  enableEmailVerification: getEnvBool('ENABLE_EMAIL_VERIFICATION', true),
  enableEmailNotifications: getEnvBool('ENABLE_EMAIL_NOTIFICATIONS', true),
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: getEnvNumber('REACT_APP_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
  allowedImageTypes: getEnvVar('REACT_APP_ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/gif,image/webp').split(','),
  allowedDocumentTypes: getEnvVar('REACT_APP_ALLOWED_DOCUMENT_TYPES', 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(','),
  uploadPath: getEnvVar('REACT_APP_UPLOAD_PATH', '/uploads'),
  enableImageOptimization: getEnvBool('REACT_APP_ENABLE_IMAGE_OPTIMIZATION', true),
  imageQuality: getEnvNumber('REACT_APP_IMAGE_QUALITY', 80),
  maxImageWidth: getEnvNumber('REACT_APP_MAX_IMAGE_WIDTH', 1920),
  maxImageHeight: getEnvNumber('REACT_APP_MAX_IMAGE_HEIGHT', 1080),
};

// Localization Configuration
export const I18N_CONFIG = {
  defaultLanguage: getEnvVar('REACT_APP_DEFAULT_LANGUAGE', 'en'),
  supportedLanguages: getEnvVar('REACT_APP_SUPPORTED_LANGUAGES', 'en,es,fr,de,it,pt,ru,zh,ja,ko').split(','),
  enableRTL: getEnvBool('REACT_APP_ENABLE_RTL', false),
  dateFormat: getEnvVar('REACT_APP_DATE_FORMAT', 'MM/DD/YYYY'),
  timeFormat: getEnvVar('REACT_APP_TIME_FORMAT', 'HH:mm:ss'),
  timezone: getEnvVar('REACT_APP_TIMEZONE', 'UTC'),
  currency: getEnvVar('REACT_APP_DEFAULT_CURRENCY', 'USD'),
};

// Gaming Configuration
export const GAMING_CONFIG = {
  defaultGameCategory: getEnvVar('REACT_APP_DEFAULT_GAME_CATEGORY', 'slots'),
  enableDemoMode: getEnvBool('REACT_APP_ENABLE_DEMO_MODE', true),
  enableAutoplay: getEnvBool('REACT_APP_ENABLE_AUTOPLAY', true),
  enableTurboMode: getEnvBool('REACT_APP_ENABLE_TURBO_MODE', true),
  maxBetAmount: getEnvNumber('REACT_APP_MAX_BET_AMOUNT', 1000),
  minBetAmount: getEnvNumber('REACT_APP_MIN_BET_AMOUNT', 0.01),
  defaultBetAmount: getEnvNumber('REACT_APP_DEFAULT_BET_AMOUNT', 1),
  enableJackpots: getEnvBool('REACT_APP_ENABLE_JACKPOTS', true),
  enableTournaments: getEnvBool('REACT_APP_ENABLE_TOURNAMENTS', false),
  enableLeaderboards: getEnvBool('REACT_APP_ENABLE_LEADERBOARDS', true),
};

// Compliance Configuration
export const COMPLIANCE_CONFIG = {
  enableGDPR: getEnvBool('REACT_APP_ENABLE_GDPR', true),
  enableCCPA: getEnvBool('REACT_APP_ENABLE_CCPA', false),
  enableCookieConsent: getEnvBool('REACT_APP_ENABLE_COOKIE_CONSENT', true),
  enableAgeVerification: getEnvBool('REACT_APP_ENABLE_AGE_VERIFICATION', true),
  minimumAge: getEnvNumber('REACT_APP_MINIMUM_AGE', 18),
  enableGeoRestrictions: getEnvBool('REACT_APP_ENABLE_GEO_RESTRICTIONS', true),
  restrictedCountries: getEnvVar('REACT_APP_RESTRICTED_COUNTRIES', 'US,FR,IT,ES').split(','),
  enableResponsibleGamingTools: getEnvBool('REACT_APP_ENABLE_RESPONSIBLE_GAMING_TOOLS', true),
  enableSelfExclusion: getEnvBool('REACT_APP_ENABLE_SELF_EXCLUSION', true),
  enableDepositLimits: getEnvBool('REACT_APP_ENABLE_DEPOSIT_LIMITS', true),
  enableSessionLimits: getEnvBool('REACT_APP_ENABLE_SESSION_LIMITS', true),
  enableLossLimits: getEnvBool('REACT_APP_ENABLE_LOSS_LIMITS', true),
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    debug: true,
    minifyCode: false,
    enableSourceMaps: true,
    enableHotReload: true,
    enableMockData: true,
    logLevel: 'debug',
  },
  staging: {
    debug: false,
    minifyCode: true,
    enableSourceMaps: true,
    enableHotReload: false,
    enableMockData: false,
    logLevel: 'info',
  },
  production: {
    debug: false,
    minifyCode: true,
    enableSourceMaps: false,
    enableHotReload: false,
    enableMockData: false,
    logLevel: 'error',
  },
  test: {
    debug: true,
    minifyCode: false,
    enableSourceMaps: true,
    enableHotReload: false,
    enableMockData: true,
    logLevel: 'debug',
  },
};

// Get current environment configuration
export const getCurrentEnvironmentConfig = () => {
  return ENVIRONMENT_CONFIGS[NODE_ENV] || ENVIRONMENT_CONFIGS.development;
};

// Validation functions
export const validateEnvironment = () => {
  const errors = [];
  
  // Required environment variables
  const requiredVars = [
    'REACT_APP_API_URL',
    'REACT_APP_WS_URL',
  ];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Production-specific validations
  if (IS_PRODUCTION) {
    const productionRequiredVars = [
      'REACT_APP_GOOGLE_ANALYTICS_ID',
      'REACT_APP_STRIPE_PUBLIC_KEY',
    ];
    
    productionRequiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Missing required production environment variable: ${varName}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export all configurations
export default {
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
  validateEnvironment,
}; 