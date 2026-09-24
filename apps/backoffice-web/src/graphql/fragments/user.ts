import { gql } from '@apollo/client';

// Basic user information fragment
export const USER_BASIC_FRAGMENT = gql`
  fragment UserBasic on User {
    id
    email
    username
    firstName
    lastName
    avatar
    status
    createdAt
    updatedAt
  }
`;

// Detailed user information fragment
export const USER_DETAIL_FRAGMENT = gql`
  fragment UserDetail on User {
    ...UserBasic
    phone
    dateOfBirth
    country
    city
    address
    zipCode
    currency
    language
    timezone
    emailVerified
    phoneVerified
    kycStatus
    vipLevel
    totalDeposits
    totalWithdrawals
    totalBets
    totalWins
    lastLoginAt
    registrationIp
    lastLoginIp
    referralCode
    referredBy
    tags
    notes
    preferences {
      notifications
      marketing
      bonuses
    }
  }
`;

// User statistics fragment
export const USER_STATS_FRAGMENT = gql`
  fragment UserStats on UserStats {
    totalUsers
    activeUsers
    newUsersToday
    newUsersThisWeek
    newUsersThisMonth
    verifiedUsers
    unverifiedUsers
    vipUsers
    suspendedUsers
    averageAge
    topCountries {
      country
      count
      percentage
    }
    registrationTrend {
      date
      count
    }
  }
`;

// User activity fragment
export const USER_ACTIVITY_FRAGMENT = gql`
  fragment UserActivity on UserActivity {
    id
    userId
    type
    description
    metadata
    ipAddress
    userAgent
    createdAt
  }
`;

// User session fragment
export const USER_SESSION_FRAGMENT = gql`
  fragment UserSession on UserSession {
    id
    userId
    token
    ipAddress
    userAgent
    device
    location
    isActive
    expiresAt
    createdAt
    lastActivityAt
  }
`;

// User balance fragment
export const USER_BALANCE_FRAGMENT = gql`
  fragment UserBalance on UserBalance {
    id
    userId
    currency
    balance
    bonusBalance
    lockedBalance
    totalBalance
    updatedAt
  }
`;

// User limits fragment
export const USER_LIMITS_FRAGMENT = gql`
  fragment UserLimits on UserLimits {
    id
    userId
    dailyDepositLimit
    weeklyDepositLimit
    monthlyDepositLimit
    dailyBetLimit
    weeklyBetLimit
    monthlyBetLimit
    sessionTimeLimit
    coolingOffPeriod
    selfExclusionUntil
    isActive
    createdAt
    updatedAt
  }
`;

// User document fragment
export const USER_DOCUMENT_FRAGMENT = gql`
  fragment UserDocument on UserDocument {
    id
    userId
    type
    fileName
    fileUrl
    status
    rejectionReason
    uploadedAt
    reviewedAt
    reviewedBy
  }
`;

// User referral fragment
export const USER_REFERRAL_FRAGMENT = gql`
  fragment UserReferral on UserReferral {
    id
    referrerId
    refereeId
    referralCode
    status
    commissionEarned
    bonusAwarded
    createdAt
    convertedAt
  }
`; 