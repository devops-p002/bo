import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useApolloClient } from '@apollo/client';

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

const USER_FIELDS = `
  id
  username
  email
  firstName
  lastName
  fullName
  role
  status
  vipLevel
  balance
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      refreshToken
      user {
        ${USER_FIELDS}
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      ${USER_FIELDS}
    }
  }
`;

// The backend's User.role/status/vipLevel are GraphQL enums (SCREAMING_CASE,
// e.g. "SUPER_ADMIN"), but the rest of this app (ProtectedRoute's
// `user.status !== 'active'` check, role checks, etc.) was written expecting
// lowercase values. Normalize once here at the API boundary.
//
// The backend also has no granular `permissions` field on User (it enforces
// a smaller role -> permission-string map server-side, in
// server/src/config/index.js). The UI here was built against a much more
// granular permission list, so we grant the full set client-side to any
// authenticated user; server-side resolvers remain the real enforcement
// point regardless of what the UI shows/hides.
const FULL_PERMISSIONS = [
  'dashboard.view',
  'members.view', 'members.group.manage', 'members.vip.manage', 'members.mass.update',
  'payments.view', 'payments.deposit.view', 'payments.withdrawal.view', 'payments.adjustment.manage',
  'payments.bank.manage', 'payments.gateway.manage', 'payments.settings.manage', 'payments.bank.view',
  'risk.view', 'risk.trace.view', 'risk.analysis.view', 'risk.highroller.view',
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

const normalizeUser = (user: any) => ({
  ...user,
  role: user.role?.toLowerCase(),
  status: user.status?.toLowerCase(),
  vipLevel: user.vipLevel?.toLowerCase(),
  name: user.fullName || user.username,
  permissions: FULL_PERMISSIONS,
});

// Provider component
export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'network-only',
        });

        if (data?.me) {
          setUser(normalizeUser(data.me));
        } else {
          // Token no longer maps to a user (e.g. deleted account)
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setError(err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function
  const login = async (email: any, password: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      });

      const { token, refreshToken, user: loggedInUser } = data.login;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      const normalized = normalizeUser(loggedInUser);
      setUser(normalized);
      setLoading(false);

      return normalized;
    } catch (err) {
      const message = err.graphQLErrors?.[0]?.message || err.message || 'Login failed. Please try again.';
      console.error('Login failed:', message);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Logout function
  const logout = () => {
    // Best-effort: tell the server, but don't block clearing local session on it.
    apolloClient.mutate({ mutation: LOGOUT_MUTATION }).catch((err) => {
      console.warn('Logout mutation failed (clearing local session anyway):', err.message);
    });

    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    apolloClient.clearStore().catch(() => {});
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
