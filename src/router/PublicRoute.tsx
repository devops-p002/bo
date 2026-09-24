import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { defaultRedirects } from '../config/routes';
import Loading from '../components/common/UI/Loading';

// Loading component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading size="large" />
    <span className="ml-3 text-lg text-gray-600">Loading...</span>
  </div>
);

// Maintenance mode component
const MaintenanceMode = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">System Maintenance</h1>
      <p className="text-gray-600 mb-6">
        We&apos;re currently performing scheduled maintenance to improve your experience. 
        Please check back in a few minutes.
      </p>
      <div className="text-sm text-gray-500">
        <p>Estimated completion: {process.env.REACT_APP_MAINTENANCE_END || 'Soon'}</p>
      </div>
    </div>
  </div>
);

// Geo-blocked access component
const GeoBlocked = ({ country }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
      <p className="text-gray-600 mb-6">
        We&apos;re sorry, but our services are not available in your location ({country}).
        This restriction is in place to comply with local regulations.
      </p>
      <div className="text-sm text-gray-500">
        <p>If you believe this is an error, please contact our support team.</p>
      </div>
    </div>
  </div>
);

const PublicRoute = ({ 
  children, 
  redirectIfAuthenticated = true,
  redirectPath = null,
  allowMaintenanceAccess = false,
  bypassGeoBlocking = false
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <RouteLoader />;
  }

  // Check for maintenance mode (unless specifically allowed)
  if (process.env.REACT_APP_MAINTENANCE_MODE === 'true' && !allowMaintenanceAccess) {
    // Allow super admins to access during maintenance
    if (!isAuthenticated || user?.role !== 'super_admin') {
      return <MaintenanceMode />;
    }
  }

  // Check for geo-blocking (unless bypassed)
  if (process.env.REACT_APP_ENABLE_GEO_BLOCKING === 'true' && !bypassGeoBlocking) {
    const restrictedCountries = process.env.REACT_APP_RESTRICTED_COUNTRIES?.split(',') || [];
    
    // In a real implementation, you'd get the user's country from IP geolocation
    // This is a placeholder for the concept
    const userCountry = localStorage.getItem('userCountry') || 'UNKNOWN';
    
    if (restrictedCountries.includes(userCountry)) {
      return <GeoBlocked country={userCountry} />;
    }
  }

  // Check for age verification requirement
  if (process.env.REACT_APP_ENABLE_AGE_VERIFICATION === 'true') {
    const ageVerified = localStorage.getItem('ageVerified');
    const minimumAge = process.env.REACT_APP_MINIMUM_AGE || 18;
    
    // Skip age verification for certain paths (like age verification page itself)
    const skipAgeVerificationPaths = ['/age-verification', '/terms', '/privacy'];
    const shouldSkipAgeVerification = skipAgeVerificationPaths.some(path => 
      location.pathname.startsWith(path)
    );
    
    if (!ageVerified && !shouldSkipAgeVerification) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Age Verification Required</h1>
            <p className="text-gray-600 mb-6">
              You must be at least {minimumAge} years old to access this site.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  localStorage.setItem('ageVerified', 'true');
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                I am {minimumAge} or older
              </button>
              <button
                onClick={() => window.location.href = 'https://www.google.com'}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                I am under {minimumAge}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check for cookie consent (GDPR compliance)
  if (process.env.REACT_APP_ENABLE_COOKIE_CONSENT === 'true') {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent && location.pathname !== '/cookie-policy') {
      // Show cookie consent banner (this would typically be a component overlay)
      console.log('Cookie consent banner should be shown');
    }
  }

  // Redirect authenticated users away from public routes (like login page)
  if (isAuthenticated && redirectIfAuthenticated) {
    const targetPath = redirectPath || 
                      location.state?.from || 
                      defaultRedirects.authenticated;
    
    return <Navigate to={targetPath} replace />;
  }

  // Check for rate limiting on public routes (like login attempts)
  if (location.pathname === '/login') {
    const loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    const maxAttempts = parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS || '5');
    const lockoutDuration = parseInt(process.env.REACT_APP_LOCKOUT_DURATION || '900000'); // 15 minutes
    
    if (loginAttempts >= maxAttempts && lastAttempt) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      
      if (timeSinceLastAttempt < lockoutDuration) {
        const remainingTime = Math.ceil((lockoutDuration - timeSinceLastAttempt) / 60000);
        
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Temporarily Locked</h1>
              <p className="text-gray-600 mb-6">
                Too many failed login attempts. Please try again in {remainingTime} minute{remainingTime !== 1 ? 's' : ''}.
              </p>
              <button
                onClick={() => window.location.href = '/forgot-password'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        );
      } else {
        // Lockout period expired, reset attempts
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
      }
    }
  }

  // Check for system announcements
  const systemAnnouncement = process.env.REACT_APP_SYSTEM_ANNOUNCEMENT;
  if (systemAnnouncement && location.pathname === '/login') {
    // This would typically be shown as a banner or modal
    console.log('System announcement:', systemAnnouncement);
  }

  // Check for feature flags that might affect public routes
  const enableRegistration = process.env.REACT_APP_ENABLE_REGISTRATION !== 'false';
  if (location.pathname === '/register' && !enableRegistration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Disabled</h1>
          <p className="text-gray-600 mb-6">
            New user registration is currently disabled. Please contact support for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render the public content
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default PublicRoute; 