import { useState, useCallback, useMemo, useContext, createContext } from 'react';

// Permission levels
export const PERMISSION_LEVELS = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  DELETE: 3,
  ADMIN: 4
};

// Default permissions for the gaming platform
export const DEFAULT_PERMISSIONS = {
  // Dashboard permissions
  'dashboard.view': 'View dashboard',
  'dashboard.stats': 'View dashboard statistics',
  'dashboard.export': 'Export dashboard data',

  // Member management permissions
  'members.view': 'View members',
  'members.create': 'Create members',
  'members.edit': 'Edit members',
  'members.delete': 'Delete members',
  'members.suspend': 'Suspend/activate members',
  'members.export': 'Export member data',

  // Payment permissions
  'payments.view': 'View payments',
  'payments.approve': 'Approve payments',
  'payments.reject': 'Reject payments',
  'payments.methods': 'Manage payment methods',
  'payments.export': 'Export payment data',

  // Marketing permissions
  'marketing.view': 'View marketing campaigns',
  'marketing.create': 'Create marketing campaigns',
  'marketing.edit': 'Edit marketing campaigns',
  'marketing.delete': 'Delete marketing campaigns',
  'marketing.bonuses': 'Manage bonuses',

  // Reports permissions
  'reports.view': 'View reports',
  'reports.create': 'Create reports',
  'reports.export': 'Export reports',
  'reports.financial': 'View financial reports',
  'reports.player': 'View player reports',

  // CRM permissions
  'crm.view': 'View CRM',
  'crm.messages': 'Manage messages',
  'crm.tickets': 'Manage tickets',
  'crm.chat': 'Access live chat',

  // Risk management permissions
  'risk.view': 'View risk management',
  'risk.investigate': 'Investigate suspicious activities',
  'risk.alerts': 'Manage risk alerts',
  'risk.limits': 'Set risk limits',

  // Betting permissions
  'bets.view': 'View bets',
  'bets.settle': 'Settle bets',
  'bets.void': 'Void bets',
  'bets.limits': 'Manage betting limits',

  // Referral permissions
  'referral.view': 'View referral system',
  'referral.commissions': 'Manage commissions',
  'referral.settings': 'Configure referral settings',

  // Settings permissions
  'settings.view': 'View settings',
  'settings.system': 'Manage system settings',
  'settings.staff': 'Manage staff',
  'settings.permissions': 'Manage permissions',
  'settings.games': 'Manage games',

  // Admin permissions
  'admin.full': 'Full administrative access',
  'admin.users': 'Manage users',
  'admin.roles': 'Manage roles',
  'admin.system': 'System administration'
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  dashboard: ['dashboard.view', 'dashboard.stats', 'dashboard.export'],
  members: ['members.view', 'members.create', 'members.edit', 'members.delete', 'members.suspend', 'members.export'],
  payments: ['payments.view', 'payments.approve', 'payments.reject', 'payments.methods', 'payments.export'],
  marketing: ['marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete', 'marketing.bonuses'],
  reports: ['reports.view', 'reports.create', 'reports.export', 'reports.financial', 'reports.player'],
  crm: ['crm.view', 'crm.messages', 'crm.tickets', 'crm.chat'],
  risk: ['risk.view', 'risk.investigate', 'risk.alerts', 'risk.limits'],
  bets: ['bets.view', 'bets.settle', 'bets.void', 'bets.limits'],
  referral: ['referral.view', 'referral.commissions', 'referral.settings'],
  settings: ['settings.view', 'settings.system', 'settings.staff', 'settings.permissions', 'settings.games'],
  admin: ['admin.full', 'admin.users', 'admin.roles', 'admin.system']
};

// Role-based permission presets
export const ROLE_PERMISSIONS = {
  admin: ['*'], // All permissions
  manager: [
    ...PERMISSION_GROUPS.dashboard,
    ...PERMISSION_GROUPS.members,
    ...PERMISSION_GROUPS.payments,
    ...PERMISSION_GROUPS.marketing,
    ...PERMISSION_GROUPS.reports,
    ...PERMISSION_GROUPS.crm,
    ...PERMISSION_GROUPS.risk,
    ...PERMISSION_GROUPS.bets,
    ...PERMISSION_GROUPS.referral,
    'settings.view'
  ],
  support: [
    'dashboard.view',
    'members.view',
    'members.edit',
    'payments.view',
    'crm.view',
    'crm.messages',
    'crm.tickets',
    'crm.chat'
  ],
  analyst: [
    'dashboard.view',
    'dashboard.stats',
    'dashboard.export',
    'members.view',
    'payments.view',
    ...PERMISSION_GROUPS.reports,
    'risk.view'
  ],
  operator: [
    'dashboard.view',
    'members.view',
    'payments.view',
    'payments.approve',
    'payments.reject',
    'bets.view',
    'bets.settle'
  ]
};

// Permission Context
const PermissionContext = createContext(null);

// Permission Provider Component
export const PermissionProvider = ({ children, userPermissions = [], userRole = null }) => {
  const permissions = useProvidePermissions(userPermissions, userRole);
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

// Main permissions hook
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Provider hook that creates permission object
const useProvidePermissions = (userPermissions = [], userRole = null) => {
  const [permissions, setPermissions] = useState(userPermissions);
  const [role, setRole] = useState(userRole);

  // Get effective permissions (role + individual permissions)
  const effectivePermissions = useMemo(() => {
    const rolePerms = role ? ROLE_PERMISSIONS[role] || [] : [];
    return [...new Set([...rolePerms, ...permissions])];
  }, [permissions, role]);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!permission) return false;
    
    // Admin wildcard
    if (effectivePermissions.includes('*') || effectivePermissions.includes('admin.full')) {
      return true;
    }
    
    // Direct permission check
    if (effectivePermissions.includes(permission)) {
      return true;
    }
    
    // Check for wildcard permissions (e.g., 'members.*' for 'members.view')
    const permissionParts = permission.split('.');
    for (let i = permissionParts.length - 1; i > 0; i--) {
      const wildcardPerm = permissionParts.slice(0, i).join('.') + '.*';
      if (effectivePermissions.includes(wildcardPerm)) {
        return true;
      }
    }
    
    return false;
  }, [effectivePermissions]);

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Check if user has all permissions
  const hasAllPermissions = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Check if user has permission group
  const hasPermissionGroup = useCallback((groupName) => {
    const groupPermissions = PERMISSION_GROUPS[groupName];
    if (!groupPermissions) return false;
    return hasAllPermissions(groupPermissions);
  }, [hasAllPermissions]);

  // Check if user has any permission in group
  const hasAnyInPermissionGroup = useCallback((groupName) => {
    const groupPermissions = PERMISSION_GROUPS[groupName];
    if (!groupPermissions) return false;
    return hasAnyPermission(groupPermissions);
  }, [hasAnyPermission]);

  // Get permission level for a resource
  const getPermissionLevel = useCallback((resource) => {
    if (hasPermission(`${resource}.admin`) || hasPermission('admin.full')) {
      return PERMISSION_LEVELS.ADMIN;
    }
    if (hasPermission(`${resource}.delete`)) {
      return PERMISSION_LEVELS.DELETE;
    }
    if (hasPermission(`${resource}.edit`) || hasPermission(`${resource}.create`)) {
      return PERMISSION_LEVELS.WRITE;
    }
    if (hasPermission(`${resource}.view`)) {
      return PERMISSION_LEVELS.READ;
    }
    return PERMISSION_LEVELS.NONE;
  }, [hasPermission]);

  // Check if user can perform action on resource
  const canPerformAction = useCallback((resource, action) => {
    const requiredLevel = {
      view: PERMISSION_LEVELS.READ,
      read: PERMISSION_LEVELS.READ,
      create: PERMISSION_LEVELS.WRITE,
      edit: PERMISSION_LEVELS.WRITE,
      update: PERMISSION_LEVELS.WRITE,
      delete: PERMISSION_LEVELS.DELETE,
      admin: PERMISSION_LEVELS.ADMIN
    }[action] || PERMISSION_LEVELS.NONE;

    return getPermissionLevel(resource) >= requiredLevel;
  }, [getPermissionLevel]);

  // Get user's accessible menu items
  const getAccessibleMenuItems = useCallback(() => {
    const menuItems = [];

    if (hasAnyInPermissionGroup('dashboard')) {
      menuItems.push({ key: 'dashboard', label: 'Dashboard', path: '/dashboard' });
    }

    if (hasAnyInPermissionGroup('members')) {
      menuItems.push({ key: 'members', label: 'Members', path: '/members' });
    }

    if (hasAnyInPermissionGroup('payments')) {
      menuItems.push({ key: 'payments', label: 'Payments', path: '/payments' });
    }

    if (hasAnyInPermissionGroup('marketing')) {
      menuItems.push({ key: 'marketing', label: 'Marketing', path: '/marketing' });
    }

    if (hasAnyInPermissionGroup('reports')) {
      menuItems.push({ key: 'reports', label: 'Reports', path: '/reports' });
    }

    if (hasAnyInPermissionGroup('crm')) {
      menuItems.push({ key: 'crm', label: 'CRM', path: '/crm' });
    }

    if (hasAnyInPermissionGroup('risk')) {
      menuItems.push({ key: 'risk', label: 'Risk Management', path: '/risk' });
    }

    if (hasAnyInPermissionGroup('bets')) {
      menuItems.push({ key: 'bets', label: 'Bets', path: '/bets' });
    }

    if (hasAnyInPermissionGroup('referral')) {
      menuItems.push({ key: 'referral', label: 'Referral', path: '/referral' });
    }

    if (hasAnyInPermissionGroup('settings')) {
      menuItems.push({ key: 'settings', label: 'Settings', path: '/settings' });
    }

    return menuItems;
  }, [hasAnyInPermissionGroup]);

  // Update permissions
  const updatePermissions = useCallback((newPermissions) => {
    setPermissions(newPermissions);
  }, []);

  // Add permission
  const addPermission = useCallback((permission) => {
    setPermissions(prev => [...new Set([...prev, permission])]);
  }, []);

  // Remove permission
  const removePermission = useCallback((permission) => {
    setPermissions(prev => prev.filter(p => p !== permission));
  }, []);

  // Update role
  const updateRole = useCallback((newRole) => {
    setRole(newRole);
  }, []);

  // Get permission description
  const getPermissionDescription = useCallback((permission) => {
    return DEFAULT_PERMISSIONS[permission] || permission;
  }, []);

  // Get all available permissions
  const getAllPermissions = useCallback(() => {
    return Object.keys(DEFAULT_PERMISSIONS);
  }, []);

  // Get permissions by group
  const getPermissionsByGroup = useCallback((groupName) => {
    return PERMISSION_GROUPS[groupName] || [];
  }, []);

  return {
    // Current state
    permissions: effectivePermissions,
    role,
    
    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionGroup,
    hasAnyInPermissionGroup,
    getPermissionLevel,
    canPerformAction,
    
    // UI helpers
    getAccessibleMenuItems,
    
    // Permission management
    updatePermissions,
    addPermission,
    removePermission,
    updateRole,
    
    // Utilities
    getPermissionDescription,
    getAllPermissions,
    getPermissionsByGroup,
    
    // Constants
    PERMISSION_LEVELS,
    PERMISSION_GROUPS,
    ROLE_PERMISSIONS
  };
};

// Standalone hook for permission checking without context
export const usePermissionChecker = (userPermissions = [], userRole = null) => {
  return useProvidePermissions(userPermissions, userRole);
};

// HOC for permission-based component rendering
export const withPermissions = (requiredPermissions, fallbackComponent = null) => {
  return (WrappedComponent) => {
    const PermissionWrappedComponent = (props) => {
      const { hasAnyPermission } = usePermissions();
      
      if (!hasAnyPermission(requiredPermissions)) {
        return fallbackComponent || <div>Access Denied</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
    
    PermissionWrappedComponent.displayName = `withPermissions(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return PermissionWrappedComponent;
  };
};

// Permission gate component
export const PermissionGate = ({ 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();
  
  let hasAccess = false;
  
  if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions);
  } else if (Array.isArray(permissions)) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  
  return hasAccess ? children : fallback;
};

// Utility functions
export const permissionUtils = {
  // Create permission string
  createPermission: (resource, action) => `${resource}.${action}`,
  
  // Parse permission string
  parsePermission: (permission) => {
    const parts = permission.split('.');
    return {
      resource: parts[0],
      action: parts.slice(1).join('.')
    };
  },
  
  // Check if permission is wildcard
  isWildcard: (permission) => permission.endsWith('*') || permission === '*',
  
  // Get permission hierarchy
  getPermissionHierarchy: (permission) => {
    const parts = permission.split('.');
    const hierarchy = [];
    
    for (let i = 1; i <= parts.length; i++) {
      hierarchy.push(parts.slice(0, i).join('.'));
    }
    
    return hierarchy;
  },
  
  // Normalize permissions (remove duplicates, expand wildcards)
  normalizePermissions: (permissions) => {
    const normalized = new Set();
    
    permissions.forEach(permission => {
      if (permission === '*' || permission === 'admin.full') {
        normalized.clear();
        normalized.add('*');
        return;
      }
      
      if (permission.endsWith('*')) {
        const prefix = permission.slice(0, -1);
        Object.keys(DEFAULT_PERMISSIONS).forEach(perm => {
          if (perm.startsWith(prefix)) {
            normalized.add(perm);
          }
        });
      } else {
        normalized.add(permission);
      }
    });
    
    return Array.from(normalized);
  }
};

export default usePermissions; 