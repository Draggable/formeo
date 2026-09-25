import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { suite, test } from 'node:test'
import {
  anchorsOf,
  CHECKED_FILES,
  checkDocLinks,
  findBrokenLinks,
  githubSlug,
} from '../../../tools/check-doc-links.mjs'

const fixture = files => {
  const dir = mkdtempSync(join(tmpdir(), 'formeo-doc-links-'))
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

suite('docs link guard', () => {
  test('README, CONTRIBUTING and docs/** have no broken internal links', t => {
    t.assert.ok(CHECKED_FILES.includes('README.md'))
    t.assert.ok(CHECKED_FILES.some(file => file.startsWith('docs/editor/')))
    t.assert.deepStrictEqual(checkDocLinks(), [])
  })

  test('githubSlug matches GitHub heading anchors', t => {
    t.assert.strictEqual(githubSlug('groupOrder'), 'grouporder')
    t.assert.strictEqual(githubSlug('[Changelog](https://example.com/CHANGELOG.md)'), 'changelog')
    t.assert.strictEqual(githubSlug('`FormeoEditor#formData`'), 'formeoeditorformdata')
    t.assert.strictEqual(githubSlug('onChange vs onUpdate'), 'onchange-vs-onupdate')
    t.assert.strictEqual(githubSlug("What's New?"), 'whats-new')
    t.assert.strictEqual(githubSlug('🎯 Features'), '-features')
  })

  test('repeated headings get numeric suffixes and code blocks are ignored', t => {
    const anchors = anchorsOf('# Usage\n## Usage\n```md\n# Not a heading\n```\n')
    t.assert.deepStrictEqual([...anchors], ['usage', 'usage-1'])
  })

  test('flags missing files, directories without README.md and unknown anchors', t => {
    const dir = fixture({
      'README.md': [
        '[ok](docs/a.md#real-heading)',
        '[missing](docs/nope.md)',
        '[dir](docs/empty/)',
        '[anchor](docs/a.md#not-there)',
        '[repo](https://github.com/Draggable/formeo/blob/main/docs/gone.md)',
        '[external](https://example.com/whatever)',
        '| [placeholder](#) |',
        '```',
        '[in code](docs/ignored.md)',
        '```',
      ].join('\n'),
      'docs/a.md': '# Real heading\n',
      'docs/empty/.keep': '',
    })
    t.assert.deepStrictEqual(findBrokenLinks('README.md', dir), [
      'README.md:2: docs/nope.md (missing file)',
      'README.md:3: docs/empty/ (directory has no README.md)',
      'README.md:4: docs/a.md#not-there (no heading for #not-there)',
      'README.md:5: https://github.com/Draggable/formeo/blob/main/docs/gone.md (missing file)',
      'README.md:7: # (placeholder link)',
    ])
  })

  test('resolves repo URLs and directory links against the working tree', t => {
    const dir = fixture({
      'README.md': '[docs](https://github.com/Draggable/formeo/tree/main/docs/options#sortable)\n[same](#top)\n# Top\n',
      'docs/options/README.md': '## sortable\n',
    })
    t.assert.deepStrictEqual(findBrokenLinks('README.md', dir), [])
  })
})
