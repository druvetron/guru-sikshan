import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Fixes the "Missing React" crash
    dedupe: ['react', 'react-dom'],
  },
  // ⬇️ FORCE PORT 8080
  server: {
    port: 8080,
    host: true, // Allows access from network/mobile if needed
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});