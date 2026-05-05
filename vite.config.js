import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '.', // Build directly to root so Cloudflare finds it immediately
    emptyOutDir: false, // Don't delete source files
  }
})
