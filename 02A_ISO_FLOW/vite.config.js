import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: 'frontend',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            '/flujo-iso.json': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
});
