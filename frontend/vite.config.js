import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
