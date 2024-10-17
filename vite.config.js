import { defineConfig } from 'vite'
import formeoI18n from 'formeo-i18n'
import mi18n from 'mi18n'
import { version } from './package.json'

import { createHtmlPlugin } from 'vite-plugin-html'

const { languageFiles, enUS } = formeoI18n

const i18n = new mi18n.I18N()

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
  root: 'src',
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'js/index.js',
      name: 'Formeo',
      fileName: format => `formeo.${format}.js`,
      formats: ['es', 'cjs', 'umd', 'iife'],
      outDir: 'dist',
    },
  },
}

const demoConfig = {
  ...sharedConfig,
  root: 'src/demo',
  build: {
    rollupOptions: {
      input: {
        demo: 'src/demo/index.html', // Entry for the demo
      },
      output: {
        dir: 'dist/demo', // Demo build output folder
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
            const lang = i18n.processFile(val)
            return {
              locale,
              dir: lang.dir,
              nativeName: lang[locale],
            }
          }),
          version,
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
  // console.log(rest)
  if (mode === 'lib') {
    return libConfig // Run this configuration when building the library
  }
  return demoConfig // Default is the demo build
})
