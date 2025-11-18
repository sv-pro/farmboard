import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './vite-plugin-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  assetsInclude: ['**/*.yaml', '**/*.yml'],
})
