import { gql } from '@apollo/client';
import {
  GAME_BASIC_FRAGMENT,
  GAME_DETAIL_FRAGMENT,
  GAME_STATS_FRAGMENT,
  BET_FRAGMENT,
  BET_STATS_FRAGMENT,
  BETTING_LIMIT_FRAGMENT,
  GAME_SESSION_FRAGMENT,
  JACKPOT_FRAGMENT,
  TOURNAMENT_FRAGMENT,
  GAME_PROVIDER_FRAGMENT,
  GAME_CATEGORY_FRAGMENT
} from '../fragments/game';

// Get games with pagination and filters
export const GET_GAMES = gql`
  query GetGames(
    $page: Int = 1
    $limit: Int = 20
    $search: String
    $provider: String
    $category: String
    $type: GameType
    $status: GameStatus
    $isActive: Boolean
    $sortBy: String = "name"
    $sortOrder: SortOrder = ASC
  ) {
    games(
      page: $page
      limit: $limit
      search: $search
      provider: $provider
      category: $category
      type: $type
      status: $status
      isActive: $isActive
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...GameBasic
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${GAME_BASIC_FRAGMENT}
`;

// Get game by ID
export const GET_GAME_BY_ID = gql`
  query GetGameById($id: ID!) {
    game(id: $id) {
      ...GameDetail
      provider {
        ...GameProvider
      }
      category {
        ...GameCategory
      }
      jackpots {
        ...Jackpot
      }
    }
  }
  ${GAME_DETAIL_FRAGMENT}
  ${GAME_PROVIDER_FRAGMENT}
  ${GAME_CATEGORY_FRAGMENT}
  ${JACKPOT_FRAGMENT}
`;

// Get game statistics
export const GET_GAME_STATISTICS = gql`
  query GetGameStatistics($dateRange: DateRangeInput) {
    gameStatistics(dateRange: $dateRange) {
      ...GameStats
    }
  }
  ${GAME_STATS_FRAGMENT}
`;

// Get bets with pagination and filters
export const GET_BETS = gql`
  query GetBets(
    $page: Int = 1
    $limit: Int = 20
    $userId: ID
    $gameId: ID
    $status: BetStatus
    $type: BetType
    $dateRange: DateRangeInput
    $minAmount: Float
    $maxAmount: Float
    $sortBy: String = "placedAt"
    $sortOrder: SortOrder = DESC
  ) {
    bets(
      page: $page
      limit: $limit
      userId: $userId
      gameId: $gameId
      status: $status
      type: $type
      dateRange: $dateRange
      minAmount: $minAmount
      maxAmount: $maxAmount
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Bet
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${BET_FRAGMENT}
`;

// Get bet by ID
export const GET_BET_BY_ID = gql`
  query GetBetById($id: ID!) {
    bet(id: $id) {
      ...Bet
      details {
        selections
        odds
        calculations
        metadata
      }
    }
  }
  ${BET_FRAGMENT}
`;

// Get bet statistics
export const GET_BET_STATISTICS = gql`
  query GetBetStatistics($dateRange: DateRangeInput, $gameId: ID, $userId: ID) {
    betStatistics(dateRange: $dateRange, gameId: $gameId, userId: $userId) {
      ...BetStats
    }
  }
  ${BET_STATS_FRAGMENT}
`;

// Get user bets
export const GET_USER_BETS = gql`
  query GetUserBets(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $gameId: ID
    $status: BetStatus
    $dateRange: DateRangeInput
  ) {
    userBets(
      userId: $userId
      page: $page
      limit: $limit
      gameId: $gameId
      status: $status
      dateRange: $dateRange
    ) {
      data {
        ...Bet
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${BET_FRAGMENT}
`;

// Get game bets
export const GET_GAME_BETS = gql`
  query GetGameBets(
    $gameId: ID!
    $page: Int = 1
    $limit: Int = 20
    $status: BetStatus
    $dateRange: DateRangeInput
  ) {
    gameBets(
      gameId: $gameId
      page: $page
      limit: $limit
      status: $status
      dateRange: $dateRange
    ) {
      data {
        ...Bet
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${BET_FRAGMENT}
`;

// Get betting limits
export const GET_BETTING_LIMITS = gql`
  query GetBettingLimits(
    $page: Int = 1
    $limit: Int = 20
    $type: BettingLimitType
    $gameId: ID
    $userId: ID
    $isActive: Boolean
  ) {
    bettingLimits(
      page: $page
      limit: $limit
      type: $type
      gameId: $gameId
      userId: $userId
      isActive: $isActive
    ) {
      data {
        ...BettingLimit
        game {
          id
          name
          provider
        }
        user {
          id
          username
          email
        }
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${BETTING_LIMIT_FRAGMENT}
`;

// Get game sessions
export const GET_GAME_SESSIONS = gql`
  query GetGameSessions(
    $page: Int = 1
    $limit: Int = 20
    $userId: ID
    $gameId: ID
    $isActive: Boolean
    $dateRange: DateRangeInput
  ) {
    gameSessions(
      page: $page
      limit: $limit
      userId: $userId
      gameId: $gameId
      isActive: $isActive
      dateRange: $dateRange
    ) {
      data {
        ...GameSession
        user {
          id
          username
          email
        }
        game {
          id
          name
          provider
        }
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${GAME_SESSION_FRAGMENT}
`;

// Get jackpots
export const GET_JACKPOTS = gql`
  query GetJackpots($gameId: ID, $type: JackpotType, $isActive: Boolean) {
    jackpots(gameId: $gameId, type: $type, isActive: $isActive) {
      ...Jackpot
      game {
        id
        name
        provider
      }
    }
  }
  ${JACKPOT_FRAGMENT}
`;

// Get tournaments
export const GET_TOURNAMENTS = gql`
  query GetTournaments(
    $page: Int = 1
    $limit: Int = 20
    $status: TournamentStatus
    $type: TournamentType
    $dateRange: DateRangeInput
  ) {
    tournaments(
      page: $page
      limit: $limit
      status: $status
      type: $type
      dateRange: $dateRange
    ) {
      data {
        ...Tournament
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${TOURNAMENT_FRAGMENT}
`;

// Get tournament by ID
export const GET_TOURNAMENT_BY_ID = gql`
  query GetTournamentById($id: ID!) {
    tournament(id: $id) {
      ...Tournament
      games {
        ...GameBasic
      }
      participants {
        id
        userId
        username
        joinedAt
        currentScore
        currentRank
      }
    }
  }
  ${TOURNAMENT_FRAGMENT}
  ${GAME_BASIC_FRAGMENT}
`;

// Get game providers
export const GET_GAME_PROVIDERS = gql`
  query GetGameProviders($isActive: Boolean) {
    gameProviders(isActive: $isActive) {
      ...GameProvider
    }
  }
  ${GAME_PROVIDER_FRAGMENT}
`;

// Get game categories
export const GET_GAME_CATEGORIES = gql`
  query GetGameCategories($parentId: ID, $isActive: Boolean) {
    gameCategories(parentId: $parentId, isActive: $isActive) {
      ...GameCategory
      children {
        ...GameCategory
      }
    }
  }
  ${GAME_CATEGORY_FRAGMENT}
`;

// Get popular games
export const GET_POPULAR_GAMES = gql`
  query GetPopularGames($limit: Int = 10, $dateRange: DateRangeInput) {
    popularGames(limit: $limit, dateRange: $dateRange) {
      ...GameBasic
      playCount
      revenue
      uniquePlayers
    }
  }
  ${GAME_BASIC_FRAGMENT}
`;

// Get pending bets
export const GET_PENDING_BETS = gql`
  query GetPendingBets($page: Int = 1, $limit: Int = 20, $gameId: ID) {
    pendingBets(page: $page, limit: $limit, gameId: $gameId) {
      data {
        ...Bet
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
  ${BET_FRAGMENT}
`;

// Get game dashboard data
export const GET_GAME_DASHBOARD = gql`
  query GetGameDashboard($dateRange: DateRangeInput) {
    gameDashboard(dateRange: $dateRange) {
      statistics {
        ...GameStats
      }
      betStatistics {
        ...BetStats
      }
      popularGames {
        ...GameBasic
        playCount
        revenue
      }
      recentBets {
        ...Bet
      }
      activeJackpots {
        ...Jackpot
        game {
          id
          name
        }
      }
    }
  }
  ${GAME_STATS_FRAGMENT}
  ${BET_STATS_FRAGMENT}
  ${GAME_BASIC_FRAGMENT}
  ${BET_FRAGMENT}
  ${JACKPOT_FRAGMENT}
`;

// Search games
export const SEARCH_GAMES = gql`
  query SearchGames($query: String!, $limit: Int = 10) {
    searchGames(query: $query, limit: $limit) {
      ...GameBasic
    }
  }
  ${GAME_BASIC_FRAGMENT}
`; 