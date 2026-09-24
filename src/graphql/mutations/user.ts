import { gql } from '@apollo/client';
import {
  USER_BASIC_FRAGMENT,
  USER_DETAIL_FRAGMENT,
  USER_BALANCE_FRAGMENT,
  USER_LIMITS_FRAGMENT,
  USER_DOCUMENT_FRAGMENT
} from '../fragments/user';

// Authentication mutations
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $rememberMe: Boolean) {
    login(email: $email, password: $password, rememberMe: $rememberMe) {
      token
      refreshToken
      expiresAt
      user {
        ...UserDetail
      }
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
      expiresAt
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// User management mutations
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($id: ID!, $reason: String, $duration: Int) {
    suspendUser(id: $id, reason: $reason, duration: $duration) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const BLOCK_USER = gql`
  mutation BlockUser($id: ID!, $reason: String!) {
    blockUser(id: $id, reason: $reason) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const UNBLOCK_USER = gql`
  mutation UnblockUser($id: ID!) {
    unblockUser(id: $id) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// Profile mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file) {
      url
      user {
        ...UserBasic
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($input: UserPreferencesInput!) {
    updatePreferences(input: $input) {
      ...UserDetail
    }
  }
  ${USER_DETAIL_FRAGMENT}
`;

// Balance mutations
export const ADJUST_BALANCE = gql`
  mutation AdjustBalance($userId: ID!, $amount: Float!, $currency: String!, $reason: String!) {
    adjustBalance(userId: $userId, amount: $amount, currency: $currency, reason: $reason) {
      ...UserBalance
    }
  }
  ${USER_BALANCE_FRAGMENT}
`;

export const TRANSFER_BALANCE = gql`
  mutation TransferBalance($fromUserId: ID!, $toUserId: ID!, $amount: Float!, $currency: String!, $reason: String) {
    transferBalance(fromUserId: $fromUserId, toUserId: $toUserId, amount: $amount, currency: $currency, reason: $reason) {
      success
      message
      fromBalance {
        ...UserBalance
      }
      toBalance {
        ...UserBalance
      }
    }
  }
  ${USER_BALANCE_FRAGMENT}
`;

// Limits mutations
export const SET_USER_LIMITS = gql`
  mutation SetUserLimits($userId: ID!, $input: UserLimitsInput!) {
    setUserLimits(userId: $userId, input: $input) {
      ...UserLimits
    }
  }
  ${USER_LIMITS_FRAGMENT}
`;

export const REMOVE_USER_LIMITS = gql`
  mutation RemoveUserLimits($userId: ID!) {
    removeUserLimits(userId: $userId) {
      success
      message
    }
  }
`;

// Document mutations
export const UPLOAD_DOCUMENT = gql`
  mutation UploadDocument($userId: ID!, $type: DocumentType!, $file: Upload!) {
    uploadDocument(userId: $userId, type: $type, file: $file) {
      ...UserDocument
    }
  }
  ${USER_DOCUMENT_FRAGMENT}
`;

export const APPROVE_DOCUMENT = gql`
  mutation ApproveDocument($id: ID!) {
    approveDocument(id: $id) {
      ...UserDocument
    }
  }
  ${USER_DOCUMENT_FRAGMENT}
`;

export const REJECT_DOCUMENT = gql`
  mutation RejectDocument($id: ID!, $reason: String!) {
    rejectDocument(id: $id, reason: $reason) {
      ...UserDocument
    }
  }
  ${USER_DOCUMENT_FRAGMENT}
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      success
      message
    }
  }
`;

// VIP mutations
export const UPDATE_VIP_LEVEL = gql`
  mutation UpdateVipLevel($userId: ID!, $vipLevel: Int!, $reason: String) {
    updateVipLevel(userId: $userId, vipLevel: $vipLevel, reason: $reason) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const ASSIGN_VIP_MANAGER = gql`
  mutation AssignVipManager($userId: ID!, $managerId: ID!) {
    assignVipManager(userId: $userId, managerId: $managerId) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// Session mutations
export const TERMINATE_SESSION = gql`
  mutation TerminateSession($sessionId: ID!) {
    terminateSession(sessionId: $sessionId) {
      success
      message
    }
  }
`;

export const TERMINATE_ALL_SESSIONS = gql`
  mutation TerminateAllSessions($userId: ID!) {
    terminateAllSessions(userId: $userId) {
      success
      message
      terminatedCount
    }
  }
`;

// Verification mutations
export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
      user {
        ...UserBasic
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const SEND_VERIFICATION_EMAIL = gql`
  mutation SendVerificationEmail($userId: ID!) {
    sendVerificationEmail(userId: $userId) {
      success
      message
    }
  }
`;

export const VERIFY_PHONE = gql`
  mutation VerifyPhone($userId: ID!, $code: String!) {
    verifyPhone(userId: $userId, code: $code) {
      success
      message
      user {
        ...UserBasic
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const SEND_PHONE_VERIFICATION = gql`
  mutation SendPhoneVerification($userId: ID!) {
    sendPhoneVerification(userId: $userId) {
      success
      message
    }
  }
`;

// KYC mutations
export const UPDATE_KYC_STATUS = gql`
  mutation UpdateKycStatus($userId: ID!, $status: KycStatus!, $notes: String) {
    updateKycStatus(userId: $userId, status: $status, notes: $notes) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// Notes and tags mutations
export const ADD_USER_NOTE = gql`
  mutation AddUserNote($userId: ID!, $note: String!) {
    addUserNote(userId: $userId, note: $note) {
      id
      userId
      note
      createdBy
      createdAt
    }
  }
`;

export const UPDATE_USER_TAGS = gql`
  mutation UpdateUserTags($userId: ID!, $tags: [String!]!) {
    updateUserTags(userId: $userId, tags: $tags) {
      ...UserBasic
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// Bulk operations
export const BULK_UPDATE_USERS = gql`
  mutation BulkUpdateUsers($userIds: [ID!]!, $input: BulkUpdateUserInput!) {
    bulkUpdateUsers(userIds: $userIds, input: $input) {
      success
      message
      updatedCount
      errors {
        userId
        error
      }
    }
  }
`;

export const BULK_SUSPEND_USERS = gql`
  mutation BulkSuspendUsers($userIds: [ID!]!, $reason: String, $duration: Int) {
    bulkSuspendUsers(userIds: $userIds, reason: $reason, duration: $duration) {
      success
      message
      suspendedCount
      errors {
        userId
        error
      }
    }
  }
`; 