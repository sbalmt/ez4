import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nodeImport from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';

export default {
  languageOptions: {
    parser: typescriptParser,
    sourceType: 'module'
  },
  ignores: ['node_modules/**', 'dist/**'],
  files: ['src/**/*.ts'],
  plugins: {
    '@typescript-eslint': typescriptPlugin,
    import: nodeImport,
    n: nodePlugin
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-unresolved': 'error',
    'n/no-missing-import': 'error'
  }
};
