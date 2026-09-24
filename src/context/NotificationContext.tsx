import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create the context
const NotificationContext = createContext<any>(undefined);

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Default timeout for notifications in milliseconds
const DEFAULT_TIMEOUT = 5000;

// Provider component
export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Add a notification
  const addNotification = useCallback((notification: any) => {
    // Generate a unique ID for the notification
    const id = notification.id || uuidv4();
    const timeout = notification.timeout || DEFAULT_TIMEOUT;
    
    // Add the notification to the state
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { ...notification, id, timestamp: Date.now() }
    ]);
    
    // Automatically remove the notification after the timeout
    if (timeout !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id: any) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Convenience methods for different notification types
  const success = useCallback((message, options: any = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options: any = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options: any = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options: any = {}) => {
    return addNotification({ 
      type: 'info', 
      message, 
      ...options 
    });
  }, [addNotification]);
  
  // Value object that will be available to consumers of this context
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  };
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext; 