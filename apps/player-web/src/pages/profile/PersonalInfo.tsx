import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileSubpage from '../../components/ProfileSubpage';

export default function PersonalInfo() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        country: country.trim() ? country.trim().toUpperCase() : undefined,
      });
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSubpage title="Personal info">
      <div className="card p-6">
        <p className="text-sm text-surface-50/50 mb-5">
          Signing up only needed your email - these details are optional, but help us verify your account and process withdrawals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">First name</label>
              <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Last name</label>
              <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date of birth</label>
              <input type="date" className="form-input" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input
                type="text"
                maxLength={2}
                placeholder="e.g. US"
                className="form-input uppercase"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-loss text-sm">{error}</p>}
          {success && <p className="text-win text-sm">{success}</p>}
          <button type="submit" disabled={submitting} className="btn-accent w-full">
            {submitting ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </ProfileSubpage>
  );
}
