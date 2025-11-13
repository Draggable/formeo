import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'

import pkg from './package.json'

const bannerTemplate = `
/**
${pkg.name} - ${pkg.homepage}
Version: ${pkg.version}
Author: ${pkg.author}
*/
`

export default defineConfig(({ mode }) => {
  const isMinified = mode === 'production-minified'

  return {
    root: './',
    build: {
      lib: {
        entry: resolve(__dirname, 'src/lib/js/index.js'),
        name: 'formeo',
        fileName: format => (isMinified ? `[name].min.${format}.js` : `[name].${format}.js`),
        formats: ['es', 'cjs', 'umd'],
      },
      outDir: 'dist',
      emptyOutDir: false, // Don't empty on each build to preserve both versions
      minify: isMinified ? 'terser' : false,
      terserOptions: isMinified
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : undefined,
      rollupOptions: {
        input: {
          formeo: resolve(__dirname, 'src/lib/js/index.js'),
        },
        output: {
          assetFileNames: isMinified ? 'formeo.min.[ext]' : 'formeo.[ext]',
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
    resolve: {
      dedupe: ['@draggable/i18n'], // Prevents multiple bundling instances of the linked package
    },
    optimizeDeps: {
      exclude: ['@draggable/i18n'], // Excludes the linked package from pre-bundling for live updates
    },
  }
})
