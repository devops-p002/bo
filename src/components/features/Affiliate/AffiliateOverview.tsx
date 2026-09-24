import React from 'react';
import ComponentTemplate from '../ComponentTemplate';

const AffiliateOverview = () => {
  const affiliateData = [
    { name: 'GamingPartner Pro', referrals: '2,345', commission: '$45,670', status: 'Active' },
    { name: 'CasinoAffiliates Ltd', referrals: '1,876', commission: '$32,450', status: 'Active' },
    { name: 'BetTraffic Network', referrals: '987', commission: '$18,200', status: 'Pending' },
  ];

  const stats = [
    { label: 'Total Affiliates', value: '127' },
    { label: 'Active Affiliates', value: '98' },
    { label: 'Total Referrals', value: '5,208' },
    { label: 'Commission Paid', value: '$96,320' },
  ];

  const columns = ['Affiliate Name', 'Referrals', 'Commission Earned', 'Status'];
  const actions = [
    { label: 'View', color: 'blue' },
    { label: 'Pay', color: 'green' },
    { label: 'Suspend', color: 'red' },
  ];

  return (
    <ComponentTemplate
      title="Affiliate Overview"
      description="Monitor affiliate performance, referrals, and commission management"
      data={affiliateData}
      columns={columns}
      stats={stats}
      actions={actions}
      hasAddButton={true}
      addButtonText="Add Affiliate"
    />
  );
};

export default AffiliateOverview; 