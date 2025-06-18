// ESLint Configuration for EGXpilot
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-trailing-spaces': 'error',
    'eol-last': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'logs/',
    '*.min.js'
  ]
};
