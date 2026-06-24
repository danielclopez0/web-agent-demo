import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        // DemoCorp ERP (the operated app)
        main: resolve(__dirname, 'index.html'),
        // TestTrack — the mock QA / test-management tool (a separate "site")
        qa: resolve(__dirname, 'qa.html'),
      },
    },
  },
})
