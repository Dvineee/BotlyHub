
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    port: 5173,
    // ngrok tüneli üzerinden HMR (Hot Module Replacement) çalışması için
    hmr: {
        clientPort: 443
    },
    // ngrok gibi dış servislerin erişimine izin ver
    allowedHosts: ['all'] 
  },
  base: './', 
});
