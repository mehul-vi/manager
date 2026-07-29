import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Rewrite /api/tasks/daily -> /api/daily-tasks
      '/api/tasks/daily': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tasks\/daily/, '/api/daily-tasks'),
      },
      // Rewrite /api/tasks/monthly -> /api/monthly-tasks
      '/api/tasks/monthly': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tasks\/monthly/, '/api/monthly-tasks'),
      },
      // Forward all other /api requests as-is
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
