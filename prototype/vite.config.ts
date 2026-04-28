import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { devApiPlugin } from './server/devApiPlugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  process.env.NVIDIA_API_KEY ||= env.NVIDIA_API_KEY
  process.env.NVIDIA_MODEL ||= env.NVIDIA_MODEL

  return {
    plugins: [devApiPlugin(), vue()],
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
      },
    },
  }
})
