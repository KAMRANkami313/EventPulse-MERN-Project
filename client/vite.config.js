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

  // BUILD OPTIMIZATION — Code Splitting
  // Breaks the 2.12MB single bundle into smaller chunks so:
  // 1. PWA service worker can precache all files (each under 2MB)
  // 2. Browser only loads what's needed for the current page (faster initial load)
  // 3. Vendors (React, Leaflet, Recharts, etc.) are cached separately and rarely change
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries (change rarely → long cache)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Heavy visualization libraries (only loaded when needed)
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],

          // UI & Animation libraries
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', 'react-hot-toast'],

          // Utility libraries
          'vendor-utils': ['axios', 'socket.io-client', 'i18next', 'react-i18next'],

          // Payment & QR (only loaded on specific pages)
          'vendor-payment': ['@stripe/stripe-js', 'jspdf', 'html2canvas', 'react-qr-code', '@yudiel/react-qr-scanner'],
        }
      }
    },
    // Increase the chunk size warning limit (we handle splitting manually)
    chunkSizeWarningLimit: 1000,
  },

  // PLUGINS
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // Disable PWA in dev mode (speeds up dev server)
      },
      workbox: {
        // FIX: Increase maximum file size for precaching (default is 2MB)
        // This is a safety net in case any single chunk still exceeds 2MB
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
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