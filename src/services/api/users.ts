import { BaseApiService } from './base';

class UsersApiService extends BaseApiService {
  constructor() {
    super('/users');
  }

  // Get all users with pagination and filters
  async getUsers(params = {}) {
    return await this.get('', params);
  }

  // Get user by ID
  async getUserById(userId) {
    return await this.get(`/${userId}`);
  }

  // Create new user
  async createUser(userData) {
    return await this.post('', userData);
  }

  // Update user
  async updateUser(userId, userData) {
    return await this.put(`/${userId}`, userData);
  }

  // Delete user
  async deleteUser(userId) {
    return await this.delete(`/${userId}`);
  }

  // Suspend user
  async suspendUser(userId, reason) {
    return await this.post(`/${userId}/suspend`, { reason });
  }

  // Activate user
  async activateUser(userId) {
    return await this.post(`/${userId}/activate`);
  }

  // Block user
  async blockUser(userId, reason) {
    return await this.post(`/${userId}/block`, { reason });
  }

  // Unblock user
  async unblockUser(userId) {
    return await this.post(`/${userId}/unblock`);
  }

  // Get user balance
  async getUserBalance(userId) {
    return await this.get(`/${userId}/balance`);
  }

  // Update user balance
  async updateUserBalance(userId, amount, type, description) {
    return await this.post(`/${userId}/balance`, {
      amount,
      type, // 'credit' or 'debit'
      description
    });
  }

  // Get user transactions
  async getUserTransactions(userId, params = {}) {
    return await this.get(`/${userId}/transactions`, params);
  }

  // Get user bets
  async getUserBets(userId, params = {}) {
    return await this.get(`/${userId}/bets`, params);
  }

  // Get user bonuses
  async getUserBonuses(userId, params = {}) {
    return await this.get(`/${userId}/bonuses`, params);
  }

  // Issue bonus to user
  async issueBonusToUser(userId, bonusData) {
    return await this.post(`/${userId}/bonuses`, bonusData);
  }

  // Get user documents
  async getUserDocuments(userId) {
    return await this.get(`/${userId}/documents`);
  }

  // Upload user document
  async uploadUserDocument(userId, file, documentType, onProgress) {
    return await this.upload(`/${userId}/documents`, file, { documentType }, onProgress);
  }

  // Verify user document
  async verifyUserDocument(userId, documentId, status, notes) {
    return await this.post(`/${userId}/documents/${documentId}/verify`, {
      status, // 'approved' or 'rejected'
      notes
    });
  }

  // Get user sessions
  async getUserSessions(userId) {
    return await this.get(`/${userId}/sessions`);
  }

  // Terminate user session
  async terminateUserSession(userId, sessionId) {
    return await this.delete(`/${userId}/sessions/${sessionId}`);
  }

  // Get user activity log
  async getUserActivity(userId, params = {}) {
    return await this.get(`/${userId}/activity`, params);
  }

  // Get user limits
  async getUserLimits(userId) {
    return await this.get(`/${userId}/limits`);
  }

  // Set user limits
  async setUserLimits(userId, limits) {
    return await this.post(`/${userId}/limits`, limits);
  }

  // Get user VIP status
  async getUserVIPStatus(userId) {
    return await this.get(`/${userId}/vip`);
  }

  // Update user VIP status
  async updateUserVIPStatus(userId, vipData) {
    return await this.put(`/${userId}/vip`, vipData);
  }

  // Get user referrals
  async getUserReferrals(userId, params = {}) {
    return await this.get(`/${userId}/referrals`, params);
  }

  // Get user notes
  async getUserNotes(userId) {
    return await this.get(`/${userId}/notes`);
  }

  // Add user note
  async addUserNote(userId, note) {
    return await this.post(`/${userId}/notes`, { note });
  }

  // Update user note
  async updateUserNote(userId, noteId, note) {
    return await this.put(`/${userId}/notes/${noteId}`, { note });
  }

  // Delete user note
  async deleteUserNote(userId, noteId) {
    return await this.delete(`/${userId}/notes/${noteId}`);
  }

  // Search users
  async searchUsers(query, filters = {}) {
    return await this.get('/search', { query, ...filters });
  }

  // Get user statistics
  async getUserStats(userId, period = '30d') {
    return await this.get(`/${userId}/stats`, { period });
  }

  // Export users data
  async exportUsers(filters = {}, format = 'csv') {
    return await this.download('/export', `users_export.${format}`, {
      ...filters,
      format
    });
  }

  // Bulk operations
  async bulkUpdateUsers(userIds, updateData) {
    return await this.post('/bulk/update', {
      userIds,
      updateData
    });
  }

  async bulkSuspendUsers(userIds, reason) {
    return await this.post('/bulk/suspend', {
      userIds,
      reason
    });
  }

  async bulkActivateUsers(userIds) {
    return await this.post('/bulk/activate', { userIds });
  }

  async bulkDeleteUsers(userIds) {
    return await this.post('/bulk/delete', { userIds });
  }

  // Get user risk profile
  async getUserRiskProfile(userId) {
    return await this.get(`/${userId}/risk-profile`);
  }

  // Update user risk profile
  async updateUserRiskProfile(userId, riskData) {
    return await this.put(`/${userId}/risk-profile`, riskData);
  }

  // Get user compliance status
  async getUserCompliance(userId) {
    return await this.get(`/${userId}/compliance`);
  }

  // Update user compliance status
  async updateUserCompliance(userId, complianceData) {
    return await this.put(`/${userId}/compliance`, complianceData);
  }

  // Send message to user
  async sendMessageToUser(userId, message) {
    return await this.post(`/${userId}/messages`, message);
  }

  // Get user messages
  async getUserMessages(userId, params = {}) {
    return await this.get(`/${userId}/messages`, params);
  }
}

// Create and export singleton instance
const usersApiService = new UsersApiService();
export default usersApiService; 