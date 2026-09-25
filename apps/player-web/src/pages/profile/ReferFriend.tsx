import { Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CopyButton from '../../components/CopyButton';
import GlassIconBadge from '../../components/GlassIconBadge';
import ProfileSubpage from '../../components/ProfileSubpage';

export default function ReferFriend() {
  const { user } = useAuth();
  // register() already accepts and stores any string in ?ref= - a
  // player's own id is a real, unique value to hand out, distinct from
  // referral_code (the code THIS player signed up under, not one they
  // give to others).
  const link = `${window.location.origin}/register?ref=${user?.id ?? ''}`;

  return (
    <ProfileSubpage title="Refer a friend">
      <div className="card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <GlassIconBadge icon={Gift} tone="success" size="md" />
          <p className="text-sm text-surface-50/60">Share your link - anyone who signs up through it is credited as your referral.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-700 border border-surface-600 rounded-md px-3 py-2">
          <span className="flex-1 min-w-0 truncate text-sm">{link}</span>
          <CopyButton value={link} label="referral link" />
        </div>
      </div>
    </ProfileSubpage>
  );
}
