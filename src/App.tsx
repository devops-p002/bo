import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './services/apollo/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { PermissionProvider } from './context/PermissionContext';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/UI/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <PermissionProvider>
                  <div className="App">
                    <AppRouter />
                  </div>
                </PermissionProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App; 