import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext<any>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// backoffice-api has no granular `permissions` field on an admin user -
// it enforces a fixed role -> owned-action-type map server-side
// (ACTION_TYPE_OWNING_ROLE in services/backoffice-api/src/roles.ts).
// The UI here was built against a much more granular permission list,
// so we grant the full set client-side to any authenticated user;
// server-side RBAC (RolesGuard, maker-checker's ownership check) remains
// the real enforcement point regardless of what the UI shows/hides.
const FULL_PERMISSIONS = [
  'dashboard.view',
  'members.view', 'members.group.manage', 'members.vip.manage', 'members.mass.update',
  'payments.view', 'payments.deposit.view', 'payments.withdrawal.view', 'payments.adjustment.manage',
  'payments.bank.manage', 'payments.gateway.manage', 'payments.settings.manage', 'payments.bank.view',
  'risk.view', 'risk.trace.view', 'risk.analysis.view', 'risk.highroller.view', 'risk.verification.view',
  'bets.view', 'bets.limits.manage', 'bets.settlement.manage', 'bets.patterns.view', 'bets.pending.view',
  'marketing.view', 'marketing.bonus.manage', 'marketing.bonus.issue', 'marketing.bonus.auto',
  'reports.view', 'reports.bonus.view', 'reports.payment.view', 'reports.turnover.view',
  'reports.bet.view', 'reports.daily.view', 'reports.vendor.view', 'reports.vip.view',
  'reports.transfer.view', 'reports.game.view',
  'crm.view', 'crm.message.manage', 'crm.frontend.manage', 'crm.service.manage', 'crm.template.manage',
  'cms.view', 'cms.games.manage', 'cms.provider.manage', 'cms.categories.manage',
  'settings.view', 'settings.staff.manage', 'settings.role.manage', 'settings.notification.manage', 'settings.template.manage',
  'affiliate.view', 'affiliate.performance.view', 'affiliate.domain.manage', 'affiliate.application.manage',
  'affiliate.commission.manage', 'affiliate.finance.view',
  'referral.view', 'referral.commission.view', 'referral.report.view',
  'notifications.view',
];

const STORED_SESSION_KEY = 'bo_admin_session_user';

// The session's actual source of truth is the httpOnly cookie
// backoffice-api sets on login - this app's own JS can never read it
// (deliberately, so an XSS bug here can't exfiltrate it). What's stored
// here is just enough non-sensitive profile info (adminUserId + roles)
// to render the right UI immediately on page reload without a network
// round trip; it grants no access on its own, and any API call that
// actually needs the cookie simply 401s once the real session expires
// or is revoked - see apiFetch's own handling of that below.
function normalizeSession(session: { adminUserId: string; roles: string[]; email?: string }) {
  return {
    id: session.adminUserId,
    email: session.email ?? '',
    roles: session.roles,
    role: session.roles[0]?.toLowerCase(),
    status: 'active',
    name: session.email || session.adminUserId,
    permissions: FULL_PERMISSIONS,
  };
}

// Exported for later pages to call once they're wired to the real API -
// on a 401 (cookie missing/expired/revoked), it clears the locally
// cached profile and broadcasts a DOM event so the UI stops claiming to
// be logged in. It's a module-level function (not a hook), so it can't
// call setUser/navigate itself - AuthProvider listens for this event
// below and does the actual redirect-to-/login.
const SESSION_EXPIRED_EVENT = 'bo-admin-session-expired';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  if (response.status === 401) {
    localStorage.removeItem(STORED_SESSION_KEY);
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  return response;
}

// Provider component
export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  // Restore the last known session's non-sensitive profile info on page
  // load - real authorization is still decided per-request by the
  // cookie, not by this. See normalizeSession's own comment.
  useEffect(() => {
    const stored = localStorage.getItem(STORED_SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORED_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // apiFetch broadcasts this when any request comes back 401 - drop the
  // in-memory session too (not just localStorage) so isAuthenticated
  // flips to false and send the admin back to login instead of leaving
  // them stuck on a page where every request just keeps 401ing.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser((current: any) => (current ? null : current));
      navigate('/login', { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [navigate]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Invalid email or password');
      }

      const data = await response.json();
      const normalized = normalizeSession({ adminUserId: data.adminUserId, roles: data.roles, email });
      localStorage.setItem(STORED_SESSION_KEY, JSON.stringify(normalized));
      setUser(normalized);
      setLoading(false);

      return normalized;
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Logout function
  const logout = () => {
    // Best-effort: tell the server to revoke the session, but don't
    // block clearing local state on it.
    apiFetch('/auth/logout', { method: 'POST' }).catch((err) => {
      console.warn('Logout request failed (clearing local session anyway):', err.message);
    });

    localStorage.removeItem(STORED_SESSION_KEY);
    setUser(null);
    navigate('/login');
  };

  // Value object that will be available to consumers of this context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
