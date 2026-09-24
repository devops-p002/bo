import React from 'react';
import ComponentTemplate from '../ComponentTemplate';

const MemberGroup = () => {
  const groupData = [
    { id: 1, name: 'VIP Players', members: '125', category: 'Premium', status: 'Active' },
    { id: 2, name: 'High Rollers', members: '87', category: 'Premium', status: 'Active' },
    { id: 3, name: 'New Players', members: '543', category: 'Standard', status: 'Active' },
  ];

  const stats = [
    { label: 'Total Groups', value: '12' },
    { label: 'Active Groups', value: '10' },
    { label: 'Total Members', value: '755' },
    { label: 'Premium Groups', value: '4' },
  ];

  const columns = ['Group Name', 'Members', 'Category', 'Status'];
  const actions = [
    { label: 'Edit', color: 'blue' },
    { label: 'Members', color: 'green' },
    { label: 'Delete', color: 'red' },
  ];

  return (
    <ComponentTemplate
      title="Member Groups"
      description="Organize and manage member groups with different privileges and access levels"
      data={groupData}
      columns={columns}
      stats={stats}
      actions={actions}
      hasAddButton={true}
      addButtonText="Create Group"
    />
  );
};

export default MemberGroup; 