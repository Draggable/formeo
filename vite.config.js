import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import formeoI18n from 'formeo-i18n'
import { I18N } from 'mi18n'
import banner from 'vite-plugin-banner'
import compression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'

import pkg from './package.json'

const { languageFiles, enUS } = formeoI18n

const bannerTemplate = `
/**
${pkg.name} - ${pkg.homepage}
Version: ${pkg.version}
Author: ${pkg.author}
*/
`

const sharedConfig = {
  server: {
    open: true, // Automatically opens the app in the browser
  },
  define: {
    'import.meta.env.EN_US': JSON.stringify(enUS),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
}

const libConfig = {
  ...sharedConfig,
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/js/index.js',
      name: 'Formeo',
      fileName: format => `formeo.${format}.min.js`,
      formats: ['es', 'cjs', 'umd', 'iife'],
      outDir: 'dist',
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    banner(bannerTemplate),
    compression({
      algorithm: 'gzip',
      minRatio: 0.8,
      ext: '.gz',
      threshold: 10240,
    }),
  ],
}

const demoConfig = {
  ...sharedConfig,
  root: 'src/demo',
  build: {
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'src/demo/index.html'),
      },
      output: {
        dir: 'dist/demo',
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
      entry: 'js/demo.js',
      template: 'index.html',
      filename: 'index.html',

      /**
       * Data that needs to be injected into the index.html ejs template
       */
      inject: {
        data: {
          langFiles: Object.entries(languageFiles).map(([locale, val]) => {
            const lang = I18N.processFile(val)
            return {
              locale,
              dir: lang.dir,
              nativeName: lang[locale],
            }
          }),
          version: pkg.version,
        },
        tags: [
          {
            injectTo: 'body-prepend',
            tag: 'div',
            attrs: {
              id: 'tag',
            },
          },
        ],
      },
    }),
  ],
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return libConfig
  }
  return demoConfig
})
