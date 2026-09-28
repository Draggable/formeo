import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { suite, test } from 'node:test'
import { buildTypes, TYPES_SOURCE } from '../../../tools/build-types.mjs'

const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))

suite('published type definitions', () => {
  test('package.json points every entry point at a declaration file', t => {
    t.assert.strictEqual(pkg.types, './dist/formeo.d.ts')
    const root = pkg.exports['.']
    t.assert.deepStrictEqual(root.import, { types: './dist/formeo.d.ts', default: './dist/formeo.es.js' })
    t.assert.deepStrictEqual(root.require, { types: './dist/formeo.d.cts', default: './dist/formeo.cjs' })
    t.assert.deepStrictEqual(root.default, { types: './dist/formeo.d.ts', default: './dist/formeo.umd.js' })
    for (const condition of Object.values(root)) {
      t.assert.strictEqual(Object.keys(condition)[0], 'types', 'types must be the first key TypeScript sees')
    }
  })

  test('the published files include dist/', t => {
    t.assert.ok(pkg.files.includes('dist/*'))
  })

  test('buildTypes writes identical ESM and CJS declaration files', t => {
    const outDir = mkdtempSync(join(tmpdir(), 'formeo-types-'))
    t.after(() => rmSync(outDir, { recursive: true, force: true }))
    const source = readFileSync(TYPES_SOURCE, 'utf8')
    const written = buildTypes(outDir)
    t.assert.deepStrictEqual(
      written.map(file => file.slice(outDir.length + 1)),
      ['formeo.d.ts', 'formeo.d.cts']
    )
    for (const file of written) {
      t.assert.strictEqual(readFileSync(file, 'utf8'), source)
    }
  })
})
