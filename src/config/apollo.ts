// Apollo GraphQL Configuration for Aura Gaming Platform
import { ApolloClient, InMemoryCache, createHttpLink, from, split, gql, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
// graphql-ws is not an installed dependency - this whole file is an unreferenced,
// dead duplicate of the live client (src/services/apollo/client.ts, see PLAN.md
// Phase 0a); the ts-ignore just lets it type-check without adding a real dependency.
// @ts-expect-error - graphql-ws types aren't installed (see note above)
import { createClient } from 'graphql-ws';
import { RetryLink } from '@apollo/client/link/retry';

// Environment configuration
const config = {
  development: {
    httpUri: 'http://localhost:4000/graphql',
    wsUri: 'ws://localhost:4000/graphql',
  },
  staging: {
    httpUri: 'https://staging-api.auragaming.com/graphql',
    wsUri: 'wss://staging-api.auragaming.com/graphql',
  },
  production: {
    httpUri: 'https://api.auragaming.com/graphql',
    wsUri: 'wss://api.auragaming.com/graphql',
  }
};

const environment = process.env.NODE_ENV || 'development';
const { httpUri, wsUri } = config[environment];

// HTTP Link
const httpLink = createHttpLink({
  uri: httpUri,
  credentials: 'include',
});

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => {
      const token = localStorage.getItem('authToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
);

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-refresh-token': refreshToken || '',
      'x-client-name': 'aura-gaming-admin',
      'x-client-version': process.env.REACT_APP_VERSION || '1.0.0',
    }
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }

      // Handle authorization errors
      if (extensions?.code === 'FORBIDDEN') {
        console.error('Access denied:', message);
        // Could redirect to unauthorized page or show toast
      }

      // Handle validation errors
      if (extensions?.code === 'BAD_USER_INPUT') {
        console.error('Validation error:', message);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle specific network errors
    if ((networkError as any).statusCode === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }
});

// Retry Link
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error
  }
});

// Split link for HTTP and WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([retryLink, errorLink, authLink, httpLink])
);

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        balance: {
          merge: true,
        },
        transactions: {
          merge: false,
        },
        bets: {
          merge: false,
        },
      },
    },
    Game: {
      fields: {
        players: {
          merge: false,
        },
      },
    },
    Transaction: {
      fields: {
        amount: {
          merge: true,
        },
      },
    },
    Bet: {
      fields: {
        amount: {
          merge: true,
        },
        winAmount: {
          merge: true,
        },
      },
    },
    Query: {
      fields: {
        users: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        transactions: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        bets: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        games: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: environment === 'development',
});

// Helper functions
export const clearCache = () => {
  return client.clearStore();
};

export const resetCache = () => {
  return client.resetStore();
};

export const refetchQueries = (queries) => {
  return client.refetchQueries({
    include: queries,
  });
};

// Cache utilities
export const updateUserCache = (userId, updates) => {
  const userRef = cache.identify({ __typename: 'User', id: userId });
  if (userRef) {
    cache.modify({
      id: userRef,
      fields: {
        ...updates,
      },
    });
  }
};

export const updateTransactionCache = (transactionId, updates) => {
  const transactionRef = cache.identify({ 
    __typename: 'Transaction', 
    id: transactionId 
  });
  if (transactionRef) {
    cache.modify({
      id: transactionRef,
      fields: {
        ...updates,
      },
    });
  }
};

// Subscription documents
// Note: this module is not currently wired into the running app (the live
// Apollo client is src/services/apollo/client.js) - these are kept minimal
// and self-contained rather than asserting a specific backend shape.
const USER_UPDATED_SUBSCRIPTION = gql`
  subscription OnUserUpdated($userId: ID!) {
    userUpdated(userId: $userId) {
      id
    }
  }
`;

const TRANSACTION_UPDATED_SUBSCRIPTION = gql`
  subscription OnTransactionUpdated {
    transactionUpdated {
      id
    }
  }
`;

const GAME_UPDATED_SUBSCRIPTION = gql`
  subscription OnGameUpdated {
    gameUpdated {
      id
    }
  }
`;

// Subscription helpers
export const subscribeToUserUpdates = (userId) => {
  return client.subscribe({
    query: USER_UPDATED_SUBSCRIPTION,
    variables: { userId },
  });
};

export const subscribeToTransactionUpdates = () => {
  return client.subscribe({
    query: TRANSACTION_UPDATED_SUBSCRIPTION,
  });
};

export const subscribeToGameUpdates = () => {
  return client.subscribe({
    query: GAME_UPDATED_SUBSCRIPTION,
  });
};

// Error handling utilities
export const handleApolloError = (error) => {
  if (error.networkError) {
    console.error('Network Error:', error.networkError);
    return {
      type: 'network',
      message: 'Network connection error. Please check your internet connection.',
    };
  }

  if (error.graphQLErrors?.length > 0) {
    const firstError = error.graphQLErrors[0];
    console.error('GraphQL Error:', firstError);
    
    return {
      type: 'graphql',
      message: firstError.message,
      code: firstError.extensions?.code,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
  };
};

// Performance monitoring
if (environment === 'production') {
  client.setLink(
    from([
      new ApolloLink((operation, forward) => {
        const startTime = Date.now();
        
        return forward(operation).map((response) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log slow queries (> 1 second)
          if (duration > 1000) {
            console.warn(
              `Slow GraphQL operation: ${operation.operationName} took ${duration}ms`
            );
          }
          
          return response;
        });
      }),
      splitLink,
    ])
  );
}

export default client; 