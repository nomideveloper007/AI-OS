import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { scannerProxyPlugin } from './scripts/vite-plugin-scanner-proxy';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), scannerProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy OmniRoute OpenAI-compatible APIs to avoid browser CORS.
      // AI-OS calls /omniroute/v1/* → http://localhost:20128/v1/*
      proxy: {
        '/omniroute': {
          target: 'http://localhost:20128',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/omniroute/, ''),
        },
      },
    },
  };
});
