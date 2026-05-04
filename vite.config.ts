import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET?.trim()

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5174,
      strictPort: false,
      ...(devProxyTarget
        ? {
            proxy: {
              '/illog-api': {
                target: devProxyTarget,
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/illog-api/, ''),
              },
            },
          }
        : {}),
    },
  }
})
