import { useState, useCallback } from 'react';

const usePermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [permissionsData, setPermissionsData] = useState(null);
  const [groupsData, setGroupsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock permissions data
  const mockPermissions = [
    // Dashboard permissions
    {
      id: '1',
      name: 'View Dashboard',
      code: 'dashboard.view',
      category: 'dashboard',
      description: 'Access to main dashboard and analytics',
      isActive: true,
      isSystem: true
    },
    {
      id: '2',
      name: 'Manage Dashboard',
      code: 'dashboard.manage',
      category: 'dashboard',
      description: 'Configure dashboard settings and widgets',
      isActive: true,
      isSystem: false
    },

    // Members permissions
    {
      id: '3',
      name: 'View Members',
      code: 'members.view',
      category: 'members',
      description: 'View member profiles and basic information',
      isActive: true,
      isSystem: true
    },
    {
      id: '4',
      name: 'Edit Members',
      code: 'members.edit',
      category: 'members',
      description: 'Edit member profiles and account settings',
      isActive: true,
      isSystem: false
    },
    {
      id: '5',
      name: 'Suspend Members',
      code: 'members.suspend',
      category: 'members',
      description: 'Suspend or activate member accounts',
      isActive: true,
      isSystem: false
    },
    {
      id: '6',
      name: 'Delete Members',
      code: 'members.delete',
      category: 'members',
      description: 'Permanently delete member accounts',
      isActive: true,
      isSystem: false
    },

    // Payments permissions
    {
      id: '7',
      name: 'View Payments',
      code: 'payments.view',
      category: 'payments',
      description: 'View payment transactions and history',
      isActive: true,
      isSystem: true
    },
    {
      id: '8',
      name: 'Process Payments',
      code: 'payments.process',
      category: 'payments',
      description: 'Approve or reject payment transactions',
      isActive: true,
      isSystem: false
    },
    {
      id: '9',
      name: 'Manage Payment Methods',
      code: 'payments.methods',
      category: 'payments',
      description: 'Configure payment methods and settings',
      isActive: true,
      isSystem: false
    },

    // Reports permissions
    {
      id: '10',
      name: 'View Reports',
      code: 'reports.view',
      category: 'reports',
      description: 'Access to all reports and analytics',
      isActive: true,
      isSystem: true
    },
    {
      id: '11',
      name: 'Export Reports',
      code: 'reports.export',
      category: 'reports',
      description: 'Export reports to various formats',
      isActive: true,
      isSystem: false
    },
    {
      id: '12',
      name: 'Create Custom Reports',
      code: 'reports.create',
      category: 'reports',
      description: 'Create and customize report templates',
      isActive: true,
      isSystem: false
    },

    // Marketing permissions
    {
      id: '13',
      name: 'View Marketing',
      code: 'marketing.view',
      category: 'marketing',
      description: 'View marketing campaigns and bonuses',
      isActive: true,
      isSystem: true
    },
    {
      id: '14',
      name: 'Manage Campaigns',
      code: 'marketing.campaigns',
      category: 'marketing',
      description: 'Create and manage marketing campaigns',
      isActive: true,
      isSystem: false
    },
    {
      id: '15',
      name: 'Manage Bonuses',
      code: 'marketing.bonuses',
      category: 'marketing',
      description: 'Create and manage bonus offers',
      isActive: true,
      isSystem: false
    },

    // CRM permissions
    {
      id: '16',
      name: 'View CRM',
      code: 'crm.view',
      category: 'crm',
      description: 'Access customer service tools',
      isActive: true,
      isSystem: true
    },
    {
      id: '17',
      name: 'Manage Tickets',
      code: 'crm.tickets',
      category: 'crm',
      description: 'Handle customer support tickets',
      isActive: true,
      isSystem: false
    },
    {
      id: '18',
      name: 'Live Chat',
      code: 'crm.chat',
      category: 'crm',
      description: 'Provide live chat support',
      isActive: true,
      isSystem: false
    },

    // Risk Management permissions
    {
      id: '19',
      name: 'View Risk Management',
      code: 'risk.view',
      category: 'risk',
      description: 'Access risk management tools',
      isActive: true,
      isSystem: true
    },
    {
      id: '20',
      name: 'Investigate Risks',
      code: 'risk.investigate',
      category: 'risk',
      description: 'Investigate suspicious activities',
      isActive: true,
      isSystem: false
    },
    {
      id: '21',
      name: 'Manage Alerts',
      code: 'risk.alerts',
      category: 'risk',
      description: 'Configure and manage risk alerts',
      isActive: true,
      isSystem: false
    },

    // Bets permissions
    {
      id: '22',
      name: 'View Bets',
      code: 'bets.view',
      category: 'bets',
      description: 'View betting history and statistics',
      isActive: true,
      isSystem: true
    },
    {
      id: '23',
      name: 'Settle Bets',
      code: 'bets.settle',
      category: 'bets',
      description: 'Manually settle betting outcomes',
      isActive: true,
      isSystem: false
    },
    {
      id: '24',
      name: 'Manage Bet Limits',
      code: 'bets.limits',
      category: 'bets',
      description: 'Configure betting limits and restrictions',
      isActive: true,
      isSystem: false
    },

    // Referral permissions
    {
      id: '25',
      name: 'View Referrals',
      code: 'referral.view',
      category: 'referral',
      description: 'View referral program data',
      isActive: true,
      isSystem: true
    },
    {
      id: '26',
      name: 'Manage Commissions',
      code: 'referral.commissions',
      category: 'referral',
      description: 'Configure commission structures',
      isActive: true,
      isSystem: false
    },

    // Settings permissions
    {
      id: '27',
      name: 'View Settings',
      code: 'settings.view',
      category: 'settings',
      description: 'Access system settings',
      isActive: true,
      isSystem: true
    },
    {
      id: '28',
      name: 'Manage General Settings',
      code: 'settings.general',
      category: 'settings',
      description: 'Configure general platform settings',
      isActive: true,
      isSystem: false
    },
    {
      id: '29',
      name: 'Manage System Settings',
      code: 'settings.system',
      category: 'settings',
      description: 'Configure technical system settings',
      isActive: true,
      isSystem: false
    },
    {
      id: '30',
      name: 'Manage Staff',
      code: 'settings.staff',
      category: 'settings',
      description: 'Manage staff accounts and roles',
      isActive: true,
      isSystem: false
    },
    {
      id: '31',
      name: 'Manage Permissions',
      code: 'settings.permissions',
      category: 'settings',
      description: 'Configure permissions and access control',
      isActive: true,
      isSystem: false
    },
    {
      id: '32',
      name: 'Manage Games',
      code: 'settings.games',
      category: 'settings',
      description: 'Configure games and categories',
      isActive: true,
      isSystem: false
    }
  ];

  const mockPermissionGroups = [
    {
      id: '1',
      name: 'View Only',
      description: 'Read-only access to all modules',
      permissions: ['1', '3', '7', '10', '13', '16', '19', '22', '25', '27'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Customer Service',
      description: 'Customer support and basic member management',
      permissions: ['1', '3', '4', '7', '10', '16', '17', '18', '22'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Financial Operations',
      description: 'Payment processing and financial reporting',
      permissions: ['1', '3', '7', '8', '9', '10', '11', '22'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Risk Management',
      description: 'Risk analysis and fraud prevention',
      permissions: ['1', '3', '7', '10', '19', '20', '21', '22', '24'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Marketing Manager',
      description: 'Marketing campaigns and bonus management',
      permissions: ['1', '3', '10', '11', '13', '14', '15', '25', '26'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      name: 'Administrator',
      description: 'Full access to all system features',
      permissions: mockPermissions.map(p => p.id),
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setPermissions(mockPermissions);
      setPermissionsData(mockPermissions);
      setGroupsData(mockPermissionGroups);
    } catch (err) {
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPermission = useCallback(async (permissionData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newPermission = {
        ...permissionData,
        id: Date.now().toString(),
        isSystem: false
      };
      return newPermission;
    } catch (err) {
      setError('Failed to create permission');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermission = useCallback(async (permissionId, permissionData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...permissionData, id: permissionId };
    } catch (err) {
      setError('Failed to update permission');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePermission = useCallback(async (permissionId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Check if permission is system permission
      const permission = mockPermissions.find(p => p.id === permissionId);
      if (permission?.isSystem) {
        throw new Error('Cannot delete system permission');
      }
      return true;
    } catch (err) {
      setError('Failed to delete permission');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newGroup = {
        ...groupData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        users: []
      };
      return newGroup;
    } catch (err) {
      setError('Failed to create permission group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (groupId, groupData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...groupData, id: groupId };
    } catch (err) {
      setError('Failed to update permission group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGroup = useCallback(async (groupId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Check if group is default group
      const group = mockPermissionGroups.find(g => g.id === groupId);
      if (group?.isDefault) {
        throw new Error('Cannot delete default permission group');
      }
      return true;
    } catch (err) {
      setError('Failed to delete permission group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermission = useCallback((userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }
    return userPermissions.includes(requiredPermission);
  }, []);

  const checkMultiplePermissions = useCallback((userPermissions, requiredPermissions, requireAll = true) => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }
    
    if (requireAll) {
      return requiredPermissions.every(permission => userPermissions.includes(permission));
    } else {
      return requiredPermissions.some(permission => userPermissions.includes(permission));
    }
  }, []);

  const getPermissionsByCategory = useCallback((category) => {
    if (!permissions) return [];
    return permissions.filter(permission => permission.category === category);
  }, [permissions]);

  const getUserPermissions = useCallback(async (userId) => {
    setLoading(true);
    try {
      // Simulate API call to get user's permissions
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock user permissions based on role
      const mockUserPermissions = {
        '1': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'], // Super Admin
        '2': ['1', '3', '4', '7', '10', '16', '17', '18', '22'], // Customer Service
        '3': ['1', '3', '7', '10', '19', '20', '21', '22', '24'], // Risk Management
        '4': ['1', '3', '7', '8', '9', '10', '11', '22'] // Finance
      };
      
      return mockUserPermissions[userId] || [];
    } catch (err) {
      setError('Failed to fetch user permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignPermissionsToUser = useCallback(async (userId, permissionIds) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { userId, permissions: permissionIds };
    } catch (err) {
      setError('Failed to assign permissions to user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePermissionsFromUser = useCallback(async (userId, permissionIds) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { userId, removedPermissions: permissionIds };
    } catch (err) {
      setError('Failed to remove permissions from user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    permissions,
    permissionsData,
    groupsData,
    loading,
    error,

    // Permission CRUD
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,

    // Permission Group CRUD
    createGroup,
    updateGroup,
    deleteGroup,

    // Permission checking utilities
    checkPermission,
    checkMultiplePermissions,
    getPermissionsByCategory,

    // User permission management
    getUserPermissions,
    assignPermissionsToUser,
    removePermissionsFromUser
  };
};

export default usePermissions; 