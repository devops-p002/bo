import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, Laptop, Smartphone, TabletSmartphone } from 'lucide-react';
import { changePassword, listMyDevices } from '../../services/api/security';
import type { PlayerDevice } from '../../services/api/security';
import GlassIconBadge from '../../components/GlassIconBadge';
import ProfileSubpage from '../../components/ProfileSubpage';

const DEVICE_ICON: Record<string, typeof Laptop> = {
  Mobile: Smartphone,
  Tablet: TabletSmartphone,
};

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="form-label">Current password</label>
        <input type="password" required className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div>
        <label className="form-label">New password</label>
        <input type="password" required minLength={8} className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      {error && <p className="text-loss text-sm">{error}</p>}
      {success && <p className="text-win text-sm">{success}</p>}
      <button type="submit" disabled={submitting} className="btn-accent w-full">
        {submitting ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}

export default function LoginSecurity() {
  const [devices, setDevices] = useState<PlayerDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyDevices()
      .then(setDevices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProfileSubpage title="Login & Security">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <GlassIconBadge icon={KeyRound} tone="success" size="sm" />
          <h2 className="text-sm font-bold text-surface-50/80">Change password</h2>
        </div>
        <PasswordForm />
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold mb-4 text-surface-50/80">Login history</h2>
        {loading ? (
          <p className="text-surface-50/50 text-sm">Loading…</p>
        ) : devices.length === 0 ? (
          <p className="text-surface-50/50 text-sm">No recorded logins yet.</p>
        ) : (
          <ul className="space-y-3">
            {devices.map((device) => {
              const Icon = DEVICE_ICON[device.device] ?? Laptop;
              return (
                <li key={device.id} className="flex items-center gap-3">
                  <GlassIconBadge icon={Icon} tone="neutral" size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {device.device} {device.ipAddress ? `· ${device.ipAddress}` : ''}
                    </p>
                    <p className="text-xs text-surface-50/50 truncate">
                      Last seen {new Date(device.lastSeenAt).toLocaleString()} · {device.loginCount} login{device.loginCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ProfileSubpage>
  );
}
