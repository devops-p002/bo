import React from 'react';
import { Card } from '../../../common/UI';

// The backend has no pattern/anomaly-detection concept - no query returns
// anything like "suspicious betting pattern", session frequency analysis,
// or player behavior clustering (see server/src/graphql/schema). Bet.riskScore
// and Bet.riskFlags exist per-bet, but there is nothing to aggregate them
// into the kind of volume/frequency/behavior/trend analysis this tab used
// to show with mock data, so this is an honest placeholder rather than
// fabricated charts (same approach as CRM/components/TicketManager.js).
const BettingPatterns = () => (
  <Card>
    <div className="p-6 text-center text-gray-500">
      <p className="font-medium">Betting pattern analysis isn&apos;t wired up yet.</p>
      <p className="text-sm mt-1">
        There&apos;s no backend support for aggregate pattern/anomaly detection yet -
        only a per-bet risk score and risk flags exist today (see the Pending
        Bets and Bet History tabs, which surface those real fields).
      </p>
    </div>
  </Card>
);

export default BettingPatterns;
