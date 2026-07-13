import { defineConfig } from 'vite'
import ol from 'vite-plugin-openlayers'

export default defineConfig({
  base: '/mapa/',
  plugins: [
    ol()
  ]
})
