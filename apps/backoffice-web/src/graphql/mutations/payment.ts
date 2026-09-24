import { gql } from '@apollo/client';
import {
  PAYMENT_DETAIL_FRAGMENT,
  PAYMENT_METHOD_FRAGMENT,
  DEPOSIT_FRAGMENT,
  WITHDRAWAL_FRAGMENT,
  BONUS_FRAGMENT,
  COMMISSION_FRAGMENT
} from '../fragments/payment';

// Payment processing mutations
export const APPROVE_PAYMENT = gql`
  mutation ApprovePayment($id: ID!, $notes: String) {
    approvePayment(id: $id, notes: $notes) {
      ...PaymentDetail
    }
  }
  ${PAYMENT_DETAIL_FRAGMENT}
`;

export const REJECT_PAYMENT = gql`
  mutation RejectPayment($id: ID!, $reason: String!, $notes: String) {
    rejectPayment(id: $id, reason: $reason, notes: $notes) {
      ...PaymentDetail
    }
  }
  ${PAYMENT_DETAIL_FRAGMENT}
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($id: ID!) {
    processPayment(id: $id) {
      ...PaymentDetail
    }
  }
  ${PAYMENT_DETAIL_FRAGMENT}
`;

export const CANCEL_PAYMENT = gql`
  mutation CancelPayment($id: ID!, $reason: String!) {
    cancelPayment(id: $id, reason: $reason) {
      ...PaymentDetail
    }
  }
  ${PAYMENT_DETAIL_FRAGMENT}
`;

// Deposit mutations
export const CREATE_DEPOSIT = gql`
  mutation CreateDeposit($input: CreateDepositInput!) {
    createDeposit(input: $input) {
      ...Deposit
    }
  }
  ${DEPOSIT_FRAGMENT}
`;

export const APPROVE_DEPOSIT = gql`
  mutation ApproveDeposit($id: ID!, $bonusCode: String, $notes: String) {
    approveDeposit(id: $id, bonusCode: $bonusCode, notes: $notes) {
      ...Deposit
    }
  }
  ${DEPOSIT_FRAGMENT}
`;

export const REJECT_DEPOSIT = gql`
  mutation RejectDeposit($id: ID!, $reason: String!, $notes: String) {
    rejectDeposit(id: $id, reason: $reason, notes: $notes) {
      ...Deposit
    }
  }
  ${DEPOSIT_FRAGMENT}
`;

// Withdrawal mutations
export const CREATE_WITHDRAWAL = gql`
  mutation CreateWithdrawal($input: CreateWithdrawalInput!) {
    createWithdrawal(input: $input) {
      ...Withdrawal
    }
  }
  ${WITHDRAWAL_FRAGMENT}
`;

export const APPROVE_WITHDRAWAL = gql`
  mutation ApproveWithdrawal($id: ID!, $notes: String) {
    approveWithdrawal(id: $id, notes: $notes) {
      ...Withdrawal
    }
  }
  ${WITHDRAWAL_FRAGMENT}
`;

export const REJECT_WITHDRAWAL = gql`
  mutation RejectWithdrawal($id: ID!, $reason: String!, $notes: String) {
    rejectWithdrawal(id: $id, reason: $reason, notes: $notes) {
      ...Withdrawal
    }
  }
  ${WITHDRAWAL_FRAGMENT}
`;

export const COMPLETE_WITHDRAWAL = gql`
  mutation CompleteWithdrawal($id: ID!, $transactionId: String) {
    completeWithdrawal(id: $id, transactionId: $transactionId) {
      ...Withdrawal
    }
  }
  ${WITHDRAWAL_FRAGMENT}
`;

// Payment method mutations
export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      ...PaymentMethod
    }
  }
  ${PAYMENT_METHOD_FRAGMENT}
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($id: ID!, $input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(id: $id, input: $input) {
      ...PaymentMethod
    }
  }
  ${PAYMENT_METHOD_FRAGMENT}
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_PAYMENT_METHOD = gql`
  mutation TogglePaymentMethod($id: ID!) {
    togglePaymentMethod(id: $id) {
      ...PaymentMethod
    }
  }
  ${PAYMENT_METHOD_FRAGMENT}
`;

// Bonus mutations
export const CREATE_BONUS = gql`
  mutation CreateBonus($input: CreateBonusInput!) {
    createBonus(input: $input) {
      ...Bonus
    }
  }
  ${BONUS_FRAGMENT}
`;

export const AWARD_BONUS = gql`
  mutation AwardBonus($userId: ID!, $bonusId: ID!, $amount: Float, $reason: String) {
    awardBonus(userId: $userId, bonusId: $bonusId, amount: $amount, reason: $reason) {
      ...Bonus
    }
  }
  ${BONUS_FRAGMENT}
`;

export const CANCEL_BONUS = gql`
  mutation CancelBonus($id: ID!, $reason: String!) {
    cancelBonus(id: $id, reason: $reason) {
      ...Bonus
    }
  }
  ${BONUS_FRAGMENT}
`;

export const COMPLETE_BONUS = gql`
  mutation CompleteBonus($id: ID!) {
    completeBonus(id: $id) {
      ...Bonus
    }
  }
  ${BONUS_FRAGMENT}
`;

export const FORFEIT_BONUS = gql`
  mutation ForfeitBonus($id: ID!) {
    forfeitBonus(id: $id) {
      ...Bonus
    }
  }
  ${BONUS_FRAGMENT}
`;

// Commission mutations
export const CREATE_COMMISSION = gql`
  mutation CreateCommission($input: CreateCommissionInput!) {
    createCommission(input: $input) {
      ...Commission
    }
  }
  ${COMMISSION_FRAGMENT}
`;

export const PAY_COMMISSION = gql`
  mutation PayCommission($id: ID!, $notes: String) {
    payCommission(id: $id, notes: $notes) {
      ...Commission
    }
  }
  ${COMMISSION_FRAGMENT}
`;

export const CANCEL_COMMISSION = gql`
  mutation CancelCommission($id: ID!, $reason: String!) {
    cancelCommission(id: $id, reason: $reason) {
      ...Commission
    }
  }
  ${COMMISSION_FRAGMENT}
`;

// Transaction mutations
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
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
      createdAt
    }
  }
`;

export const REVERSE_TRANSACTION = gql`
  mutation ReverseTransaction($id: ID!, $reason: String!) {
    reverseTransaction(id: $id, reason: $reason) {
      success
      message
      reversalTransaction {
        id
        type
        amount
        currency
        description
        createdAt
      }
    }
  }
`;

// Bulk operations
export const BULK_APPROVE_PAYMENTS = gql`
  mutation BulkApprovePayments($paymentIds: [ID!]!, $notes: String) {
    bulkApprovePayments(paymentIds: $paymentIds, notes: $notes) {
      success
      message
      approvedCount
      errors {
        paymentId
        error
      }
    }
  }
`;

export const BULK_REJECT_PAYMENTS = gql`
  mutation BulkRejectPayments($paymentIds: [ID!]!, $reason: String!, $notes: String) {
    bulkRejectPayments(paymentIds: $paymentIds, reason: $reason, notes: $notes) {
      success
      message
      rejectedCount
      errors {
        paymentId
        error
      }
    }
  }
`;

export const BULK_APPROVE_DEPOSITS = gql`
  mutation BulkApproveDeposits($depositIds: [ID!]!, $notes: String) {
    bulkApproveDeposits(depositIds: $depositIds, notes: $notes) {
      success
      message
      approvedCount
      errors {
        depositId
        error
      }
    }
  }
`;

export const BULK_APPROVE_WITHDRAWALS = gql`
  mutation BulkApproveWithdrawals($withdrawalIds: [ID!]!, $notes: String) {
    bulkApproveWithdrawals(withdrawalIds: $withdrawalIds, notes: $notes) {
      success
      message
      approvedCount
      errors {
        withdrawalId
        error
      }
    }
  }
`;

// Payment processor mutations
export const CREATE_PAYMENT_PROCESSOR = gql`
  mutation CreatePaymentProcessor($input: CreatePaymentProcessorInput!) {
    createPaymentProcessor(input: $input) {
      id
      name
      type
      isActive
      configuration
      supportedMethods
      supportedCurrencies
      createdAt
    }
  }
`;

export const UPDATE_PAYMENT_PROCESSOR = gql`
  mutation UpdatePaymentProcessor($id: ID!, $input: UpdatePaymentProcessorInput!) {
    updatePaymentProcessor(id: $id, input: $input) {
      id
      name
      type
      isActive
      configuration
      supportedMethods
      supportedCurrencies
      updatedAt
    }
  }
`;

export const TOGGLE_PAYMENT_PROCESSOR = gql`
  mutation TogglePaymentProcessor($id: ID!) {
    togglePaymentProcessor(id: $id) {
      id
      name
      isActive
      updatedAt
    }
  }
`;

// Webhook mutations
export const PROCESS_WEBHOOK = gql`
  mutation ProcessWebhook($processorId: ID!, $payload: JSON!) {
    processWebhook(processorId: $processorId, payload: $payload) {
      success
      message
      paymentId
      status
    }
  }
`;

// Manual adjustments
export const MANUAL_CREDIT = gql`
  mutation ManualCredit($userId: ID!, $amount: Float!, $currency: String!, $reason: String!, $reference: String) {
    manualCredit(userId: $userId, amount: $amount, currency: $currency, reason: $reason, reference: $reference) {
      success
      message
      transaction {
        id
        amount
        currency
        description
        createdAt
      }
      newBalance
    }
  }
`;

export const MANUAL_DEBIT = gql`
  mutation ManualDebit($userId: ID!, $amount: Float!, $currency: String!, $reason: String!, $reference: String) {
    manualDebit(userId: $userId, amount: $amount, currency: $currency, reason: $reason, reference: $reference) {
      success
      message
      transaction {
        id
        amount
        currency
        description
        createdAt
      }
      newBalance
    }
  }
`; 