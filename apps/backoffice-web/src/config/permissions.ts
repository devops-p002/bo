// Permissions Configuration for Aura Gaming Platform

// Permission Categories
export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  GAMES: 'games',
  BETS: 'bets',
  BONUSES: 'bonuses',
  MARKETING: 'marketing',
  REPORTS: 'reports',
  CRM: 'crm',
  RISK: 'risk',
  REFERRAL: 'referral',
  SETTINGS: 'settings',
  SYSTEM: 'system',
};

// All Available Permissions
export const PERMISSIONS = {
  // Dashboard Permissions
  'dashboard.view': {
    category: PERMISSION_CATEGORIES.DASHBOARD,
    name: 'View Dashboard',
    description: 'Access to main dashboard and overview statistics',
  },
  'dashboard.stats.view': {
    category: PERMISSION_CATEGORIES.DASHBOARD,
    name: 'View Dashboard Statistics',
    description: 'View detailed dashboard statistics and metrics',
  },

  // User Management Permissions
  'users.view': {
    category: PERMISSION_CATEGORIES.USERS,
    name: 'View Users',
    description: 'View admin users and staff members',
  },
  'users.create': {
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Create Users',
    description: 'Create new admin users and staff members',
  },
  'users.edit': {
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Edit Users',
    description: 'Edit admin users and staff member details',
  },
  'users.delete': {
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Delete Users',
    description: 'Delete admin users and staff members',
  },
  'users.permissions.manage': {
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Manage User Permissions',
    description: 'Assign and modify user permissions and roles',
  },

  // Member Management Permissions
  'members.view': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'View Members',
    description: 'View player accounts and member profiles',
  },
  'members.create': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Create Members',
    description: 'Create new player accounts',
  },
  'members.edit': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Edit Members',
    description: 'Edit player account details and profiles',
  },
  'members.suspend': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Suspend Members',
    description: 'Suspend and unsuspend player accounts',
  },
  'members.ban': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Ban Members',
    description: 'Ban and unban player accounts',
  },
  'members.kyc.manage': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Manage KYC',
    description: 'Review and approve KYC documents',
  },
  'members.limits.manage': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Manage Member Limits',
    description: 'Set and modify player gaming limits',
  },
  'members.balance.adjust': {
    category: PERMISSION_CATEGORIES.MEMBERS,
    name: 'Adjust Member Balance',
    description: 'Make manual balance adjustments',
  },

  // Payment Permissions
  'payments.view': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'View Payments',
    description: 'View payment transactions and history',
  },
  'payments.deposits.manage': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'Manage Deposits',
    description: 'Process and manage deposit transactions',
  },
  'payments.withdrawals.manage': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'Manage Withdrawals',
    description: 'Process and manage withdrawal transactions',
  },
  'payments.approve': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'Approve Payments',
    description: 'Approve pending payment transactions',
  },
  'payments.reject': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'Reject Payments',
    description: 'Reject payment transactions',
  },
  'payments.methods.manage': {
    category: PERMISSION_CATEGORIES.PAYMENTS,
    name: 'Manage Payment Methods',
    description: 'Configure payment methods and providers',
  },

  // Game Management Permissions
  'games.view': {
    category: PERMISSION_CATEGORIES.GAMES,
    name: 'View Games',
    description: 'View game catalog and game details',
  },
  'games.manage': {
    category: PERMISSION_CATEGORIES.GAMES,
    name: 'Manage Games',
    description: 'Add, edit, and configure games',
  },
  'games.enable': {
    category: PERMISSION_CATEGORIES.GAMES,
    name: 'Enable/Disable Games',
    description: 'Enable and disable games for players',
  },
  'games.jackpots.manage': {
    category: PERMISSION_CATEGORIES.GAMES,
    name: 'Manage Jackpots',
    description: 'Configure and manage progressive jackpots',
  },

  // Betting Permissions
  'bets.view': {
    category: PERMISSION_CATEGORIES.BETS,
    name: 'View Bets',
    description: 'View betting history and bet details',
  },
  'bets.settle': {
    category: PERMISSION_CATEGORIES.BETS,
    name: 'Settle Bets',
    description: 'Manually settle bets and adjust outcomes',
  },
  'bets.cancel': {
    category: PERMISSION_CATEGORIES.BETS,
    name: 'Cancel Bets',
    description: 'Cancel bets and process refunds',
  },
  'bets.limits.manage': {
    category: PERMISSION_CATEGORIES.BETS,
    name: 'Manage Bet Limits',
    description: 'Set and modify betting limits',
  },

  // Bonus Management Permissions
  'bonuses.view': {
    category: PERMISSION_CATEGORIES.BONUSES,
    name: 'View Bonuses',
    description: 'View bonus campaigns and player bonuses',
  },
  'bonuses.create': {
    category: PERMISSION_CATEGORIES.BONUSES,
    name: 'Create Bonuses',
    description: 'Create new bonus campaigns and templates',
  },
  'bonuses.edit': {
    category: PERMISSION_CATEGORIES.BONUSES,
    name: 'Edit Bonuses',
    description: 'Edit bonus campaigns and templates',
  },
  'bonuses.award': {
    category: PERMISSION_CATEGORIES.BONUSES,
    name: 'Award Bonuses',
    description: 'Manually award bonuses to players',
  },
  'bonuses.cancel': {
    category: PERMISSION_CATEGORIES.BONUSES,
    name: 'Cancel Bonuses',
    description: 'Cancel active bonuses',
  },

  // Marketing Permissions
  'marketing.view': {
    category: PERMISSION_CATEGORIES.MARKETING,
    name: 'View Marketing',
    description: 'View marketing campaigns and promotions',
  },
  'marketing.campaigns.manage': {
    category: PERMISSION_CATEGORIES.MARKETING,
    name: 'Manage Campaigns',
    description: 'Create and manage marketing campaigns',
  },
  'marketing.promotions.manage': {
    category: PERMISSION_CATEGORIES.MARKETING,
    name: 'Manage Promotions',
    description: 'Create and manage promotional offers',
  },
  'marketing.bonus.manage': {
    category: PERMISSION_CATEGORIES.MARKETING,
    name: 'Manage Marketing Bonuses',
    description: 'Create and manage marketing bonus templates',
  },

  // Reporting Permissions
  'reports.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Reports',
    description: 'Access reporting dashboard and basic reports',
  },
  'reports.financial.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Financial Reports',
    description: 'View financial and revenue reports',
  },
  'reports.player.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Player Reports',
    description: 'View player activity and behavior reports',
  },
  'reports.bonus.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Bonus Reports',
    description: 'View bonus usage and performance reports',
  },
  'reports.payment.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Payment Reports',
    description: 'View payment transaction reports',
  },
  'reports.turnover.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Turnover Reports',
    description: 'View player turnover and GGR reports',
  },
  'reports.bet.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Bet Reports',
    description: 'View betting statistics and reports',
  },
  'reports.daily.view': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Daily Reports',
    description: 'View daily performance reports',
  },
  'reports.export': {
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'Export Reports',
    description: 'Export reports in various formats',
  },

  // CRM Permissions
  'crm.view': {
    category: PERMISSION_CATEGORIES.CRM,
    name: 'View CRM',
    description: 'Access CRM dashboard and customer data',
  },
  'crm.messages.manage': {
    category: PERMISSION_CATEGORIES.CRM,
    name: 'Manage Messages',
    description: 'Send and manage customer messages',
  },
  'crm.tickets.manage': {
    category: PERMISSION_CATEGORIES.CRM,
    name: 'Manage Support Tickets',
    description: 'Handle customer support tickets',
  },
  'crm.chat.access': {
    category: PERMISSION_CATEGORIES.CRM,
    name: 'Access Live Chat',
    description: 'Access live chat with customers',
  },

  // Risk Management Permissions
  'risk.view': {
    category: PERMISSION_CATEGORIES.RISK,
    name: 'View Risk Management',
    description: 'Access risk management dashboard',
  },
  'risk.alerts.manage': {
    category: PERMISSION_CATEGORIES.RISK,
    name: 'Manage Risk Alerts',
    description: 'Review and manage risk alerts',
  },
  'risk.analysis.view': {
    category: PERMISSION_CATEGORIES.RISK,
    name: 'View Risk Analysis',
    description: 'View detailed risk analysis and reports',
  },
  'risk.aml.manage': {
    category: PERMISSION_CATEGORIES.RISK,
    name: 'Manage AML',
    description: 'Handle anti-money laundering procedures',
  },
  'risk.fraud.investigate': {
    category: PERMISSION_CATEGORIES.RISK,
    name: 'Investigate Fraud',
    description: 'Investigate suspected fraudulent activities',
  },

  // Referral Program Permissions
  'referral.view': {
    category: PERMISSION_CATEGORIES.REFERRAL,
    name: 'View Referral Program',
    description: 'View referral program data and statistics',
  },
  'referral.manage': {
    category: PERMISSION_CATEGORIES.REFERRAL,
    name: 'Manage Referral Program',
    description: 'Configure referral program settings',
  },
  'referral.commissions.manage': {
    category: PERMISSION_CATEGORIES.REFERRAL,
    name: 'Manage Commissions',
    description: 'Process and manage referral commissions',
  },

  // Settings Permissions
  'settings.view': {
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'View Settings',
    description: 'View system settings and configuration',
  },
  'settings.general.manage': {
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'Manage General Settings',
    description: 'Modify general system settings',
  },
  'settings.security.manage': {
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'Manage Security Settings',
    description: 'Configure security and authentication settings',
  },
  'settings.payment.manage': {
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'Manage Payment Settings',
    description: 'Configure payment processing settings',
  },
  'settings.game.manage': {
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'Manage Game Settings',
    description: 'Configure game-related settings',
  },

  // System Administration Permissions
  'system.logs.view': {
    category: PERMISSION_CATEGORIES.SYSTEM,
    name: 'View System Logs',
    description: 'Access system logs and audit trails',
  },
  'system.maintenance.manage': {
    category: PERMISSION_CATEGORIES.SYSTEM,
    name: 'Manage System Maintenance',
    description: 'Schedule and manage system maintenance',
  },
  'system.backup.manage': {
    category: PERMISSION_CATEGORIES.SYSTEM,
    name: 'Manage System Backups',
    description: 'Create and manage system backups',
  },
  'system.monitoring.view': {
    category: PERMISSION_CATEGORIES.SYSTEM,
    name: 'View System Monitoring',
    description: 'Access system monitoring and performance metrics',
  },
};

// Role-based Permission Sets
export const ROLE_PERMISSIONS = {
  super_admin: Object.keys(PERMISSIONS), // All permissions
  
  admin: [
    // Dashboard
    'dashboard.view',
    'dashboard.stats.view',
    
    // Users (limited)
    'users.view',
    'users.create',
    'users.edit',
    
    // Members
    'members.view',
    'members.create',
    'members.edit',
    'members.suspend',
    'members.kyc.manage',
    'members.limits.manage',
    'members.balance.adjust',
    
    // Payments
    'payments.view',
    'payments.deposits.manage',
    'payments.withdrawals.manage',
    'payments.approve',
    'payments.reject',
    
    // Games
    'games.view',
    'games.manage',
    'games.enable',
    
    // Bets
    'bets.view',
    'bets.settle',
    'bets.cancel',
    'bets.limits.manage',
    
    // Bonuses
    'bonuses.view',
    'bonuses.create',
    'bonuses.edit',
    'bonuses.award',
    'bonuses.cancel',
    
    // Marketing
    'marketing.view',
    'marketing.campaigns.manage',
    'marketing.promotions.manage',
    'marketing.bonus.manage',
    
    // Reports
    'reports.view',
    'reports.financial.view',
    'reports.player.view',
    'reports.bonus.view',
    'reports.payment.view',
    'reports.turnover.view',
    'reports.bet.view',
    'reports.daily.view',
    'reports.export',
    
    // CRM
    'crm.view',
    'crm.messages.manage',
    'crm.tickets.manage',
    'crm.chat.access',
    
    // Risk
    'risk.view',
    'risk.alerts.manage',
    'risk.analysis.view',
    'risk.aml.manage',
    'risk.fraud.investigate',
    
    // Referral
    'referral.view',
    'referral.manage',
    'referral.commissions.manage',
    
    // Settings (limited)
    'settings.view',
    'settings.general.manage',
  ],
  
  manager: [
    // Dashboard
    'dashboard.view',
    'dashboard.stats.view',
    
    // Members
    'members.view',
    'members.edit',
    'members.suspend',
    'members.kyc.manage',
    'members.limits.manage',
    
    // Payments
    'payments.view',
    'payments.deposits.manage',
    'payments.withdrawals.manage',
    'payments.approve',
    
    // Games
    'games.view',
    'games.enable',
    
    // Bets
    'bets.view',
    'bets.settle',
    'bets.limits.manage',
    
    // Bonuses
    'bonuses.view',
    'bonuses.award',
    
    // Marketing
    'marketing.view',
    'marketing.campaigns.manage',
    'marketing.promotions.manage',
    
    // Reports
    'reports.view',
    'reports.player.view',
    'reports.bonus.view',
    'reports.payment.view',
    'reports.turnover.view',
    'reports.bet.view',
    'reports.daily.view',
    'reports.export',
    
    // CRM
    'crm.view',
    'crm.messages.manage',
    'crm.tickets.manage',
    'crm.chat.access',
    
    // Risk
    'risk.view',
    'risk.alerts.manage',
    'risk.analysis.view',
    
    // Referral
    'referral.view',
    'referral.commissions.manage',
  ],
  
  operator: [
    // Dashboard
    'dashboard.view',
    
    // Members
    'members.view',
    'members.edit',
    'members.kyc.manage',
    
    // Payments
    'payments.view',
    'payments.deposits.manage',
    'payments.withdrawals.manage',
    
    // Games
    'games.view',
    
    // Bets
    'bets.view',
    'bets.settle',
    
    // Bonuses
    'bonuses.view',
    'bonuses.award',
    
    // Reports
    'reports.view',
    'reports.player.view',
    'reports.payment.view',
    'reports.bet.view',
    'reports.daily.view',
    
    // CRM
    'crm.view',
    'crm.messages.manage',
    'crm.tickets.manage',
    'crm.chat.access',
    
    // Risk
    'risk.view',
    'risk.alerts.manage',
  ],
  
  support: [
    // Dashboard
    'dashboard.view',
    
    // Members
    'members.view',
    'members.kyc.manage',
    
    // Payments
    'payments.view',
    
    // Games
    'games.view',
    
    // Bets
    'bets.view',
    
    // Bonuses
    'bonuses.view',
    
    // CRM
    'crm.view',
    'crm.messages.manage',
    'crm.tickets.manage',
    'crm.chat.access',
  ],
  
  viewer: [
    // Dashboard
    'dashboard.view',
    
    // Members
    'members.view',
    
    // Payments
    'payments.view',
    
    // Games
    'games.view',
    
    // Bets
    'bets.view',
    
    // Bonuses
    'bonuses.view',
    
    // Reports
    'reports.view',
    'reports.player.view',
    'reports.payment.view',
    'reports.bet.view',
    'reports.daily.view',
    
    // CRM
    'crm.view',
  ],
};

// Permission Utilities
export const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

export const getPermissionsByCategory = (category) => {
  return Object.entries(PERMISSIONS)
    .filter(([, permission]) => permission.category === category)
    .reduce((acc, [key, permission]) => {
      acc[key] = permission;
      return acc;
    }, {});
};

export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export const getPermissionDetails = (permissionKey) => {
  return PERMISSIONS[permissionKey];
};

export const validatePermissions = (userPermissions) => {
  return userPermissions.filter(permission => 
    Object.keys(PERMISSIONS).includes(permission)
  );
};

export const getPermissionHierarchy = () => {
  const hierarchy = {};
  
  Object.values(PERMISSION_CATEGORIES).forEach(category => {
    hierarchy[category] = getPermissionsByCategory(category);
  });
  
  return hierarchy;
};

export default {
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
  getPermissionHierarchy,
}; 