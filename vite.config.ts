import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-framer':  ['framer-motion'],
          'vendor-three':   ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-emailjs': ['@emailjs/browser'],
        },
      },
    },
  },
})
