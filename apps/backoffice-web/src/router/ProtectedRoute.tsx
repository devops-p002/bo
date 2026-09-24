import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import { hasPermission, hasAnyPermission } from '../config/permissions';
import Loading from '../components/common/UI/Loading';

// Loading component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading size="large" />
    <span className="ml-3 text-lg text-gray-600">Verifying access...</span>
  </div>
);

// Unauthorized component
const UnauthorizedAccess = ({ message }: any) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        {message || 'You do not have permission to access this page.'}
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.history.back()}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  userPermissions = [],
  requireAll = false,
  fallbackPath = '/login',
  unauthorizedPath = '/unauthorized',
  showUnauthorized = true
}) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { permissions: hookPermissions, loading: permissionsLoading } = usePermission();
  const location = useLocation();

  // Use permissions from props or hook
  const permissions = userPermissions.length > 0 ? userPermissions : hookPermissions;

  // Show loading while checking authentication and permissions
  if (authLoading || permissionsLoading) {
    return <RouteLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user account is active
  if (user && user.status !== 'active') {
    const statusMessages = {
      inactive: 'Your account is inactive. Please contact support.',
      suspended: 'Your account has been suspended. Please contact support.',
      banned: 'Your account has been banned.',
      pending: 'Your account is pending approval.',
    };

    return (
      <UnauthorizedAccess 
        message={statusMessages[user.status] || 'Your account status prevents access to this page.'} 
      />
    );
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(permissions, permission))
      : hasAnyPermission(permissions, requiredPermissions);

    if (!hasRequiredPermissions) {
      if (showUnauthorized) {
        return <UnauthorizedAccess />;
      } else {
        return (
          <Navigate 
            to={unauthorizedPath} 
            state={{ 
              from: location.pathname,
              requiredPermissions,
              userPermissions: permissions
            }} 
            replace 
          />
        );
      }
    }
  }

  // Check role-based access (additional security layer)
  if (user && user.role) {
    const roleHierarchy = {
      viewer: 1,
      support: 2,
      operator: 3,
      manager: 4,
      admin: 5,
      super_admin: 6,
      // Also handle uppercase variants
      VIEWER: 1,
      SUPPORT: 2,
      OPERATOR: 3,
      MANAGER: 4,
      ADMIN: 5,
      SUPER_ADMIN: 6,
    };

    // Some routes might require minimum role level
    const currentRoleLevel = roleHierarchy[user.role] || 0;
    
    // Example: Admin-only routes
    if (location.pathname.startsWith('/settings') && currentRoleLevel < 5) {
      return <UnauthorizedAccess message="This section requires administrator privileges." />;
    }

    // Example: Super admin-only routes
    if (location.pathname.startsWith('/system') && currentRoleLevel < 6) {
      return <UnauthorizedAccess message="This section requires super administrator privileges." />;
    }
  }

  // Check for maintenance mode
  if (process.env.REACT_APP_MAINTENANCE_MODE === 'true' && user?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">System Maintenance</h1>
          <p className="text-gray-600 mb-6">
            The system is currently under maintenance. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Check for IP restrictions (if enabled)
  if (process.env.REACT_APP_ENABLE_IP_RESTRICTIONS === 'true') {
    // This would typically be handled on the server side
    // but we can add client-side checks for additional security
    const allowedIPs = process.env.REACT_APP_ALLOWED_IPS?.split(',') || [];
    
    if (allowedIPs.length > 0) {
      // In a real implementation, you'd get the client IP from the server
      // This is just a placeholder for the concept
      console.log('IP restriction check would be performed here');
    }
  }

  // Check for time-based access restrictions
  if (user && user.accessSchedule) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const { allowedHours, allowedDays } = user.accessSchedule;

    if (allowedHours && !allowedHours.includes(currentHour)) {
      return (
        <UnauthorizedAccess 
          message="Access is restricted during this time period." 
        />
      );
    }

    if (allowedDays && !allowedDays.includes(currentDay)) {
      return (
        <UnauthorizedAccess 
          message="Access is restricted on this day." 
        />
      );
    }
  }

  // Check for session timeout
  if (user && user.lastActivity) {
    const sessionTimeout = process.env.REACT_APP_SESSION_TIMEOUT || 3600000; // 1 hour default
    const timeSinceLastActivity = Date.now() - new Date(user.lastActivity).getTime();

    if (timeSinceLastActivity > Number(sessionTimeout)) {
      // Session expired, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      
      return (
        <Navigate 
          to="/login" 
          state={{ 
            from: location.pathname,
            message: 'Your session has expired. Please log in again.'
          }} 
          replace 
        />
      );
    }
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute; 