import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // SERVER CONFIGURATION
  server: {
    host: true, // Allow LAN access (so you can open on phone)
    port: 5173,
    // Fix Google Auth Console Warnings
    headers: {
   'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }
  },

  // PLUGINS
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Enable PWA in dev mode for testing
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'EventPulse - Event Manager',
        short_name: 'EventPulse',
        description: 'Connect, Organize, and Celebrate with EventPulse.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Makes it look like a native app (no browser bar)
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
          }
        ]
      }
    })
  ],
})