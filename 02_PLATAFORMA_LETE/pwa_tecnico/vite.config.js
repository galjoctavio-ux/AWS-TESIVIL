import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/lete/app/', // <--- ESTA LÍNEA ES LA CLAVE PARA ARREGLAR LA PANTALLA BLANCA
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Plataforma Técnico',
        short_name: 'Técnico',
        description: 'App para técnicos de campo',
        theme_color: '#ffffff',
        start_url: '/lete/app/', // <--- Importante para que la PWA abra en la ruta correcta
        scope: '/lete/app/',     // <--- Define el alcance de la PWA
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
});