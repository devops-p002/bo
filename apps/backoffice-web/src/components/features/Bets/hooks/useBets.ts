import { useCallback, useMemo, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// Real Bet fields from server/src/graphql/schema/index.js - no fabricated fields.
const BET_FIELDS = gql`
  fragment BetFields on Bet {
    id
    userId
    gameId
    type
    status
    amount
    currency
    odds
    potentialWin
    winAmount
    gameProvider
    gameCategory
    gameName
    riskScore
    riskFlags
    ipAddress
    selections
    result
    voidReason
    createdAt
    settledAt
    user {
      username
    }
    game {
      name
    }
  }
`;

const GET_BETS = gql`
  query BetsList($filter: BetFilterInput, $pagination: PaginationInput) {
    bets(filter: $filter, pagination: $pagination) {
      totalCount
      nodes {
        ...BetFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${BET_FIELDS}
`;

const GET_PENDING_BETS = gql`
  query PendingBetsList($pagination: PaginationInput) {
    pendingBets(pagination: $pagination) {
      totalCount
      nodes {
        ...BetFields
      }
    }
  }
  ${BET_FIELDS}
`;

const SETTLE_BET = gql`
  mutation SettleBet($id: ID!, $winAmount: Float!, $result: JSON) {
    settleBet(id: $id, winAmount: $winAmount, result: $result) {
      id
      status
      winAmount
      settledAt
      result
    }
  }
`;

const CANCEL_BET = gql`
  mutation CancelBet($id: ID!, $reason: String!) {
    cancelBet(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

const VOID_BET = gql`
  mutation VoidBet($id: ID!, $reason: String!) {
    voidBet(id: $id, reason: $reason) {
      id
      status
      voidReason
    }
  }
`;

const DEFAULT_PAGINATION = { page: 1, limit: 50 };

/**
 * Wires the Bets feature to the real backend:
 * - Query.bets / Query.pendingBets for listing
 * - Mutation.settleBet / cancelBet / voidBet for settlement actions
 *
 * Variables objects are memoized (see gotcha: an inline object literal makes
 * useQuery think variables changed every render, causing an infinite
 * refetch loop).
 */
const useBets = () => {
  const [betsFilter, setBetsFilter] = useState(null);
  const [betsPagination, setBetsPagination] = useState(DEFAULT_PAGINATION);
  const [pendingPagination, setPendingPagination] = useState(DEFAULT_PAGINATION);

  // The backend resolves `filter` via a JS default parameter (`filter = {}`),
  // which only kicks in when the argument is `undefined` - an explicit
  // `null` (which is what Apollo would send for `filter: null`) reaches the
  // resolver as `null` and crashes on `filter.category`/`filter.status`. So
  // when there is no filter, the key must be left out of variables
  // entirely rather than set to null.
  const betsVariables = useMemo(
    () => (betsFilter ? { filter: betsFilter, pagination: betsPagination } : { pagination: betsPagination }),
    [betsFilter, betsPagination]
  );
  const pendingVariables = useMemo(
    () => ({ pagination: pendingPagination }),
    [pendingPagination]
  );

  const betsQuery = useQuery(GET_BETS, {
    variables: betsVariables,
    fetchPolicy: 'cache-and-network',
  });
  const pendingQuery = useQuery(GET_PENDING_BETS, {
    variables: pendingVariables,
    fetchPolicy: 'cache-and-network',
  });

  const [settleBetMutation] = useMutation(SETTLE_BET);
  const [cancelBetMutation] = useMutation(CANCEL_BET);
  const [voidBetMutation] = useMutation(VOID_BET);

  // filter: { status, userId, gameId, minAmount, maxAmount, dateRange }
  const fetchBets = useCallback((filter = {}, pagination) => {
    setBetsFilter(Object.keys(filter).length ? filter : null);
    if (pagination) setBetsPagination((prev) => ({ ...prev, ...pagination }));
  }, []);

  const fetchPendingBets = useCallback((pagination) => {
    if (pagination) setPendingPagination((prev) => ({ ...prev, ...pagination }));
  }, []);

  const refetchAll = useCallback(async () => {
    await Promise.all([betsQuery.refetch(), pendingQuery.refetch()]);
  }, [betsQuery, pendingQuery]);

  const cancelBet = useCallback(
    async (betId, reason = 'Cancelled by administrator') => {
      const { data } = await cancelBetMutation({ variables: { id: betId, reason } });
      await refetchAll();
      return data?.cancelBet;
    },
    [cancelBetMutation, refetchAll]
  );

  // outcome: 'won' | 'lost' | 'push' | 'cancelled'. Maps onto the real
  // settleBet(winAmount, result) / cancelBet(reason) mutations - there is no
  // separate "outcome" concept on the backend, so it is derived here.
  const settleBet = useCallback(
    async (betId: any, outcome: any, extra: any = {}) => {
      if (outcome === 'cancelled') {
        return cancelBet(betId, extra.notes || 'Cancelled by administrator');
      }
      const bet = [...(betsQuery.data?.bets?.nodes || []), ...(pendingQuery.data?.pendingBets?.nodes || [])]
        .find((b) => b.id === betId);
      let winAmount;
      if (extra.winAmount !== undefined && extra.winAmount !== '' && extra.winAmount !== null) {
        winAmount = parseFloat(extra.winAmount);
      } else if (outcome === 'won') {
        winAmount = bet?.potentialWin ?? 0;
      } else if (outcome === 'push') {
        winAmount = bet?.amount ?? 0;
      } else {
        winAmount = 0;
      }
      const { data } = await settleBetMutation({
        variables: {
          id: betId,
          winAmount,
          result: { outcome: outcome ? outcome.toUpperCase() : 'SETTLED', notes: extra.notes || null },
        },
      });
      await refetchAll();
      return data?.settleBet;
    },
    [betsQuery.data, pendingQuery.data, settleBetMutation, refetchAll, cancelBet]
  );

  const voidBet = useCallback(
    async (betId, reason = 'Voided by administrator') => {
      const { data } = await voidBetMutation({ variables: { id: betId, reason } });
      await refetchAll();
      return data?.voidBet;
    },
    [voidBetMutation, refetchAll]
  );

  // action: 'won' | 'lost' | 'void'. Runs the matching single mutation for
  // each selected bet (no dedicated bulk mutation exists on the backend).
  const bulkSettleBets = useCallback(
    async (betIds, action) => {
      if (action === 'void') {
        await Promise.all(betIds.map((id) => voidBetMutation({ variables: { id, reason: 'Bulk void by administrator' } })));
      } else {
        await Promise.all(
          betIds.map((id) => {
            const bet = [...(betsQuery.data?.bets?.nodes || []), ...(pendingQuery.data?.pendingBets?.nodes || [])]
              .find((b) => b.id === id);
            const winAmount = action === 'won' ? bet?.potentialWin ?? 0 : 0;
            return settleBetMutation({
              variables: { id, winAmount, result: { outcome: action.toUpperCase(), notes: 'Bulk settlement' } },
            });
          })
        );
      }
      await refetchAll();
    },
    [betsQuery.data, pendingQuery.data, settleBetMutation, voidBetMutation, refetchAll]
  );

  return {
    bets: betsQuery.data?.bets?.nodes ?? [],
    betsTotalCount: betsQuery.data?.bets?.totalCount ?? 0,
    pendingBets: pendingQuery.data?.pendingBets?.nodes ?? [],
    pendingTotalCount: pendingQuery.data?.pendingBets?.totalCount ?? 0,
    loading: betsQuery.loading || pendingQuery.loading,
    error: betsQuery.error?.message || pendingQuery.error?.message || null,
    fetchBets,
    fetchPendingBets,
    settleBet,
    cancelBet,
    voidBet,
    bulkSettleBets,
    refetch: refetchAll,
  };
};

export default useBets;
