import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  // A real affiliate-link parameter (?ref=<code>), read once at mount and
  // forwarded on submit - never shown/editable in the form itself, so a
  // visitor can't just type any value in and claim to be affiliate
  // traffic. See services/backoffice-api's Member Search "Channel Type"
  // filter, and the add-signup-channel migration's own comment.
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref')?.trim() || undefined;
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, username.trim() || undefined, referralCode);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-1 text-center">Create account</h1>
      {/* Identity/login is email-only per CLAUDE.md - username is
          optional and display-only, never required to sign up or log
          in. */}
      <p className="text-sm text-surface-50/50 mb-6 text-center">Email is how you'll log in - username is optional.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Email</label>
          <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Username (optional)</label>
          <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={64} />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-loss text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-accent w-full py-3 text-base">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-surface-50/50 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-400 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
