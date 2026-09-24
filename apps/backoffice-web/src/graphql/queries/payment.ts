import { gql } from '@apollo/client';
import {
  PAYMENT_BASIC_FRAGMENT,
  PAYMENT_DETAIL_FRAGMENT,
  PAYMENT_METHOD_FRAGMENT,
  TRANSACTION_FRAGMENT,
  PAYMENT_STATS_FRAGMENT,
  DEPOSIT_FRAGMENT,
  WITHDRAWAL_FRAGMENT,
  BONUS_FRAGMENT,
  COMMISSION_FRAGMENT
} from '../fragments/payment';

// Get payments with pagination and filters
export const GET_PAYMENTS = gql`
  query GetPayments(
    $page: Int = 1
    $limit: Int = 20
    $type: PaymentType
    $status: PaymentStatus
    $method: String
    $userId: ID
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    payments(
      page: $page
      limit: $limit
      type: $type
      status: $status
      method: $method
      userId: $userId
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...PaymentBasic
        user {
          id
          username
          email
          vipLevel
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
  ${PAYMENT_BASIC_FRAGMENT}
`;

// Get payment by ID
export const GET_PAYMENT_BY_ID = gql`
  query GetPaymentById($id: ID!) {
    payment(id: $id) {
      ...PaymentDetail
      user {
        id
        username
        email
        firstName
        lastName
        vipLevel
        country
      }
    }
  }
  ${PAYMENT_DETAIL_FRAGMENT}
`;

// Get deposits
export const GET_DEPOSITS = gql`
  query GetDeposits(
    $page: Int = 1
    $limit: Int = 20
    $status: PaymentStatus
    $method: String
    $userId: ID
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    deposits(
      page: $page
      limit: $limit
      status: $status
      method: $method
      userId: $userId
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Deposit
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
  ${DEPOSIT_FRAGMENT}
`;

// Get withdrawals
export const GET_WITHDRAWALS = gql`
  query GetWithdrawals(
    $page: Int = 1
    $limit: Int = 20
    $status: PaymentStatus
    $method: String
    $userId: ID
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    withdrawals(
      page: $page
      limit: $limit
      status: $status
      method: $method
      userId: $userId
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Withdrawal
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
  ${WITHDRAWAL_FRAGMENT}
`;

// Get payment methods
export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods($type: PaymentMethodType, $isActive: Boolean) {
    paymentMethods(type: $type, isActive: $isActive) {
      ...PaymentMethod
    }
  }
  ${PAYMENT_METHOD_FRAGMENT}
`;

// Get payment statistics
export const GET_PAYMENT_STATISTICS = gql`
  query GetPaymentStatistics($dateRange: DateRangeInput) {
    paymentStatistics(dateRange: $dateRange) {
      ...PaymentStats
    }
  }
  ${PAYMENT_STATS_FRAGMENT}
`;

// Get transactions
export const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $page: Int = 1
    $limit: Int = 20
    $userId: ID
    $type: TransactionType
    $category: String
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    transactions(
      page: $page
      limit: $limit
      userId: $userId
      type: $type
      category: $category
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Transaction
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
  ${TRANSACTION_FRAGMENT}
`;

// Get user transactions
export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $type: TransactionType
    $category: String
    $dateRange: DateRangeInput
  ) {
    userTransactions(
      userId: $userId
      page: $page
      limit: $limit
      type: $type
      category: $category
      dateRange: $dateRange
    ) {
      data {
        ...Transaction
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
  ${TRANSACTION_FRAGMENT}
`;

// Get bonuses
export const GET_BONUSES = gql`
  query GetBonuses(
    $page: Int = 1
    $limit: Int = 20
    $userId: ID
    $type: BonusType
    $status: BonusStatus
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    bonuses(
      page: $page
      limit: $limit
      userId: $userId
      type: $type
      status: $status
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Bonus
        user {
          id
          username
          email
          vipLevel
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
  ${BONUS_FRAGMENT}
`;

// Get user bonuses
export const GET_USER_BONUSES = gql`
  query GetUserBonuses(
    $userId: ID!
    $page: Int = 1
    $limit: Int = 20
    $status: BonusStatus
  ) {
    userBonuses(
      userId: $userId
      page: $page
      limit: $limit
      status: $status
    ) {
      data {
        ...Bonus
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
  ${BONUS_FRAGMENT}
`;

// Get commissions
export const GET_COMMISSIONS = gql`
  query GetCommissions(
    $page: Int = 1
    $limit: Int = 20
    $referrerId: ID
    $type: CommissionType
    $status: CommissionStatus
    $dateRange: DateRangeInput
    $sortBy: String = "createdAt"
    $sortOrder: SortOrder = DESC
  ) {
    commissions(
      page: $page
      limit: $limit
      referrerId: $referrerId
      type: $type
      status: $status
      dateRange: $dateRange
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        ...Commission
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
  ${COMMISSION_FRAGMENT}
`;

// Get pending payments
export const GET_PENDING_PAYMENTS = gql`
  query GetPendingPayments(
    $type: PaymentType
    $page: Int = 1
    $limit: Int = 20
  ) {
    pendingPayments(type: $type, page: $page, limit: $limit) {
      data {
        ...PaymentBasic
        user {
          id
          username
          email
          vipLevel
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
  ${PAYMENT_BASIC_FRAGMENT}
`;

// Get payment dashboard data
export const GET_PAYMENT_DASHBOARD = gql`
  query GetPaymentDashboard($dateRange: DateRangeInput) {
    paymentDashboard(dateRange: $dateRange) {
      statistics {
        ...PaymentStats
      }
      recentDeposits {
        ...Deposit
      }
      recentWithdrawals {
        ...Withdrawal
      }
      pendingCount {
        deposits
        withdrawals
        total
      }
      alerts {
        id
        type
        message
        severity
        createdAt
      }
    }
  }
  ${PAYMENT_STATS_FRAGMENT}
  ${DEPOSIT_FRAGMENT}
  ${WITHDRAWAL_FRAGMENT}
`;

// Get payment method statistics
export const GET_PAYMENT_METHOD_STATS = gql`
  query GetPaymentMethodStats($dateRange: DateRangeInput) {
    paymentMethodStats(dateRange: $dateRange) {
      method
      deposits {
        count
        volume
        averageAmount
      }
      withdrawals {
        count
        volume
        averageAmount
      }
      successRate
      averageProcessingTime
    }
  }
`;

// Get user payment summary
export const GET_USER_PAYMENT_SUMMARY = gql`
  query GetUserPaymentSummary($userId: ID!, $dateRange: DateRangeInput) {
    userPaymentSummary(userId: $userId, dateRange: $dateRange) {
      totalDeposits
      totalWithdrawals
      netPosition
      depositCount
      withdrawalCount
      averageDepositAmount
      averageWithdrawalAmount
      favoritePaymentMethod
      lastDepositAt
      lastWithdrawalAt
      pendingDeposits
      pendingWithdrawals
    }
  }
`; 