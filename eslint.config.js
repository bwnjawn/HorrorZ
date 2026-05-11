import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import globals from 'globals'; // Importación necesaria para definir los entornos

export default [
  {
    // Configuración global para los archivos del proyecto
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser, // Reconoce variables como 'console' y 'window'
        ...globals.node, // Reconoce variables como 'process' y 'URL'
        Phaser: 'readonly', // Tu global personalizada para el motor de juego
      },
    },
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'], //
  },

  js.configs.recommended, //
  ...pluginVue.configs['flat/essential'], //
  skipFormatting, //

  {
    rules: {
      // REGLAS DE JAVASCRIPT
      'no-unused-vars': 'warn', //
      // 'no-console': 'warn',    // Comentado para etapa de debug
      eqeqeq: 'error', //
      curly: ['error', 'multi-line'], //
      // 'no-debugger': 'error',  // Comentado para etapa de debug

      // REGLAS DE VUE
      'vue/multi-word-component-names': 'off', //
      'vue/require-default-prop': 'error', //
      'vue/no-unused-vars': 'error', //
      'vue/component-api-style': ['error', ['script-setup']], //
    },
  },
];
