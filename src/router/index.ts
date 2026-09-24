// Router Index - Centralized exports for Aura Gaming Platform Router

// Import all router components and utilities
import AppRouter from './AppRouter';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
// NOTE: this barrel's import list has never matched the actual named exports
// of ./routes (see src/router/routes.ts) - it references names like
// `navigation`, `redirects`, `getRouteConfig`, `getRouteBreadcrumb`, etc.
// that module never exported. This predates the TS conversion; nothing under
// src/ imports this barrel (verified), so it silently never ran. Preserving
// behavior exactly (every one of those undefined-in-the-source-module names
// evaluates to `undefined`, same as before) rather than guessing intended
// semantics, by pulling the module in as `any` instead of named imports.
import * as routesModule from './routes';
const routesAny: any = routesModule;
const routesConfig = routesAny.default;
const {
  routes,
  navigation,
  redirects,
  getRouteConfig,
  getPublicRoutes,
  getProtectedRoutes,
  getRouteTitle,
  getRouteDescription,
  getRouteBreadcrumb,
  getRoutePermissions,
  isPublicRoute,
  requiresExactMatch,
  getNavigationItems,
  getNavigationItem,
  getNavigationByPath,
  hasNavigationChildren,
  validateRoute,
  validateNavigation,
  matchRoute,
  extractRouteParams,
  generatePath,
  generateBreadcrumbs,
} = routesAny;

// Re-export all router components
export { default as AppRouter } from './AppRouter';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as PublicRoute } from './PublicRoute';

// Re-export route configurations and utilities
export {
  routes,
  navigation,
  redirects,
  getRouteConfig,
  getPublicRoutes,
  getProtectedRoutes,
  getRouteTitle,
  getRouteDescription,
  getRouteBreadcrumb,
  getRoutePermissions,
  isPublicRoute,
  requiresExactMatch,
  getNavigationItems,
  getNavigationItem,
  getNavigationByPath,
  hasNavigationChildren,
  validateRoute,
  validateNavigation,
  matchRoute,
  extractRouteParams,
  generatePath,
  generateBreadcrumbs,
};

// Router utilities
export const routerUtils = {
  // Route validation
  validateAllRoutes: () => {
    const routeErrors = [];
    const navValidation = validateNavigation();
    
    routes.forEach(route => {
      const validation = validateRoute(route.path);
      if (!validation.isValid) {
        routeErrors.push({
          path: route.path,
          error: validation.error,
        });
      }
    });
    
    return {
      isValid: routeErrors.length === 0 && navValidation.isValid,
      routeErrors,
      navigationErrors: navValidation.errors,
    };
  },
  
  // Route information
  getRouteInfo: (pathname) => {
    const route = matchRoute(pathname);
    
    if (!route) {
      return {
        exists: false,
        isPublic: false,
        title: 'Page Not Found',
        description: '',
        breadcrumbs: [],
        permissions: [],
      };
    }
    
    return {
      exists: true,
      isPublic: route.isPublic || false,
      title: route.title || 'Aura Gaming Admin',
      description: route.description || '',
      breadcrumbs: generateBreadcrumbs(pathname),
      permissions: route.permissions || [],
      exact: route.exact || false,
    };
  },
  
  // Navigation helpers
  getActiveNavigation: (pathname) => {
    return getNavigationByPath(pathname);
  },
  
  getNavigationTree: () => {
    return navigation.map(item => ({
      ...item,
      isParent: hasNavigationChildren(item.id),
      children: item.children || [],
    }));
  },
  
  // Route generation
  buildRoute: (routePath, params = {}, query = {}) => {
    let path = generatePath(routePath, params);
    
    const queryString = new URLSearchParams(query).toString();
    if (queryString) {
      path += `?${queryString}`;
    }
    
    return path;
  },
  
  // Permission checking
  canAccessRoute: (pathname, userPermissions = []) => {
    const route = matchRoute(pathname);
    
    if (!route) return false;
    if (route.isPublic) return true;
    if (!route.permissions || route.permissions.length === 0) return true;
    
    return route.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  },
  
  // Route filtering
  getAccessibleRoutes: (userPermissions = []) => {
    return routes.filter(route => {
      if (route.isPublic) return true;
      if (!route.permissions || route.permissions.length === 0) return true;
      
      return route.permissions.some(permission => 
        userPermissions.includes(permission)
      );
    });
  },
  
  getAccessibleNavigation: (userPermissions = []) => {
    return navigation.filter(item => {
      if (!item.permissions || item.permissions.length === 0) return true;
      
      const hasPermission = item.permissions.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (hasPermission && item.children) {
        item.children = item.children.filter(child => {
          if (!child.permissions || child.permissions.length === 0) return true;
          return child.permissions.some(permission => 
            userPermissions.includes(permission)
          );
        });
      }
      
      return hasPermission;
    });
  },
  
  // Route history helpers
  getPreviousRoute: () => {
    const history = JSON.parse(localStorage.getItem('routeHistory') || '[]');
    return history[history.length - 2] || '/dashboard';
  },
  
  addToHistory: (pathname) => {
    const history = JSON.parse(localStorage.getItem('routeHistory') || '[]');
    
    // Don't add duplicate consecutive entries
    if (history[history.length - 1] !== pathname) {
      history.push(pathname);
      
      // Keep only last 10 routes
      if (history.length > 10) {
        history.shift();
      }
      
      localStorage.setItem('routeHistory', JSON.stringify(history));
    }
  },
  
  clearHistory: () => {
    localStorage.removeItem('routeHistory');
  },
  
  // Route analytics
  trackRouteVisit: (pathname) => {
    const visits = JSON.parse(localStorage.getItem('routeVisits') || '{}');
    visits[pathname] = (visits[pathname] || 0) + 1;
    localStorage.setItem('routeVisits', JSON.stringify(visits));
  },
  
  getRouteVisits: (pathname) => {
    const visits = JSON.parse(localStorage.getItem('routeVisits') || '{}');
    return visits[pathname] || 0;
  },
  
  getMostVisitedRoutes: (limit = 5) => {
    const visits = JSON.parse(localStorage.getItem('routeVisits') || '{}');
    
    return Object.entries(visits)
      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
      .slice(0, limit)
      .map(([path, count]) => ({
        path,
        count,
        route: matchRoute(path),
      }));
  },
  
  // Route debugging
  debugRoute: (pathname) => {
    const route = matchRoute(pathname);
    const info = routerUtils.getRouteInfo(pathname);
    
    console.group(`Route Debug: ${pathname}`);
    console.log('Matched Route:', route);
    console.log('Route Info:', info);
    console.log('Route Params:', route ? extractRouteParams(route.path, pathname) : {});
    console.log('Navigation Item:', getNavigationByPath(pathname));
    console.groupEnd();
    
    return {
      pathname,
      route,
      info,
      params: route ? extractRouteParams(route.path, pathname) : {},
      navigation: getNavigationByPath(pathname),
    };
  },
};

// Development mode validation
if (process.env.NODE_ENV === 'development') {
  const validation = routerUtils.validateAllRoutes();
  
  if (!validation.isValid) {
    console.warn('Router validation warnings:');
    
    if (validation.routeErrors.length > 0) {
      console.warn('Route errors:', validation.routeErrors);
    }
    
    if (validation.navigationErrors.length > 0) {
      console.warn('Navigation errors:', validation.navigationErrors);
    }
  }
}

// Default export with all router functionality
export default {
  AppRouter,
  ProtectedRoute,
  PublicRoute,
  routes: routesConfig,
  utils: routerUtils,
}; 