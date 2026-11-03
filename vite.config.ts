import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['chrome87', 'edge88', 'firefox78', 'safari14'],
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      workbox: { clientsClaim: true },
      manifest: {
        name: 'Progressive Overload',
        short_name: 'Overload',
        background_color: '#f9d72f',
        description: 'Progressive Overload is the name of the game',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
    react(),
  ],
})
