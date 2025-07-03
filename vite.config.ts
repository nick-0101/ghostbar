import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

const filesPathToExclude = ['src/docs'].map(src => {
  return fileURLToPath(new URL(src, import.meta.url))
})

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [vue(), tailwindcss(), crx({ manifest })],
  build: {
    rollupOptions: {
      external: [...filesPathToExclude]
    }
  }
})
