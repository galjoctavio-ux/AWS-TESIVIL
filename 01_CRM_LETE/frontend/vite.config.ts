import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <--- CAMBIA ESTE PUERTO SI TU BACKEND NO ES EL 3000
        changeOrigin: true,
        secure: false,
        // Opcional: si tu backend no espera "/api" al principio, descomenta la siguiente línea:
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
