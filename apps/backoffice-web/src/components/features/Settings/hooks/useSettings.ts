import { useState, useCallback } from 'react';

const useSettings = () => {
  // State for different types of settings
  const [generalSettings, setGeneralSettings] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [rolesData, setRolesData] = useState(null);
  const [gamesData, setGamesData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for development
  const mockGeneralSettings = {
    platform: {
      name: 'Aura Gaming Platform',
      description: 'The ultimate gaming experience with cutting-edge technology and exceptional user experience.',
      logoUrl: 'https://via.placeholder.com/200x80/3B82F6/FFFFFF?text=AURA',
      faviconUrl: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=A',
      supportEmail: 'support@auragaming.com',
      supportPhone: '+1-555-AURA-GAME',
      timezone: 'UTC',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      maintenanceMode: false,
      maintenanceMessage: 'We are performing scheduled maintenance. Please check back in 30 minutes.'
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter',
      headerImage: 'https://via.placeholder.com/1200x300/3B82F6/FFFFFF?text=Gaming+Header',
      footerText: '© 2024 Aura Gaming Platform. All rights reserved. Licensed and regulated by the Malta Gaming Authority.'
    },
    legal: {
      termsUrl: 'https://auragaming.com/terms',
      privacyUrl: 'https://auragaming.com/privacy',
      cookiePolicyUrl: 'https://auragaming.com/cookies',
      responsibleGamblingUrl: 'https://auragaming.com/responsible-gambling',
      licenseNumber: 'MGA/B2C/394/2024',
      licenseAuthority: 'Malta Gaming Authority',
      companyName: 'Aura Gaming Ltd.',
      companyAddress: '123 Gaming Street, St. Julians, Malta',
      companyEmail: 'legal@auragaming.com',
      companyPhone: '+356-2138-0000'
    },
    features: {
      enableLiveChat: true,
      enableNotifications: true,
      enableNewsletter: true,
      enableReferrals: true,
      enableLoyaltyProgram: true,
      enableSports: true,
      enableCasino: true,
      enableLiveCasino: true,
      enablePoker: false,
      enableBingo: false
    },
    limits: {
      maxDepositAmount: 10000,
      maxWithdrawalAmount: 5000,
      maxBetAmount: 1000,
      maxDailyDeposits: 5,
      maxDailyWithdrawals: 3,
      sessionTimeoutMinutes: 60,
      inactivityTimeoutDays: 30
    },
    social: {
      facebookUrl: 'https://facebook.com/auragaming',
      twitterUrl: 'https://twitter.com/auragaming',
      instagramUrl: 'https://instagram.com/auragaming',
      youtubeUrl: 'https://youtube.com/auragaming',
      telegramUrl: 'https://t.me/auragaming',
      discordUrl: 'https://discord.gg/auragaming'
    }
  };

  const mockSystemSettings = {
    database: {
      connectionString: 'postgresql://user:pass@localhost:5432/gaming_db',
      maxConnections: 100,
      timeoutSeconds: 30,
      autoBackup: true,
      backupInterval: '24',
      retentionDays: 30
    },
    cache: {
      enabled: true,
      provider: 'redis',
      ttlSeconds: 3600,
      maxMemoryMB: 512,
      evictionPolicy: 'allkeys-lru'
    },
    api: {
      rateLimit: 1000,
      rateLimitWindow: 60,
      corsEnabled: true,
      allowedOrigins: 'https://app.auragaming.com\nhttps://admin.auragaming.com',
      maxRequestSize: 10,
      timeoutSeconds: 30
    },
    security: {
      jwtSecret: '***HIDDEN***',
      jwtExpiryHours: 24,
      passwordMinLength: 8,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      twoFactorAuth: true,
      sslRequired: true
    },
    logging: {
      level: 'info',
      retentionDays: 30,
      enableFileLogging: true,
      enableDatabaseLogging: true,
      enableConsoleLogging: true,
      maxLogFileSizeMB: 100
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      webhookEnabled: false,
      webhookUrl: '',
      emailProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@auragaming.com',
      smtpPassword: '***HIDDEN***'
    },
    monitoring: {
      enabled: true,
      alertThresholds: {
        cpuPercent: 80,
        memoryPercent: 85,
        diskPercent: 90,
        responseTimeMs: 5000
      },
      healthCheckIntervalSeconds: 60,
      metricsRetentionDays: 7
    }
  };

  const mockStaffData = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@auragaming.com',
      username: 'jsmith',
      roleId: '1',
      department: 'administration',
      phone: '+1-555-0101',
      status: 'active',
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@auragaming.com',
      username: 'sjohnson',
      roleId: '2',
      department: 'customer_service',
      phone: '+1-555-0102',
      status: 'active',
      isActive: true,
      lastLogin: '2024-01-15T09:45:00Z',
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@auragaming.com',
      username: 'mchen',
      roleId: '3',
      department: 'technical',
      phone: '+1-555-0103',
      status: 'active',
      isActive: true,
      lastLogin: '2024-01-15T11:15:00Z',
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@auragaming.com',
      username: 'edavis',
      roleId: '4',
      department: 'finance',
      phone: '+1-555-0104',
      status: 'inactive',
      isActive: false,
      lastLogin: '2024-01-10T16:30:00Z',
      createdAt: '2024-01-04T00:00:00Z'
    }
  ];

  const mockRolesData = [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Customer Service',
      description: 'Customer support and basic member management',
      permissions: ['2', '3', '8'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Technical Support',
      description: 'System monitoring and technical operations',
      permissions: ['1', '4', '7'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Finance Manager',
      description: 'Payment and financial operations management',
      permissions: ['4', '5', '6'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockGamesData = [
    {
      id: '1',
      name: 'Starburst',
      provider: 'NetEnt',
      categoryId: '1',
      description: 'A classic slot game with expanding wilds and re-spins.',
      rtp: 96.09,
      minBet: 0.10,
      maxBet: 100,
      volatility: 'low',
      paylines: 10,
      reels: 5,
      status: 'active',
      isActive: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Starburst',
      thumbnailUrl: 'https://via.placeholder.com/150x100/4F46E5/FFFFFF?text=Starburst',
      demoUrl: 'https://demo.netent.com/starburst',
      gameUrl: 'https://game.netent.com/starburst',
      mobileCompatible: true,
      tags: ['popular', 'classic', 'wilds']
    },
    {
      id: '2',
      name: 'Book of Dead',
      provider: 'Play\'n GO',
      categoryId: '1',
      description: 'Adventure-themed slot with expanding symbols and free spins.',
      rtp: 96.21,
      minBet: 0.01,
      maxBet: 100,
      volatility: 'high',
      paylines: 10,
      reels: 5,
      status: 'active',
      isActive: true,
      isPopular: true,
      isFeatured: false,
      imageUrl: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Book+of+Dead',
      thumbnailUrl: 'https://via.placeholder.com/150x100/DC2626/FFFFFF?text=Book+of+Dead',
      demoUrl: 'https://demo.playngo.com/book-of-dead',
      gameUrl: 'https://game.playngo.com/book-of-dead',
      mobileCompatible: true,
      tags: ['adventure', 'high-volatility', 'free-spins']
    },
    {
      id: '3',
      name: 'Lightning Roulette',
      provider: 'Evolution Gaming',
      categoryId: '2',
      description: 'Live roulette with random multipliers up to 500x.',
      rtp: 97.30,
      minBet: 0.20,
      maxBet: 5000,
      volatility: 'medium',
      paylines: 0,
      reels: 0,
      status: 'active',
      isActive: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Lightning+Roulette',
      thumbnailUrl: 'https://via.placeholder.com/150x100/F59E0B/FFFFFF?text=Lightning+Roulette',
      demoUrl: '',
      gameUrl: 'https://game.evolution.com/lightning-roulette',
      mobileCompatible: true,
      tags: ['live', 'roulette', 'multipliers']
    },
    {
      id: '4',
      name: 'Blackjack Classic',
      provider: 'Evolution Gaming',
      categoryId: '2',
      description: 'Classic blackjack with professional dealers.',
      rtp: 99.28,
      minBet: 1.00,
      maxBet: 2500,
      volatility: 'low',
      paylines: 0,
      reels: 0,
      status: 'maintenance',
      isActive: false,
      isPopular: false,
      isFeatured: false,
      imageUrl: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Blackjack',
      thumbnailUrl: 'https://via.placeholder.com/150x100/059669/FFFFFF?text=Blackjack',
      demoUrl: '',
      gameUrl: 'https://game.evolution.com/blackjack-classic',
      mobileCompatible: true,
      tags: ['blackjack', 'classic', 'live']
    }
  ];

  const mockCategoriesData = [
    {
      id: '1',
      name: 'Slots',
      description: 'Video slots and classic slot machines',
      imageUrl: 'https://via.placeholder.com/200x150/8B5CF6/FFFFFF?text=Slots',
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Live Casino',
      description: 'Live dealer games with real-time interaction',
      imageUrl: 'https://via.placeholder.com/200x150/EF4444/FFFFFF?text=Live+Casino',
      sortOrder: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Table Games',
      description: 'Classic casino table games',
      imageUrl: 'https://via.placeholder.com/200x150/10B981/FFFFFF?text=Table+Games',
      sortOrder: 3,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Jackpots',
      description: 'Progressive and fixed jackpot games',
      imageUrl: 'https://via.placeholder.com/200x150/F59E0B/FFFFFF?text=Jackpots',
      sortOrder: 4,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  // General Settings functions
  const fetchGeneralSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneralSettings(mockGeneralSettings);
    } catch (err) {
      setError('Failed to fetch general settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGeneralSettings = useCallback(async (settings) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneralSettings(settings);
      return settings;
    } catch (err) {
      setError('Failed to update general settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // System Settings functions
  const fetchSystemSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSystemSettings(mockSystemSettings);
    } catch (err) {
      setError('Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSystemSettings = useCallback(async (settings) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSystemSettings(settings);
      return settings;
    } catch (err) {
      setError('Failed to update system settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Staff Management functions
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setStaffData(mockStaffData);
      setRolesData(mockRolesData);
    } catch (err) {
      setError('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (staffData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newStaff = {
        ...staffData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      return newStaff;
    } catch (err) {
      setError('Failed to create staff member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (staffId, staffData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...staffData, id: staffId };
    } catch (err) {
      setError('Failed to update staff member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStaff = useCallback(async (staffId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      setError('Failed to delete staff member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newRole = {
        ...roleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return newRole;
    } catch (err) {
      setError('Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (roleId, roleData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...roleData, id: roleId };
    } catch (err) {
      setError('Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (roleId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      setError('Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Game Management functions
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setGamesData(mockGamesData);
      setCategoriesData(mockCategoriesData);
    } catch (err) {
      setError('Failed to fetch games data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = useCallback(async (gameData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newGame = {
        ...gameData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return newGame;
    } catch (err) {
      setError('Failed to create game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGame = useCallback(async (gameId, gameData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...gameData, id: gameId };
    } catch (err) {
      setError('Failed to update game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (gameId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      setError('Failed to delete game');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCategory = {
        ...categoryData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return newCategory;
    } catch (err) {
      setError('Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, categoryData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...categoryData, id: categoryId };
    } catch (err) {
      setError('Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Settings data
    generalSettings,
    systemSettings,
    staffData,
    rolesData,
    gamesData,
    categoriesData,
    loading,
    error,

    // General Settings
    fetchGeneralSettings,
    updateGeneralSettings,

    // System Settings
    fetchSystemSettings,
    updateSystemSettings,

    // Staff Management
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    createRole,
    updateRole,
    deleteRole,

    // Game Management
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useSettings; 