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
        description: 'Progressive Overload is the name of the game',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'osaka-metro-logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'osaka-metro-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    react(),
  ],
})
