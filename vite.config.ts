
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // Telefondan test ederken yerel IP ile erişim için gerekli
  },
  base: './', // Telegram WebApp için gerekli göreceli yollar
});
