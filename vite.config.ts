import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // servido em https://<user>.github.io/amor/ quando buildado pelo GitHub Pages
  base: '/amor/',
})
