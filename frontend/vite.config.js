import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Usamos import.meta.dirname (disponible en Node 20+)
// Si tu versión de Node es anterior, usa:
// const __dirname = path.dirname(new URL(import.meta.url).pathname);
const __dirname = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});