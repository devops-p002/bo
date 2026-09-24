import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { PermissionProvider } from './PermissionContext';

export { default as AuthContext, AuthProvider, useAuth } from './AuthContext';
export { default as ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
export { default as NotificationContext, NotificationProvider, useNotification } from './NotificationContext';
export { default as PermissionContext, PermissionProvider, usePermission } from './PermissionContext';

// Combined provider that wraps all context providers
export const AppProviders = ({ children }) => (
  <AuthProvider>
    <PermissionProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </PermissionProvider>
  </AuthProvider>
); 