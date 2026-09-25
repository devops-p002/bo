import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Bell, BadgeCheck, ChevronRight, Crown, Dices, Gift, LogOut, Percent, ReceiptText, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CopyButton from '../components/CopyButton';
import GlassIconBadge from '../components/GlassIconBadge';
import type { GlassTone } from '../components/GlassIconBadge';

interface MenuItem {
  icon: LucideIcon;
  tone: GlassTone;
  label: string;
  to: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: Bell, tone: 'neutral', label: 'Notifications', to: '/profile/notifications' },
  { icon: User, tone: 'brand', label: 'Personal info', to: '/profile/personal-info' },
  { icon: ShieldCheck, tone: 'success', label: 'Login & Security', to: '/profile/security' },
  { icon: BadgeCheck, tone: 'brand', label: 'Verification', to: '/profile/verification' },
  { icon: ReceiptText, tone: 'success', label: 'Transaction records', to: '/profile/transactions' },
  { icon: Dices, tone: 'brand', label: 'Betting records', to: '/profile/bets' },
  { icon: Percent, tone: 'brand', label: 'Turnover', to: '/profile/bets' },
  { icon: Crown, tone: 'brand', label: 'My VIP', to: '/vip-club' },
  { icon: Gift, tone: 'success', label: 'Refer a friend', to: '/profile/refer' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center text-2xl font-bold text-accent-400 shrink-0">
            {(user.username || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="font-bold truncate">{user.username || user.email}</p>
              {!user.firstName && (
                <Link to="/profile/personal-info" className="text-xs text-accent-400 hover:underline shrink-0">
                  Complete profile
                </Link>
              )}
            </div>
            {fullName && <p className="text-sm text-surface-50/60 truncate">{fullName}</p>}
            <div className="flex items-center gap-1">
              <p className="text-xs text-surface-50/40 truncate">ID {user.id}</p>
              <CopyButton value={user.id} label="player ID" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-600 flex items-center gap-1.5 text-sm text-surface-50/60">
          <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          <CopyButton value={new Date(user.createdAt).toLocaleDateString()} label="signup date" />
        </div>
      </div>

      <div className="card divide-y divide-surface-600/70 overflow-hidden">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-700 transition-colors"
          >
            <GlassIconBadge icon={item.icon} tone={item.tone} size="sm" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-surface-50/30 shrink-0" />
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-loss hover:bg-surface-700 transition-colors"
        >
          <GlassIconBadge icon={LogOut} tone="danger" size="sm" />
          <span className="flex-1 text-left">Log out</span>
        </button>
      </div>
    </div>
  );
}
