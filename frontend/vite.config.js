import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // envDir '.' evita depender do global `process` (lint no-undef)
  const env = loadEnv(mode, '.', '')
  const target = env.VITE_PROXY_TARGET || 'https://localhost:8443'
  const secure = env.VITE_PROXY_SECURE === 'true'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Tudo que começa com /api é encaminhado para a API (HTTPS na 8443).
        // O prefixo /api é removido antes de chegar na API.
        '/api': {
          target,
          changeOrigin: true,
          secure, // false em dev para aceitar certificado auto-assinado
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
