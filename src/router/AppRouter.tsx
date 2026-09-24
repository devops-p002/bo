// Main Application Router for Aura Gaming Platform
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import { routes, defaultRedirects } from '../config/routes';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Layout from '../components/common/Layout/Layout';
import Loading from '../components/common/UI/Loading';
import ErrorBoundary from '../components/common/UI/ErrorBoundary';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotificationsPage from '../pages/NotificationsPage';
import BonusPage from '../pages/Dashboard/BonusPage';
import OnlineUsersPage from '../pages/Dashboard/OnlineUsersPage';
import RegisteredUsersPage from '../pages/Dashboard/RegisteredUsersPage';
import CompanyProfitPage from '../pages/Dashboard/CompanyProfitPage';
import DepositDetailsPage from '../pages/Dashboard/DepositDetailsPage';
import WithdrawalDetailsPage from '../pages/Dashboard/WithdrawalDetailsPage';
import FirstDepositPage from '../pages/Dashboard/FirstDepositPage';
import TurnoverPage from '../pages/Dashboard/TurnoverPage';
import MemberProfile from '../components/features/Members/components/MemberProfile';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading />
    <span className="ml-3 text-lg text-gray-600">Loading...</span>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="text-gray-600 mb-6">
        {error?.message || 'An unexpected error occurred while loading the page.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const AppRouter = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { permissions: userPermissions, loading: permissionsLoading } = usePermission();

  // Show loading spinner while authentication is being checked
  if (authLoading || permissionsLoading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          {routes
            .filter(route => route.isPublic)
            .map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PublicRoute>
                    <Suspense fallback={<PageLoader />}>
                      {React.createElement(route.component as any)}
                    </Suspense>
                  </PublicRoute>
                }
              />
            ))}

          {/* Special route for member profile popup with custom popup layout */}
          <Route
            path="/members/profile/:id"
            element={
              <ProtectedRoute
                requiredPermissions={['members.view']}
                userPermissions={userPermissions}
              >
                <Suspense fallback={<PageLoader />}>
                  {React.createElement(MemberProfile as any, { isPopup: true })}
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Special route for notifications without layout (monitor mode) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                requiredPermissions={['notifications.view']}
                userPermissions={userPermissions}
              >
                <Suspense fallback={<PageLoader />}>
                  <NotificationsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Special route for bonus page without layout */}
          <Route
            path="/bonus"
            element={
              <ProtectedRoute
                requiredPermissions={['dashboard.view']}
                userPermissions={userPermissions}
              >
                <Suspense fallback={<PageLoader />}>
                  <BonusPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Special route for online users page without layout */}
          <Route
            path="/online-users"
            element={
              <ProtectedRoute
                requiredPermissions={['dashboard.view']}
                userPermissions={userPermissions}
              >
                <Suspense fallback={<PageLoader />}>
                  <OnlineUsersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Pages without sidebar */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/bonus" element={<BonusPage />} />
          <Route path="/online-users" element={<OnlineUsersPage />} />
          <Route path="/registered-users" element={<RegisteredUsersPage />} />
          <Route path="/company-profit" element={<CompanyProfitPage />} />
          <Route path="/deposit-details" element={<DepositDetailsPage />} />
          <Route path="/withdrawal-details" element={<WithdrawalDetailsPage />} />
          <Route path="/first-deposit" element={<FirstDepositPage />} />
          <Route path="/turnover" element={<TurnoverPage />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {routes
                        .filter(route => !route.isPublic && route.path !== '/members/profile/:id')
                        .map(route => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={
                              <ProtectedRoute
                                requiredPermissions={route.permissions}
                                userPermissions={userPermissions}
                              >
                                {React.createElement(route.component as any)}
                              </ProtectedRoute>
                            }
                          />
                        ))}

                      {/* Special Routes */}
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route path="/404" element={<NotFoundPage />} />
                      
                      {/* Catch-all route for 404 */}
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? defaultRedirects.authenticated : defaultRedirects.unauthenticated}
                replace
              />
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default AppRouter; 