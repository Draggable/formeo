import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import { resolve } from 'node:path'

import pkg from './package.json'

const bannerTemplate = `
/**
${pkg.name} - ${pkg.homepage}
Version: ${pkg.version}
Author: ${pkg.author}
*/
`

export default defineConfig({
  root: './',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/js/index.js'),
      name: 'formeo',
      fileName: format => `[name].${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        formeo: resolve(__dirname, 'src/lib/js/index.js'),
      },
      output: {
        assetFileNames: 'formeo.min.[ext]',
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [banner(bannerTemplate)],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
