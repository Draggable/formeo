import { readFileSync } from 'node:fs'
import { suite, test } from 'node:test'
import { compileFormeoCss } from '../../../tools/compile-scss.mjs'
import { ALLOWED_ADDITIONS, resolveFormeoProperties } from '../../../tools/resolve-formeo-properties.mjs'

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

  test('.formeo-dark preset overrides surfaces and text but keeps on-accent light', t => {
    const { dark, defaults } = resolveFormeoProperties(compileFormeoCss())
    for (const name of ['--formeo-bg', '--formeo-text', '--formeo-border', '--formeo-icon']) {
      t.assert.ok(dark.has(name), `${name} missing from dark preset`)
      t.assert.notStrictEqual(dark.get(name), defaults.get(name))
    }
    t.assert.ok(!dark.has('--formeo-on-accent'), 'on-accent must not be overridden')
    for (const key of dark.keys()) t.assert.ok(defaults.has(key), `${key} has no default`)
  })

  test('every allowed addition matches exactly one compiled rule', t => {
    const compiled = compileFormeoCss()
    for (const re of ALLOWED_ADDITIONS) {
      t.assert.strictEqual([...compiled.matchAll(re)].length, 1, `${re} must match exactly one rule`)
    }
  })

  test(':where(.svg-icon) sets the icon fill and color', t => {
    t.assert.strictEqual(
      compiledRule(':where(.svg-icon) {'),
      ':where(.svg-icon) {\n  fill: var(--formeo-icon);\n  color: var(--formeo-icon);\n}'
    )
  })

  test('.formeo-dark preset sets text color on formeo containers, nested or on the container itself', t => {
    t.assert.strictEqual(
      compiledRule(':where(.formeo-dark) :where('),
      [
        ':where(.formeo-dark) :where(.formeo, .formeo-controls, .formeo-dialog),',
        ':where(.formeo-dark):where(.formeo, .formeo-controls, .formeo-dialog) {',
        '  color: var(--formeo-text);',
        '}',
      ].join('\n')
    )
  })

  test('.formeo-dark gives the THEN condition label a higher-contrast background', t => {
    const label = '.formeo.formeo-editor .conditions-prop-inputs label.condition-label.then-condition-label'
    t.assert.strictEqual(
      compiledRule(`.formeo-dark ${label},`),
      [
        `.formeo-dark ${label},`,
        `.formeo-dark${label} {`,
        '  background-color: var(--formeo-border-strong);',
        '}',
      ].join('\n')
    )
  })

  test('dialogs and the edit popover take their surface and text from the properties', t => {
    t.assert.strictEqual(
      compiledRule(':where(.formeo-dialog, '),
      [
        ':where(.formeo-dialog, .component-edit[popover]) {',
        '  background-color: var(--formeo-bg);',
        '  color: var(--formeo-text);',
        '}',
      ].join('\n')
    )
  })

  test('allowed additions are stripped before the baseline comparison', t => {
    const { css } = resolveFormeoProperties(compileFormeoCss())
    for (const fragment of ['formeo-dark', ':where(.svg-icon)', ':where(.formeo-dialog']) {
      t.assert.ok(!css.includes(fragment), `${fragment} must be stripped before baseline comparison`)
    }
  })
})

suite('resolveFormeoProperties purity', () => {
  const root = ':where(:root) {\n  --formeo-bg: #fff;\n}\n'
  const dark = ':where(.formeo-dark) {\n  color-scheme: dark;\n  --formeo-bg: #000;\n}\n'
  const use = '.a {\n  color: var(--formeo-bg);\n}\n'

  test('resolves a well-formed stylesheet', t => {
    const result = resolveFormeoProperties(root + dark + use)
    t.assert.strictEqual(result.css, '.a {\n  color: #fff;\n}\n')
    t.assert.strictEqual(result.dark.get('--formeo-bg'), '#000')
  })

  test('rejects more than one :where(:root) block', t => {
    t.assert.throws(() => resolveFormeoProperties(root + root + use), /at most one :where\(:root\) block, found 2/)
  })

  test('rejects more than one :where(.formeo-dark) block', t => {
    t.assert.throws(
      () => resolveFormeoProperties(root + dark + dark),
      /at most one :where\(\.formeo-dark\) block, found 2/
    )
  })

  test('rejects non-property declarations in the root block', t => {
    const impure = ':where(:root) {\n  --formeo-bg: #fff;\n  color: red;\n}\n'
    t.assert.throws(() => resolveFormeoProperties(impure), /:where\(:root\) may only declare .*found: color: red/)
  })

  test('rejects anything but properties and color-scheme in the dark block', t => {
    const impure = ':where(.formeo-dark) {\n  color-scheme: dark;\n  background: black;\n}\n'
    t.assert.throws(
      () => resolveFormeoProperties(root + impure),
      /:where\(\.formeo-dark\) may only declare .*found: background: black/
    )
  })
})

/** The single compiled rule starting with `start`, trimmed. */
function compiledRule(start) {
  const compiled = compileFormeoCss()
  const at = compiled.indexOf(start)
  if (at === -1 || compiled.indexOf(start, at + 1) !== -1) throw new Error(`expected one rule starting ${start}`)
  return compiled.slice(at, compiled.indexOf('}', at) + 1)
}
