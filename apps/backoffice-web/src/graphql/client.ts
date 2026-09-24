import { ApolloClient, InMemoryCache, createHttpLink, from, split, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
// graphql-ws is not an installed dependency - this whole file is an unreferenced,
// dead duplicate of the live client (src/services/apollo/client.ts, see PLAN.md
// Phase 0a); the ts-ignore just lets it type-check without adding a real dependency.
// @ts-expect-error - package not installed; see comment above
import { createClient } from 'graphql-ws';

// HTTP Link for queries and mutations
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql',
  credentials: 'include'
});

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('authToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    shouldRetry: (errOrCloseEvent) => {
      // Retry on connection errors but not on auth errors
      return !errOrCloseEvent || errOrCloseEvent.code !== 4401;
    },
    retryAttempts: 5,
    retryWait: async (attempt) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  })
);

// Auth Link - adds authorization header to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-client-version': process.env.REACT_APP_VERSION || '1.0.0',
      'x-client-platform': 'web'
    }
  };
});

// Error Link - handles GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Handle authorization errors
      if (extensions?.code === 'FORBIDDEN') {
        console.warn('Access denied for operation:', operation.operationName);
        // Could show a toast notification here
      }

      // Handle validation errors
      if (extensions?.code === 'BAD_USER_INPUT') {
        console.warn('Validation error:', message);
        // Could show form validation errors here
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle specific network errors
    if ((networkError as any).statusCode === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if ((networkError as any).statusCode >= 500) {
      console.error('Server error detected');
      // Could show a server error notification here
    }

    // Retry logic for network errors
    if ((networkError as any).statusCode >= 500 || networkError.name === 'ServerError') {
      return forward(operation);
    }
  }

  return undefined;
});

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        balance: {
          merge: true
        },
        limits: {
          merge: true
        },
        preferences: {
          merge: true
        }
      }
    },
    Payment: {
      fields: {
        user: {
          merge: true
        }
      }
    },
    Bet: {
      fields: {
        user: {
          merge: true
        },
        game: {
          merge: true
        }
      }
    },
    Game: {
      fields: {
        provider: {
          merge: true
        },
        category: {
          merge: true
        }
      }
    },
    Query: {
      fields: {
        users: {
          keyArgs: ['search', 'status', 'vipLevel', 'country', 'sortBy', 'sortOrder'],
          merge(existing = { data: [], pagination: {} }, incoming) {
            return {
              data: [...existing.data, ...incoming.data],
              pagination: incoming.pagination
            };
          }
        },
        payments: {
          keyArgs: ['type', 'status', 'method', 'userId', 'dateRange', 'sortBy', 'sortOrder'],
          merge(existing = { data: [], pagination: {} }, incoming) {
            return {
              data: [...existing.data, ...incoming.data],
              pagination: incoming.pagination
            };
          }
        },
        bets: {
          keyArgs: ['userId', 'gameId', 'status', 'type', 'dateRange', 'sortBy', 'sortOrder'],
          merge(existing = { data: [], pagination: {} }, incoming) {
            return {
              data: [...existing.data, ...incoming.data],
              pagination: incoming.pagination
            };
          }
        },
        games: {
          keyArgs: ['search', 'provider', 'category', 'type', 'status', 'sortBy', 'sortOrder'],
          merge(existing = { data: [], pagination: {} }, incoming) {
            return {
              data: [...existing.data, ...incoming.data],
              pagination: incoming.pagination
            };
          }
        }
      }
    }
  },
  dataIdFromObject: (object) => {
    // Custom cache ID generation
    switch (object.__typename) {
      case 'User':
      case 'Payment':
      case 'Bet':
      case 'Game':
      case 'Tournament':
      case 'Bonus':
      case 'Commission':
        return `${object.__typename}:${object.id}`;
      default:
        return null;
    }
  }
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
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  },
  connectToDevTools: process.env.NODE_ENV === 'development'
});

// Cache utilities
export const cacheUtils = {
  // Clear all cache
  clearCache: () => {
    client.cache.reset();
  },

  // Clear specific cache entries
  clearCacheEntry: (typename, id) => {
    client.cache.evict({ id: `${typename}:${id}` });
    client.cache.gc();
  },

  // Update cache entry
  updateCacheEntry: (typename, id, data) => {
    client.cache.writeFragment({
      id: `${typename}:${id}`,
      fragment: gql`
        fragment Update${typename} on ${typename} {
          ${Object.keys(data).join('\n')}
        }
      `,
      data
    });
  },

  // Read cache entry
  readCacheEntry: (typename, id) => {
    return client.cache.readFragment({
      id: `${typename}:${id}`,
      fragment: gql`
        fragment Read${typename} on ${typename} {
          id
        }
      `
    });
  },

  // Invalidate queries
  invalidateQueries: (queryNames) => {
    queryNames.forEach(queryName => {
      client.cache.evict({ fieldName: queryName });
    });
    client.cache.gc();
  }
};

// Client utilities
export const clientUtils = {
  // Refetch all active queries
  refetchQueries: () => {
    return client.refetchQueries({
      include: 'active'
    });
  },

  // Stop all active subscriptions
  stopSubscriptions: () => {
    client.stop();
  },

  // Restart client
  restart: () => {
    client.stop();
    client.cache.reset();
    // Client will automatically restart on next query
  },

  // Check if client is connected
  isConnected: () => {
    return client.link && !(client.link as any).closed;
  },

  // Get client stats
  getStats: () => {
    return {
      cacheSize: Object.keys((client.cache as any).data.data).length,
      activeQueries: (client as any).queryManager.queries.size,
      activeSubscriptions: (client as any).queryManager.subscriptions.size
    };
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).__APOLLO_CLIENT__ = client;
  (window as any).__APOLLO_CACHE__ = cache;
  (window as any).__APOLLO_CACHE_UTILS__ = cacheUtils;
  (window as any).__APOLLO_CLIENT_UTILS__ = clientUtils;
}

export default client; 