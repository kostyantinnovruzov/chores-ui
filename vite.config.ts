import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src')
    }
  },
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
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          'vue-query': ['@tanstack/vue-query']
        }
      }
    }
  }
});
