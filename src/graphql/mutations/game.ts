import { gql } from '@apollo/client';
import {
  GAME_DETAIL_FRAGMENT,
  BET_FRAGMENT,
  BETTING_LIMIT_FRAGMENT,
  JACKPOT_FRAGMENT,
  TOURNAMENT_FRAGMENT,
  GAME_PROVIDER_FRAGMENT,
  GAME_CATEGORY_FRAGMENT
} from '../fragments/game';

// Game management mutations
export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      ...GameDetail
    }
  }
  ${GAME_DETAIL_FRAGMENT}
`;

export const UPDATE_GAME = gql`
  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {
    updateGame(id: $id, input: $input) {
      ...GameDetail
    }
  }
  ${GAME_DETAIL_FRAGMENT}
`;

export const DELETE_GAME = gql`
  mutation DeleteGame($id: ID!) {
    deleteGame(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_GAME_STATUS = gql`
  mutation ToggleGameStatus($id: ID!) {
    toggleGameStatus(id: $id) {
      id
      name
      isActive
      status
      updatedAt
    }
  }
`;

export const UPDATE_GAME_CONFIGURATION = gql`
  mutation UpdateGameConfiguration($id: ID!, $configuration: JSON!) {
    updateGameConfiguration(id: $id, configuration: $configuration) {
      ...GameDetail
    }
  }
  ${GAME_DETAIL_FRAGMENT}
`;

// Bet mutations
export const PLACE_BET = gql`
  mutation PlaceBet($input: PlaceBetInput!) {
    placeBet(input: $input) {
      ...Bet
    }
  }
  ${BET_FRAGMENT}
`;

export const SETTLE_BET = gql`
  mutation SettleBet($id: ID!, $result: BetResult!, $winAmount: Float, $notes: String) {
    settleBet(id: $id, result: $result, winAmount: $winAmount, notes: $notes) {
      ...Bet
    }
  }
  ${BET_FRAGMENT}
`;

export const VOID_BET = gql`
  mutation VoidBet($id: ID!, $reason: String!) {
    voidBet(id: $id, reason: $reason) {
      ...Bet
    }
  }
  ${BET_FRAGMENT}
`;

export const CANCEL_BET = gql`
  mutation CancelBet($id: ID!, $reason: String!) {
    cancelBet(id: $id, reason: $reason) {
      ...Bet
    }
  }
  ${BET_FRAGMENT}
`;

// Betting limit mutations
export const CREATE_BETTING_LIMIT = gql`
  mutation CreateBettingLimit($input: CreateBettingLimitInput!) {
    createBettingLimit(input: $input) {
      ...BettingLimit
    }
  }
  ${BETTING_LIMIT_FRAGMENT}
`;

export const UPDATE_BETTING_LIMIT = gql`
  mutation UpdateBettingLimit($id: ID!, $input: UpdateBettingLimitInput!) {
    updateBettingLimit(id: $id, input: $input) {
      ...BettingLimit
    }
  }
  ${BETTING_LIMIT_FRAGMENT}
`;

export const DELETE_BETTING_LIMIT = gql`
  mutation DeleteBettingLimit($id: ID!) {
    deleteBettingLimit(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_BETTING_LIMIT = gql`
  mutation ToggleBettingLimit($id: ID!) {
    toggleBettingLimit(id: $id) {
      ...BettingLimit
    }
  }
  ${BETTING_LIMIT_FRAGMENT}
`;

// Jackpot mutations
export const CREATE_JACKPOT = gql`
  mutation CreateJackpot($input: CreateJackpotInput!) {
    createJackpot(input: $input) {
      ...Jackpot
    }
  }
  ${JACKPOT_FRAGMENT}
`;

export const UPDATE_JACKPOT = gql`
  mutation UpdateJackpot($id: ID!, $input: UpdateJackpotInput!) {
    updateJackpot(id: $id, input: $input) {
      ...Jackpot
    }
  }
  ${JACKPOT_FRAGMENT}
`;

export const TRIGGER_JACKPOT = gql`
  mutation TriggerJackpot($id: ID!, $winnerId: ID!, $winAmount: Float!) {
    triggerJackpot(id: $id, winnerId: $winnerId, winAmount: $winAmount) {
      ...Jackpot
      winner {
        id
        username
        email
      }
    }
  }
  ${JACKPOT_FRAGMENT}
`;

export const RESET_JACKPOT = gql`
  mutation ResetJackpot($id: ID!, $seedAmount: Float) {
    resetJackpot(id: $id, seedAmount: $seedAmount) {
      ...Jackpot
    }
  }
  ${JACKPOT_FRAGMENT}
`;

// Tournament mutations
export const CREATE_TOURNAMENT = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      ...Tournament
    }
  }
  ${TOURNAMENT_FRAGMENT}
`;

export const UPDATE_TOURNAMENT = gql`
  mutation UpdateTournament($id: ID!, $input: UpdateTournamentInput!) {
    updateTournament(id: $id, input: $input) {
      ...Tournament
    }
  }
  ${TOURNAMENT_FRAGMENT}
`;

export const DELETE_TOURNAMENT = gql`
  mutation DeleteTournament($id: ID!) {
    deleteTournament(id: $id) {
      success
      message
    }
  }
`;

export const START_TOURNAMENT = gql`
  mutation StartTournament($id: ID!) {
    startTournament(id: $id) {
      ...Tournament
    }
  }
  ${TOURNAMENT_FRAGMENT}
`;

export const END_TOURNAMENT = gql`
  mutation EndTournament($id: ID!) {
    endTournament(id: $id) {
      ...Tournament
    }
  }
  ${TOURNAMENT_FRAGMENT}
`;

export const JOIN_TOURNAMENT = gql`
  mutation JoinTournament($tournamentId: ID!, $userId: ID!) {
    joinTournament(tournamentId: $tournamentId, userId: $userId) {
      success
      message
      participant {
        id
        userId
        tournamentId
        joinedAt
        currentScore
        currentRank
      }
    }
  }
`;

export const LEAVE_TOURNAMENT = gql`
  mutation LeaveTournament($tournamentId: ID!, $userId: ID!) {
    leaveTournament(tournamentId: $tournamentId, userId: $userId) {
      success
      message
    }
  }
`;

// Game provider mutations
export const CREATE_GAME_PROVIDER = gql`
  mutation CreateGameProvider($input: CreateGameProviderInput!) {
    createGameProvider(input: $input) {
      ...GameProvider
    }
  }
  ${GAME_PROVIDER_FRAGMENT}
`;

export const UPDATE_GAME_PROVIDER = gql`
  mutation UpdateGameProvider($id: ID!, $input: UpdateGameProviderInput!) {
    updateGameProvider(id: $id, input: $input) {
      ...GameProvider
    }
  }
  ${GAME_PROVIDER_FRAGMENT}
`;

export const DELETE_GAME_PROVIDER = gql`
  mutation DeleteGameProvider($id: ID!) {
    deleteGameProvider(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_GAME_PROVIDER = gql`
  mutation ToggleGameProvider($id: ID!) {
    toggleGameProvider(id: $id) {
      ...GameProvider
    }
  }
  ${GAME_PROVIDER_FRAGMENT}
`;

// Game category mutations
export const CREATE_GAME_CATEGORY = gql`
  mutation CreateGameCategory($input: CreateGameCategoryInput!) {
    createGameCategory(input: $input) {
      ...GameCategory
    }
  }
  ${GAME_CATEGORY_FRAGMENT}
`;

export const UPDATE_GAME_CATEGORY = gql`
  mutation UpdateGameCategory($id: ID!, $input: UpdateGameCategoryInput!) {
    updateGameCategory(id: $id, input: $input) {
      ...GameCategory
    }
  }
  ${GAME_CATEGORY_FRAGMENT}
`;

export const DELETE_GAME_CATEGORY = gql`
  mutation DeleteGameCategory($id: ID!) {
    deleteGameCategory(id: $id) {
      success
      message
    }
  }
`;

export const REORDER_GAME_CATEGORIES = gql`
  mutation ReorderGameCategories($categoryIds: [ID!]!) {
    reorderGameCategories(categoryIds: $categoryIds) {
      success
      message
      categories {
        ...GameCategory
      }
    }
  }
  ${GAME_CATEGORY_FRAGMENT}
`;

// Bulk operations
export const BULK_SETTLE_BETS = gql`
  mutation BulkSettleBets($betIds: [ID!]!, $result: BetResult!, $notes: String) {
    bulkSettleBets(betIds: $betIds, result: $result, notes: $notes) {
      success
      message
      settledCount
      errors {
        betId
        error
      }
    }
  }
`;

export const BULK_VOID_BETS = gql`
  mutation BulkVoidBets($betIds: [ID!]!, $reason: String!) {
    bulkVoidBets(betIds: $betIds, reason: $reason) {
      success
      message
      voidedCount
      errors {
        betId
        error
      }
    }
  }
`;

export const BULK_UPDATE_GAMES = gql`
  mutation BulkUpdateGames($gameIds: [ID!]!, $input: BulkUpdateGameInput!) {
    bulkUpdateGames(gameIds: $gameIds, input: $input) {
      success
      message
      updatedCount
      errors {
        gameId
        error
      }
    }
  }
`;

// Game session mutations
export const START_GAME_SESSION = gql`
  mutation StartGameSession($userId: ID!, $gameId: ID!) {
    startGameSession(userId: $userId, gameId: $gameId) {
      id
      userId
      gameId
      startedAt
      isActive
    }
  }
`;

export const END_GAME_SESSION = gql`
  mutation EndGameSession($sessionId: ID!) {
    endGameSession(sessionId: $sessionId) {
      id
      userId
      gameId
      startedAt
      endedAt
      duration
      totalBets
      totalWins
      netResult
      isActive
    }
  }
`;

// RNG and fairness mutations
export const VERIFY_GAME_RESULT = gql`
  mutation VerifyGameResult($betId: ID!, $serverSeed: String!, $clientSeed: String!, $nonce: Int!) {
    verifyGameResult(betId: $betId, serverSeed: $serverSeed, clientSeed: $clientSeed, nonce: $nonce) {
      isValid
      expectedResult
      actualResult
      hash
    }
  }
`;

export const GENERATE_SERVER_SEED = gql`
  mutation GenerateServerSeed($userId: ID!) {
    generateServerSeed(userId: $userId) {
      seedHash
      expiresAt
    }
  }
`;

export const SET_CLIENT_SEED = gql`
  mutation SetClientSeed($userId: ID!, $clientSeed: String!) {
    setClientSeed(userId: $userId, clientSeed: $clientSeed) {
      success
      message
      newSeedHash
    }
  }
`; 