import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'https://realnovahdboxfianlbackendlasttry.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/r2-upload': {
        target: 'https://clipnova.9eb21a93fe24eb749b65eaa4252d2319.r2.cloudflarestorage.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/r2-upload/, ''),
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-axios': ['axios'],
        },
      },
    },
  },
})
