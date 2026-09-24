// Base API service and utilities
import BaseApiService, { apiClient, apiUtils } from './base';
export { default as BaseApiService, apiClient, apiUtils } from './base';

// Specific API services
import authApiService from './auth';
import usersApiService from './users';
import paymentsApiService from './payments';
import gamesApiService from './games';
export { default as authApiService } from './auth';
export { default as usersApiService } from './users';
export { default as paymentsApiService } from './payments';
export { default as gamesApiService } from './games';

// API service registry for easy access
export const apiServices = {
  auth: authApiService,
  users: usersApiService,
  payments: paymentsApiService,
  games: gamesApiService
};

// Utility function to get API service by name
export const getApiService = (serviceName) => {
  return apiServices[serviceName];
};

// Common API error handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// API response wrapper for consistent handling
export const apiResponse = {
  success: (data, message = 'Success') => ({
    success: true,
    data,
    message
  }),
  
  error: (error, message = 'An error occurred') => ({
    success: false,
    error: handleApiError(error, message),
    data: null
  })
};

// API request interceptor helpers
export const apiInterceptors = {
  // Add request interceptor
  addRequestInterceptor: (onFulfilled, onRejected) => {
    return apiClient.interceptors.request.use(onFulfilled, onRejected);
  },
  
  // Add response interceptor
  addResponseInterceptor: (onFulfilled, onRejected) => {
    return apiClient.interceptors.response.use(onFulfilled, onRejected);
  },
  
  // Remove interceptor
  removeInterceptor: (type, interceptorId) => {
    if (type === 'request') {
      apiClient.interceptors.request.eject(interceptorId);
    } else if (type === 'response') {
      apiClient.interceptors.response.eject(interceptorId);
    }
  }
};

// API configuration helpers
export const apiConfig = {
  // Set base URL
  setBaseURL: (baseURL) => {
    apiClient.defaults.baseURL = baseURL;
  },
  
  // Set timeout
  setTimeout: (timeout) => {
    apiClient.defaults.timeout = timeout;
  },
  
  // Set default headers
  setDefaultHeaders: (headers) => {
    Object.assign(apiClient.defaults.headers, headers);
  },
  
  // Get current config
  getConfig: () => ({
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    headers: apiClient.defaults.headers
  })
};

// Export everything as default for convenience
export default {
  BaseApiService,
  apiClient,
  apiUtils,
  authApiService,
  usersApiService,
  paymentsApiService,
  gamesApiService,
  apiServices,
  getApiService,
  handleApiError,
  apiResponse,
  apiInterceptors,
  apiConfig
}; 