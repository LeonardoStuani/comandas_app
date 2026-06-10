import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Buscar dados da API ao montar a página (useEffect -> carregar() -> setState)
      // é o padrão usado em todas as listagens deste app. A regra do React Compiler
      // sinaliza esse caso como "setState síncrono no efeito"; aqui é intencional.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
