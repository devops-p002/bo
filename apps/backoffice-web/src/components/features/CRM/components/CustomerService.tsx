import React from 'react';
import { Card } from '../../../common/UI';

// The backend has no CustomerService/Ticket model yet - CRM is out of scope
// for this pass. This placeholder exists only so the /crm route doesn't
// crash when this tab is selected.
const CustomerService = () => (
  <Card>
    <div className="p-6 text-center text-gray-500">
      <p className="font-medium">Customer service tools aren&apos;t wired up yet.</p>
      <p className="text-sm mt-1">There&apos;s no backend support for this yet.</p>
    </div>
  </Card>
);

export default CustomerService;
