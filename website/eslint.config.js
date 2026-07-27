const js = require('@eslint/js');
const { fixupPluginRules } = require('@eslint/compat');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

const reactRecommended = react.configs.flat.recommended;
const reactJsxRuntime = react.configs.flat['jsx-runtime'];
const reactPlugin = { react: fixupPluginRules(react) };
const importFixed = fixupPluginRules(importPlugin);
const importTs = importPlugin.flatConfigs.typescript;

module.exports = tseslint.config(
  {
    ignores: ['**/node_modules/', 'build/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ...reactRecommended, plugins: reactPlugin },
  { ...reactJsxRuntime, plugins: reactPlugin },
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  jsxA11y.flatConfigs.recommended,
  {
    ...importPlugin.flatConfigs.recommended,
    plugins: { import: importFixed },
  },
  { ...importTs, plugins: { import: importFixed } },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '19.2' },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'linebreak-style': 0,
      'new-cap': 0,
      'import/prefer-default-export': 0,
      // eslint-plugin-import's node resolver can't read exports-only packages
      // like react-router v8, see https://github.com/remix-run/react-router/issues/12371
      'import/no-unresolved': ['error', { ignore: ['^react-router'] }],
      'no-underscore-dangle': 0,
      'react/destructuring-assignment': 0,
      'react/static-property-placement': [
        'warn',
        'property assignment',
        { defaultProps: 'static public field' },
      ],
      'lines-between-class-members': 0,
      'no-restricted-syntax': 0,
      'no-nested-ternary': 0,
      'no-plusplus': 0,
      'dot-notation': 0,
      camelcase: 0,
      'jsx-a11y/href-no-hash': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-filename-extension': [
        'warn',
        { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      ],
      'multiline-ternary': 0,
      'no-unused-vars': 0,
      'no-unused-expressions': 'off',
      'no-shadow': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      'react/prop-types': 0,
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'max-len': [
        'warn',
        {
          code: 250,
          tabWidth: 2,
          comments: 250,
          ignoreComments: false,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      'no-param-reassign': [2, { props: false }],
      'react/function-component-definition': 0,
      'react/no-unstable-nested-components': 0,
      'react/jsx-no-useless-fragment': 0,
      'no-unsafe-optional-chaining': 0,
    },
  },
);
