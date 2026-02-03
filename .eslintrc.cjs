module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    'standard',
    'plugin:react/recommended',
    'airbnb-typescript',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'tailwind.config.js', 'vite.config.ts', 'convex/**/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['import', 'react-refresh', 'react-hooks', '@typescript-eslint', 'prettier'],
  rules: {
    "prettier/prettier": "error",
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        "react/jsx-filename-extension": 'off',
        '@typescript-eslint/np-explicit-any': 'off',
      }
    }
  ]
};
