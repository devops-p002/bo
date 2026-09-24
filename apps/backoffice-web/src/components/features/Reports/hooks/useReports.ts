import { useState, useCallback, useEffect } from 'react';
import { gql, useApolloClient } from '@apollo/client';

const GET_BET_REPORT = gql`
  query BetReportData($filter: BetFilterInput, $pagination: PaginationInput) {
    bets(filter: $filter, pagination: $pagination) {
      nodes {
        id
        createdAt
        amount
        winAmount
        status
        isWin
        user { username }
        game { name }
      }
    }
  }
`;

const GET_BONUS_REPORT = gql`
  query BonusReportData($pagination: PaginationInput) {
    bonuses(pagination: $pagination) {
      nodes {
        id
        createdAt
        type
        amount
        status
        wagerProgress
        remainingWagerAmount
        user { username }
      }
    }
  }
`;

const GET_PAYMENT_REPORT = gql`
  query PaymentReportData($filter: TransactionFilterInput, $pagination: PaginationInput) {
    transactions(filter: $filter, pagination: $pagination) {
      nodes {
        id
        createdAt
        type
        amount
        status
        paymentMethod
        user { username }
      }
    }
  }
`;

const GET_TURNOVER_REPORT = gql`
  query TurnoverReportData($pagination: PaginationInput, $dateRange: DateRangeInput) {
    userBettingLeaderboard(pagination: $pagination, dateRange: $dateRange) {
      userId
      username
      turnoverAmount
      companyProfitLoss
    }
  }
`;

const GET_DAILY_REPORT = gql`
  query DailyReportData($dateRange: DateRangeInput) {
    revenueStats(dateRange: $dateRange) {
      daily { date deposits withdrawals bets wins revenue }
    }
  }
`;

const buildDateRange = (filters) => {
  if (filters?.startDate && filters?.endDate) {
    return { start: filters.startDate, end: filters.endDate };
  }
  return undefined;
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

// Dispatches to the real GraphQL query for each report type. Previously this
// hook ignored its `type`/`filters` arguments entirely and always returned
// the same two hardcoded rows under a `reports` key the callers didn't even
// read (they destructured `data`), so every report silently rendered empty.
export const useReports = (type?, filters: any = {}) => {
  const apolloClient = useApolloClient();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!type) {
      setReports([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dateRange = buildDateRange(filters);
      let rows = [];

      switch (type) {
        case 'bet': {
          const { data } = await apolloClient.query({
            query: GET_BET_REPORT,
            variables: {
              filter: dateRange ? { dateRange } : undefined,
              pagination: { page: 1, limit: 100 },
            },
            fetchPolicy: 'network-only',
          });
          rows = data.bets.nodes.map((b) => ({
            id: b.id,
            date: formatDate(b.createdAt),
            user: b.user?.username,
            game: b.game?.name,
            betAmount: b.amount,
            winAmount: b.winAmount,
            result: b.isWin ? 'Win' : 'Loss',
            status: b.status,
          }));
          break;
        }

        case 'bonus': {
          const { data } = await apolloClient.query({
            query: GET_BONUS_REPORT,
            variables: { pagination: { page: 1, limit: 100 } },
            fetchPolicy: 'network-only',
          });
          // bonuses() has no dateRange filter server-side, so apply the
          // period filter client-side if one is set.
          let nodes = data.bonuses.nodes;
          if (dateRange) {
            nodes = nodes.filter((b) => b.createdAt >= dateRange.start && b.createdAt <= dateRange.end);
          }
          rows = nodes.map((b) => ({
            id: b.id,
            date: formatDate(b.createdAt),
            type: b.type,
            amount: b.amount,
            issuedTo: b.user?.username,
            status: b.status,
            wagered: b.wagerProgress,
            remaining: b.remainingWagerAmount,
          }));
          break;
        }

        case 'payment': {
          const { data } = await apolloClient.query({
            query: GET_PAYMENT_REPORT,
            variables: {
              filter: dateRange ? { dateRange } : undefined,
              pagination: { page: 1, limit: 100 },
            },
            fetchPolicy: 'network-only',
          });
          rows = data.transactions.nodes.map((t) => ({
            id: t.id,
            date: formatDate(t.createdAt),
            transactionId: t.id,
            type: t.type,
            amount: t.amount,
            method: t.paymentMethod || 'N/A',
            status: t.status,
            user: t.user?.username,
          }));
          break;
        }

        case 'turnover': {
          // userBettingLeaderboard is per-user, not per-bet/per-game, so
          // "Game" and "Total Bets" (a count) have no backend equivalent -
          // shown as aggregate placeholders below.
          const { data } = await apolloClient.query({
            query: GET_TURNOVER_REPORT,
            variables: { pagination: { page: 1, limit: 100 }, dateRange },
            fetchPolicy: 'network-only',
          });
          const periodLabel = dateRange ? `${filters.startDate} - ${filters.endDate}` : 'All time';
          rows = data.userBettingLeaderboard.map((row) => ({
            id: row.userId,
            date: periodLabel,
            user: row.username,
            game: 'All games',
            totalAmount: row.turnoverAmount,
            winnings: row.turnoverAmount - row.companyProfitLoss,
            netResult: row.companyProfitLoss,
          }));
          break;
        }

        case 'daily': {
          // DailyRevenue has no new-user/active-user counts, so those
          // columns aren't populated here.
          const { data } = await apolloClient.query({
            query: GET_DAILY_REPORT,
            variables: { dateRange },
            fetchPolicy: 'network-only',
          });
          rows = data.revenueStats.daily.map((d) => ({
            id: d.date,
            date: d.date,
            totalTurnover: d.bets,
            totalWinnings: d.wins,
            netRevenue: d.revenue,
          }));
          break;
        }

        default:
          rows = [];
      }

      setReports(rows);
    } catch (err) {
      setError(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, filters.startDate, filters.endDate, apolloClient]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    data: reports,
    loading,
    error,
    fetchReports,
    refetch: fetchReports,
  };
};
