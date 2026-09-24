import { BaseApiService } from './base';

class AuthApiService extends BaseApiService {
  constructor() {
    super('/auth');
  }

  // Login user
  async login(credentials) {
    const response = await this.post('/login', credentials);
    
    // Store auth data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  // Register user
  async register(userData) {
    const response = await this.post('/register', userData);
    
    // Store auth data if auto-login after registration
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  // Logout user
  async logout() {
    try {
      await this.post('/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Refresh token
  async refreshToken() {
    const response = await this.post('/refresh');
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  // Forgot password
  async forgotPassword(email) {
    return await this.post('/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token, newPassword) {
    return await this.post('/reset-password', { token, password: newPassword });
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    return await this.post('/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Verify email
  async verifyEmail(token) {
    return await this.post('/verify-email', { token });
  }

  // Resend verification email
  async resendVerification(email) {
    return await this.post('/resend-verification', { email });
  }

  // Get current user profile
  async getProfile() {
    return await this.get('/profile');
  }

  // Update user profile
  async updateProfile(profileData) {
    return await this.put('/profile', profileData);
  }

  // Enable 2FA
  async enable2FA() {
    return await this.post('/2fa/enable');
  }

  // Disable 2FA
  async disable2FA(code) {
    return await this.post('/2fa/disable', { code });
  }

  // Verify 2FA code
  async verify2FA(code) {
    return await this.post('/2fa/verify', { code });
  }

  // Get user sessions
  async getSessions() {
    return await this.get('/sessions');
  }

  // Revoke session
  async revokeSession(sessionId) {
    return await this.delete(`/sessions/${sessionId}`);
  }

  // Revoke all sessions
  async revokeAllSessions() {
    return await this.post('/sessions/revoke-all');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user from storage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Auto refresh token if needed
  async autoRefreshToken() {
    if (this.isTokenExpired()) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        console.error('Auto refresh failed:', error);
        this.logout();
        return false;
      }
    }
    return true;
  }
}

// Create and export singleton instance
const authApiService = new AuthApiService();
export default authApiService; 