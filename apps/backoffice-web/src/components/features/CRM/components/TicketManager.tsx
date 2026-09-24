import React from 'react';
import { Card } from '../../../common/UI';

// The backend has no Ticket model/schema yet (see server/src/graphql/schema)
// - CRM is out of scope for this pass. This placeholder exists only so the
// /crm route (which defaults to this tab) doesn't crash on an empty module.
const TicketManager = () => (
  <Card>
    <div className="p-6 text-center text-gray-500">
      <p className="font-medium">Ticket management isn&apos;t wired up yet.</p>
      <p className="text-sm mt-1">There&apos;s no backend support for support tickets yet.</p>
    </div>
  </Card>
);

export default TicketManager;
