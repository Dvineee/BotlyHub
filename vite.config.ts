
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
    },
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
  };
});
