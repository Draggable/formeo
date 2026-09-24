import { suite, test } from 'node:test'
import { checkGuardedFiles, findColorLiterals, GUARDED_FILES } from '../../../tools/check-color-literals.mjs'

const flagged = text => findColorLiterals(text, 'sample.scss').length > 0

suite('color literal guard', () => {
  test('guarded styles contain no color literals', t => {
    t.assert.ok(GUARDED_FILES.some(file => file.startsWith('src/lib/sass/components/')))
    t.assert.deepStrictEqual(checkGuardedFiles(), [])
  })

  test('flags hex and every color function', t => {
    for (const value of [
      '#fff',
      '#a1a1aa80',
      'rgb(0 0 0)',
      'rgba(0, 0, 0, 0.5)',
      'hsl(0 0% 0%)',
      'hsla(0, 0%, 0%, 0.5)',
      'hwb(0 0% 0%)',
      'lab(50% 0 0)',
      'lch(50% 0 0)',
      'oklab(0.5 0 0)',
      'oklch(0.5 0 0)',
    ]) {
      t.assert.ok(flagged(`  color: ${value};`), `${value} not flagged`)
    }
  })

  test('flags the colors module however it is imported or referenced', t => {
    t.assert.ok(flagged("@use '../base/colors' as c;"))
    t.assert.ok(flagged('@use "colors" as palette;'))
    t.assert.ok(flagged("@use 'colors';"))
    t.assert.ok(flagged("@use 'colors' as *;"))
    t.assert.ok(flagged('  border-color: color.$gray;'))
    t.assert.ok(flagged('  border-color: colors.$gray;'))
    const viaNamespace = findColorLiterals("@use 'colors' as c; // formeo-color-literal-ok: test\n  fill: c.$x;", 's')
    t.assert.deepStrictEqual(viaNamespace, ['s:2: fill: c.$x;'])
  })

  test('flags named colors in declaration values only', t => {
    t.assert.ok(flagged('  border: 1px solid white;'))
    t.assert.ok(flagged('  color: Black;'))
    t.assert.ok(flagged('  background: rebeccapurple'))
    t.assert.ok(flagged('$accent: tomato;'))
    t.assert.ok(!flagged('.red, .white {'))
    t.assert.ok(!flagged('li:first-child {'))
    t.assert.ok(!flagged("@include mixins.theme('white');"))
    t.assert.ok(!flagged('  white-space: nowrap;'))
    t.assert.ok(!flagged('  border-color: t.$white;'))
    t.assert.ok(!flagged('  background: transparent;'))
    t.assert.ok(!flagged('  fill: currentcolor;'))
    t.assert.ok(!flagged('  color: inherit;'))
  })

  test('allows marked lines, comments and token or variable references', t => {
    t.assert.ok(!flagged('  box-shadow: 0 0 1px #000; // formeo-color-literal-ok: shadow'))
    t.assert.ok(!flagged('  // border: 1px solid #000;'))
    t.assert.ok(!flagged('/*\n  color: white;\n*/'))
    t.assert.ok(!flagged('  border-radius: var.$input-border-radius;'))
    t.assert.ok(!flagged('  padding: mixins.space();'))
    t.assert.ok(!flagged('  background-color: t.$bg;'))
    t.assert.ok(!flagged("@use 'sass:color' as sass-color;"))
  })
})
