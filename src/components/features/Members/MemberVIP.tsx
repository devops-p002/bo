import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import ComponentTemplate from '../ComponentTemplate';

// Real backend field: User.vipLevel (VIPLevel enum: BRONZE/SILVER/GOLD/
// PLATINUM/DIAMOND). There's no points/benefits/nextLevel concept on the
// backend - this lists real members with their real VIP level instead of
// fabricating those fields. `role` isn't needed here but username/balance/
// currency give a useful real "VIP roster" view.
const GET_VIP_MEMBERS = gql`
  query GetVipMembers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      totalCount
      nodes {
        id
        username
        vipLevel
        balance
        currency
      }
    }
  }
`;

const VIP_LEVELS = ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

const MemberVIP = () => {
  // Pull a reasonably large page so the VIP-level counts below are computed
  // over the real, mostly-small seeded dataset rather than paginating -
  // this page has no filter/pagination UI of its own to change that.
  const variables = useMemo(() => ({ pagination: { page: 1, limit: 200 } }), []);
  const { data, loading, error } = useQuery(GET_VIP_MEMBERS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const users = data?.users?.nodes ?? [];

  const vipData = users.map((u) => ({
    id: u.id,
    username: u.username,
    level: u.vipLevel,
    balance: `${(u.balance ?? 0).toLocaleString()} ${u.currency || ''}`.trim(),
  }));

  const stats = VIP_LEVELS.map((level) => ({
    label: `${level.charAt(0)}${level.slice(1).toLowerCase()} Members`,
    value: String(users.filter((u) => u.vipLevel === level).length),
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
      error={error ? `Failed to load members: ${error.message}` : null}
      hasAddButton={false}
    />
  );
};

export default MemberVIP;
