import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { languageFileOptions, enUS } from '@draggable/formeo-languages'
import banner from 'vite-plugin-banner'
import compression from 'vite-plugin-compression'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { createHtmlPlugin } from 'vite-plugin-html'

import pkg from './package.json'

const bannerTemplate = `
/**
${pkg.name} - ${pkg.homepage}
Version: ${pkg.version}
Author: ${pkg.author}
*/
`

const isImage = extType => /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)
const getExtType = assetInfo => {
  let [extType] = assetInfo.name.split('.').reverse()
  if (isImage(extType)) {
    extType = 'img'
  }
  return extType
}

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

export default defineConfig({
  ...sharedConfig,
  root: 'src/demo',
  base: process.env.NODE_ENV === 'production' ? '/formeo/' : '/',
  resolve: {
    alias: {
      formeo: resolve(__dirname, 'src/lib/js/index.js'),
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'src/demo/index.html'),
      },
      output: {
        entryFileNames: 'assets/js/[name].min.js',
        chunkFileNames: 'assets/js/[name].min.js',
        assetFileNames: assetInfo => {
          const extType = getExtType(assetInfo)
          const ext = extType === 'img' ? '[ext]' : 'min.[ext]'
          return `assets/${getExtType(assetInfo)}/[name].${ext}`
        },
      },
      external: ['formeo'],
    },
    outDir: resolve(__dirname, 'dist/demo'),
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      output: {
        comments: false,
        beautify: false,
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
      entry: 'js/index.js',
      template: 'index.html',
      filename: 'index.html',
      inject: {
        data: {
          langFiles: languageFileOptions,
          version: pkg.version,
        },
      },
    }),
    banner(bannerTemplate),
    compression({
      algorithm: 'gzip',
      minRatio: 0.8,
      ext: '.gz',
      threshold: 10240,
    }),
    viteStaticCopy({
      targets: [
        {
          src: resolve('src/lib/icons/formeo-sprite.svg'),
          dest: './assets/img/',
        },
        {
          src: resolve('node_modules', '@draggable/formeo-languages/dist/lang/*'),
          dest: './assets/lang',
        },
        {
          src: resolve('dist/formeo.umd.js'),
          dest: './assets/js/',
          rename: 'formeo.min.js',
        },
      ],
    }),
  ],
  // optimizeDeps: {
  //   exclude: ['@draggable/i18n']
  // }
})
