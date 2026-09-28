import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

/** Hand-written declarations; the single source for both published copies. */
export const TYPES_SOURCE = join(root, 'src/types/formeo.d.ts')

/**
 * Copy the declarations next to the bundles. `.d.ts` describes the ES and UMD builds and `.d.cts`
 * the CommonJS build (`dist/formeo.cjs`); TypeScript picks the one matching the resolved file's format.
 * @param {string} [outDir]
 * @return {string[]} written file paths
 */
export function buildTypes(outDir = join(root, 'dist')) {
  mkdirSync(outDir, { recursive: true })
  const written = ['formeo.d.ts', 'formeo.d.cts'].map(name => join(outDir, name))
  for (const file of written) {
    copyFileSync(TYPES_SOURCE, file)
  }
  return written
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`types: ${buildTypes().join(', ')}`)
}
