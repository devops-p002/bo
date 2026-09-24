// Router Routes - Aura Gaming Platform
// This file re-exports routes from config for router-specific usage

import {
  routes,
  navigationMenu,
  getRouteByPath,
  getPublicRoutes,
  getProtectedRoutes,
  getRoutesByPermission,
  getNavigationByPermission,
  generateBreadcrumb,
  requiresAuth,
  requiresPermission,
  validateRoute,
} from '../config/routes';

// Re-export all route configurations
export {
  routes,
  navigationMenu,
  getRouteByPath,
  getPublicRoutes,
  getProtectedRoutes,
  getRoutesByPermission,
  getNavigationByPermission,
  generateBreadcrumb,
  requiresAuth,
  requiresPermission,
  validateRoute,
};

// Router-specific utilities
export const getRouteComponent = (path) => {
  const route = getRouteByPath(path);
  return route ? route.component : null;
};

export const getRouteTitle = (path) => {
  const route = getRouteByPath(path);
  return route ? route.title : 'Aura Gaming Platform';
};

export const getRouteDescription = (path) => {
  const route = getRouteByPath(path);
  return route ? route.description : '';
};

export const isExactRoute = (path) => {
  const route = getRouteByPath(path);
  return route ? route.exact : false;
};

// Route matching utilities
export const matchRoute = (pathname, routes) => {
  return routes.find(route => {
    if (route.exact) {
      return route.path === pathname;
    }
    return pathname.startsWith(route.path);
  });
};

export const getActiveRoute = (pathname) => {
  return matchRoute(pathname, routes);
};

// Navigation utilities for router
export const getActiveNavItem = (pathname, navigation) => {
  return navigation.find(item => {
    if (item.children) {
      return item.children.some(child => pathname.startsWith(child.path));
    }
    return pathname.startsWith(item.path);
  });
};

// Route guards
export const canAccessRoute = (path, userPermissions = []) => {
  const validation = validateRoute(path, userPermissions);
  return validation.valid;
};

export const getRouteRedirect = (path, userPermissions = []) => {
  if (!requiresAuth(path)) {
    return null; // Public route, no redirect needed
  }
  
  if (!canAccessRoute(path, userPermissions)) {
    return '/dashboard'; // Redirect to dashboard if no access
  }
  
  return null;
};

// Default export for convenience
export default {
  routes,
  navigationMenu,
  getRouteByPath,
  getPublicRoutes,
  getProtectedRoutes,
  getRoutesByPermission,
  getNavigationByPermission,
  generateBreadcrumb,
  requiresAuth,
  requiresPermission,
  validateRoute,
  getRouteComponent,
  getRouteTitle,
  getRouteDescription,
  isExactRoute,
  matchRoute,
  getActiveRoute,
  getActiveNavItem,
  canAccessRoute,
  getRouteRedirect,
};