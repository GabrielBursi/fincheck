// @ts-check
import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist',
      '**/dist',
      'build',
      '**/build',
      'coverage',
      '**/coverage',
      'node_modules',
      '.next',
      '.nuxt',
      'out',
      '**/node_modules',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      import: eslintPluginImport,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      jest: eslintPluginJest,
      'jsx-a11y': eslintPluginJsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    rules: {
      // TypeScript Strict — violações críticas
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Clean Code — best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-trailing-spaces': 'warn',
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'arrow-body-style': ['warn', 'as-needed'],

      // Imports organization
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'import/no-default-export': 'warn',

      // React Rules
      'react/jsx-no-undef': 'error',
      'react/no-unknown-property': 'error',
      'react/prop-types': 'off', // TypeScript handles prop validation
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
      'react/display-name': 'warn',
      'react/no-children-prop': 'warn',
      'react/no-danger-with-children': 'warn',
      'react/self-closing-comp': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX A11y — Accessibility
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',

      // Prettier Integration
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  // Jest Configuration
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'warn',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-be': 'warn',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
    },
  },
  // React Configuration
  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      'react/jsx-uses-react': 'off',
      'react/no-array-index-key': 'warn',
      'react/require-default-props': 'off',
    },
  },
  // NestJS Configuration (Classes with decorators)
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-parameter-properties': 'off', // Allow constructor parameter properties in NestJS
      'no-restricted-syntax': [
        'off',
        'ForInStatement', // Allow for..in in some contexts
      ],
    },
  },
);
