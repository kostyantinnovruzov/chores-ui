import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: ['vue.localtest.local'],
    hmr: {
      host: 'vue.localtest.local',
      protocol: 'ws',
      clientPort: 80
    }
  }
})