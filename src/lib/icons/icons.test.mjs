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

  test('the sprite has a symbol for every icon file', t => {
    const sprite = readFileSync(new URL('formeo-sprite.svg', dir), 'utf8')
    const missing = svgFiles
      .filter(f => f.startsWith('icon-'))
      .map(f => f.replace(/^icon-(.*)\.svg$/, 'f-i-$1'))
      .filter(id => !sprite.includes(`id="${id}"`))
    t.assert.deepStrictEqual(missing, [])
  })

  test('has a table icon (#349)', t => {
    t.assert.ok(svgFiles.includes('icon-table.svg'))
    t.assert.ok(svgFiles.includes('icon-matrix.svg'))
  })
})
