import { useEffect, useState } from 'react';
import { BellOff, ShieldAlert } from 'lucide-react';
import { listMyNotifications, markNotificationRead } from '../../services/api/notifications';
import type { PlayerNotification } from '../../services/api/notifications';
import GlassIconBadge from '../../components/GlassIconBadge';
import ProfileSubpage from '../../components/ProfileSubpage';

// Scoped, minimal notification system - the only event that writes a row
// today is a KYC rejection (see backoffice-api's KycService), not a
// general-purpose notification center. See the create-player-
// notifications migration's comment.
const ICON_BY_TYPE: Record<string, typeof ShieldAlert> = {
  KYC_REJECTED: ShieldAlert,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (n: PlayerNotification) => {
    if (n.readAt) return;
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item)));
    markNotificationRead(n.id).catch(() => {
      /* best-effort - the unread dot reappears on next load if this fails */
    });
  };

  return (
    <ProfileSubpage title="Notifications">
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-surface-50/60 text-sm">Loading…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <BellOff className="w-8 h-8 mx-auto mb-3 text-surface-50/30" />
          <p className="text-surface-50/60 text-sm">You have no notifications.</p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-600/70 overflow-hidden">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleOpen(n)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-700 transition-colors"
            >
              <GlassIconBadge icon={ICON_BY_TYPE[n.type] ?? ShieldAlert} tone="danger" size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.readAt && <span className="w-2 h-2 rounded-full bg-win shrink-0" />}
                </div>
                <p className="text-sm text-surface-50/60 mt-0.5">{n.body}</p>
                <p className="text-xs text-surface-50/40 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </ProfileSubpage>
  );
}
