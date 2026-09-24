import { useCallback, useEffect, useState } from 'react';
import { listGamesWithLimits, updateGameLimits } from '../../../../services/api/game-limits';

// There is no dedicated "bet limits" model on the backend. The
// gameType/minBet/maxBet/maxWin shape maps directly onto real fields on
// the games table (see game-limits.service.ts), so "bet limits" here means
// "per-game min/max bet and max win", read and written through GET/PATCH
// /games - not full CMS games CRUD (that's a separate, not-yet-built
// phase).
const useBettingLimits = () => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [betLimits, setBetLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGamesWithLimits(category)
      .then((rows) => {
        if (cancelled) return;
        setBetLimits(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => load(), [load]);

  // filter: { category, provider, status, search } - only category is a
  // real, backend-supported filter; the others have no field to filter on.
  const fetchBetLimits = useCallback((filter: any = {}) => {
    setCategory(filter.category || undefined);
  }, []);

  const updateBetLimit = useCallback(
    async (gameId: string, { minBet, maxBet, maxWin }: any) => {
      const input: any = {};
      if (minBet !== undefined && minBet !== '') input.minBet = Number.parseFloat(minBet);
      if (maxBet !== undefined && maxBet !== '') input.maxBet = Number.parseFloat(maxBet);
      if (maxWin !== undefined && maxWin !== '') input.maxWin = Number.parseFloat(maxWin);
      const data = await updateGameLimits(gameId, input);
      load();
      return data;
    },
    [load],
  );

  return {
    betLimits,
    totalCount: betLimits.length,
    loading,
    error,
    fetchBetLimits,
    updateBetLimit,
    refetch: load,
  };
};

export default useBettingLimits;
