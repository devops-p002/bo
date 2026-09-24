import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Wallet {
  id: string;
  username: string | null;
  email: string;
  currency: string;
  status: string;
  vipLevel: string;
  balance: number;
  bonusBalance: number;
}

interface AuthContextValue {
  user: Wallet | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  refreshWallet: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5200';
const SESSION_EXPIRED_EVENT = 'sunrion-session-expired';

// Same shape as apps/backoffice-web's apiFetch - see that file's
// AuthContext.tsx for the 401 -> session-expired-event rationale, learned
// there the hard way (a 401 that only clears storage without also
// clearing in-memory auth state leaves the UI claiming to be logged in
// while every request just keeps failing). /auth/me is excluded: unlike
// backoffice-web (every route behind auth), most of this app is public,
// so /auth/me's own "am I logged in?" check 401s normally for every
// anonymous visitor on mount - that's not a session expiring mid-use,
// and redirecting an anonymous visitor off the register/lobby page the
// instant that check runs would be a self-inflicted bug, not a feature.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  if (response.status === 401 && path !== '/auth/me') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  return response;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshWallet = async () => {
    const response = await apiFetch('/auth/me');
    if (!response.ok) {
      setUser(null);
      return;
    }
    setUser(await response.json());
  };

  useEffect(() => {
    refreshWallet().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    await parseOrThrow(response);
    await refreshWallet();
  };

  const register = async (email: string, password: string, username?: string) => {
    const response = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) });
    await parseOrThrow(response);
    await refreshWallet();
  };

  const logout = () => {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    navigate('/login');
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    refreshWallet,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
