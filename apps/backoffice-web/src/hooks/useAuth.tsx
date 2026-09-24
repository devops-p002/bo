import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider hook that creates auth object
const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - replace with real API call
      const mockUsers = {
        'admin@auragaming.com': {
          id: '1',
          email: 'admin@auragaming.com',
          name: 'Admin User',
          role: 'admin',
          permissions: ['*'], // All permissions
          avatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=AU'
        },
        'manager@auragaming.com': {
          id: '2',
          email: 'manager@auragaming.com',
          name: 'Manager User',
          role: 'manager',
          permissions: ['dashboard.view', 'members.view', 'payments.view', 'reports.view'],
          avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=MU'
        },
        'support@auragaming.com': {
          id: '3',
          email: 'support@auragaming.com',
          name: 'Support User',
          role: 'support',
          permissions: ['dashboard.view', 'members.view', 'crm.view'],
          avatar: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=SU'
        }
      };

      const user = mockUsers[email];
      if (!user || password !== 'admin123') {
        throw new Error('Invalid email or password');
      }

      // Generate mock JWT token
      const token = `mock-jwt-${Date.now()}-${user.id}`;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      setUser(user);
      return { user, token };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulate API call to invalidate token
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Simulate API call to get fresh user data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (currentPassword !== 'admin123') {
        throw new Error('Current password is incorrect');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }
      
      // In real app, this would update the password on the server
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    
    // Admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  }, [user]);

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user || !user.permissions) return false;
    
    // Admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check if user has any of the required permissions
    return permissions.some(permission => user.permissions.includes(permission));
  }, [user]);

  // Check if user has all permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!user || !user.permissions) return false;
    
    // Admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    // Check if user has all required permissions
    return permissions.every(permission => user.permissions.includes(permission));
  }, [user]);

  // Get user role
  const getRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('authToken');
  }, [user]);

  // Get auth token
  const getToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  // Validate token (check if still valid)
  const validateToken = useCallback(async () => {
    const token = getToken();
    if (!token) return false;

    try {
      // Simulate API call to validate token
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock validation - in real app, verify with server
      const tokenParts = token.split('-');
      const timestamp = parseInt(tokenParts[2]);
      const now = Date.now();
      
      // Token expires after 24 hours (mock)
      const isValid = (now - timestamp) < (24 * 60 * 60 * 1000);
      
      if (!isValid) {
        logout();
      }
      
      return isValid;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  }, [getToken, logout]);

  return {
    // State
    user,
    loading,
    error,
    
    // Actions
    login,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    resetPassword,
    
    // Permissions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Utilities
    getRole,
    isAuthenticated,
    getToken,
    validateToken
  };
};

export default useAuth; 