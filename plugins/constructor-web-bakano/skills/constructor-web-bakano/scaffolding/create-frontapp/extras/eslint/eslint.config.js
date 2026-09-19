import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsConfig from '@vue/eslint-config-typescript'

export default [
  { ignores: ['dist/**', 'node_modules/**', '*.config.js'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vueTsConfig(),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'vue/multi-word-component-names': 'off',

      // Formato: lo decide Prettier. Dejarlas encendidas hace que las dos
      // herramientas se peleen por el mismo archivo.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
    },
  },
  {
    // ── La regla de las 300 líneas ────────────────────────────────────
    // Un .vue que pasa de 300 líneas casi siempre está haciendo dos cosas.
    // La salida no es partirlo en dos archivos de 290: es sacar la lógica
    // a un composable y quedarse con un componente que solo compone.
    files: ['**/*.vue'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // La lógica extraída tampoco puede convertirse en un cajón de sastre.
    files: ['src/composables/**/*.ts', 'src/services/**/*.ts'],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
]
