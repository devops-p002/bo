// Apollo Client
export { default as client, cacheUtils, clientUtils } from './client';

// Fragments
export * from './fragments';

// Queries
export * from './queries';

// Mutations
export * from './mutations';

// Subscriptions
export * from './subscriptions';

// GraphQL utilities
export const graphqlUtils = {
  // Extract error messages from GraphQL errors
  extractErrorMessages: (error) => {
    if (!error) return [];
    
    const messages = [];
    
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach(err => {
        messages.push(err.message);
      });
    }
    
    if (error.networkError) {
      messages.push(error.networkError.message);
    }
    
    return messages;
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    if (!error) return false;
    
    return error.graphQLErrors?.some(err => 
      err.extensions?.code === 'UNAUTHENTICATED' ||
      err.extensions?.code === 'FORBIDDEN'
    ) || error.networkError?.statusCode === 401;
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return error?.networkError && !error.graphQLErrors?.length;
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error?.graphQLErrors?.some(err => 
      err.extensions?.code === 'BAD_USER_INPUT'
    );
  },

  // Format error for display
  formatError: (error) => {
    if (!error) return 'An unknown error occurred';
    
    if (error.graphQLErrors?.length) {
      return error.graphQLErrors[0].message;
    }
    
    if (error.networkError) {
      return `Network error: ${error.networkError.message}`;
    }
    
    return error.message || 'An error occurred';
  },

  // Create optimistic response for mutations
  createOptimisticResponse: (typename, data) => {
    return {
      __typename: 'Mutation',
      [`create${typename}`]: {
        __typename: typename,
        id: `temp-${Date.now()}`,
        ...data
      }
    };
  },

  // Create update function for cache after mutation
  createCacheUpdate: (queryName, typename) => {
    return (cache, { data }) => {
      const mutationResult = data[Object.keys(data)[0]];
      
      try {
        const existingData = cache.readQuery({ query: queryName });
        
        if (existingData && existingData[typename.toLowerCase() + 's']) {
          cache.writeQuery({
            query: queryName,
            data: {
              ...existingData,
              [typename.toLowerCase() + 's']: {
                ...existingData[typename.toLowerCase() + 's'],
                data: [mutationResult, ...existingData[typename.toLowerCase() + 's'].data]
              }
            }
          });
        }
      } catch (error) {
        console.warn('Cache update failed:', error);
      }
    };
  }
};

// Query result utilities
export const queryUtils = {
  // Check if query is loading
  isLoading: (queryResult) => {
    return queryResult.loading && !queryResult.data;
  },

  // Check if query is refetching
  isRefetching: (queryResult) => {
    return queryResult.loading && !!queryResult.data;
  },

  // Check if query has error
  hasError: (queryResult) => {
    return !!queryResult.error;
  },

  // Check if query has data
  hasData: (queryResult) => {
    return !!queryResult.data && !queryResult.loading;
  },

  // Get pagination info from query result
  getPagination: (queryResult, dataKey) => {
    return queryResult.data?.[dataKey]?.pagination || null;
  },

  // Get data array from paginated query result
  getData: (queryResult, dataKey) => {
    return queryResult.data?.[dataKey]?.data || [];
  },

  // Check if there are more pages
  hasNextPage: (queryResult, dataKey) => {
    const pagination = queryUtils.getPagination(queryResult, dataKey);
    return pagination?.hasNext || false;
  },

  // Check if there are previous pages
  hasPrevPage: (queryResult, dataKey) => {
    const pagination = queryUtils.getPagination(queryResult, dataKey);
    return pagination?.hasPrev || false;
  }
};

// Subscription utilities
export const subscriptionUtils = {
  // Create subscription options with error handling
  createSubscriptionOptions: (onData, onError) => {
    return {
      onData: ({ data }) => {
        if (data.data) {
          onData(data.data);
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error);
        if (onError) {
          onError(error);
        }
      }
    };
  },

  // Handle subscription connection state
  handleConnectionState: (subscriptionResult, onConnected, onDisconnected) => {
    if (subscriptionResult.loading) {
      // Connecting
      return;
    }
    
    if (subscriptionResult.error) {
      if (onDisconnected) {
        onDisconnected(subscriptionResult.error);
      }
      return;
    }
    
    if (subscriptionResult.data && onConnected) {
      onConnected();
    }
  }
};

// Type definitions for better IDE support
export const GraphQLTypes = {
  // Enums
  UserStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    BLOCKED: 'BLOCKED',
    PENDING: 'PENDING'
  },
  
  PaymentStatus: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
  },
  
  PaymentType: {
    DEPOSIT: 'DEPOSIT',
    WITHDRAWAL: 'WITHDRAWAL'
  },
  
  BetStatus: {
    PENDING: 'PENDING',
    SETTLED: 'SETTLED',
    VOIDED: 'VOIDED',
    CANCELLED: 'CANCELLED'
  },
  
  GameStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    MAINTENANCE: 'MAINTENANCE'
  },
  
  SortOrder: {
    ASC: 'ASC',
    DESC: 'DESC'
  }
}; 