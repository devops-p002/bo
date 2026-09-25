import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Bell, BadgeCheck, ChevronRight, Crown, Dices, Gift, LogOut, Percent, ReceiptText, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CopyButton from '../components/CopyButton';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  to: string;
  badge?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: Bell, label: 'Notifications', to: '/profile/notifications' },
  { icon: User, label: 'Personal info', to: '/profile/personal-info' },
  { icon: ShieldCheck, label: 'Login & Security', to: '/profile/security' },
  { icon: BadgeCheck, label: 'Verification', to: '/profile/verification' },
  { icon: ReceiptText, label: 'Transaction records', to: '/profile/transactions' },
  { icon: Dices, label: 'Betting records', to: '/profile/bets' },
  { icon: Percent, label: 'Turnover', to: '/profile/bets' },
  { icon: Crown, label: 'My VIP', to: '/vip-club' },
  { icon: Gift, label: 'Refer a friend', to: '/profile/refer' },
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
            <item.icon className="w-[18px] h-[18px] text-surface-50/60 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-surface-50/30 shrink-0" />
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-loss hover:bg-surface-700 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className="flex-1 text-left">Log out</span>
        </button>
      </div>
    </div>
  );
}
