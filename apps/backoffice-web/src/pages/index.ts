// Main feature pages
export { default as DashboardPage } from './Dashboard/DashboardPage';

// Reports pages
export { default as ReportsPage } from './Reports/ReportsPage';
export { default as BonusReportPage } from './Reports/BonusReportPage';
export { default as PaymentReportPage } from './Reports/PaymentReportPage';
export { default as TurnoverReportPage } from './Reports/TurnoverReportPage';
export { default as BetReportPage } from './Reports/BetReportPage';
export { default as DailyReportPage } from './Reports/DailyReportPage';

// Feature pages
export { default as CRMPage } from './CRM/CRMPage';
// NOTE: no consolidated MembersPage or Bets/BetsPage file exists in src/pages -
// this barrel is unreferenced anywhere in the app (real routing goes through
// src/config/routes.ts, which imports pages/components directly), so these two
// exports pointed at modules that never existed. Dropped rather than pointing
// them at unrelated files, since there's nothing here to preserve the behavior
// of (see PLAN.md Phase 0a).
export { default as MemberDetailsPage } from './Members/MemberDetailsPage';
export { default as PaymentsPage } from './Payments/PaymentsPage';
export { default as RiskPage } from './Risk/RiskPage';
export { default as ReferralPage } from './Referral/ReferralPage';
export { default as SettingsPage } from './Settings/SettingsPage';

// Auth pages
export { default as LoginPage } from './Auth/LoginPage';
export { default as ForgotPasswordPage } from './Auth/ForgotPasswordPage'; 