import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/player/',   // <— IMPORTANT for /player path
  plugins: [react()],
});
