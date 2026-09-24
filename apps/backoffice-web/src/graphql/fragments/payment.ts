import { gql } from '@apollo/client';

// Basic payment fragment
export const PAYMENT_BASIC_FRAGMENT = gql`
  fragment PaymentBasic on Payment {
    id
    userId
    type
    method
    amount
    currency
    status
    createdAt
    updatedAt
  }
`;

// Detailed payment fragment
export const PAYMENT_DETAIL_FRAGMENT = gql`
  fragment PaymentDetail on Payment {
    ...PaymentBasic
    transactionId
    externalTransactionId
    description
    metadata
    fees
    netAmount
    exchangeRate
    originalAmount
    originalCurrency
    processedAt
    completedAt
    failedAt
    rejectedAt
    rejectionReason
    processorResponse
    ipAddress
    userAgent
    approvedBy
    rejectedBy
    notes
  }
`;

// Payment method fragment
export const PAYMENT_METHOD_FRAGMENT = gql`
  fragment PaymentMethod on PaymentMethod {
    id
    name
    type
    provider
    isActive
    minAmount
    maxAmount
    dailyLimit
    weeklyLimit
    monthlyLimit
    processingTime
    fees {
      type
      value
      currency
    }
    supportedCurrencies
    countries
    configuration
    createdAt
    updatedAt
  }
`;

// Transaction fragment
export const TRANSACTION_FRAGMENT = gql`
  fragment Transaction on Transaction {
    id
    userId
    type
    category
    amount
    currency
    balance
    balanceAfter
    description
    reference
    metadata
    createdAt
  }
`;

// Payment statistics fragment
export const PAYMENT_STATS_FRAGMENT = gql`
  fragment PaymentStats on PaymentStats {
    totalDeposits
    totalWithdrawals
    totalVolume
    netRevenue
    pendingDeposits
    pendingWithdrawals
    approvedDeposits
    approvedWithdrawals
    rejectedDeposits
    rejectedWithdrawals
    averageDepositAmount
    averageWithdrawalAmount
    topPaymentMethods {
      method
      count
      volume
      percentage
    }
    dailyTrend {
      date
      deposits
      withdrawals
      volume
    }
  }
`;

// Deposit fragment
export const DEPOSIT_FRAGMENT = gql`
  fragment Deposit on Deposit {
    id
    userId
    amount
    currency
    method
    status
    transactionId
    bonusAwarded
    bonusAmount
    processingTime
    completedAt
    createdAt
    user {
      id
      username
      email
      vipLevel
    }
  }
`;

// Withdrawal fragment
export const WITHDRAWAL_FRAGMENT = gql`
  fragment Withdrawal on Withdrawal {
    id
    userId
    amount
    currency
    method
    status
    transactionId
    bankDetails
    processingTime
    approvedAt
    completedAt
    createdAt
    user {
      id
      username
      email
      vipLevel
    }
  }
`;

// Payment processor fragment
export const PAYMENT_PROCESSOR_FRAGMENT = gql`
  fragment PaymentProcessor on PaymentProcessor {
    id
    name
    type
    isActive
    configuration
    supportedMethods
    supportedCurrencies
    webhookUrl
    apiVersion
    createdAt
    updatedAt
  }
`;

// Bonus fragment
export const BONUS_FRAGMENT = gql`
  fragment Bonus on Bonus {
    id
    userId
    type
    name
    amount
    currency
    wageringRequirement
    wageringProgress
    status
    expiresAt
    awardedAt
    completedAt
    cancelledAt
    terms
    metadata
  }
`;

// Commission fragment
export const COMMISSION_FRAGMENT = gql`
  fragment Commission on Commission {
    id
    referrerId
    refereeId
    type
    amount
    currency
    rate
    sourceAmount
    status
    paidAt
    createdAt
    referrer {
      id
      username
      email
    }
    referee {
      id
      username
      email
    }
  }
`; 