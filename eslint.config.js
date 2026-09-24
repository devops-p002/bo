import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Covers packages/*, services/*, and any other TS-everywhere workspace
// package with no eslint.config.js of its own (ESLint's flat-config
// resolution walks up from the linted file to the nearest one - this is
// the fallback for whatever doesn't have a closer match).
// apps/backoffice-web is deliberately excluded: it's the original
// dashboard, kept on its own looser, pre-existing eslint.config.js.
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', 'apps/backoffice-web/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
