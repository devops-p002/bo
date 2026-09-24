import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5300,
  },
  define: {
    global: 'globalThis',
    // Single combined JSON.stringify, not per-key - see
    // apps/backoffice-web/vite.config.js's own comment on why Vite's
    // `define` double-encodes a nested object of individually-stringified
    // values.
    'process.env': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV || 'development',
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5200',
    }),
  },
});
