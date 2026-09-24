import { gql } from '@apollo/client';
import {
  USER_BASIC_FRAGMENT,
  USER_DETAIL_FRAGMENT,
  USER_STATS_FRAGMENT,
  USER_ACTIVITY_FRAGMENT,
  USER_SESSION_FRAGMENT,
  USER_BALANCE_FRAGMENT,
  USER_LIMITS_FRAGMENT,
  USER_DOCUMENT_FRAGMENT,
  USER_REFERRAL_FRAGMENT
} from '../fragments/user';

// Get current user
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      ...UserDetail
      balance {
        ...UserBalance
      }
      limits {
        ...UserLimits
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
  ${USER_BALANCE_FRAGMENT}
  ${USER_LIMITS_FRAGMENT}
`;

// Get user by ID
export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      ...UserDetail
      balance {
        ...UserBalance
      }
      limits {
        ...UserLimits
      }
      documents {
        ...UserDocument
      }
      sessions {
        ...UserSession
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
  ${USER_BALANCE_FRAGMENT}
  ${USER_LIMITS_FRAGMENT}
  ${USER_DOCUMENT_FRAGMENT}
  ${USER_SESSION_FRAGMENT}
`;

// Get users with pagination and filters
export const GET_USERS = gql`
  query GetUsers(
    $page: Int = 1
    $limit: Int = 20
    $search: String
    $status: UserStatus
    $vipLevel: Int
    $country: String
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    users(
      page: $page
      limit: $limit
      search: $search
      status: $status
      vipLevel: $vipLevel
      country: $country
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...UserBasic
        balance {
          totalBalance
          currency
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
  ${USER_BASIC_FRAGMENT}
`;

// Get user statistics
export const GET_USER_STATISTICS = gql`
  query GetUserStatistics($dateRange: DateRangeInput) {
    userStatistics(dateRange: $dateRange) {
      ...UserStats
    }
  }
  ${USER_STATS_FRAGMENT}
`;

// Get user activities
export const GET_USER_ACTIVITIES = gql`
  query GetUserActivities(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $type: String
    $dateRange: DateRangeInput
  ) {
    userActivities(
      userId: $userId
      page: $page
      limit: $limit
      type: $type
      dateRange: $dateRange
    ) {
      data {
        ...UserActivity
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
  ${USER_ACTIVITY_FRAGMENT}
`;

// Get user sessions
export const GET_USER_SESSIONS = gql`
  query GetUserSessions(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $isActive: Boolean
  ) {
    userSessions(
      userId: $userId
      page: $page
      limit: $limit
      isActive: $isActive
    ) {
      data {
        ...UserSession
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
  ${USER_SESSION_FRAGMENT}
`;

// Get user balance history
export const GET_USER_BALANCE_HISTORY = gql`
  query GetUserBalanceHistory(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $dateRange: DateRangeInput
  ) {
    userBalanceHistory(
      userId: $userId
      page: $page
      limit: $limit
      dateRange: $dateRange
    ) {
      data {
        id
        userId
        type
        amount
        currency
        balanceBefore
        balanceAfter
        description
        createdAt
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
`;

// Get user documents
export const GET_USER_DOCUMENTS = gql`
  query GetUserDocuments($userId: ID!) {
    userDocuments(userId: $userId) {
      ...UserDocument
    }
  }
  ${USER_DOCUMENT_FRAGMENT}
`;

// Get user referrals
export const GET_USER_REFERRALS = gql`
  query GetUserReferrals(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $status: ReferralStatus
  ) {
    userReferrals(
      userId: $userId
      page: $page
      limit: $limit
      status: $status
    ) {
      data {
        ...UserReferral
        referee {
          ...UserBasic
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
  ${USER_REFERRAL_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
`;

// Search users
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int = 10) {
    searchUsers(query: $query, limit: $limit) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// Get user profile summary
export const GET_USER_PROFILE_SUMMARY = gql`
  query GetUserProfileSummary($userId: ID!) {
    userProfileSummary(userId: $userId) {
      user {
        ...UserDetail
      }
      stats {
        totalDeposits
        totalWithdrawals
        totalBets
        totalWins
        netPosition
        lastLoginAt
        registrationDate
        daysSinceRegistration
        averageBetAmount
        favoriteGame
        riskScore
      }
      recentActivity {
        ...UserActivity
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
  ${USER_ACTIVITY_FRAGMENT}
`;

// Get online users
export const GET_ONLINE_USERS = gql`
  query GetOnlineUsers($page: Int = 1, $limit: Int = 20) {
    onlineUsers(page: $page, limit: $limit) {
      data {
        ...UserBasic
        currentSession {
          id
          startedAt
          lastActivityAt
          ipAddress
          device
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
  ${USER_BASIC_FRAGMENT}
`;

// Get VIP users
export const GET_VIP_USERS = gql`
  query GetVipUsers(
    $page: Int = 1
    $limit: Int = 20
    $vipLevel: Int
    $sortBy: String = "totalDeposits"
    $sortOrder: SortOrder = DESC
  ) {
    vipUsers(
      page: $page
      limit: $limit
      vipLevel: $vipLevel
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...UserBasic
        vipLevel
        totalDeposits
        totalBets
        lifetimeValue
        vipManager
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
  ${USER_BASIC_FRAGMENT}
`; 