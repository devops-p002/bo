import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'server'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // `process` isn't a real browser global, but vite.config.js shims
      // `process.env.*` via its `define` block, so the app legitimately
      // references it throughout - recognize it rather than treating every
      // call site as undefined.
      globals: { ...globals.browser, process: 'readonly' },
    },
    settings: { react: { version: '18.2' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off',
      // Pragmatic typing during the TS conversion pass (PLAN.md Phase 0a):
      // `any` is allowed at GraphQL response boundaries and legacy patterns
      // rather than forcing full type modeling in a behavior-preserving pass.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['*.config.js', '*.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  }
);
