import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { target: 'es2022' },
  // In production the API is served from the same origin under /api; in dev, forward it to portfolio-api.
  server: { proxy: { '/api': 'http://localhost:8787' } },
})
