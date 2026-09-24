// Apollo Client and utilities
export { default as apolloClient, clientUtils, errorUtils, performanceUtils } from './client';

// Re-export Apollo Client for convenience
import apolloClient from './client';
export default apolloClient; 