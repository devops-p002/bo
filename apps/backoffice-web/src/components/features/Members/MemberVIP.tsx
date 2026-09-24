import React, { useEffect, useState } from 'react';
import ComponentTemplate from '../ComponentTemplate';
import { listPlayers } from '../../../services/api/players';

// Real backend field: Player.vipLevel (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND).
// There's no points/benefits/nextLevel concept on the backend - this lists
// real members with their real VIP level instead of fabricating those
// fields.
const VIP_LEVELS = ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

const MemberVIP = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Pull a reasonably large page so the VIP-level counts below are
    // computed over the real, mostly-small seeded dataset rather than
    // paginating - this page has no filter/pagination UI of its own to
    // change that.
    listPlayers({}, { page: 1, limit: 200 })
      .then((data) => {
        if (cancelled) return;
        setPlayers(data.nodes ?? []);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load members');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const vipData = players.map((p) => ({
    id: p.id,
    username: p.username || p.email,
    level: p.vipLevel,
    balance: `${(p.balance ?? 0).toLocaleString()} ${p.currency || ''}`.trim(),
  }));

  const stats = VIP_LEVELS.map((level) => ({
    label: `${level.charAt(0)}${level.slice(1).toLowerCase()} Members`,
    value: String(players.filter((p) => p.vipLevel === level).length),
  }));

  const columns = ['Username', 'VIP Level', 'Balance'];

  return (
    <ComponentTemplate
      title="VIP Management"
      description="Real members grouped by VIP level. Points, benefits and next-level thresholds aren't tracked on the backend (only vipLevel itself is a real field) and have been dropped rather than fabricated."
      data={vipData}
      columns={columns}
      rowKeys={['username', 'level', 'balance']}
      stats={stats}
      loading={loading}
      error={error ? `Failed to load members: ${error}` : null}
      hasAddButton={false}
    />
  );
};

export default MemberVIP;
