import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Get the base API URL from environment
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5000';

  console.log('API Base URL (Vite Config):', apiBaseUrl);
  console.log('Development Mode:', mode === 'development');

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Alias "@" points to the "src" directory
      },
    },
    server: {
      port: 4200, // Change the development server port to 4200
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          // We don't need to rewrite paths since API endpoints already include /api
          rewrite: (path) => path,
        },
      },
    },
    plugins: [react()],
    optimizeDeps: {
      include: ['@emotion/react', '@emotion/styled'],
    },
    base: '/', // Ensure proper base URL for client-side routing
  };
});
