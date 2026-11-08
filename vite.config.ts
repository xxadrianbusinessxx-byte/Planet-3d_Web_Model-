// Construcción del HTML portátil (D-07): un solo dist/index.html con todo embebido,
// que abre con doble clic por file:// sin internet (R8).
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    target: 'es2022',
    // El plugin ya embebe todo; esto evita el aviso por el tamaño de three.js.
    chunkSizeWarningLimit: 2000,
  },
})
