// tools/dist.test.mjs
// Loads the built package the way a consumer does: from a clean Node process (no JSDOM globals), through
// node_modules/formeo, so package.json main/exports are what resolve it. Run after `npm run build:lib`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
let consumer

const run = (args, cwd = consumer) =>
  execFileSync(process.execPath, args, { cwd, encoding: 'utf8', env: { PATH: process.env.PATH } }).trim()

describe('built package in plain Node', () => {
  before(() => {
    assert.ok(existsSync(join(root, 'dist')), 'dist/ is missing: run `npm run build:lib` first')
    consumer = mkdtempSync(join(tmpdir(), 'formeo-consumer-'))
    mkdirSync(join(consumer, 'node_modules'))
    symlinkSync(root, join(consumer, 'node_modules', 'formeo'), 'dir')
  })
  after(() => rmSync(consumer, { recursive: true, force: true }))

  test('require("formeo") returns both classes', () => {
    const out = run(['-e', "const f = require('formeo'); console.log(typeof f.FormeoEditor, typeof f.FormeoRenderer)"])
    assert.equal(out, 'function function')
  })

  test('import("formeo") returns both classes', () => {
    const out = run([
      '--input-type=module',
      '-e',
      "const f = await import('formeo'); console.log(typeof f.FormeoEditor, typeof f.FormeoRenderer)",
    ])
    assert.equal(out, 'function function')
  })

  test('the stylesheet export resolves to a file', () => {
    const out = run(['-e', "console.log(require.resolve('formeo/dist/formeo.min.css'))"])
    assert.ok(existsSync(out), out)
  })

  test('every entry point package.json names exists', () => {
    const targets = [pkg.main, pkg.module, pkg.unpkg, pkg.types, ...exportTargets(pkg.exports)].filter(Boolean)
    for (const target of new Set(targets)) {
      assert.ok(existsSync(join(root, target)), target)
    }
  })

  test('the CommonJS entry is a .cjs file', () => {
    assert.match(pkg.main, /\.cjs$/)
    assert.match(pkg.exports['.'].require.default, /\.cjs$/)
  })

  test('every entry point has built type declarations', () => {
    assert.equal(pkg.types, './dist/formeo.d.ts')
    for (const [condition, target] of Object.entries(pkg.exports['.'])) {
      assert.ok(target.types, `exports["."].${condition} has no types`)
      assert.ok(existsSync(join(root, target.types)), target.types)
    }
    assert.match(pkg.exports['.'].require.types, /\.d\.cts$/)
  })

  test('TypeScript finds the declarations in every module resolution mode', () => {
    const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
    const source = [
      "import { FormeoEditor, type FormeoFormData } from 'formeo'",
      'const formData: FormeoFormData = new FormeoEditor().formData',
      'export { formData }',
      '',
    ].join('\n')
    for (const file of ['esm.mts', 'cjs.cts', 'app.ts']) {
      writeFileSync(join(consumer, file), source)
    }
    const modes = [
      ['--module', 'nodenext', '--moduleResolution', 'nodenext', 'esm.mts', 'cjs.cts'],
      ['--module', 'esnext', '--moduleResolution', 'bundler', 'app.ts'],
    ]
    for (const mode of modes) {
      try {
        run([tsc, '--noEmit', '--strict', '--lib', 'es2022,dom', ...mode])
      } catch (error) {
        assert.fail(`tsc ${mode.join(' ')}\n${error.stdout}`)
      }
    }
  })
})

/**
 * Every file path in an exports tree; a condition's value is a path or another condition object.
 * @param {string|Object} value
 * @return {string[]}
 */
function exportTargets(value) {
  return typeof value === 'string' ? [value] : Object.values(value).flatMap(exportTargets)
}
