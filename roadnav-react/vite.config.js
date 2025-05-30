import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      //  http://localhost:5174/route  →  http://localhost:8002/route
      '/route': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: path => path               // leave “/route” intact
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
});
