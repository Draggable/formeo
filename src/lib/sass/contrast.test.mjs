import { suite, test } from 'node:test'
import { compileFormeoCss } from '../../../tools/compile-scss.mjs'
import { resolveFormeoProperties } from '../../../tools/resolve-formeo-properties.mjs'

// WCAG 2.x AA for normal-size text
const AA = 4.5

/** [r, g, b] (0-255) from a compiled color: #rgb, #rrggbb or rgb()/rgba() with possibly fractional channels. */
function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map(d => d + d) : hex[1].match(/../g)
    return digits.map(d => Number.parseInt(d, 16))
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*1\s*)?\)$/)
  if (rgb) return rgb.slice(1, 4).map(Number)
  throw new Error(`unsupported (or translucent) color: ${value}`)
}

/** WCAG 2.x relative luminance. */
function luminance([r, g, b]) {
  const linear = c => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** WCAG 2.x contrast ratio between two colors, 1 to 21. */
function contrast(a, b) {
  const [hi, lo] = [luminance(parseColor(a)), luminance(parseColor(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const { defaults, dark } = resolveFormeoProperties(compileFormeoCss())
const prop = name => defaults.get(`--formeo-${name}`)
const darkProp = name => dark.get(`--formeo-${name}`) ?? prop(name)

suite('WCAG contrast helper', () => {
  test('matches the reference ratios', t => {
    t.assert.strictEqual(contrast('#fff', '#000').toFixed(2), '21.00')
    t.assert.strictEqual(contrast('#ffffff', '#ffffff'), 1)
    t.assert.strictEqual(contrast('#fff', 'rgb(118, 118, 118)').toFixed(2), '4.54')
  })

  test('rejects colors it cannot judge', t => {
    t.assert.throws(() => parseColor('rgba(0, 0, 0, 0.5)'), /translucent/)
    t.assert.throws(() => parseColor('var(--x)'), /unsupported/)
  })
})

suite('default color contrast (WCAG AA)', () => {
  for (const accent of ['primary', 'success', 'warning', 'danger']) {
    test(`on-accent text on ${accent} buttons is at least ${AA}:1`, t => {
      const ratio = contrast(prop('on-accent'), prop(accent))
      t.assert.ok(ratio >= AA, `${prop(accent)} gives ${ratio.toFixed(2)}:1 with ${prop('on-accent')}`)
    })

    test(`${accent}-dark (the button border) is darker than ${accent}`, t => {
      t.assert.ok(luminance(parseColor(prop(`${accent}-dark`))) < luminance(parseColor(prop(accent))))
    })
  }

  test('the dark preset keeps the accents and on-accent, so buttons keep their contrast', t => {
    for (const name of ['on-accent', 'primary', 'success', 'warning', 'danger']) {
      t.assert.ok(!dark.has(`--formeo-${name}`), `--formeo-${name} must not be overridden in .formeo-dark`)
    }
  })

  for (const accent of ['success', 'warning', 'danger']) {
    test(`${accent}-text is at least ${AA}:1 on the background, light and dark`, t => {
      const light = contrast(prop(`${accent}-text`), prop('bg'))
      t.assert.ok(light >= AA, `light: ${light.toFixed(2)}:1`)
      const onDark = contrast(darkProp(`${accent}-text`), darkProp('bg'))
      t.assert.ok(onDark >= AA, `dark: ${onDark.toFixed(2)}:1`)
    })
  }
})
