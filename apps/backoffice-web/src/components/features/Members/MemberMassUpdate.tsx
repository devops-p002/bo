import React from 'react';
import ComponentTemplate from '../ComponentTemplate';

const MemberMassUpdate = () => {
  const updateData = [
    { operation: 'Balance Adjustment', affected: '250', status: 'Completed', date: '2024-06-01' },
    { operation: 'VIP Level Update', affected: '45', status: 'In Progress', date: '2024-06-01' },
    { operation: 'Status Change', affected: '12', status: 'Pending', date: '2024-05-31' },
  ];

  const stats = [
    { label: 'Pending Operations', value: '3' },
    { label: 'Completed Today', value: '12' },
    { label: 'Members Affected', value: '307' },
    { label: 'Failed Operations', value: '1' },
  ];

  const columns = ['Operation Type', 'Members Affected', 'Status', 'Date'];
  const actions = [
    { label: 'View', color: 'blue' },
    { label: 'Retry', color: 'green' },
    { label: 'Cancel', color: 'red' },
  ];

  return (
    <ComponentTemplate
      title="Mass Update Operations"
      description="Perform bulk operations on multiple member accounts simultaneously"
      data={updateData}
      columns={columns}
      stats={stats}
      actions={actions}
      hasAddButton={true}
      addButtonText="New Bulk Operation"
    />
  );
};

export default MemberMassUpdate; 