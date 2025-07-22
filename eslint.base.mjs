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
  files: ['packages/**/*.ts'],
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
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-unresolved': 'error',
    'n/no-missing-import': 'error',
    'no-console': 'warn',
    eqeqeq: 'error'
  }
};
