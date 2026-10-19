import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Cloudflare (Pages or Workers) serves the app from the domain root; GitHub Pages
// serves it from /CardInventoryApp/. CF_PAGES / WORKERS_CI are set automatically
// in Cloudflare builds.
const onCloudflare = process.env.CF_PAGES || process.env.WORKERS_CI
const base = onCloudflare ? '/' : '/CardInventoryApp/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'BTC Set Collector',
        short_name: 'BTC Set Collector',
        description: 'Track your trading card sets — from Beyond The Cardboard',
        theme_color: '#1a3a5c',
        background_color: '#142d4a',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'btc-set-collector-v1',
        // Always fetch the HTML shell from network so updates are immediate
        navigateFallbackDenylist: [],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache',
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
})
