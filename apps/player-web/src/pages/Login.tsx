import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-1 text-center">Log in</h1>
      <p className="text-sm text-surface-50/50 mb-6 text-center">Welcome back to BetQueen.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Email</label>
          <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-loss text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-accent w-full py-3 text-base">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-surface-50/50 mt-6 text-center">
        No account?{' '}
        <Link to="/register" className="text-accent-400 hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
