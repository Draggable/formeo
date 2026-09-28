// tools/dist.test.mjs
// Loads the built package the way a consumer does: from a clean Node process (no JSDOM globals), through
// node_modules/formeo, so package.json main/exports are what resolve it. Run after `npm run build:lib`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
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
    const targets = [pkg.main, pkg.module, pkg.unpkg, ...Object.values(pkg.exports).flatMap(Object.values)]
    for (const target of new Set(targets)) {
      assert.ok(existsSync(join(root, target)), target)
    }
  })

  test('the CommonJS entry is a .cjs file', () => {
    assert.match(pkg.main, /\.cjs$/)
    assert.match(pkg.exports['.'].require, /\.cjs$/)
  })
})
