import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/react-comp-misc/',
  root: '.',
  publicDir: 'public',
  server: {
    port: 5191,
  },
  build: {
    outDir: 'build',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

