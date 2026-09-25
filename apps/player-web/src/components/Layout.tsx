import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/category/SLOTS', label: 'Slots', icon: '▦' },
  { to: '/category/TABLE_GAMES', label: 'Table', icon: '♠' },
  { to: '/games/game_betqueen_crash', label: 'Crash', icon: '⚡' },
  { to: '/fishing', label: 'Fishing', icon: '≈' },
  { to: '/arcade', label: 'Arcade', icon: '◆' },
  { to: '/lottery', label: 'Lottery', icon: '✧' },
  { to: '/category/LIVE_CASINO', label: 'Live Casino', icon: '●' },
  { to: '/sports', label: 'Sports', icon: '▲' },
  { to: '/promotions', label: 'Promotion', icon: '★' },
  { to: '/vip-club', label: 'VIP Club', icon: '♛' },
  { to: '/responsible-gaming', label: 'Responsible Gaming', icon: '⚠' },
  { to: '/support', label: 'Live Support', icon: '☎' },
];

const SIDEBAR_COLLAPSED_KEY = 'betqueen-sidebar-collapsed';

function money(amount: number, currency: string) {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function readCollapsedPref(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout, refreshWallet } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsedPref);
  const [refreshing, setRefreshing] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // Per-viewer convenience only - a blocked/unavailable localStorage
      // just means the collapsed state doesn't persist across reloads.
    }
  }, [collapsed]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      await refreshWallet();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900 text-surface-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 ${collapsed ? 'lg:w-20' : 'lg:w-60'} shrink-0 bg-surface-800 border-r border-surface-600 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-600">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight min-w-0">
            <img src="/betqueen-logo.png" alt="" className="w-11 h-11 rounded-full shrink-0" />
            <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="text-accent-400">Bet</span>Queen
            </span>
          </Link>
          {!collapsed && (
            <button
              className="hidden lg:flex w-8 h-8 shrink-0 items-center justify-center rounded-md text-surface-50/70 hover:bg-surface-700 hover:text-surface-50"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              &#9776;
            </button>
          )}
        </div>
        {collapsed && (
          <button
            className="hidden lg:flex w-full items-center justify-center py-2 text-surface-50/70 hover:bg-surface-700 hover:text-surface-50 border-b border-surface-600"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            &#9776;
          </button>
        )}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${collapsed ? 'lg:justify-center' : ''} ${
                  isActive ? 'bg-surface-600 text-accent-400' : 'text-surface-50/70 hover:bg-surface-700 hover:text-surface-50'
                }`
              }
            >
              <span className="w-5 text-center shrink-0">{item.icon}</span>
              <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* The profile dropdown in the header is hidden below md (no room
            for it alongside the logo/balance/wallet button on a narrow
            screen), which otherwise leaves a logged-in mobile user with no
            way to reach their profile or log out at all. This is that
            access point, shown only in the mobile drawer. */}
        {isAuthenticated && user && (
          <div className="lg:hidden border-t border-surface-600 p-3 mt-2">
            <p className="px-3 text-sm font-medium truncate">{user.username || user.email}</p>
            <p className="px-3 text-xs text-surface-50/50 truncate mb-2">{user.email}</p>
            <button
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-surface-50/70 hover:bg-surface-700 hover:text-surface-50"
              onClick={() => {
                setSidebarOpen(false);
                navigate('/profile');
              }}
            >
              Profile
              {!user.firstName && <span className="text-accent-400">•</span>}
            </button>
            <button
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-surface-50/60 hover:bg-surface-700 hover:text-surface-50"
              onClick={() => {
                setSidebarOpen(false);
                logout();
              }}
            >
              Log out
            </button>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-surface-600 bg-surface-800/80 backdrop-blur flex items-center justify-between px-4 gap-3">
          <button className="lg:hidden text-xl px-2" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            &#9776;
          </button>

          {/* The sidebar's own brand mark is off-screen until opened on
              mobile (lg:static/-translate-x-full above) - shown here too
              so small screens aren't brandless until the menu is tapped. */}
          <Link to="/" className="lg:hidden flex items-center gap-2 font-extrabold text-base tracking-tight">
            <img src="/betqueen-logo.png" alt="" className="w-8 h-8 rounded-full shrink-0" />
            <span className="whitespace-nowrap">
              <span className="text-accent-400">Bet</span>Queen
            </span>
          </Link>

          <div className="flex-1" />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <div className="flex flex-col items-end leading-tight">
                  <span className="hidden sm:inline text-xs text-surface-50/50">Balance</span>
                  <span className="font-semibold text-xs sm:text-sm">{money(user.balance, user.currency)}</span>
                </div>
                <button
                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-surface-50/60 hover:bg-surface-700 hover:text-surface-50 disabled:opacity-50"
                  onClick={handleRefreshBalance}
                  disabled={refreshing}
                  aria-label="Refresh balance"
                  title="Refresh balance"
                >
                  <span className={refreshing ? 'inline-block animate-spin' : 'inline-block'}>&#8635;</span>
                </button>
              </div>
              <button className="btn-accent text-sm" onClick={() => navigate('/wallet')}>
                Wallet
              </button>
              <div ref={profileMenuRef} className="relative hidden md:block pl-2 border-l border-surface-600">
                <button
                  className="flex items-center gap-1.5 text-sm text-surface-50/70 hover:text-surface-50 px-2 py-1.5 rounded-md hover:bg-surface-700"
                  onMouseEnter={() => setProfileMenuOpen(true)}
                  onMouseLeave={() => setProfileMenuOpen(false)}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <span className="w-6 h-6 rounded-full bg-surface-600 flex items-center justify-center text-xs font-bold text-accent-400 shrink-0">
                    {(user.username || user.email).charAt(0).toUpperCase()}
                  </span>
                  Profile
                  {!user.firstName && <span className="text-accent-400">•</span>}
                  <span className="text-[10px] text-surface-50/40">▾</span>
                </button>
                {profileMenuOpen && (
                  <div
                    onMouseEnter={() => setProfileMenuOpen(true)}
                    onMouseLeave={() => setProfileMenuOpen(false)}
                    className="absolute right-0 top-full pt-1 w-48 z-50"
                  >
                    <div className="card py-1 shadow-lg">
                      <div className="px-3 py-2 border-b border-surface-600">
                        <p className="text-sm font-medium truncate">{user.username || user.email}</p>
                        <p className="text-xs text-surface-50/50 truncate">{user.email}</p>
                      </div>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-surface-50/80 hover:bg-surface-700 hover:text-surface-50"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        Profile{!user.firstName && <span className="ml-1 text-accent-400">•</span>}
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-surface-50/60 hover:bg-surface-700 hover:text-surface-50"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-accent text-sm">
                Sign up
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
