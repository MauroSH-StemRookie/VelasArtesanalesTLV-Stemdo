import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8080,
    host: true,
    allowedHosts: ['www.artesanasdevelas.com', 'artesanasdevelas.com'],
  },
  server: {
    port: 8080,
    host: true,
  },
})
