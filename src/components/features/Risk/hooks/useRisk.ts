import { useCallback, useMemo, useState } from 'react';
import { gql, useQuery, useApolloClient } from '@apollo/client';

// Real fields only - see server/src/graphql/schema/index.js. RiskAssessment
// has no "status"/"category"/"actions" workflow, and there is no dedicated
// "alert"/"suspicious activity" type on the backend - those are derived
// here from RiskAssessment + Bet.riskScore/Transaction.riskScore instead of
// being fabricated.
const RISK_ASSESSMENT_FIELDS = gql`
  fragment RiskAssessmentFields on RiskAssessment {
    id
    userId
    riskScore
    riskLevel
    factors {
      type
      score
      description
      severity
    }
    recommendations
    assessedAt
    assessedBy
    notes
    user {
      id
      username
      email
      vipLevel
    }
  }
`;

const GET_RISK_ASSESSMENTS = gql`
  query RiskAssessmentsList($pagination: PaginationInput) {
    riskAssessments(pagination: $pagination) {
      ...RiskAssessmentFields
    }
  }
  ${RISK_ASSESSMENT_FIELDS}
`;

const GET_HIGH_RISK_BETS = gql`
  query HighRiskBetsList($pagination: PaginationInput) {
    highRiskBets(pagination: $pagination) {
      totalCount
      nodes {
        id
        userId
        amount
        currency
        status
        riskScore
        riskFlags
        gameName
        createdAt
        user {
          username
        }
      }
    }
  }
`;

const GET_HIGH_RISK_TRANSACTIONS = gql`
  query HighRiskTransactionsList($pagination: PaginationInput) {
    highRiskTransactions(pagination: $pagination) {
      totalCount
      nodes {
        id
        userId
        type
        status
        amount
        currency
        riskScore
        riskFlags
        createdAt
        user {
          username
        }
      }
    }
  }
`;

// High Roller Monitoring has no dedicated backend concept either - this
// pulls a page of real members and the caller filters/sorts by the real
// vipLevel/totalDeposits/totalBets fields.
const GET_MEMBERS_FOR_HIGH_ROLLERS = gql`
  query MembersForHighRollers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      totalCount
      nodes {
        id
        username
        email
        vipLevel
        balance
        currency
        totalDeposits
        totalBets
        totalWithdrawals
        totalWins
        riskAssessment {
          riskScore
          riskLevel
        }
      }
    }
  }
`;

const SEARCH_MEMBERS = gql`
  query SearchMembersForRisk($search: String!) {
    users(filter: { search: $search }, pagination: { limit: 10 }) {
      totalCount
      nodes {
        id
        username
        email
        vipLevel
      }
    }
  }
`;

// Member Trace: a real per-user activity timeline built from the user's
// own bets + transactions (both real relations on User), merged and sorted
// by createdAt. There is no separate "device/location/login" activity log
// on the backend, so those fields are not fabricated here.
const GET_MEMBER_TRACE = gql`
  query MemberTraceForUser($userId: ID!, $pagination: PaginationInput) {
    user(id: $userId) {
      id
      username
      email
      vipLevel
      riskAssessment {
        riskScore
        riskLevel
      }
      bets(pagination: $pagination) {
        totalCount
        nodes {
          id
          type
          status
          amount
          currency
          riskScore
          gameName
          gameCategory
          createdAt
        }
      }
      transactions(pagination: $pagination) {
        totalCount
        nodes {
          id
          type
          status
          amount
          currency
          riskScore
          createdAt
        }
      }
    }
  }
`;

const DEFAULT_PAGINATION = { page: 1, limit: 50 };
const HIGH_ROLLER_VIP_LEVELS = new Set(['GOLD', 'PLATINUM', 'DIAMOND']);

/**
 * Wires Risk Alerts, Suspicious Activity, High Roller Monitoring and Member
 * Trace to the real backend:
 * - Query.riskAssessments for the alert feed
 * - Query.highRiskBets / highRiskTransactions for suspicious activity
 * - Query.users for the high-roller roster
 * - Query.user(id).bets/transactions for a single member's trace
 *
 * Variables are memoized (an inline object literal makes useQuery think
 * variables changed every render, causing an infinite refetch loop).
 */
const useRisk = () => {
  const apolloClient = useApolloClient();
  const [alertsPagination] = useState(DEFAULT_PAGINATION);
  const [highRiskPagination] = useState(DEFAULT_PAGINATION);
  const [highRollerPagination] = useState({ page: 1, limit: 200 });

  const [traceUserId, setTraceUserId] = useState(null);
  const [traceUser, setTraceUser] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState(null);

  const alertsVariables = useMemo(() => ({ pagination: alertsPagination }), [alertsPagination]);
  const highRiskVariables = useMemo(() => ({ pagination: highRiskPagination }), [highRiskPagination]);
  const highRollerVariables = useMemo(() => ({ pagination: highRollerPagination }), [highRollerPagination]);

  const assessmentsQuery = useQuery(GET_RISK_ASSESSMENTS, {
    variables: alertsVariables,
    fetchPolicy: 'cache-and-network',
  });
  const highRiskBetsQuery = useQuery(GET_HIGH_RISK_BETS, {
    variables: highRiskVariables,
    fetchPolicy: 'cache-and-network',
  });
  const highRiskTransactionsQuery = useQuery(GET_HIGH_RISK_TRANSACTIONS, {
    variables: highRiskVariables,
    fetchPolicy: 'cache-and-network',
  });
  const membersQuery = useQuery(GET_MEMBERS_FOR_HIGH_ROLLERS, {
    variables: highRollerVariables,
    fetchPolicy: 'cache-and-network',
  });

  const searchMembers = useCallback(
    async (query) => {
      if (!query || !query.trim()) return [];
      const { data } = await apolloClient.query({
        query: SEARCH_MEMBERS,
        variables: { search: query.trim() },
        fetchPolicy: 'network-only',
      });
      return data?.users?.nodes ?? [];
    },
    [apolloClient]
  );

  const fetchMemberTrace = useCallback(
    async (userId) => {
      if (!userId) {
        setTraceUserId(null);
        setTraceUser(null);
        return;
      }
      setTraceUserId(userId);
      setTraceLoading(true);
      setTraceError(null);
      try {
        const { data } = await apolloClient.query({
          query: GET_MEMBER_TRACE,
          variables: { userId, pagination: { page: 1, limit: 100 } },
          fetchPolicy: 'network-only',
        });
        setTraceUser(data?.user ?? null);
      } catch (err) {
        setTraceError(err.message || 'Failed to load member trace');
        setTraceUser(null);
      } finally {
        setTraceLoading(false);
      }
    },
    [apolloClient]
  );

  const highRollers = useMemo(
    () =>
      (membersQuery.data?.users?.nodes ?? [])
        .filter((u) => HIGH_ROLLER_VIP_LEVELS.has(u.vipLevel))
        .sort((a, b) => (b.totalDeposits ?? 0) - (a.totalDeposits ?? 0)),
    [membersQuery.data]
  );

  // Merged real activity feed for the selected member's trace, sorted
  // newest-first, so bets and transactions read as one timeline.
  const memberTrace = useMemo(() => {
    if (!traceUser) return [];
    const bets = (traceUser.bets?.nodes ?? []).map((b) => ({
      id: `bet-${b.id}`,
      kind: 'Bet',
      description: `${b.type || 'Bet'} - ${b.gameName || b.gameCategory || ''}`.trim(),
      amount: b.amount,
      currency: b.currency,
      status: b.status,
      riskScore: b.riskScore,
      createdAt: b.createdAt,
    }));
    const transactions = (traceUser.transactions?.nodes ?? []).map((t) => ({
      id: `txn-${t.id}`,
      kind: 'Transaction',
      description: t.type,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      riskScore: t.riskScore,
      createdAt: t.createdAt,
    }));
    return [...bets, ...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [traceUser]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      assessmentsQuery.refetch(),
      highRiskBetsQuery.refetch(),
      highRiskTransactionsQuery.refetch(),
      membersQuery.refetch(),
    ]);
  }, [assessmentsQuery, highRiskBetsQuery, highRiskTransactionsQuery, membersQuery]);

  return {
    // Risk Alerts
    riskAssessments: assessmentsQuery.data?.riskAssessments ?? [],
    assessmentsLoading: assessmentsQuery.loading,
    assessmentsError: assessmentsQuery.error?.message || null,

    // Suspicious Activity
    highRiskBets: highRiskBetsQuery.data?.highRiskBets?.nodes ?? [],
    highRiskBetsTotalCount: highRiskBetsQuery.data?.highRiskBets?.totalCount ?? 0,
    highRiskTransactions: highRiskTransactionsQuery.data?.highRiskTransactions?.nodes ?? [],
    highRiskTransactionsTotalCount: highRiskTransactionsQuery.data?.highRiskTransactions?.totalCount ?? 0,
    suspiciousLoading: highRiskBetsQuery.loading || highRiskTransactionsQuery.loading,
    suspiciousError: highRiskBetsQuery.error?.message || highRiskTransactionsQuery.error?.message || null,

    // High Roller Monitoring
    highRollers,
    highRollersLoading: membersQuery.loading,
    highRollersError: membersQuery.error?.message || null,

    // Member Trace
    traceUserId,
    traceUser,
    memberTrace,
    traceLoading,
    traceError,
    fetchMemberTrace,

    // Shared
    searchMembers,
    refetch: refetchAll,
  };
};

export default useRisk;
