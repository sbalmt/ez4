import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintImport from 'eslint-plugin-import';

export const eslintIgnore = {
  ignores: ['node_modules/**', 'dist/**']
};

export const eslintProject = {
  languageOptions: {
    parser: typescriptParser,
    sourceType: 'module'
  },
  files: ['src/**/*.ts'],
  plugins: {
    '@typescript-eslint': typescriptPlugin,
    import: eslintImport
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
    'import/no-unresolved': 'error'
  }
};
