import { useCallback, useMemo, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// There is no dedicated "bet limits" model on the backend. The mock
// gameType/minBet/maxBet/maxWin shape maps directly onto real fields that
// already exist on the Game type (see server/src/graphql/schema/index.js),
// so "bet limits" here means "per-game min/max bet and max win", read and
// written through games() / updateGame().
const GET_GAMES_WITH_LIMITS = gql`
  query GamesWithLimits($filter: GameFilterInput, $pagination: PaginationInput) {
    games(filter: $filter, pagination: $pagination) {
      totalCount
      nodes {
        id
        name
        provider
        category
        status
        minBet
        maxBet
        maxWin
        currencies
      }
    }
  }
`;

const UPDATE_GAME_LIMITS = gql`
  mutation UpdateGameLimits($id: ID!, $input: UpdateGameInput!) {
    updateGame(id: $id, input: $input) {
      id
      minBet
      maxBet
      maxWin
    }
  }
`;

const DEFAULT_PAGINATION = { page: 1, limit: 100 };

const useBettingLimits = () => {
  const [filter, setFilter] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // See useBets.js: the backend's `filter = {}` default parameter only
  // applies when the argument is `undefined`, so an unset filter must be
  // left out of variables rather than sent as an explicit null.
  const variables = useMemo(
    () => (filter ? { filter, pagination } : { pagination }),
    [filter, pagination]
  );

  const gamesQuery = useQuery(GET_GAMES_WITH_LIMITS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const [updateGameLimitsMutation] = useMutation(UPDATE_GAME_LIMITS);

  // filter: { category, provider, status, search }
  const fetchBetLimits = useCallback((nextFilter: any = {}, nextPagination?: any) => {
    const clean = Object.fromEntries(
      Object.entries(nextFilter).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    setFilter(Object.keys(clean).length ? clean : null);
    if (nextPagination) setPagination((prev) => ({ ...prev, ...nextPagination }));
  }, []);

  const updateBetLimit = useCallback(
    async (gameId: any, { minBet, maxBet, maxWin }: any) => {
      const input: any = {};
      if (minBet !== undefined && minBet !== '') input.minBet = parseFloat(minBet);
      if (maxBet !== undefined && maxBet !== '') input.maxBet = parseFloat(maxBet);
      if (maxWin !== undefined && maxWin !== '') input.maxWin = parseFloat(maxWin);
      const { data } = await updateGameLimitsMutation({ variables: { id: gameId, input } });
      await gamesQuery.refetch();
      return data?.updateGame;
    },
    [updateGameLimitsMutation, gamesQuery]
  );

  const betLimits = gamesQuery.data?.games?.nodes ?? [];

  return {
    betLimits,
    totalCount: gamesQuery.data?.games?.totalCount ?? 0,
    loading: gamesQuery.loading,
    error: gamesQuery.error?.message || null,
    fetchBetLimits,
    updateBetLimit,
    refetch: gamesQuery.refetch,
  };
};

export default useBettingLimits;
