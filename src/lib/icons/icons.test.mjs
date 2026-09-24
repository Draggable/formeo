import { readdirSync, readFileSync } from 'node:fs'
import { suite, test } from 'node:test'

const dir = new URL('./', import.meta.url)

suite('icons', () => {
  test('no icon hard-codes a fill color', t => {
    const offenders = readdirSync(dir)
      .filter(f => f.endsWith('.svg'))
      .filter(f => /fill="#[0-9a-fA-F]+"/.test(readFileSync(new URL(f, dir), 'utf8')))
    t.assert.deepStrictEqual(offenders, [])
  })
})
