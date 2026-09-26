import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

// Guards #152: editor code must reach Events, Actions, Components, Controls and the component
// stores through its own editor instance, never through the page-wide default exports.
const JS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SINGLETON_MODULES = new Set(
  [
    'common/events.js',
    'common/actions.js',
    'components/index.js',
    'components/controls/index.js',
    'components/stages/index.js',
    'components/rows/index.js',
    'components/columns/index.js',
    'components/fields/index.js',
  ].map(path => join(JS_ROOT, path))
)
// components/index.js assembles the legacy default instance (kept for existing tests) from the default stores
const ALLOWED_IMPORTERS = new Set([join(JS_ROOT, 'components/index.js')])
const DEFAULT_IMPORT = /^import\s+[\w$]+\s*(?:,\s*\{[^}]*\})?\s+from\s+'([^']+)'/gm
const DYNAMIC_IMPORT = /import\(\s*'([^']+)'\s*\)/g

const sourceFiles = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return sourceFiles(path)
    }
    return /\.m?js$/.test(entry.name) && !/\.test\.m?js$/.test(entry.name) ? [path] : []
  })

test('no editor module uses a page-wide singleton instead of its editor instance', () => {
  const violations = sourceFiles(JS_ROOT)
    .filter(file => !ALLOWED_IMPORTERS.has(file))
    .flatMap(file => {
      const source = readFileSync(file, 'utf8')
      const specifiers = [...source.matchAll(DEFAULT_IMPORT), ...source.matchAll(DYNAMIC_IMPORT)].map(
        ([, spec]) => spec
      )
      return specifiers
        .filter(spec => spec.startsWith('.') && SINGLETON_MODULES.has(resolve(dirname(file), spec)))
        .map(spec => `${relative(JS_ROOT, file)} -> ${spec}`)
    })

  assert.deepEqual(violations, [])
})
