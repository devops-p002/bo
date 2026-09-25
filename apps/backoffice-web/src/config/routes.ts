// Routes Configuration for Aura Gaming Platform
import { lazy } from 'react';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard/DashboardPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));

// Marketing
const MarketingPage = lazy(() => import('../pages/Marketing/MarketingPage'));
const BonusTemplatePage = lazy(() => import('../pages/Marketing/BonusTemplatePage'));
const IssueBonusPage = lazy(() => import('../pages/Marketing/IssueBonusPage'));

// Reports
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const BonusReportPage = lazy(() => import('../pages/Reports/BonusReportPage'));
const PaymentReportPage = lazy(() => import('../pages/Reports/PaymentReportPage'));
const TurnoverReportPage = lazy(() => import('../pages/Reports/TurnoverReportPage'));
const BetReportPage = lazy(() => import('../pages/Reports/BetReportPage'));
const DailyReportPage = lazy(() => import('../pages/Reports/DailyReportPage'));

// CRM
const CRMPage = lazy(() => import('../pages/CRM/CRMPage'));

// Members
const MemberDetailsPage = lazy(() => import('../pages/Members/MemberDetailsPage'));
const MemberSearchPage = lazy(() => import('../pages/Members/MemberSearch'));
const MemberGroupPage = lazy(() => import('../pages/Members/MemberGroupPage'));
const MemberVIPPage = lazy(() => import('../pages/Members/MemberVIPPage'));
const MemberMassUpdatePage = lazy(() => import('../pages/Members/MemberMassUpdatePage'));
const MemberProfile = lazy(() => import('../components/features/Members/components/MemberProfile'));

// Payments
const PaymentsPage = lazy(() => import('../pages/Payments/PaymentsPage'));
const PaymentDepositPage = lazy(() => import('../pages/Payments/PaymentDepositPage'));

// CMS
const CMSGamesPage = lazy(() => import('../pages/CMS/CMSGamesPage'));

// Affiliate
const AffiliateOverviewPage = lazy(() => import('../pages/Affiliate/AffiliateOverviewPage'));

// Risk Management (single tabbed page backs all /risk* routes)
const RiskPage = lazy(() => import('../pages/Risk/RiskPage'));

// Bets (single tabbed page backs all /bets* routes)
const BetsPage = lazy(() => import('../components/features/Bets/pages/BetsPage'));

// Referral
const ReferralPage = lazy(() => import('../pages/Referral/ReferralPage'));

// Settings
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));



// Route definitions
export const routes = [
  // Authentication Routes
  {
    path: '/login',
    component: LoginPage,
    isPublic: true,
    title: 'Login',
    description: 'Admin login page',
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage,
    isPublic: true,
    title: 'Forgot Password',
    description: 'Password recovery page',
  },

  // Dashboard
  {
    path: '/',
    component: Dashboard,
    exact: true,
    title: 'Dashboard',
    description: 'Main admin dashboard',
    permissions: ['dashboard.view'],
    breadcrumb: 'Dashboard',
  },
  {
    path: '/dashboard',
    component: Dashboard,
    title: 'Dashboard',
    description: 'Main admin dashboard',
    permissions: ['dashboard.view'],
    breadcrumb: 'Dashboard',
  },

  // Marketing Routes
  {
    path: '/marketing',
    component: MarketingPage,
    exact: true,
    title: 'Marketing',
    description: 'Marketing campaigns and promotions',
    permissions: ['marketing.view'],
    breadcrumb: 'Marketing',
  },
  {
    path: '/marketing/bonus-templates',
    component: BonusTemplatePage,
    title: 'Bonus Templates',
    description: 'Manage bonus templates',
    permissions: ['marketing.bonus.manage'],
    breadcrumb: 'Marketing > Bonus Templates',
  },
  {
    path: '/marketing/issue-bonus',
    component: IssueBonusPage,
    title: 'Issue Bonus',
    description: 'Issue bonuses to players',
    permissions: ['marketing.bonus.issue'],
    breadcrumb: 'Marketing > Issue Bonus',
  },

  // Reports Routes
  {
    path: '/reports',
    component: ReportsPage,
    exact: true,
    title: 'Reports',
    description: 'Analytics and reporting dashboard',
    permissions: ['reports.view'],
    breadcrumb: 'Reports',
  },
  {
    path: '/reports/bonus',
    component: BonusReportPage,
    title: 'Bonus Report',
    description: 'Bonus usage and performance reports',
    permissions: ['reports.bonus.view'],
    breadcrumb: 'Reports > Bonus Report',
  },
  {
    path: '/reports/payment',
    component: PaymentReportPage,
    title: 'Payment Report',
    description: 'Payment transaction reports',
    permissions: ['reports.payment.view'],
    breadcrumb: 'Reports > Payment Report',
  },
  {
    path: '/reports/turnover',
    component: TurnoverReportPage,
    title: 'Turnover Report',
    description: 'Player turnover and activity reports',
    permissions: ['reports.turnover.view'],
    breadcrumb: 'Reports > Turnover Report',
  },
  {
    path: '/reports/bet',
    component: BetReportPage,
    title: 'Bet Report',
    description: 'Betting activity and statistics',
    permissions: ['reports.bet.view'],
    breadcrumb: 'Reports > Bet Report',
  },
  {
    path: '/reports/daily',
    component: DailyReportPage,
    title: 'Daily Report',
    description: 'Daily performance summary',
    permissions: ['reports.daily.view'],
    breadcrumb: 'Reports > Daily Report',
  },

  // CRM Routes
  {
    path: '/crm',
    component: CRMPage,
    title: 'CRM',
    description: 'Customer relationship management',
    permissions: ['crm.view'],
    breadcrumb: 'CRM',
  },

  // Members Routes
  {
    path: '/members',
    component: MemberSearchPage,
    exact: true,
    title: 'Members',
    description: 'Member management and profiles',
    permissions: ['members.view'],
    breadcrumb: 'Members',
  },
  {
    path: '/members/search',
    component: MemberSearchPage,
    title: 'Member Search',
    description: 'Search and filter members with advanced options',
    permissions: ['members.view'],
    breadcrumb: 'Members > Search',
  },
  {
    path: '/members/group',
    component: MemberGroupPage,
    title: 'Member Groups',
    description: 'Organize and manage member groups',
    permissions: ['members.group.manage'],
    breadcrumb: 'Members > Groups',
  },
  {
    path: '/members/vip',
    component: MemberVIPPage,
    title: 'VIP Management',
    description: 'Manage VIP levels and benefits',
    permissions: ['members.vip.manage'],
    breadcrumb: 'Members > VIP',
  },
  {
    path: '/members/mass-update',
    component: MemberMassUpdatePage,
    title: 'Mass Update',
    description: 'Perform bulk operations on members',
    permissions: ['members.mass.update'],
    breadcrumb: 'Members > Mass Update',
  },
  {
    path: '/members/:id',
    component: MemberDetailsPage,
    title: 'Member Details',
    description: 'Individual member profile and details',
    permissions: ['members.view'],
    breadcrumb: 'Members > Member Details',
  },
  {
    path: '/members/profile/:id',
    component: MemberProfile,
    title: 'Member Profile',
    description: 'Member profile view from search',
    permissions: ['members.view'],
    breadcrumb: 'Members > Profile',
  },

  // Payments Routes
  {
    path: '/payments',
    component: PaymentsPage,
    title: 'Payments',
    description: 'Payment processing and transaction management',
    permissions: ['payments.view'],
    breadcrumb: 'Payments',
  },
  {
    path: '/payments/deposit',
    component: PaymentDepositPage,
    title: 'Deposit Management',
    description: 'Monitor and manage member deposits',
    permissions: ['payments.deposit.view'],
    breadcrumb: 'Payments > Deposit',
  },

  // Risk Management Routes
  {
    path: '/risk',
    component: RiskPage,
    title: 'Risk Management',
    description: 'Risk assessment and fraud detection',
    permissions: ['risk.view'],
    breadcrumb: 'Risk Management',
  },
  {
    path: '/risk/member-trace',
    component: RiskPage,
    title: 'Member Trace',
    description: 'Track and monitor member activities',
    permissions: ['risk.trace.view'],
    breadcrumb: 'Risk > Member Trace',
  },
  {
    path: '/risk/member-analysis',
    component: RiskPage,
    title: 'Member Analysis Report',
    description: 'Detailed member behavior analysis',
    permissions: ['risk.analysis.view'],
    breadcrumb: 'Risk > Member Analysis',
  },
  {
    path: '/risk/high-roller-monitoring',
    component: RiskPage,
    title: 'High Roller Monitoring',
    description: 'Monitor high-value player activities',
    permissions: ['risk.highroller.view'],
    breadcrumb: 'Risk > High Roller Monitoring',
  },
  {
    path: '/risk/verification',
    component: RiskPage,
    title: 'Verification',
    description: 'Review player KYC/identity verification submissions',
    permissions: ['risk.verification.view'],
    breadcrumb: 'Risk > Verification',
  },

  // Bets Routes
  {
    path: '/bets',
    component: BetsPage,
    title: 'Bets',
    description: 'Betting management and analytics',
    permissions: ['bets.view'],
    breadcrumb: 'Bets',
  },
  {
    path: '/bets/limit-set',
    component: BetsPage,
    title: 'Bet Limit Set',
    description: 'Configure betting limits and restrictions',
    permissions: ['bets.limits.manage'],
    breadcrumb: 'Bets > Bet Limit Set',
  },
  {
    path: '/bets/settlement',
    component: BetsPage,
    title: 'Bet Settlement',
    description: 'Manage bet settlements and payouts',
    permissions: ['bets.settlement.manage'],
    breadcrumb: 'Bets > Bet Settlement',
  },
  {
    path: '/bets/patterns',
    component: BetsPage,
    title: 'Betting Patterns',
    description: 'Analyze member betting patterns',
    permissions: ['bets.patterns.view'],
    breadcrumb: 'Bets > Betting Patterns',
  },
  {
    path: '/bets/pending',
    component: BetsPage,
    title: 'Pending Bet List',
    description: 'View and manage pending bets',
    permissions: ['bets.pending.view'],
    breadcrumb: 'Bets > Pending Bet List',
  },

  // Referral Routes
  {
    path: '/referral',
    component: ReferralPage,
    title: 'Referral',
    description: 'Referral program management',
    permissions: ['referral.view'],
    breadcrumb: 'Referral',
  },

  // CMS Routes
  {
    path: '/cms/games',
    component: CMSGamesPage,
    title: 'Game Management',
    description: 'Manage games, providers, and categories',
    permissions: ['cms.games.manage'],
    breadcrumb: 'CMS > Games',
  },

  // Affiliate Routes
  {
    path: '/affiliate/overview',
    component: AffiliateOverviewPage,
    title: 'Affiliate Overview',
    description: 'Monitor affiliate performance and commissions',
    permissions: ['affiliate.view'],
    breadcrumb: 'Affiliate > Overview',
  },

  // Settings Routes
  {
    path: '/settings',
    component: SettingsPage,
    title: 'Settings',
    description: 'System settings and configuration',
    permissions: ['settings.view'],
    breadcrumb: 'Settings',
  },


];

// Navigation menu structure with permissions
export const navigationMenu = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    permissions: ['dashboard.view'],
  },
  {
    title: 'Member',
    path: '/members',
    icon: 'users',
    permissions: ['members.view'],
    children: [
      {
        title: 'Search',
        path: '/members/search',
        permissions: ['members.view'],
      },
      {
        title: 'Group',
        path: '/members/group',
        permissions: ['members.group.manage'],
      },
      {
        title: 'VIP',
        path: '/members/vip',
        permissions: ['members.vip.manage'],
      },
      {
        title: 'Mass Update',
        path: '/members/mass-update',
        permissions: ['members.mass.update'],
      },
    ],
  },
  {
    title: 'Payment',
    path: '/payments',
    icon: 'credit-card',
    permissions: ['payments.view'],
    children: [
      {
        title: 'Deposit',
        path: '/payments/deposit',
        permissions: ['payments.deposit.view'],
      },
      {
        title: 'Withdrawal',
        path: '/payments/withdrawal',
        permissions: ['payments.withdrawal.view'],
      },
      {
        title: 'Adjustment',
        path: '/payments/adjustment',
        permissions: ['payments.adjustment.manage'],
      },
      {
        title: 'Company Bank',
        path: '/payments/company-bank',
        permissions: ['payments.bank.manage'],
      },
      {
        title: 'Payment Gateway',
        path: '/payments/gateway',
        permissions: ['payments.gateway.manage'],
      },
      {
        title: 'Deposit Setting',
        path: '/payments/deposit-setting',
        permissions: ['payments.settings.manage'],
      },
      {
        title: 'Withdrawal Setting',
        path: '/payments/withdrawal-setting',
        permissions: ['payments.settings.manage'],
      },
      {
        title: 'Bank List',
        path: '/payments/bank-list',
        permissions: ['payments.bank.view'],
      },
    ],
  },
  {
    title: 'Risk',
    path: '/risk',
    icon: 'shield',
    permissions: ['risk.view'],
    children: [
      {
        title: 'Member Trace',
        path: '/risk/member-trace',
        permissions: ['risk.trace.view'],
      },
      {
        title: 'Member Analysis Report',
        path: '/risk/member-analysis',
        permissions: ['risk.analysis.view'],
      },
      {
        title: 'High Roller Monitoring',
        path: '/risk/high-roller-monitoring',
        permissions: ['risk.highroller.view'],
      },
      {
        title: 'Verification',
        path: '/risk/verification',
        permissions: ['risk.verification.view'],
      },
    ],
  },
  {
    title: 'Bets',
    path: '/bets',
    icon: 'trending-up',
    permissions: ['bets.view'],
    children: [
      {
        title: 'Bet Limit Set',
        path: '/bets/limit-set',
        permissions: ['bets.limits.manage'],
      },
      {
        title: 'Bet Settlement',
        path: '/bets/settlement',
        permissions: ['bets.settlement.manage'],
      },
      {
        title: 'Betting Patterns',
        path: '/bets/patterns',
        permissions: ['bets.patterns.view'],
      },
      {
        title: 'Pending Bet List',
        path: '/bets/pending',
        permissions: ['bets.pending.view'],
      },
    ],
  },
  {
    title: 'Marketing',
    path: '/marketing',
    icon: 'megaphone',
    permissions: ['marketing.view'],
    children: [
      {
        title: 'Bonus Template',
        path: '/marketing/bonus-templates',
        permissions: ['marketing.bonus.manage'],
      },
      {
        title: 'Issue Bonus',
        path: '/marketing/issue-bonus',
        permissions: ['marketing.bonus.issue'],
      },
      {
        title: 'Semi-Auto Bonus',
        path: '/marketing/semi-auto-bonus',
        permissions: ['marketing.bonus.auto'],
      },
    ],
  },
  {
    title: 'Report',
    path: '/reports',
    icon: 'bar-chart',
    permissions: ['reports.view'],
    children: [
      {
        title: 'Bonus',
        path: '/reports/bonus',
        permissions: ['reports.bonus.view'],
      },
      {
        title: 'Payment',
        path: '/reports/payment',
        permissions: ['reports.payment.view'],
      },
      {
        title: 'Turnover',
        path: '/reports/turnover',
        permissions: ['reports.turnover.view'],
      },
      {
        title: 'Bet',
        path: '/reports/bet',
        permissions: ['reports.bet.view'],
      },
      {
        title: 'Daily',
        path: '/reports/daily',
        permissions: ['reports.daily.view'],
      },
      {
        title: 'Vendor',
        path: '/reports/vendor',
        permissions: ['reports.vendor.view'],
      },
      {
        title: 'VIP Change',
        path: '/reports/vip-change',
        permissions: ['reports.vip.view'],
      },
      {
        title: 'Transfer',
        path: '/reports/transfer',
        permissions: ['reports.transfer.view'],
      },
      {
        title: 'Game',
        path: '/reports/game',
        permissions: ['reports.game.view'],
      },
      {
        title: 'VIP Point',
        path: '/reports/vip-point',
        permissions: ['reports.vip.view'],
      },
    ],
  },
  {
    title: 'CRM',
    path: '/crm',
    icon: 'message-circle',
    permissions: ['crm.view'],
    children: [
      {
        title: 'Message',
        path: '/crm/message',
        permissions: ['crm.message.manage'],
      },
      {
        title: 'Frontend Setting',
        path: '/crm/frontend-setting',
        permissions: ['crm.frontend.manage'],
      },
      {
        title: 'Customer Service',
        path: '/crm/customer-service',
        permissions: ['crm.service.manage'],
      },
      {
        title: 'Message Template',
        path: '/crm/message-template',
        permissions: ['crm.template.manage'],
      },
    ],
  },
  {
    title: 'CMS',
    path: '/cms',
    icon: 'layout',
    permissions: ['cms.view'],
    children: [
      {
        title: 'Games',
        path: '/cms/games',
        permissions: ['cms.games.manage'],
      },
      {
        title: 'Provider',
        path: '/cms/provider',
        permissions: ['cms.provider.manage'],
      },
      {
        title: 'Categories',
        path: '/cms/categories',
        permissions: ['cms.categories.manage'],
      },
    ],
  },
  {
    title: 'Setting',
    path: '/settings',
    icon: 'settings',
    permissions: ['settings.view'],
    children: [
      {
        title: 'Staff',
        path: '/settings/staff',
        permissions: ['settings.staff.manage'],
      },
      {
        title: 'Role',
        path: '/settings/role',
        permissions: ['settings.role.manage'],
      },
      {
        title: 'Notification',
        path: '/settings/notification',
        permissions: ['settings.notification.manage'],
      },
      {
        title: 'Remark Template',
        path: '/settings/remark-template',
        permissions: ['settings.template.manage'],
      },
    ],
  },
  {
    title: 'Affiliate',
    path: '/affiliate',
    icon: 'users-2',
    permissions: ['affiliate.view'],
    children: [
      {
        title: 'Overview',
        path: '/affiliate/overview',
        permissions: ['affiliate.view'],
      },
      {
        title: 'Search',
        path: '/affiliate/search',
        permissions: ['affiliate.view'],
      },
      {
        title: 'Performance',
        path: '/affiliate/performance',
        permissions: ['affiliate.performance.view'],
      },
      {
        title: 'Affiliate Domain',
        path: '/affiliate/domain',
        permissions: ['affiliate.domain.manage'],
      },
      {
        title: 'Pending Application',
        path: '/affiliate/pending',
        permissions: ['affiliate.application.manage'],
        badge: '2',
      },
      {
        title: 'Commission Structure',
        path: '/affiliate/commission',
        permissions: ['affiliate.commission.manage'],
      },
      {
        title: 'Finance',
        path: '/affiliate/finance',
        permissions: ['affiliate.finance.view'],
      },
    ],
  },
  {
    title: 'Referral',
    path: '/referral',
    icon: 'share-2',
    permissions: ['referral.view'],
    children: [
      {
        title: 'Commission Report',
        path: '/referral/commission',
        permissions: ['referral.commission.view'],
      },
      {
        title: 'Report',
        path: '/referral/report',
        permissions: ['referral.report.view'],
      },
    ],
  },
];

// Utility functions
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

export const getPublicRoutes = () => {
  return routes.filter(route => route.isPublic);
};

export const getProtectedRoutes = () => {
  return routes.filter(route => !route.isPublic);
};

export const getRoutesByPermission = (userPermissions) => {
  return routes.filter(route => {
    if (route.isPublic) return true;
    if (!route.permissions) return true;
    return route.permissions.some(permission => userPermissions.includes(permission));
  });
};

export const getNavigationByPermission = (userPermissions) => {
  return navigationMenu.filter(item => {
    if (!item.permissions) return true;
    const hasPermission = item.permissions.some(permission => userPermissions.includes(permission));
    
    if (hasPermission && item.children) {
      item.children = item.children.filter(child => {
        if (!child.permissions) return true;
        return child.permissions.some(permission => userPermissions.includes(permission));
      });
    }
    
    return hasPermission;
  });
};

export const generateBreadcrumb = (pathname) => {
  const route = getRouteByPath(pathname);
  if (route && route.breadcrumb) {
    return route.breadcrumb.split(' > ').map((crumb, index, array) => ({
      title: crumb,
      path: index === array.length - 1 ? pathname : '/', // Last item is current page
      isActive: index === array.length - 1,
    }));
  }
  return [];
};

export const requiresAuth = (path) => {
  const route = getRouteByPath(path);
  return route ? !route.isPublic : true;
};

export const requiresPermission = (path, userPermissions) => {
  const route = getRouteByPath(path);
  if (!route || route.isPublic || !route.permissions) return true;
  return route.permissions.some(permission => userPermissions.includes(permission));
};

// Route validation
export const validateRoute = (path, userPermissions = []) => {
  const route = getRouteByPath(path);
  
  if (!route) {
    return { valid: false, reason: 'Route not found' };
  }
  
  if (route.isPublic) {
    return { valid: true };
  }
  
  if (!route.permissions) {
    return { valid: true };
  }
  
  const hasPermission = route.permissions.some(permission => userPermissions.includes(permission));
  
  return {
    valid: hasPermission,
    reason: hasPermission ? null : 'Insufficient permissions',
    requiredPermissions: route.permissions,
  };
};

export default routes; 
// Default redirects
export const defaultRedirects = {
  authenticated: '/dashboard',
  unauthenticated: '/login',
};
