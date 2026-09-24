import { useCallback, useEffect, useState } from 'react';
import { listBets, updateBetStatus } from '../../../../services/api/bets';

const DEFAULT_PAGINATION = { page: 1, limit: 50 };

// filter: { status, gameCategory, playerId, search, minAmount, maxAmount,
// dateRange: { start, end } } -> the flat query params GET /bets accepts.
function toApiFilter(filter: any) {
  const apiFilter: any = {};
  if (filter.status) apiFilter.status = filter.status;
  if (filter.gameCategory) apiFilter.gameCategory = filter.gameCategory;
  if (filter.playerId) apiFilter.playerId = filter.playerId;
  if (filter.search) apiFilter.search = filter.search;
  if (filter.minAmount !== undefined) apiFilter.minAmount = filter.minAmount;
  if (filter.maxAmount !== undefined) apiFilter.maxAmount = filter.maxAmount;
  if (filter.dateRange) {
    apiFilter.dateRangeStart = filter.dateRange.start;
    apiFilter.dateRangeEnd = filter.dateRange.end;
  }
  return apiFilter;
}

/**
 * Wires the Bets feature to the real backend (GET/PATCH /bets). Each
 * useBets() call keeps its own filter/pagination state and fetches
 * automatically whenever that state changes - fetchBets/fetchPendingBets
 * are just setters, same shape as the previous Apollo-backed version so
 * BetsPage's own instance (which never calls them, only reads the
 * result) still gets real data on mount.
 */
const useBets = () => {
  const [betsFilter, setBetsFilterState] = useState<any>({});
  const [betsPagination, setBetsPagination] = useState(DEFAULT_PAGINATION);
  const [pendingPagination, setPendingPagination] = useState(DEFAULT_PAGINATION);

  const [bets, setBets] = useState<any[]>([]);
  const [betsTotalCount, setBetsTotalCount] = useState(0);
  const [betsLoading, setBetsLoading] = useState(false);
  const [betsError, setBetsError] = useState<string | null>(null);

  const [pendingBets, setPendingBets] = useState<any[]>([]);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const loadBets = useCallback(() => {
    let cancelled = false;
    setBetsLoading(true);
    setBetsError(null);
    listBets(toApiFilter(betsFilter), betsPagination)
      .then((data) => {
        if (cancelled) return;
        setBets(data.nodes);
        setBetsTotalCount(data.totalCount);
      })
      .catch((err) => {
        if (cancelled) return;
        setBetsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setBetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [betsFilter, betsPagination]);

  useEffect(() => loadBets(), [loadBets]);

  const loadPendingBets = useCallback(() => {
    let cancelled = false;
    setPendingLoading(true);
    setPendingError(null);
    listBets({ status: 'PENDING' }, pendingPagination)
      .then((data) => {
        if (cancelled) return;
        setPendingBets(data.nodes);
        setPendingTotalCount(data.totalCount);
      })
      .catch((err) => {
        if (cancelled) return;
        setPendingError(err.message);
      })
      .finally(() => {
        if (!cancelled) setPendingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pendingPagination]);

  useEffect(() => loadPendingBets(), [loadPendingBets]);

  const fetchBets = useCallback((filter: any = {}, pagination?: any) => {
    setBetsFilterState(filter);
    if (pagination) setBetsPagination((prev) => ({ ...prev, ...pagination }));
  }, []);

  const fetchPendingBets = useCallback((pagination?: any) => {
    if (pagination) setPendingPagination((prev) => ({ ...prev, ...pagination }));
  }, []);

  const refetchAll = useCallback(() => {
    loadBets();
    loadPendingBets();
  }, [loadBets, loadPendingBets]);

  const cancelBet = useCallback(
    async (betId: string, reason = 'Cancelled by administrator') => {
      const data = await updateBetStatus(betId, { status: 'CANCELLED', voidReason: reason });
      refetchAll();
      return data;
    },
    [refetchAll],
  );

  // outcome: 'won' | 'lost' | 'push' | 'cancelled'. All settle down to the
  // same SETTLED status - "won"/"lost"/"push" only affects winAmount and
  // the recorded result, there's no separate won/lost status on the row.
  const settleBet = useCallback(
    async (betId: string, outcome: string, extra: any = {}) => {
      if (outcome === 'cancelled') {
        return cancelBet(betId, extra.notes || 'Cancelled by administrator');
      }
      const bet = [...bets, ...pendingBets].find((b) => b.id === betId);
      let winAmount: number;
      if (extra.winAmount !== undefined && extra.winAmount !== '' && extra.winAmount !== null) {
        winAmount = Number.parseFloat(extra.winAmount);
      } else if (outcome === 'won') {
        winAmount = bet?.potentialWin ?? 0;
      } else if (outcome === 'push') {
        winAmount = bet?.amount ?? 0;
      } else {
        winAmount = 0;
      }
      const data = await updateBetStatus(betId, {
        status: 'SETTLED',
        winAmount,
        result: { outcome: outcome ? outcome.toUpperCase() : 'SETTLED', notes: extra.notes || null },
      });
      refetchAll();
      return data;
    },
    [bets, pendingBets, cancelBet, refetchAll],
  );

  const voidBet = useCallback(
    async (betId: string, reason = 'Voided by administrator') => {
      const data = await updateBetStatus(betId, { status: 'VOID', voidReason: reason });
      refetchAll();
      return data;
    },
    [refetchAll],
  );

  // action: 'won' | 'lost' | 'void'. Runs the matching single update for
  // each selected bet (no dedicated bulk endpoint exists on the backend).
  const bulkSettleBets = useCallback(
    async (betIds: string[], action: string) => {
      if (action === 'void') {
        await Promise.all(betIds.map((id) => updateBetStatus(id, { status: 'VOID', voidReason: 'Bulk void by administrator' })));
      } else {
        await Promise.all(
          betIds.map((id) => {
            const bet = [...bets, ...pendingBets].find((b) => b.id === id);
            const winAmount = action === 'won' ? (bet?.potentialWin ?? 0) : 0;
            return updateBetStatus(id, { status: 'SETTLED', winAmount, result: { outcome: action.toUpperCase(), notes: 'Bulk settlement' } });
          }),
        );
      }
      refetchAll();
    },
    [bets, pendingBets, refetchAll],
  );

  return {
    bets,
    betsTotalCount,
    pendingBets,
    pendingTotalCount,
    loading: betsLoading || pendingLoading,
    error: betsError || pendingError,
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
