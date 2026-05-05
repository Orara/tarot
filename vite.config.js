import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        '.',
        'C:/Users/USER/.gemini/antigravity/brain/85228e03-3cc5-4d65-b278-f24c5afb90f7'
      ]
    }
  }
})
