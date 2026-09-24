import { BaseApiService } from './base';

class GamesApiService extends BaseApiService {
  constructor() {
    super('/games');
  }

  // Games Management
  async getGames(params = {}) {
    return await this.get('', params);
  }

  async getGameById(gameId) {
    return await this.get(`/${gameId}`);
  }

  async createGame(gameData) {
    return await this.post('', gameData);
  }

  async updateGame(gameId, gameData) {
    return await this.put(`/${gameId}`, gameData);
  }

  async deleteGame(gameId) {
    return await this.delete(`/${gameId}`);
  }

  async toggleGameStatus(gameId, enabled) {
    return await this.post(`/${gameId}/toggle`, { enabled });
  }

  async bulkUpdateGames(gameIds, updateData) {
    return await this.post('/bulk/update', { gameIds, updateData });
  }

  // Game Categories
  async getGameCategories() {
    return await this.get('/categories');
  }

  async createGameCategory(categoryData) {
    return await this.post('/categories', categoryData);
  }

  async updateGameCategory(categoryId, categoryData) {
    return await this.put(`/categories/${categoryId}`, categoryData);
  }

  async deleteGameCategory(categoryId) {
    return await this.delete(`/categories/${categoryId}`);
  }

  // Game Providers
  async getGameProviders() {
    return await this.get('/providers');
  }

  async getGameProviderById(providerId) {
    return await this.get(`/providers/${providerId}`);
  }

  async createGameProvider(providerData) {
    return await this.post('/providers', providerData);
  }

  async updateGameProvider(providerId, providerData) {
    return await this.put(`/providers/${providerId}`, providerData);
  }

  async deleteGameProvider(providerId) {
    return await this.delete(`/providers/${providerId}`);
  }

  async toggleGameProvider(providerId, enabled) {
    return await this.post(`/providers/${providerId}/toggle`, { enabled });
  }

  // Bets Management
  async getBets(params = {}) {
    return await this.get('/bets', params);
  }

  async getBetById(betId) {
    return await this.get(`/bets/${betId}`);
  }

  async settleBet(betId, settlementData) {
    return await this.post(`/bets/${betId}/settle`, settlementData);
  }

  async voidBet(betId, reason) {
    return await this.post(`/bets/${betId}/void`, { reason });
  }

  async bulkSettleBets(betIds, settlementData) {
    return await this.post('/bets/bulk/settle', { betIds, ...settlementData });
  }

  async bulkVoidBets(betIds, reason) {
    return await this.post('/bets/bulk/void', { betIds, reason });
  }

  async getPendingBets(params = {}) {
    return await this.get('/bets/pending', params);
  }

  async searchBets(query, filters = {}) {
    return await this.get('/bets/search', { query, ...filters });
  }

  async exportBets(filters = {}, format = 'csv') {
    return await this.download('/bets/export', `bets_export.${format}`, {
      ...filters,
      format
    });
  }

  // Betting Limits
  async getBettingLimits(params = {}) {
    return await this.get('/limits', params);
  }

  async getBettingLimitById(limitId) {
    return await this.get(`/limits/${limitId}`);
  }

  async createBettingLimit(limitData) {
    return await this.post('/limits', limitData);
  }

  async updateBettingLimit(limitId, limitData) {
    return await this.put(`/limits/${limitId}`, limitData);
  }

  async deleteBettingLimit(limitId) {
    return await this.delete(`/limits/${limitId}`);
  }

  async toggleBettingLimit(limitId, enabled) {
    return await this.post(`/limits/${limitId}/toggle`, { enabled });
  }

  async getUserBettingLimits(userId) {
    return await this.get(`/limits/user/${userId}`);
  }

  async setUserBettingLimits(userId, limits) {
    return await this.post(`/limits/user/${userId}`, limits);
  }

  // Game Statistics
  async getGameStats(gameId, period = '30d') {
    return await this.get(`/${gameId}/stats`, { period });
  }

  async getAllGamesStats(period = '30d') {
    return await this.get('/stats', { period });
  }

  async getBettingStats(period = '30d') {
    return await this.get('/bets/stats', { period });
  }

  async getProviderStats(providerId, period = '30d') {
    return await this.get(`/providers/${providerId}/stats`, { period });
  }

  async getCategoryStats(categoryId, period = '30d') {
    return await this.get(`/categories/${categoryId}/stats`, { period });
  }

  // Jackpots
  async getJackpots(params = {}) {
    return await this.get('/jackpots', params);
  }

  async getJackpotById(jackpotId) {
    return await this.get(`/jackpots/${jackpotId}`);
  }

  async createJackpot(jackpotData) {
    return await this.post('/jackpots', jackpotData);
  }

  async updateJackpot(jackpotId, jackpotData) {
    return await this.put(`/jackpots/${jackpotId}`, jackpotData);
  }

  async deleteJackpot(jackpotId) {
    return await this.delete(`/jackpots/${jackpotId}`);
  }

  async triggerJackpot(jackpotId, winnerId, amount) {
    return await this.post(`/jackpots/${jackpotId}/trigger`, {
      winnerId,
      amount
    });
  }

  async getJackpotHistory(jackpotId, params = {}) {
    return await this.get(`/jackpots/${jackpotId}/history`, params);
  }

  // Tournaments
  async getTournaments(params = {}) {
    return await this.get('/tournaments', params);
  }

  async getTournamentById(tournamentId) {
    return await this.get(`/tournaments/${tournamentId}`);
  }

  async createTournament(tournamentData) {
    return await this.post('/tournaments', tournamentData);
  }

  async updateTournament(tournamentId, tournamentData) {
    return await this.put(`/tournaments/${tournamentId}`, tournamentData);
  }

  async deleteTournament(tournamentId) {
    return await this.delete(`/tournaments/${tournamentId}`);
  }

  async startTournament(tournamentId) {
    return await this.post(`/tournaments/${tournamentId}/start`);
  }

  async endTournament(tournamentId) {
    return await this.post(`/tournaments/${tournamentId}/end`);
  }

  async getTournamentLeaderboard(tournamentId) {
    return await this.get(`/tournaments/${tournamentId}/leaderboard`);
  }

  async getTournamentParticipants(tournamentId, params = {}) {
    return await this.get(`/tournaments/${tournamentId}/participants`, params);
  }

  // Game Sessions
  async getGameSessions(params = {}) {
    return await this.get('/sessions', params);
  }

  async getGameSessionById(sessionId) {
    return await this.get(`/sessions/${sessionId}`);
  }

  async terminateGameSession(sessionId, reason) {
    return await this.post(`/sessions/${sessionId}/terminate`, { reason });
  }

  async getUserGameSessions(userId, params = {}) {
    return await this.get(`/sessions/user/${userId}`, params);
  }

  // RNG (Random Number Generator)
  async getRNGReports(params = {}) {
    return await this.get('/rng/reports', params);
  }

  async generateRNGReport(gameId, period) {
    return await this.post('/rng/generate-report', { gameId, period });
  }

  async verifyRNGSequence(gameId, sequence) {
    return await this.post('/rng/verify', { gameId, sequence });
  }

  // Game Analytics
  async getGameAnalytics(gameId, period = '30d') {
    return await this.get(`/${gameId}/analytics`, { period });
  }

  async getPlayerBehaviorAnalytics(params = {}) {
    return await this.get('/analytics/player-behavior', params);
  }

  async getGamePerformanceAnalytics(params = {}) {
    return await this.get('/analytics/performance', params);
  }

  async getRevenuAnalytics(period = '30d') {
    return await this.get('/analytics/revenue', { period });
  }

  // Game Configuration
  async getGameConfiguration(gameId) {
    return await this.get(`/${gameId}/config`);
  }

  async updateGameConfiguration(gameId, config) {
    return await this.put(`/${gameId}/config`, config);
  }

  async resetGameConfiguration(gameId) {
    return await this.post(`/${gameId}/config/reset`);
  }

  // Betting Patterns
  async getBettingPatterns(params = {}) {
    return await this.get('/betting-patterns', params);
  }

  async analyzeBettingPattern(userId, gameId, period = '30d') {
    return await this.post('/betting-patterns/analyze', {
      userId,
      gameId,
      period
    });
  }

  async flagSuspiciousBetting(patternId, reason) {
    return await this.post(`/betting-patterns/${patternId}/flag`, { reason });
  }
}

// Create and export singleton instance
const gamesApiService = new GamesApiService();
export default gamesApiService; 