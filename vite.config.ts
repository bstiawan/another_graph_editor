import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === 'production' && process.env.VITE_BASE_PATH 
    ? process.env.VITE_BASE_PATH 
    : "https://anacc22.github.io/another_graph_editor/";
    
  return {
    plugins: [react()],
    base,
  }
})
