import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Deliberately no custom `include`/esbuild override here (see PLAN.md
    // Phase 0a): Vite's own defaults already handle .ts/.tsx/.jsx/.js
    // correctly per-extension, and empirically, overriding esbuild's loader
    // to force everything through 'jsx' - the old approach, needed only
    // because plain .js can't otherwise carry JSX - breaks real TypeScript
    // syntax (return types, generics, etc.) in .ts/.tsx files, because
    // esbuild's 'jsx' loader doesn't understand TS syntax at all. Once the
    // TS conversion is complete (zero .js/.jsx left under src/), this stops
    // being a tradeoff entirely. Until then, a remaining plain .js file
    // with JSX in it will fail to build - that's expected mid-migration,
    // not a regression to "fix" by re-adding the override.
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/services/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 3000,
  },
  define: {
    // Fix for "process is not defined" error.
    //
    // Note: this must be a single JSON.stringify(...) of the whole object,
    // not an object of individually-JSON.stringify'd values. Vite's `define`
    // auto-expands a nested-object value into per-key replacements and
    // JSON.stringifies each leaf itself, so pre-stringifying the leaves here
    // double-encodes them (e.g. a URL ends up as the literal string
    // `"http://localhost:4000/graphql"`, quote characters included, which
    // then gets treated as a relative path by fetch/XHR). Stringifying the
    // whole object once and passing that single string avoids the
    // auto-expansion entirely.
    global: 'globalThis',
    'process.env': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || 'development',
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
      REACT_APP_GRAPHQL_HTTP_URI: process.env.REACT_APP_GRAPHQL_HTTP_URI || 'http://localhost:4000/graphql',
      REACT_APP_GRAPHQL_WS_URI: process.env.REACT_APP_GRAPHQL_WS_URI || 'ws://localhost:4000/graphql',
      REACT_APP_GRAPHQL_HTTP_URL: process.env.REACT_APP_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql',
      REACT_APP_GRAPHQL_WS_URL: process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
      REACT_APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
      REACT_APP_MAINTENANCE_MODE: process.env.REACT_APP_MAINTENANCE_MODE || 'false',
      REACT_APP_MAINTENANCE_END: process.env.REACT_APP_MAINTENANCE_END || 'Soon',
      REACT_APP_ENABLE_IP_RESTRICTIONS: process.env.REACT_APP_ENABLE_IP_RESTRICTIONS || 'false',
      REACT_APP_ALLOWED_IPS: process.env.REACT_APP_ALLOWED_IPS || '',
      REACT_APP_SESSION_TIMEOUT: process.env.REACT_APP_SESSION_TIMEOUT || '3600000',
      REACT_APP_ENABLE_GEO_BLOCKING: process.env.REACT_APP_ENABLE_GEO_BLOCKING || 'false',
      REACT_APP_RESTRICTED_COUNTRIES: process.env.REACT_APP_RESTRICTED_COUNTRIES || '',
      REACT_APP_ENABLE_AGE_VERIFICATION: process.env.REACT_APP_ENABLE_AGE_VERIFICATION || 'false',
      REACT_APP_MINIMUM_AGE: process.env.REACT_APP_MINIMUM_AGE || '18',
      REACT_APP_ENABLE_COOKIE_CONSENT: process.env.REACT_APP_ENABLE_COOKIE_CONSENT || 'false',
      REACT_APP_MAX_LOGIN_ATTEMPTS: process.env.REACT_APP_MAX_LOGIN_ATTEMPTS || '5',
      REACT_APP_LOCKOUT_DURATION: process.env.REACT_APP_LOCKOUT_DURATION || '900000',
      REACT_APP_SYSTEM_ANNOUNCEMENT: process.env.REACT_APP_SYSTEM_ANNOUNCEMENT || '',
      REACT_APP_ENABLE_REGISTRATION: process.env.REACT_APP_ENABLE_REGISTRATION || 'true',
    }),
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});