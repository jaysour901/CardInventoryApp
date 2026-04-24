import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/CardInventoryApp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Card Collector Tracker',
        short_name: 'Card Collector',
        description: 'Track your trading card sets — see what you have and what you need',
        theme_color: '#1a3a5c',
        background_color: '#142d4a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/CardInventoryApp/',
        start_url: '/CardInventoryApp/',
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
        cacheId: 'card-collector-v14',
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
