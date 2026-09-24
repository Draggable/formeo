import { readdirSync, readFileSync } from 'node:fs'
import { suite, test } from 'node:test'

const dir = new URL('./', import.meta.url)
const svgFiles = readdirSync(dir).filter(f => f.endsWith('.svg'))

suite('icons', () => {
  test('no icon hard-codes a fill or stroke color attribute', t => {
    const offenders = svgFiles.filter(f => /(fill|stroke)="#[0-9a-fA-F]+"/.test(readFileSync(new URL(f, dir), 'utf8')))
    t.assert.deepStrictEqual(offenders, [])
  })

  test('the sprite has no fill or stroke color in a style attribute', t => {
    const sprite = readFileSync(new URL('formeo-sprite.svg', dir), 'utf8')
    const styles = sprite.match(/style="[^"]*"/g) ?? []
    const offenders = styles.filter(style => /(fill|stroke)\s*:\s*#/.test(style))
    t.assert.deepStrictEqual(offenders, [])
  })
})
