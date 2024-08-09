module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    // Mark as warning to not block during dev work, and allow with description
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-ignore': 'allow-with-description',
    }],
    "semi": [2, "always"]
  },
  env: {
    node: true
  },
};
