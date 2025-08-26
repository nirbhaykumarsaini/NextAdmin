import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import next from 'eslint-config-next';

export default [
  {
    // Base configuration
    ignores: ['.next/', 'node_modules/'],
  },
  {
    // Next.js configuration
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...next,
  },
  {
    // TypeScript-specific rules
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Add other TypeScript-specific rules here
    },
  },
];