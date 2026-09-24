import { readFileSync } from 'node:fs'
import { suite, test } from 'node:test'
import { compileFormeoCss } from '../../../tools/compile-scss.mjs'
import { resolveFormeoProperties } from '../../../tools/resolve-formeo-properties.mjs'

const baseline = readFileSync(new URL('./__fixtures__/formeo-baseline.css', import.meta.url), 'utf8')

const EXPECTED = [
  'bg',
  'bg-hover',
  'surface-muted',
  'stage-bg',
  'stage-shadow',
  'overlay',
  'text',
  'text-strong',
  'text-secondary',
  'text-muted',
  'text-subtle',
  'on-accent',
  'icon',
  'border',
  'border-strong',
  'focus',
  'primary',
  'primary-dark',
  'success',
  'success-dark',
  'warning',
  'warning-dark',
  'danger',
  'danger-dark',
  'danger-subtle',
  'info',
  'remove-bg',
  'column-outline-soft',
  ...['stage', 'row', 'column', 'field', 'option'].flatMap(s => [
    `${s}-outline`,
    `${s}-outline-text`,
    `${s}-highlight`,
    `${s}-highlight-text`,
  ]),
].map(n => `--formeo-${n}`)

suite('formeo CSS custom properties', () => {
  test('resolved CSS is identical to the pre-change baseline', t => {
    const { css } = resolveFormeoProperties(compileFormeoCss())
    t.assert.strictEqual(css.trim(), baseline.trim())
  })

  test('declares every expected property on :where(:root)', t => {
    const { defaults } = resolveFormeoProperties(compileFormeoCss())
    t.assert.deepStrictEqual([...defaults.keys()].sort(), [...EXPECTED].sort())
  })
})
