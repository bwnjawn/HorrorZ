import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/node_modules/**'],
  },

  js.configs.recommended,
  eslintConfigPrettier,

  {
    rules: {
      // Reglas de JavaScript (Las mismas que usas en el frontend)
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      curly: ['error', 'multi-line'],

      // Tu espaciado estructural
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
        { blankLine: 'always', prev: '*', next: ['function', 'class', 'export'] },
      ],
    },
  },
];
