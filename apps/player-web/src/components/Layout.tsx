import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Lobby', icon: '⌂' },
  { to: '/category/SLOTS', label: 'Slots', icon: '▦' },
  { to: '/category/LIVE_CASINO', label: 'Live Casino', icon: '●' },
  { to: '/category/GAME_SHOWS', label: 'Game Shows', icon: '★' },
  { to: '/category/TABLE_GAMES', label: 'Table Games', icon: '♠' },
  { to: '/category/ORIGINALS', label: 'Originals', icon: '⚡' },
];

function money(amount: number, currency: string) {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface-900 text-surface-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 shrink-0 bg-surface-800 border-r border-surface-600 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-surface-600">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
            <span className="text-accent-400">Sun</span>rion
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-surface-600 text-accent-400' : 'text-surface-50/70 hover:bg-surface-700 hover:text-surface-50'
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
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

          <div className="flex-1" />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs text-surface-50/50">Balance</span>
                <span className="font-semibold text-sm">{money(user.balance, user.currency)}</span>
              </div>
              <button className="btn-accent text-sm" onClick={() => navigate('/wallet')}>
                Wallet
              </button>
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-surface-600">
                <span className="text-sm text-surface-50/70">{user.username || user.email}</span>
                <button className="text-xs text-surface-50/50 hover:text-surface-50" onClick={logout}>
                  Log out
                </button>
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
