export const DB_TOKEN = 'DB';

// Shared between the login/register/logout routes (which set/clear it)
// and JwtAuthGuard (which reads it) - kept in one place so the name can
// never drift between the two. Deliberately distinct from
// backoffice-api's `bo_admin_session` (different subdomain, different
// service - a stolen cookie for one should never be mistaken for the
// other even by name).
export const SESSION_COOKIE_NAME = 'player_session';
