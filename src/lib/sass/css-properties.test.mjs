import { readFileSync } from 'node:fs'
import { suite, test } from 'node:test'
import { compileFormeoCss } from '../../../tools/compile-scss.mjs'
import { resolveFormeoProperties } from '../../../tools/resolve-formeo-properties.mjs'

const baseline = readFileSync(new URL('./__fixtures__/formeo-baseline.css', import.meta.url), 'utf8')

suite('formeo CSS custom properties', () => {
  test('resolved CSS is identical to the pre-change baseline', t => {
    const { css } = resolveFormeoProperties(compileFormeoCss())
    t.assert.strictEqual(css.trim(), baseline.trim())
  })
})
