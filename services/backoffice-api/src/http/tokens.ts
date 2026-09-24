export const DB_TOKEN = 'DB';

// Shared between the login/logout routes (which set/clear it) and
// JwtAuthGuard (which reads it as a Bearer-header fallback) - kept in
// one place so the name can never drift between the two.
export const SESSION_COOKIE_NAME = 'bo_admin_session';
