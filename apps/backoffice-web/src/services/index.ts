// API Services
import apiServices from './api';
export * from './api';
export { default as apiServices } from './api';

// Storage Services
import storageServices from './storage';
export * from './storage';
export { default as storageServices } from './storage';

// Utility Services
import utilityServices from './utils';
export * from './utils';
export { default as utilityServices } from './utils';

// Apollo Services
import apolloClient from './apollo';
export * from './apollo';
export { default as apolloClient } from './apollo';

// Main services object for convenience
export const services = {
  // API services
  api: apiServices,
  
  // Storage services
  storage: storageServices,
  
  // Utility services
  utils: utilityServices,
  
  // Apollo client
  apollo: apolloClient
};

// Export default services object
export default services; 