import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AcceptedPlugin, ProcessOptions } from 'postcss';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import Inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);
type PostCSSConfig = ProcessOptions & { plugins?: AcceptedPlugin[] };
const postcssConfig = require('./postcss.config.cjs') as PostCSSConfig;

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: 'src/types/auto-imports.d.ts',
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      },
      resolvers: [NaiveUiResolver()]
    }),
    Components({
      dts: 'src/types/components.d.ts',
      directoryAsNamespace: true,
      resolvers: [NaiveUiResolver()]
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
    }),
    Inspect(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Chores UI',
        short_name: 'Chores',
        description: 'Kid chores app',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src')
    }
  },
  css: {
    postcss: postcssConfig
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
