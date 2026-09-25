import { BellOff } from 'lucide-react';
import ProfileSubpage from '../../components/ProfileSubpage';

// No notification system exists in this repo (no table, no service) -
// an honest empty state, never a fabricated unread badge or list.
export default function Notifications() {
  return (
    <ProfileSubpage title="Notifications">
      <div className="card p-8 text-center">
        <BellOff className="w-8 h-8 mx-auto mb-3 text-surface-50/30" />
        <p className="text-surface-50/60 text-sm">You have no notifications.</p>
      </div>
    </ProfileSubpage>
  );
}
