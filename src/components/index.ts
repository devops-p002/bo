// Main Components Index - Aura Gaming Platform
// This file exports all components for easy importing.
// Note: unreferenced anywhere in the live app (verified via grep) - kept
// working rather than deleted, but the "Individual Feature Exports for
// Convenience" block that used to live here was dropped during the
// TypeScript conversion: it re-exported ~30 named components (e.g.
// `StatsOverview` from './features/Dashboard') that none of the target
// modules actually export by name (they only export a single default),
// so none of it could ever have worked. Same for the `Members` default
// export below - `features/Members` has no default export.

// Common Components
export * from './common/Layout';
export * from './common/UI';
export * from './common/Forms';
export * from './common/Charts';

// Feature Components
export { default as Dashboard } from './features/Dashboard';
export { default as Marketing } from './features/Marketing';
export { default as Reports } from './features/Reports';
export { default as CRM } from './features/CRM';
export { default as Payments } from './features/Payments';
export { default as Risk } from './features/Risk';
export { default as Bets } from './features/Bets';
export { default as Referral } from './features/Referral';
export { default as Settings } from './features/Settings';
