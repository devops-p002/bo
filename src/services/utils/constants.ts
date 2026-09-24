// Constants for gaming platform
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile'
  },
  USERS: {
    BASE: '/users',
    SEARCH: '/users/search',
    EXPORT: '/users/export',
    BULK: '/users/bulk'
  },
  PAYMENTS: {
    BASE: '/payments',
    DEPOSITS: '/payments/deposits',
    WITHDRAWALS: '/payments/withdrawals',
    METHODS: '/payments/methods',
    TRANSACTIONS: '/payments/transactions',
    BONUSES: '/payments/bonuses',
    COMMISSIONS: '/payments/commissions'
  },
  GAMES: {
    BASE: '/games',
    CATEGORIES: '/games/categories',
    PROVIDERS: '/games/providers',
    BETS: '/games/bets',
    LIMITS: '/games/limits',
    JACKPOTS: '/games/jackpots',
    TOURNAMENTS: '/games/tournaments'
  }
};

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPORT: 'support',
  AGENT: 'agent',
  VIEWER: 'viewer'
};

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified'
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET: 'bet',
  WIN: 'win',
  BONUS: 'bonus',
  COMMISSION: 'commission',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment'
};

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  CRYPTOCURRENCY: 'cryptocurrency',
  PREPAID_CARD: 'prepaid_card'
};

export const GAME_CATEGORIES = {
  SLOTS: 'slots',
  TABLE_GAMES: 'table_games',
  LIVE_CASINO: 'live_casino',
  SPORTS_BETTING: 'sports_betting',
  POKER: 'poker',
  BINGO: 'bingo',
  LOTTERY: 'lottery',
  VIRTUAL_SPORTS: 'virtual_sports'
};

export const GAME_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  COMING_SOON: 'coming_soon',
  DEPRECATED: 'deprecated'
};

export const BET_STATUSES = {
  PENDING: 'pending',
  SETTLED: 'settled',
  VOIDED: 'voided',
  CANCELLED: 'cancelled'
};

export const BONUS_TYPES = {
  WELCOME: 'welcome',
  DEPOSIT: 'deposit',
  NO_DEPOSIT: 'no_deposit',
  FREE_SPINS: 'free_spins',
  CASHBACK: 'cashback',
  RELOAD: 'reload',
  VIP: 'vip',
  REFERRAL: 'referral'
};

export const BONUS_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const VIP_LEVELS = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
  DIAMOND: 4,
  VIP: 5
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const DOCUMENT_TYPES = {
  ID_CARD: 'id_card',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
  PROOF_OF_ADDRESS: 'proof_of_address'
};

export const DOCUMENT_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

export const ALERT_TYPES = {
  FRAUD: 'fraud',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  HIGH_ROLLER: 'high_roller',
  MULTIPLE_ACCOUNTS: 'multiple_accounts',
  UNUSUAL_BETTING: 'unusual_betting',
  PAYMENT_ISSUE: 'payment_issue'
};

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  JPY: 'JPY',
  BTC: 'BTC',
  ETH: 'ETH'
};

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
  KO: 'ko'
};

export const TIMEZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney'
};

export const DATE_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  NUMERIC: 'numeric'
};

export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-()]+$/
  },
  BET_AMOUNT: {
    MIN: 0.01,
    MAX: 10000
  },
  WITHDRAWAL_AMOUNT: {
    MIN: 10,
    MAX: 50000
  }
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DASHBOARD_STATS: 'dashboard_stats',
  GAME_LIST: 'game_list',
  PAYMENT_METHODS: 'payment_methods',
  EXCHANGE_RATES: 'exchange_rates',
  SYSTEM_CONFIG: 'system_config'
};

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NEW_MESSAGE: 'new_message',
  NOTIFICATION: 'notification',
  BALANCE_UPDATE: 'balance_update',
  BET_PLACED: 'bet_placed',
  BET_SETTLED: 'bet_settled',
  JACKPOT_UPDATE: 'jackpot_update',
  SYSTEM_ALERT: 'system_alert'
};

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Users
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  SUSPEND_USER: 'suspend_user',
  
  // Payments
  VIEW_PAYMENTS: 'view_payments',
  APPROVE_DEPOSITS: 'approve_deposits',
  APPROVE_WITHDRAWALS: 'approve_withdrawals',
  MANAGE_PAYMENT_METHODS: 'manage_payment_methods',
  
  // Games
  VIEW_GAMES: 'view_games',
  MANAGE_GAMES: 'manage_games',
  VIEW_BETS: 'view_bets',
  SETTLE_BETS: 'settle_bets',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_STAFF: 'manage_staff',
  
  // Risk Management
  VIEW_RISK: 'view_risk',
  MANAGE_RISK: 'manage_risk',
  
  // Marketing
  VIEW_MARKETING: 'view_marketing',
  MANAGE_BONUSES: 'manage_bonuses',
  MANAGE_CAMPAIGNS: 'manage_campaigns'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.SUSPEND_USER,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.APPROVE_DEPOSITS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.MANAGE_GAMES,
    PERMISSIONS.VIEW_BETS,
    PERMISSIONS.SETTLE_BETS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_RISK,
    PERMISSIONS.MANAGE_RISK,
    PERMISSIONS.VIEW_MARKETING,
    PERMISSIONS.MANAGE_BONUSES
  ],
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.APPROVE_DEPOSITS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.VIEW_BETS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_RISK,
    PERMISSIONS.VIEW_MARKETING
  ],
  [USER_ROLES.SUPPORT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.VIEW_BETS
  ],
  [USER_ROLES.AGENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_GAMES
  ],
  [USER_ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD
  ]
};

export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SECONDARY: '#6B7280',
  LIGHT: '#F3F4F6',
  DARK: '#1F2937'
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter'
};

export const TABLE_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  SUSPEND: 'suspend',
  ACTIVATE: 'activate',
  EXPORT: 'export'
};

export const MODAL_TYPES = {
  CONFIRM: 'confirm',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FORM: 'form'
};

export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right'
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// Gaming specific constants
export const GAME_PROVIDERS = {
  NETENT: 'netent',
  MICROGAMING: 'microgaming',
  PLAYTECH: 'playtech',
  EVOLUTION: 'evolution',
  PRAGMATIC_PLAY: 'pragmatic_play',
  YGGDRASIL: 'yggdrasil',
  QUICKSPIN: 'quickspin',
  RED_TIGER: 'red_tiger'
};

export const VOLATILITY_LEVELS = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5
};

export const RTP_RANGES = {
  LOW: { min: 85, max: 92 },
  MEDIUM: { min: 92, max: 96 },
  HIGH: { min: 96, max: 99 }
};

export const JACKPOT_TYPES = {
  FIXED: 'fixed',
  PROGRESSIVE: 'progressive',
  DAILY: 'daily',
  HOURLY: 'hourly'
};

export const TOURNAMENT_TYPES = {
  SLOTS: 'slots',
  POKER: 'poker',
  BLACKJACK: 'blackjack',
  ROULETTE: 'roulette'
};

export const TOURNAMENT_STATUSES = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
};

// Export all constants as a single object for convenience
export default {
  API_ENDPOINTS,
  USER_ROLES,
  USER_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_METHODS,
  GAME_CATEGORIES,
  GAME_STATUSES,
  BET_STATUSES,
  BONUS_TYPES,
  BONUS_STATUSES,
  VIP_LEVELS,
  RISK_LEVELS,
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  NOTIFICATION_TYPES,
  ALERT_TYPES,
  CURRENCIES,
  LANGUAGES,
  TIMEZONES,
  DATE_FORMATS,
  TIME_PERIODS,
  PAGINATION,
  VALIDATION_RULES,
  FILE_UPLOAD,
  CACHE_KEYS,
  CACHE_TTL,
  HTTP_STATUS,
  WEBSOCKET_EVENTS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  CHART_COLORS,
  CHART_TYPES,
  TABLE_ACTIONS,
  MODAL_TYPES,
  TOAST_POSITIONS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  Z_INDEX,
  GAME_PROVIDERS,
  VOLATILITY_LEVELS,
  RTP_RANGES,
  JACKPOT_TYPES,
  TOURNAMENT_TYPES,
  TOURNAMENT_STATUSES
}; 