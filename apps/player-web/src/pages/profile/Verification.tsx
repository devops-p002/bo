import ProfileSubpage from '../../components/ProfileSubpage';

// No KYC/identity-verification backend exists anywhere in this repo -
// same honest "not wired up" placeholder as Fishing/Arcade/etc.
export default function Verification() {
  return (
    <ProfileSubpage title="Verification">
      <div className="card p-8 text-center">
        <p className="text-surface-50/60 text-sm">Verification isn't live yet - we're building it out. Check back soon.</p>
      </div>
    </ProfileSubpage>
  );
}
