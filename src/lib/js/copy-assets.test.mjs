import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { suite, test } from 'node:test'
import { copyTargets, targets } from '../../../tools/copy-assets.mjs'

const fixture = (t, files = {}) => {
  const dir = mkdtempSync(join(tmpdir(), 'formeo-copy-assets-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

suite('copy-assets', () => {
  test('copies nested files flat by basename and skips directories', async t => {
    const src = fixture(t, { 'lang/de-DE.lang': 'de', 'lang/de-DE.json': '{}', 'top.lang': 'top' })
    const dest = join(fixture(t), 'out')

    t.assert.strictEqual(await copyTargets([{ src: join(src, '**/*'), dest }]), 0)
    t.assert.deepStrictEqual(readdirSync(dest).sort(), ['de-DE.json', 'de-DE.lang', 'top.lang'])
  })

  test('the language target copies the installed package files into the demo', async t => {
    const langTarget = targets.find(({ dest }) => dest.endsWith(join('assets', 'lang')))
    const dest = fixture(t)

    t.assert.strictEqual(await copyTargets([{ ...langTarget, dest }]), 0)
    const files = readdirSync(dest)
    t.assert.ok(files.includes('en-US.lang'))
    t.assert.ok(files.includes('de-DE.lang'))
    t.assert.ok(!files.includes('lang'))
  })

  test('*.js does not pick up .cjs files', async t => {
    const src = fixture(t, { 'formeo.es.js': '', 'formeo.cjs': '' })
    const dest = join(fixture(t), 'out')

    await copyTargets([{ src: join(src, '*.js'), dest }])
    t.assert.deepStrictEqual(readdirSync(dest), ['formeo.es.js'])
  })

  test('counts a failed copy instead of swallowing it', async t => {
    t.mock.method(console, 'error', () => {})
    const src = fixture(t, { 'a.lang': 'a' })
    const dest = join(fixture(t, { 'not-a-dir': '' }), 'not-a-dir')

    t.assert.strictEqual(await copyTargets([{ src: join(src, '*'), dest }]), 1)
    t.assert.strictEqual(console.error.mock.callCount(), 1)
  })
})
