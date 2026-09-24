import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Configuration
const HTTP_URI = process.env.REACT_APP_GRAPHQL_HTTP_URI || 'http://localhost:4000/graphql';
const WS_URI = process.env.REACT_APP_GRAPHQL_WS_URI || 'ws://localhost:4000/graphql';

// HTTP Link
const httpLink = createHttpLink({
  uri: HTTP_URI,
  credentials: 'include'
});

// WebSocket Link for subscriptions
const wsLink = process.env.NODE_ENV !== 'test' ? new WebSocketLink({
  uri: WS_URI,
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem('authToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    connectionCallback: (error) => {
      if (error) {
        console.error('WebSocket connection error:', error);
      } else {
        console.log('WebSocket connected successfully');
      }
    },
    reconnectionAttempts: 5,
    timeout: 20000,
    lazy: true
  }
}) : null;

// Auth Link - adds authorization header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'X-Client-Name': 'Aura Gaming Admin',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
    }
  };
});

// Error Link - handles GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle specific error types
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear auth data and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (extensions?.code === 'FORBIDDEN') {
        console.warn('Access forbidden for operation:', operation.operationName);
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle specific network errors
    if ((networkError as any).statusCode === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if ((networkError as any).statusCode >= 500) {
      // Could trigger a global error notification here
      console.error('Server error detected');
    }
  }
});

// Retry Link - retries failed operations
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors but not on GraphQL errors
      return !!error && !error.result;
    }
  }
});

// Split link for HTTP and WebSocket
const splitLink = wsLink ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([retryLink, authLink, errorLink, httpLink])
) : from([retryLink, authLink, errorLink, httpLink]);

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        balance: {
          merge: true
        },
        transactions: {
          merge: false
        },
        bets: {
          merge: false
        }
      }
    },
    Game: {
      fields: {
        statistics: {
          merge: true
        }
      }
    },
    Transaction: {
      keyFields: ['id']
    },
    Bet: {
      keyFields: ['id']
    },
    // `users`/`games`/`bets`/`transactions`/`bonuses` all return a
    // Connection type ({ nodes, totalCount, pageInfo }) per the real schema
    // (server/src/graphql/schema/index.js). There's no cumulative/infinite-
    // scroll loading anywhere in this app today, so the default
    // replace-on-refetch cache behavior is what we want - no custom merge
    // needed. (A previous version of this file had merge functions here
    // built around an imagined `{ data: [...], pagination: {} }} shape that
    // doesn't exist in the real API and crashed on every real response.)
  },
});

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    },
    query: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    },
    mutate: {
      errorPolicy: 'all'
    }
  },
  connectToDevTools: process.env.NODE_ENV === 'development'
});

// Client utilities
export const clientUtils = {
  // Clear cache
  clearCache: () => {
    return client.clearStore();
  },

  // Reset cache
  resetCache: () => {
    return client.resetStore();
  },

  // Refetch all active queries
  refetchQueries: () => {
    return client.refetchQueries({
      include: 'active'
    });
  },

  // Get cache data
  getCacheData: (query, variables = {}) => {
    try {
      return client.readQuery({ query, variables });
    } catch (error) {
      console.warn('Failed to read from cache:', error);
      return null;
    }
  },

  // Write cache data
  setCacheData: (query, data, variables = {}) => {
    try {
      client.writeQuery({ query, variables, data });
      return true;
    } catch (error) {
      console.warn('Failed to write to cache:', error);
      return false;
    }
  },

  // Update cache field
  updateCacheField: (typename, id, field, value) => {
    try {
      client.cache.modify({
        id: client.cache.identify({ __typename: typename, id }),
        fields: {
          [field]: () => value
        }
      });
      return true;
    } catch (error) {
      console.warn('Failed to update cache field:', error);
      return false;
    }
  },

  // Remove from cache
  removeFromCache: (typename, id) => {
    try {
      client.cache.evict({
        id: client.cache.identify({ __typename: typename, id })
      });
      client.cache.gc();
      return true;
    } catch (error) {
      console.warn('Failed to remove from cache:', error);
      return false;
    }
  },

  // Get cache size
  getCacheSize: () => {
    try {
      const cacheData = client.cache.extract();
      return JSON.stringify(cacheData).length;
    } catch (error) {
      console.warn('Failed to get cache size:', error);
      return 0;
    }
  },

  // Export cache
  exportCache: () => {
    try {
      return client.cache.extract();
    } catch (error) {
      console.warn('Failed to export cache:', error);
      return null;
    }
  },

  // Import cache
  importCache: (cacheData) => {
    try {
      client.cache.restore(cacheData);
      return true;
    } catch (error) {
      console.warn('Failed to import cache:', error);
      return false;
    }
  },

  // Check if query is in cache
  isInCache: (query, variables = {}) => {
    try {
      const data = client.readQuery({ query, variables });
      return !!data;
    } catch (error) {
      return false;
    }
  },

  // Get network status
  getNetworkStatus: () => {
    return {
      online: navigator.onLine,
      connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    };
  },

  // Subscribe to network status changes
  onNetworkStatusChange: (callback) => {
    const handleOnline = () => callback({ online: true });
    const handleOffline = () => callback({ online: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

// Error handling utilities
export const errorUtils = {
  // Extract error message
  getErrorMessage: (error) => {
    if (error.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message;
    }
    
    if (error.networkError) {
      return error.networkError.message;
    }
    
    return error.message || 'An unknown error occurred';
  },

  // Check if error is network error
  isNetworkError: (error) => {
    return !!error.networkError;
  },

  // Check if error is GraphQL error
  isGraphQLError: (error) => {
    return error.graphQLErrors?.length > 0;
  },

  // Check if error is authentication error
  isAuthError: (error) => {
    return error.graphQLErrors?.some(err => 
      err.extensions?.code === 'UNAUTHENTICATED' || 
      err.extensions?.code === 'FORBIDDEN'
    ) || error.networkError?.statusCode === 401;
  },

  // Get error code
  getErrorCode: (error) => {
    if (error.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].extensions?.code;
    }
    
    if (error.networkError) {
      return error.networkError.statusCode;
    }
    
    return null;
  }
};

// Performance monitoring
export const performanceUtils = {
  // Track query performance
  trackQuery: (operationName, startTime, endTime, error = null) => {
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query ${operationName}: ${duration}ms`, error ? 'ERROR' : 'SUCCESS');
    }
    
    // Could send to analytics service here
    return { operationName, duration, error: !!error };
  },

  // Get cache hit ratio
  getCacheHitRatio: () => {
    // This would need to be implemented with custom cache monitoring
    return 0;
  }
};

export default client; 