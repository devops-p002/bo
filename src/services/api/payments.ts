import { BaseApiService } from './base';

class PaymentsApiService extends BaseApiService {
  constructor() {
    super('/payments');
  }

  // Deposits
  async getDeposits(params = {}) {
    return await this.get('/deposits', params);
  }

  async getDepositById(depositId) {
    return await this.get(`/deposits/${depositId}`);
  }

  async approveDeposit(depositId, notes = '') {
    return await this.post(`/deposits/${depositId}/approve`, { notes });
  }

  async rejectDeposit(depositId, reason) {
    return await this.post(`/deposits/${depositId}/reject`, { reason });
  }

  async bulkApproveDeposits(depositIds, notes = '') {
    return await this.post('/deposits/bulk/approve', { depositIds, notes });
  }

  async bulkRejectDeposits(depositIds, reason) {
    return await this.post('/deposits/bulk/reject', { depositIds, reason });
  }

  // Withdrawals
  async getWithdrawals(params = {}) {
    return await this.get('/withdrawals', params);
  }

  async getWithdrawalById(withdrawalId) {
    return await this.get(`/withdrawals/${withdrawalId}`);
  }

  async approveWithdrawal(withdrawalId, notes = '') {
    return await this.post(`/withdrawals/${withdrawalId}/approve`, { notes });
  }

  async rejectWithdrawal(withdrawalId, reason) {
    return await this.post(`/withdrawals/${withdrawalId}/reject`, { reason });
  }

  async processWithdrawal(withdrawalId, processingData) {
    return await this.post(`/withdrawals/${withdrawalId}/process`, processingData);
  }

  async completeWithdrawal(withdrawalId, completionData) {
    return await this.post(`/withdrawals/${withdrawalId}/complete`, completionData);
  }

  async bulkApproveWithdrawals(withdrawalIds, notes = '') {
    return await this.post('/withdrawals/bulk/approve', { withdrawalIds, notes });
  }

  async bulkRejectWithdrawals(withdrawalIds, reason) {
    return await this.post('/withdrawals/bulk/reject', { withdrawalIds, reason });
  }

  // Payment Methods
  async getPaymentMethods(params = {}) {
    return await this.get('/methods', params);
  }

  async getPaymentMethodById(methodId) {
    return await this.get(`/methods/${methodId}`);
  }

  async createPaymentMethod(methodData) {
    return await this.post('/methods', methodData);
  }

  async updatePaymentMethod(methodId, methodData) {
    return await this.put(`/methods/${methodId}`, methodData);
  }

  async deletePaymentMethod(methodId) {
    return await this.delete(`/methods/${methodId}`);
  }

  async togglePaymentMethod(methodId, enabled) {
    return await this.post(`/methods/${methodId}/toggle`, { enabled });
  }

  // Transactions
  async getTransactions(params = {}) {
    return await this.get('/transactions', params);
  }

  async getTransactionById(transactionId) {
    return await this.get(`/transactions/${transactionId}`);
  }

  async searchTransactions(query, filters = {}) {
    return await this.get('/transactions/search', { query, ...filters });
  }

  async exportTransactions(filters = {}, format = 'csv') {
    return await this.download('/transactions/export', `transactions_export.${format}`, {
      ...filters,
      format
    });
  }

  // Payment Statistics
  async getPaymentStats(period = '30d') {
    return await this.get('/stats', { period });
  }

  async getDepositStats(period = '30d') {
    return await this.get('/deposits/stats', { period });
  }

  async getWithdrawalStats(period = '30d') {
    return await this.get('/withdrawals/stats', { period });
  }

  async getPaymentMethodStats(period = '30d') {
    return await this.get('/methods/stats', { period });
  }

  // Bonuses
  async getBonuses(params = {}) {
    return await this.get('/bonuses', params);
  }

  async getBonusById(bonusId) {
    return await this.get(`/bonuses/${bonusId}`);
  }

  async createBonus(bonusData) {
    return await this.post('/bonuses', bonusData);
  }

  async updateBonus(bonusId, bonusData) {
    return await this.put(`/bonuses/${bonusId}`, bonusData);
  }

  async deleteBonus(bonusId) {
    return await this.delete(`/bonuses/${bonusId}`);
  }

  async issueBonusToUser(userId, bonusId, customAmount = null) {
    return await this.post('/bonuses/issue', {
      userId,
      bonusId,
      customAmount
    });
  }

  async bulkIssueBonus(userIds, bonusId, customAmount = null) {
    return await this.post('/bonuses/bulk-issue', {
      userIds,
      bonusId,
      customAmount
    });
  }

  async cancelBonus(bonusId, reason) {
    return await this.post(`/bonuses/${bonusId}/cancel`, { reason });
  }

  async getBonusStats(period = '30d') {
    return await this.get('/bonuses/stats', { period });
  }

  // Commissions
  async getCommissions(params = {}) {
    return await this.get('/commissions', params);
  }

  async getCommissionById(commissionId) {
    return await this.get(`/commissions/${commissionId}`);
  }

  async calculateCommission(userId, amount, type) {
    return await this.post('/commissions/calculate', {
      userId,
      amount,
      type
    });
  }

  async payCommission(commissionId, paymentData) {
    return await this.post(`/commissions/${commissionId}/pay`, paymentData);
  }

  async bulkPayCommissions(commissionIds, paymentData) {
    return await this.post('/commissions/bulk-pay', {
      commissionIds,
      ...paymentData
    });
  }

  async getCommissionStats(period = '30d') {
    return await this.get('/commissions/stats', { period });
  }

  // Payment Providers
  async getPaymentProviders() {
    return await this.get('/providers');
  }

  async getPaymentProviderById(providerId) {
    return await this.get(`/providers/${providerId}`);
  }

  async updatePaymentProvider(providerId, providerData) {
    return await this.put(`/providers/${providerId}`, providerData);
  }

  async testPaymentProvider(providerId) {
    return await this.post(`/providers/${providerId}/test`);
  }

  async togglePaymentProvider(providerId, enabled) {
    return await this.post(`/providers/${providerId}/toggle`, { enabled });
  }

  // Fraud Detection
  async getFraudAlerts(params = {}) {
    return await this.get('/fraud/alerts', params);
  }

  async getFraudAlertById(alertId) {
    return await this.get(`/fraud/alerts/${alertId}`);
  }

  async markFraudAlertAsReviewed(alertId, notes) {
    return await this.post(`/fraud/alerts/${alertId}/review`, { notes });
  }

  async markFraudAlertAsFalsePositive(alertId, notes) {
    return await this.post(`/fraud/alerts/${alertId}/false-positive`, { notes });
  }

  async blockSuspiciousTransaction(transactionId, reason) {
    return await this.post(`/fraud/block-transaction`, {
      transactionId,
      reason
    });
  }

  // Compliance
  async getComplianceReports(params = {}) {
    return await this.get('/compliance/reports', params);
  }

  async generateComplianceReport(reportType, period) {
    return await this.post('/compliance/generate-report', {
      reportType,
      period
    });
  }

  async exportComplianceReport(reportId, format = 'pdf') {
    return await this.download(`/compliance/reports/${reportId}/export`, 
      `compliance_report.${format}`, { format });
  }

  // Reconciliation
  async getReconciliationReports(params = {}) {
    return await this.get('/reconciliation', params);
  }

  async createReconciliationReport(period) {
    return await this.post('/reconciliation', { period });
  }

  async approveReconciliation(reconciliationId) {
    return await this.post(`/reconciliation/${reconciliationId}/approve`);
  }

  async rejectReconciliation(reconciliationId, reason) {
    return await this.post(`/reconciliation/${reconciliationId}/reject`, { reason });
  }
}

// Create and export singleton instance
const paymentsApiService = new PaymentsApiService();
export default paymentsApiService; 