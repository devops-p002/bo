// axios is not an installed dependency - this service layer is unreferenced dead
// code (nothing under src/ imports src/services/api/*, see PLAN.md Phase 0a); the
// ts-ignore just lets it type-check without adding a real dependency.
// @ts-expect-error - package not installed; see comment above
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
    'X-Client-Platform': 'web'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date().getTime() - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    // Calculate request duration
    const duration = error.config?.metadata ? new Date().getTime() - error.config.metadata.startTime : 0;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.warn('Access denied for request:', error.config?.url);
    }

    if (error.response?.status >= 500) {
      // Server error - could trigger error reporting
      console.error('Server error detected:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

// Base API service class
export class BaseApiService {
  baseEndpoint: string;
  client: any;

  constructor(baseEndpoint = '') {
    this.baseEndpoint = baseEndpoint;
    this.client = apiClient;
  }

  // Build URL with base endpoint
  buildUrl(endpoint = '') {
    return this.baseEndpoint ? `${this.baseEndpoint}${endpoint}` : endpoint;
  }

  // GET request
  async get(endpoint = '', params = {}, config = {}) {
    try {
      const response = await this.client.get(this.buildUrl(endpoint), {
        params,
        ...config
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  async post(endpoint = '', data = {}, config = {}) {
    try {
      const response = await this.client.post(this.buildUrl(endpoint), data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put(endpoint = '', data = {}, config = {}) {
    try {
      const response = await this.client.put(this.buildUrl(endpoint), data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  async patch(endpoint = '', data = {}, config = {}) {
    try {
      const response = await this.client.patch(this.buildUrl(endpoint), data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete(endpoint = '', config = {}) {
    try {
      const response = await this.client.delete(this.buildUrl(endpoint), config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload file
  async upload(endpoint = '', file, additionalData: any = {}, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add additional form data
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const config: any = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Add progress tracking if callback provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const response = await this.client.post(this.buildUrl(endpoint), formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download file
  async download(endpoint = '', filename = null, params = {}) {
    try {
      const response = await this.client.get(this.buildUrl(endpoint), {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors consistently
  handleError(error) {
    const apiError = {
      message: 'An error occurred',
      status: null,
      code: null,
      details: null
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      apiError.message = error.response.data?.message || error.message;
      apiError.code = error.response.data?.code;
      apiError.details = error.response.data?.details;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Network error - please check your connection';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Something else happened
      apiError.message = error.message;
      apiError.code = 'UNKNOWN_ERROR';
    }

    return apiError;
  }

  // Cancel request
  createCancelToken() {
    return axios.CancelToken.source();
  }

  // Check if error is cancellation
  isCancelError(error) {
    return axios.isCancel(error);
  }
}

// Utility functions
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params: any) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value as string);
        }
      }
    });
    
    return searchParams.toString();
  },

  // Parse error response
  parseError: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    
    if (error.response?.data?.message) {
      return [error.response.data.message];
    }
    
    return [error.message || 'An unknown error occurred'];
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize: (file, maxSizeInMB) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
};

// Export configured axios instance
export { apiClient };

// Export base service
export default BaseApiService; 