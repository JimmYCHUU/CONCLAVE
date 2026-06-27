import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CONCLAVE', short_name: 'CONCLAVE',
        theme_color: '#7c6af7', background_color: '#080810',
        display: 'standalone', start_url: '/',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true }
    }
  },
  test: { globals: true, environment: 'jsdom', setupFiles: './src/setupTests.js' }
})
