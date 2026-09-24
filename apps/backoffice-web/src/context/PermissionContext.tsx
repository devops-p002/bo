import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Create the context
const PermissionContext = createContext<any>(undefined);

// Custom hook to use the permission context
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

// Provider component
export const PermissionProvider = ({ children }: any) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Update permissions when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true);
      
      // Set user permissions
      setPermissions(user.permissions || []);
      
      // Set user roles
      setRoles([user.role].filter(Boolean));
      
      setLoading(false);
    } else {
      // Reset permissions and roles when not authenticated
      setPermissions([]);
      setRoles([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);
  
  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!isAuthenticated) return false;
    if (!permission) return true;
    
    return permissions.includes(permission);
  };
  
  // Check if user has any of the specified permissions
  const hasAnyPermission = (requiredPermissions = []) => {
    if (!isAuthenticated) return false;
    if (!requiredPermissions.length) return true;
    
    return requiredPermissions.some(permission => permissions.includes(permission));
  };
  
  // Check if user has all of the specified permissions
  const hasAllPermissions = (requiredPermissions = []) => {
    if (!isAuthenticated) return false;
    if (!requiredPermissions.length) return true;
    
    return requiredPermissions.every(permission => permissions.includes(permission));
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!isAuthenticated) return false;
    if (!role) return true;
    
    return roles.includes(role);
  };
  
  // Check if user has any of the specified roles
  const hasAnyRole = (requiredRoles = []) => {
    if (!isAuthenticated) return false;
    if (!requiredRoles.length) return true;
    
    return requiredRoles.some(role => roles.includes(role));
  };
  
  // Value object that will be available to consumers of this context
  const value = {
    permissions,
    roles,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };
  
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export default PermissionContext; 