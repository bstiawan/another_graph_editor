import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === 'production' && process.env.VITE_BASE_PATH 
    ? process.env.VITE_BASE_PATH 
    : "/";
    
  return {
    plugins: [react()],
    base,
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            // Keep font files in the root directory for easier access
            if (assetInfo.name && assetInfo.name.endsWith('.ttf')) {
              return '[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  }
})
