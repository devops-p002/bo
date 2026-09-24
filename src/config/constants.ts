// Constants Configuration for Aura Gaming Platform

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  GRAPHQL_ENDPOINT: '/graphql',
  WEBSOCKET_ENDPOINT: '/graphql',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'currentUser',
  TOKEN_EXPIRY_BUFFER: 300000, // 5 minutes in milliseconds
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  REMEMBER_ME_DURATION: 2592000000, // 30 days in milliseconds
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  SUPPORT: 'support',
  VIEWER: 'viewer',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
  VERIFIED: 'verified',
};

// VIP Levels
export const VIP_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BONUS: 'bonus',
  WIN: 'win',
  BET: 'bet',
  REFUND: 'refund',
  COMMISSION: 'commission',
  ADJUSTMENT: 'adjustment',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  CRYPTOCURRENCY: 'cryptocurrency',
  PREPAID_CARD: 'prepaid_card',
};

// Game Categories
export const GAME_CATEGORIES = {
  SLOTS: 'slots',
  TABLE_GAMES: 'table_games',
  LIVE_CASINO: 'live_casino',
  SPORTS_BETTING: 'sports_betting',
  POKER: 'poker',
  BINGO: 'bingo',
  LOTTERY: 'lottery',
  VIRTUAL_SPORTS: 'virtual_sports',
};

// Game Status
export const GAME_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  COMING_SOON: 'coming_soon',
};

// Bet Status
export const BET_STATUS = {
  PENDING: 'pending',
  SETTLED: 'settled',
  CANCELLED: 'cancelled',
  VOID: 'void',
  PARTIALLY_SETTLED: 'partially_settled',
};

// Bet Types
export const BET_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  SYSTEM: 'system',
  CHAIN: 'chain',
};

// Bonus Types
export const BONUS_TYPES = {
  WELCOME: 'welcome',
  DEPOSIT: 'deposit',
  NO_DEPOSIT: 'no_deposit',
  FREE_SPINS: 'free_spins',
  CASHBACK: 'cashback',
  RELOAD: 'reload',
  VIP: 'vip',
  REFERRAL: 'referral',
};

// Bonus Status
export const BONUS_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Alert Types
export const ALERT_TYPES = {
  FRAUD: 'fraud',
  AML: 'aml',
  RESPONSIBLE_GAMING: 'responsible_gaming',
  TECHNICAL: 'technical',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
};

// Alert Status
export const ALERT_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  FALSE_POSITIVE: 'false_positive',
  ESCALATED: 'escalated',
};

// Currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  JPY: 'JPY',
  CNY: 'CNY',
  BTC: 'BTC',
  ETH: 'ETH',
  LTC: 'LTC',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
};

// Time Zones
export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
  DATETIME: 'MM/DD/YYYY HH:mm:ss',
  TIME: 'HH:mm:ss',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-()]+$/,
  },
  AMOUNT: {
    MIN: 0.01,
    MAX: 1000000,
    DECIMAL_PLACES: 2,
  },
};

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DASHBOARD_STATS: 'dashboard_stats',
  GAME_LIST: 'game_list',
  PAYMENT_METHODS: 'payment_methods',
  CURRENCIES: 'currencies',
  SETTINGS: 'settings',
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// WebSocket Events
export const WS_EVENTS = {
  USER_UPDATED: 'user_updated',
  TRANSACTION_UPDATED: 'transaction_updated',
  BET_PLACED: 'bet_placed',
  BET_SETTLED: 'bet_settled',
  GAME_UPDATED: 'game_updated',
  ALERT_CREATED: 'alert_created',
  BONUS_AWARDED: 'bonus_awarded',
  JACKPOT_WON: 'jackpot_won',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark'],
  STORAGE_KEY: 'theme_preference',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SUCCESS: '#059669',
  GRADIENT: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'],
};

// Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
  JSON: 'json',
};

// Report Types
export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

// Gaming Limits
export const GAMING_LIMITS = {
  DEPOSIT: {
    DAILY: 'daily_deposit_limit',
    WEEKLY: 'weekly_deposit_limit',
    MONTHLY: 'monthly_deposit_limit',
  },
  BET: {
    SINGLE: 'single_bet_limit',
    DAILY: 'daily_bet_limit',
    WEEKLY: 'weekly_bet_limit',
    MONTHLY: 'monthly_bet_limit',
  },
  LOSS: {
    DAILY: 'daily_loss_limit',
    WEEKLY: 'weekly_loss_limit',
    MONTHLY: 'monthly_loss_limit',
  },
  SESSION: {
    TIME: 'session_time_limit',
    REMINDER: 'session_reminder_interval',
  },
};

// Responsible Gaming
export const RESPONSIBLE_GAMING = {
  SELF_EXCLUSION: {
    PERIODS: [7, 30, 90, 180, 365], // days
    PERMANENT: 'permanent',
  },
  COOLING_OFF: {
    PERIODS: [1, 7, 30], // days
  },
  REALITY_CHECK: {
    INTERVALS: [30, 60, 120, 180], // minutes
  },
};

// System Status
export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  MAINTENANCE: 'maintenance',
  DEGRADED: 'degraded',
  OUTAGE: 'outage',
};

// Feature Flags
export const FEATURE_FLAGS = {
  LIVE_CHAT: 'live_chat_enabled',
  CRYPTO_PAYMENTS: 'crypto_payments_enabled',
  SPORTS_BETTING: 'sports_betting_enabled',
  LIVE_CASINO: 'live_casino_enabled',
  MOBILE_APP: 'mobile_app_enabled',
  REFERRAL_PROGRAM: 'referral_program_enabled',
};

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  GAME_UNAVAILABLE: 'GAME_UNAVAILABLE',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  LOGOUT: 'Successfully logged out',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  TRANSACTION_COMPLETED: 'Transaction completed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  BONUS_AWARDED: 'Bonus awarded successfully',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred',
  NETWORK: 'Network connection error',
  TIMEOUT: 'Request timeout',
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCOUNT_LOCKED: 'Account is locked',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  VALIDATION_FAILED: 'Validation failed',
  FILE_TOO_LARGE: 'File size exceeds limit',
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type',
};

// Default Values
export const DEFAULTS = {
  CURRENCY: CURRENCIES.USD,
  LANGUAGE: LANGUAGES.EN,
  TIMEZONE: TIME_ZONES.UTC,
  THEME: THEME_CONFIG.DEFAULT_THEME,
  PAGE_SIZE: PAGINATION.DEFAULT_PAGE_SIZE,
  DATE_FORMAT: DATE_FORMATS.SHORT,
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
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
  FEATURE_FLAGS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DEFAULTS,
}; 