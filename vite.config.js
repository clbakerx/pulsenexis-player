// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/player/',   // <— required for pulsenexis.com/player
  plugins: [react()],
})
