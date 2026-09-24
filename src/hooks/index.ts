// Authentication hooks
export { default as useAuth, AuthProvider } from './useAuth';

// API hooks
export {
  useApi,
  useApiEndpoint,
  usePaginatedApi,
  useInfiniteApi
} from './useApi';

// Local storage hooks
export {
  useLocalStorage,
  useLocalStorageWithExpiry,
  useLocalStorageState,
  useValidatedLocalStorage,
  useSyncedLocalStorage,
  localStorageUtils
} from './useLocalStorage';

// Pagination hooks
export {
  usePagination,
  useClientPagination,
  useServerPagination,
  useInfinitePagination,
  paginationUtils
} from './usePagination';

// Table hooks
export {
  useTable,
  useServerTable,
  tableUtils
} from './useTable';

// Debounce hooks
export {
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
  useDebouncedApi,
  useDebouncedValidation,
  useDebouncedState,
  useDebouncedWindowSize,
  useDebouncedScroll,
  debounceUtils
} from './useDebounce';

// Permission hooks
export {
  usePermissions,
  usePermissionChecker,
  PermissionProvider,
  withPermissions,
  PermissionGate,
  PERMISSION_LEVELS,
  DEFAULT_PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_PERMISSIONS,
  permissionUtils
} from './usePermissions';

// Feature-specific hooks (from components)
// NOTE: these paths were missing the `features/` path segment (e.g.
// '../components/Dashboard/...' instead of '../components/features/Dashboard/...')
// and could never have resolved - a genuine pre-existing bug. Harmless before
// TS because this barrel is never imported anywhere under src/ (verified),
// but module resolution now catches it. Fixed to point at the real files.
// useDashboardData and useReports only have named exports (no default) -
// also true before this conversion, so `default as X` here could never have
// worked either; fixed to import the real named export.
export { useDashboardData as useDashboard } from '../components/features/Dashboard/hooks/useDashboardData';
export { default as useDashboardStats } from '../components/features/Dashboard/hooks/useDashboardStats';
export { default as useMarketing } from '../components/features/Marketing/hooks/useMarketing';
export { default as useBonusTemplates } from '../components/features/Marketing/hooks/useBonusTemplates';
export { useReports } from '../components/features/Reports/hooks/useReports';
export { default as useReportData } from '../components/features/Reports/hooks/useReportData';
export { default as useCRM } from '../components/features/CRM/hooks/useCRM';
export { default as useMessages } from '../components/features/CRM/hooks/useMessages';
// useMembers and useMemberProfile hooks don't exist anywhere in the repo
// (only useMemberSearch.ts does) - these two lines could never have resolved.
// Left out rather than inventing new hook modules outside this batch's scope.
export { default as usePayments } from '../components/features/Payments/hooks/usePayments';
export { default as useTransactions } from '../components/features/Payments/hooks/useTransactions';
export { default as useRisk } from '../components/features/Risk/hooks/useRisk';
export { default as useRiskAnalysis } from '../components/features/Risk/hooks/useRiskAnalysis';
export { default as useBets } from '../components/features/Bets/hooks/useBets';
export { default as useBettingLimits } from '../components/features/Bets/hooks/useBettingLimits';
export { default as useReferral } from '../components/features/Referral/hooks/useReferral';
export { default as useCommissions } from '../components/features/Referral/hooks/useCommissions';
export { default as useSettings } from '../components/features/Settings/hooks/useSettings';

// Re-export commonly used React hooks for convenience
export { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } from 'react'; 