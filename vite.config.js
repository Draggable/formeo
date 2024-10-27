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
    open: true,
    fs: {
      strict: false,
    },
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
    emptyOutDir: false,
    lib: {
      entry: 'src/lib/js/index.js',
      name: 'Formeo',
      fileName: () => 'formeo.min.js',
      formats: ['umd'],
      outDir: resolve(__dirname, 'dist'),
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
  base: process.env.NODE_ENV === 'production' ? '/formeo/' : '/',
  resolve: {
    alias: {
      'formeo': resolve(__dirname, 'src/lib/js/index.js'),
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'src/demo/index.html'),
      },
      output: {
        manualChunks:{
          formeo: ['formeo'],
        },
      },
    },
    outDir: resolve(__dirname, 'dist/demo'),
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
      entry: 'js/index.js',
      template: 'index.html',
      filename: 'index.html',
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
