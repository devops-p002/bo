import { gql } from '@apollo/client';

// Basic game fragment
export const GAME_BASIC_FRAGMENT = gql`
  fragment GameBasic on Game {
    id
    name
    slug
    provider
    category
    type
    status
    thumbnail
    isActive
    createdAt
    updatedAt
  }
`;

// Detailed game fragment
export const GAME_DETAIL_FRAGMENT = gql`
  fragment GameDetail on Game {
    ...GameBasic
    description
    rules
    minBet
    maxBet
    rtp
    volatility
    paylines
    reels
    themes
    features
    languages
    currencies
    countries
    mobileOptimized
    demoAvailable
    jackpotType
    jackpotAmount
    popularity
    rating
    playCount
    configuration
    metadata
  }
`;

// Game statistics fragment
export const GAME_STATS_FRAGMENT = gql`
  fragment GameStats on GameStats {
    totalGames
    activeGames
    inactiveGames
    totalProviders
    totalCategories
    popularGames {
      id
      name
      playCount
      revenue
    }
    categoryStats {
      category
      gameCount
      playCount
      revenue
    }
    providerStats {
      provider
      gameCount
      playCount
      revenue
    }
  }
`;

// Bet fragment
export const BET_FRAGMENT = gql`
  fragment Bet on Bet {
    id
    userId
    gameId
    amount
    currency
    odds
    potentialWin
    actualWin
    status
    type
    selections
    placedAt
    settledAt
    voidedAt
    metadata
    user {
      id
      username
      email
      vipLevel
    }
    game {
      id
      name
      provider
      category
    }
  }
`;

// Bet statistics fragment
export const BET_STATS_FRAGMENT = gql`
  fragment BetStats on BetStats {
    totalBets
    totalVolume
    totalWins
    totalLosses
    netRevenue
    averageBetAmount
    averageWinAmount
    winRate
    houseEdge
    pendingBets
    settledBets
    voidedBets
    topGames {
      gameId
      gameName
      betCount
      volume
      revenue
    }
    hourlyTrend {
      hour
      betCount
      volume
      wins
    }
  }
`;

// Betting limit fragment
export const BETTING_LIMIT_FRAGMENT = gql`
  fragment BettingLimit on BettingLimit {
    id
    name
    type
    gameId
    userId
    minBet
    maxBet
    dailyLimit
    weeklyLimit
    monthlyLimit
    maxWin
    isActive
    appliesTo
    conditions
    createdAt
    updatedAt
  }
`;

// Game session fragment
export const GAME_SESSION_FRAGMENT = gql`
  fragment GameSession on GameSession {
    id
    userId
    gameId
    startedAt
    endedAt
    duration
    totalBets
    totalWins
    netResult
    currency
    isActive
    metadata
  }
`;

// Jackpot fragment
export const JACKPOT_FRAGMENT = gql`
  fragment Jackpot on Jackpot {
    id
    gameId
    type
    amount
    currency
    seedAmount
    contributionRate
    lastWonAt
    lastWonBy
    lastWonAmount
    isActive
    metadata
  }
`;

// Tournament fragment
export const TOURNAMENT_FRAGMENT = gql`
  fragment Tournament on Tournament {
    id
    name
    description
    type
    gameIds
    startDate
    endDate
    status
    entryFee
    currency
    maxParticipants
    currentParticipants
    prizePool
    prizeStructure
    leaderboard {
      rank
      userId
      username
      score
      prize
    }
    rules
    metadata
  }
`;

// Game provider fragment
export const GAME_PROVIDER_FRAGMENT = gql`
  fragment GameProvider on GameProvider {
    id
    name
    slug
    logo
    website
    isActive
    gameCount
    categories
    features
    integration
    configuration
    createdAt
    updatedAt
  }
`;

// Game category fragment
export const GAME_CATEGORY_FRAGMENT = gql`
  fragment GameCategory on GameCategory {
    id
    name
    slug
    description
    icon
    parentId
    sortOrder
    isActive
    gameCount
    metadata
  }
`; 