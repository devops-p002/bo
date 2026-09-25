import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VipClub() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-lg">
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">VIP Club</h1>
        {isAuthenticated && user ? (
          <>
            <p className="text-surface-50/50 text-sm mb-1">Your current tier</p>
            <p className="text-2xl font-extrabold text-accent-400 mb-4">{user.vipLevel}</p>
          </>
        ) : (
          <p className="text-surface-50/60 text-sm mb-4">
            <Link to="/login" className="text-accent-400 hover:underline">
              Log in
            </Link>{' '}
            to see your VIP tier.
          </p>
        )}
        <p className="text-surface-50/60 text-sm">
          Tier perks and rewards aren't live yet - we're building out the full VIP Club experience.
        </p>
      </div>
    </div>
  );
}
