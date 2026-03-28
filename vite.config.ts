
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json']
  },
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    port: 3000,
  },
  base: '/', 
});
