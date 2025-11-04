// copyDir.mjs
import { promises as fs } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const projectRoot = resolve(__dirname, '..')

const targets = [
  {
    src: resolve(projectRoot, 'src/lib/icons/formeo-sprite.svg'),
    dest: resolve(projectRoot, 'dist/demo/assets/img/'),
  },
  {
    src: resolve(projectRoot, 'src/lib/icons/formeo-sprite.svg'),
    dest: resolve(projectRoot, 'dist/'),
  },
  {
    src: resolve(projectRoot, 'node_modules', '@draggable/formeo-languages/dist/lang/*'),
    dest: resolve(projectRoot, 'dist/demo/assets/lang'),
  },
  {
    src: resolve(projectRoot, 'dist/formeo.umd.js'),
    dest: resolve(projectRoot, 'dist/'),
    rename: 'formeo.min.js',
  },
  {
    src: resolve(projectRoot, 'dist/*.js'),
    dest: resolve(projectRoot, 'dist/demo/assets/js/'),
  },
  {
    src: resolve(projectRoot, 'dist/formeo.min.css'),
    dest: resolve(projectRoot, 'dist/demo/assets/css/'),
  },
]

async function copyFile(src, dest, rename = null) {
  for await (const file of fs.glob(src)) {
    const destPath = rename ? join(dest, rename) : join(dest, basename(file))
    await fs.mkdir(dirname(destPath), { recursive: true })
    await fs.copyFile(file, destPath)
  }
}

// Entry point
async function main() {
  for (const target of targets) {
    try {
      await copyFile(target.src, target.dest, target.rename)
      console.log(`Copied ${basename(target.src)} to ${target.dest}`)
    } catch (error) {
      console.error(`Error copying file: ${error.message}`)
    }
  }
}

main()
