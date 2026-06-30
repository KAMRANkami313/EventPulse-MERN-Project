import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Sitemap generation plugin — creates sitemap.xml at build time AND serves it in dev
const viteSitemap = (options = {}) => {
  const {
    hostname = 'https://eventpulse-tawny.vercel.app',
    dynamicRoutes = [],
  } = options;

  const staticRoutes = ['/', '/login', '/register', '/forgot-password'];

  const generateSitemap = () => {
    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    const today = new Date().toISOString().split('T')[0];

    const urls = allRoutes
      .map((route) => {
        const priority = route === '/' ? '1.0' : route === '/login' ? '0.9' : route === '/register' ? '0.8' : '0.5';
        return `  <url>
    <loc>${hostname}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'daily' : route === '/forgot-password' ? 'monthly' : 'weekly'}</changefreq>
    <priority>${priority}</priority>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 ${urls}
</urlset>`;
  };

  return {
    name: 'vite-plugin-sitemap',

    // ─── DEV MODE: serve /sitemap.xml on the dev server ───
    // NOTE: No `apply: 'build'` here! That would skip this hook in dev mode.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/sitemap.xml' || url === '/sitemap') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(generateSitemap());
          return;
        }
        next();
      });
    },

    // ─── PREVIEW MODE: also serve /sitemap.xml ───
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/sitemap.xml' || url === '/sitemap') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(generateSitemap());
          return;
        }
        next();
      });
    },

    // ─── BUILD MODE: write sitemap.xml to dist/ ───
    // closeBundle is a Rollup hook that only runs during build, so no need
    // for `apply: 'build'` to gate it.
    closeBundle: async () => {
      const fs = await import('fs');
      const path = await import('path');
      const outDir = path.resolve('dist');
      if (fs.existsSync(outDir)) {
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), generateSitemap(), 'utf-8');
        console.log(`[sitemap] Generated sitemap.xml with ${staticRoutes.length + dynamicRoutes.length} URLs`);
      }
    },
  };
};

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', 'react-hot-toast'],
          'vendor-utils': ['axios', 'socket.io-client', 'i18next', 'react-i18next'],
          'vendor-payment': ['@stripe/stripe-js', 'jspdf', 'html2canvas', 'react-qr-code', '@yudiel/react-qr-scanner'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallbackDenylist: [
          /^\/sitemap\.xml$/,
          /^\/sitemap-.*\.xml$/,
          /^\/robots\.txt$/,
          /^\/manifest\.webmanifest$/,
          /^\/api\/.*/,
          /^\/og-image\.png$/,
          /^\/favicon.*$/,
          /^\/pwa-.*$/,
          /^\/apple-touch-icon.*$/,
          /^\/masked-icon\.svg$/,
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(?:xml|txt)$/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'robots.txt', 'og-image.png'],
      manifest: {
        name: 'EventPulse - Event Manager',
        short_name: 'EventPulse',
        description: 'Connect, Organize, and Celebrate with EventPulse.',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    }),
    viteSitemap({
      hostname: 'https://eventpulse-tawny.vercel.app',
    }),
  ],
})