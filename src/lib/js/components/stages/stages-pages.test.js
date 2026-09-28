import { strict as assert } from 'node:assert'
import { describe, it, mock } from 'node:test'
import { enUS } from '@draggable/formeo-languages'
import i18n from '@draggable/i18n'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import { PAGE_TEXT, pageText } from './page-text.mjs'

const form = stages => ({ id: 'form-t', stages, rows: {}, columns: {}, fields: {} })
const threeStages = () =>
  form({
    's-1': { id: 's-1', config: { title: 'About you' }, children: [] },
    's-2': { id: 's-2', children: [] },
    's-3': { id: 's-3', config: { title: '  ' }, children: [] },
  })

const editorState = (formData, opts = { pages: true }, callbacks = {}) => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load(formData, opts)
  return components
}

describe('pageText (#122)', () => {
  it('falls back to English and fills {tokens}', () => {
    assert.equal(pageText('pages.untitled', { n: 4 }), 'Page 4')
    assert.equal(pageText('pages.removeConfirm', { title: 'Account' }), 'Remove "Account" and everything on it?')
    assert.equal(pageText('pages.add'), 'Add page')
  })

  it('leaves unknown tokens alone and returns the key for an unknown key', () => {
    assert.equal(pageText('pages.moved', {}), 'Moved to {title}')
    assert.equal(pageText('pages.nope'), 'pages.nope')
  })

  it('fills a translated string with a title holding $ patterns, literally', () => {
    const title = "Pay $$ and $& now $` $'"
    assert.equal(pageText('pages.moved', { title }), `Moved to ${title}`)
    // the real i18n, with a locale that ships the key
    i18n.applyLanguage(i18n.locale, { 'pages.moved': 'Now on {title}' })
    try {
      assert.equal(pageText('pages.moved', { title }), `Now on ${title}`)
    } finally {
      delete i18n.langs[i18n.locale]['pages.moved']
    }
    assert.equal(pageText('pages.moved', { title }), `Moved to ${title}`)
  })

  it('has a fallback for every pages.* key', () => {
    assert.deepEqual(Object.keys(PAGE_TEXT).sort(), [
      'pages.add',
      'pages.label',
      'pages.move',
      'pages.moveTo',
      'pages.moved',
      'pages.page',
      'pages.remove',
      'pages.removeConfirm',
      'pages.rename',
      'pages.untitled',
    ])
  })

  it('@draggable/formeo-languages ships every pages.* key, matching the English fallback', () => {
    // pages.page is new (#122) and not yet shipped by @draggable/formeo-languages; pageText()'s own
    // fallback carries it until a release adds it (see docs/editor/pages.md#i18n)
    for (const [key, text] of Object.entries(PAGE_TEXT)) {
      if (key === 'pages.page') {
        continue
      }
      assert.equal(enUS[key], text, key)
    }
  })
})

describe('Stages page helpers (#122)', () => {
  it('seeds config.title with pages on', () => {
    const { formData } = editorState(
      form({
        a: { id: 'a', children: [] },
        b: { id: 'b', config: { title: null }, children: [] },
        c: { id: 'c', config: { title: 5 }, children: [] },
        d: { id: 'd', config: { title: 'Kept' }, children: [] },
      })
    )
    assert.deepEqual(
      Object.values(formData.stages).map(({ config }) => config),
      [{ title: '' }, { title: '' }, { title: '5' }, { title: 'Kept' }]
    )
  })

  it('leaves formData as it was with pages off', () => {
    const { formData } = editorState(threeStages(), {})
    assert.equal(formData.stages['s-2'].config, undefined)
  })

  it('titles a page by config.title, or "Page {n}" when it is empty', () => {
    const { stages } = editorState(threeStages())
    assert.equal(stages.pageTitle(stages.get('s-1')), 'About you')
    assert.equal(stages.pageTitle(stages.get('s-2')), 'Page 2')
    assert.equal(stages.pageTitle(stages.get('s-3')), 'Page 3')
    assert.equal(stages.pageTitle(stages.get('s-2'), 6), 'Page 7')
  })

  it('reorders stages in place and announces it', () => {
    const components = editorState(threeStages(), { pages: true })
    const data = components.stages.data
    let announcement
    const onFormeoUpdated = evt => {
      announcement = evt.detail
    }
    document.addEventListener('formeoUpdated', onFormeoUpdated)

    try {
      assert.equal(components.stages.reorder(['s-3', 's-1', 's-2']), true)
      assert.deepEqual(Object.keys(components.formData.stages), ['s-3', 's-1', 's-2'])
      // the same object the Components instance holds
      assert.strictEqual(components.get('stages'), data)
      assert.strictEqual(components.stages.data, data)

      assert.equal(announcement?.changeType, 'reordered')
      assert.deepEqual(announcement?.value, ['s-3', 's-1', 's-2'])
      assert.deepEqual(announcement?.previousValue, ['s-1', 's-2', 's-3'])
    } finally {
      document.removeEventListener('formeoUpdated', onFormeoUpdated)
    }
  })

  it('ignores unknown ids, keeps missing ones at the end, and reports no change', () => {
    const { stages } = editorState(threeStages())
    assert.equal(stages.reorder(['nope', 's-2']), true)
    assert.deepEqual(Object.keys(stages.data), ['s-2', 's-1', 's-3'])
    assert.equal(stages.reorder(['s-2', 's-1', 's-3']), false)
  })

  it('refuses an order that integer-like ids make impossible', () => {
    const warn = mock.method(console, 'warn', () => {})
    const { stages } = editorState(form({ 1: { id: '1', children: [] }, 2: { id: '2', children: [] } }))
    assert.equal(stages.reorder(['2', '1']), false)
    assert.deepEqual(Object.keys(stages.data), ['1', '2'])
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })

  it('honors an order that integer-like ids allow: they stay first, in ascending order', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const components = editorState(
        form({
          1: { id: '1', children: [] },
          2: { id: '2', children: [] },
          abc: { id: 'abc', children: [] },
          def: { id: 'def', children: [] },
        })
      )
      const data = components.stages.data
      assert.equal(components.stages.reorder(['1', '2', 'def', 'abc']), true)
      assert.deepEqual(Object.keys(components.formData.stages), ['1', '2', 'def', 'abc'])
      assert.strictEqual(components.stages.data, data)
      assert.strictEqual(components.get('stages'), data)
      assert.equal(warn.mock.callCount(), 0)
    } finally {
      warn.mock.restore()
    }
  })

  it('refuses an order that puts another page before an integer-like id, even from a partial list', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const { stages } = editorState(
        form({
          1: { id: '1', children: [] },
          2: { id: '2', children: [] },
          abc: { id: 'abc', children: [] },
          def: { id: 'def', children: [] },
        })
      )
      assert.equal(stages.reorder(['1', 'abc', '2', 'def']), false)
      // missing ids go to the end: ['def', '1', '2', 'abc'], which can't be kept either
      assert.equal(stages.reorder(['def']), false)
      assert.deepEqual(Object.keys(stages.data), ['1', '2', 'abc', 'def'])
      assert.equal(warn.mock.callCount(), 2)
    } finally {
      warn.mock.restore()
    }
  })

  it('compares integer-like ids as numbers, not text', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const { stages } = editorState(
        form({
          2: { id: '2', children: [] },
          10: { id: '10', children: [] },
          abc: { id: 'abc', children: [] },
          xyz: { id: 'xyz', children: [] },
        })
      )
      assert.deepEqual(Object.keys(stages.data), ['2', '10', 'abc', 'xyz'])
      assert.equal(stages.reorder(['10', '2', 'abc', 'xyz']), false)
      assert.equal(stages.reorder(['2', '10', 'xyz', 'abc']), true)
      assert.deepEqual(Object.keys(stages.data), ['2', '10', 'xyz', 'abc'])
      assert.equal(warn.mock.callCount(), 1)
    } finally {
      warn.mock.restore()
    }
  })

  it('treats ids that only look numeric ("01", "4294967295") as ordinary ids', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const { stages } = editorState(
        form({
          abc: { id: 'abc', children: [] },
          '01': { id: '01', children: [] },
          4294967295: { id: '4294967295', children: [] },
        })
      )
      assert.deepEqual(Object.keys(stages.data), ['abc', '01', '4294967295'])
      assert.equal(stages.reorder(['4294967295', '01', 'abc']), true)
      assert.deepEqual(Object.keys(stages.data), ['4294967295', '01', 'abc'])
      assert.equal(warn.mock.callCount(), 0)
    } finally {
      warn.mock.restore()
    }
  })

  it('never auto-generates an integer-like page id, even when uuid() looks numeric', () => {
    // JS objects list an integer-like key ("12345678") before any string key regardless of insertion order, which
    // would silently jump a newly added page to the front instead of appending it (#122). uuid() is 8 hex
    // characters, so this happens for roughly 1 add in 43; Stages#generateId retries until it isn't one.
    // The mock is installed only for the add() call below: editorState() itself calls uuid() several times
    // (Components' instanceId, and more), and a mock installed earlier would be spent on those instead.
    const { stages } = editorState(threeStages())
    const real = crypto.randomUUID.bind(crypto)
    let forcedOnce = false
    const spy = mock.method(crypto, 'randomUUID', () => {
      if (!forcedOnce) {
        forcedOnce = true
        return '12345678-0000-0000-0000-000000000000'
      }
      return real()
    })
    try {
      const stage = stages.add(null, { config: { title: '' } })
      assert.ok(spy.mock.callCount() >= 2, 'expected a retry: at least the forced call and one real one')
      assert.notEqual(stage.id, '12345678')
      assert.notEqual(String(Number.parseInt(stage.id, 10)), stage.id)
      assert.deepEqual(Object.keys(stages.data).slice(-1), [stage.id])
    } finally {
      spy.mock.restore()
    }
  })
})
