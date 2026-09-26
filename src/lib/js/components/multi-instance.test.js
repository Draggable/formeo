import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import Sortable from 'sortablejs'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { formDataStorageKey } from '../common/utils/index.mjs'
import { SESSION_FORMDATA_KEY } from '../constants.js'
import Control from './controls/control.js'
import defaultComponents, { Components, Controls } from './index.js'

const formFor = key => ({
  id: `form-${key}`,
  stages: { [`stage-${key}`]: { id: `stage-${key}`, children: [`row-${key}`] } },
  rows: { [`row-${key}`]: { id: `row-${key}`, config: {}, children: [`col-${key}`] } },
  columns: { [`col-${key}`]: { id: `col-${key}`, config: { width: '100%' }, children: [`field-${key}`] } },
  fields: {
    [`field-${key}`]: { id: `field-${key}`, tag: 'input', attrs: { type: 'text' }, config: { label: key } },
  },
})

const editorState = (opts = {}) => {
  const events = new Events().init(opts)
  return new Components({ events, actions: new Actions(events).init({}) })
}

describe('Multi-instance isolation (#152)', () => {
  it('keeps each instance’s formData separate', () => {
    const a = editorState()
    const b = editorState()

    a.load(formFor('a'))
    b.load(formFor('b'))

    assert.equal(a.formData.id, 'form-a')
    assert.deepEqual(Object.keys(a.formData.fields), ['field-a'])
    assert.equal(b.formData.id, 'form-b')
    assert.deepEqual(Object.keys(b.formData.fields), ['field-b'])
  })

  it('gives every instance its own stores, wired back to it', () => {
    const a = editorState()
    const b = editorState()

    for (const type of ['stages', 'rows', 'columns', 'fields']) {
      assert.notStrictEqual(a[type], b[type], `${type} store is shared`)
      assert.strictEqual(a[type].components, a, `${type} store knows its instance`)
    }
    assert.notEqual(a.instanceId, b.instanceId)
  })

  it('never touches the default singleton', () => {
    const before = JSON.stringify(defaultComponents.formData)
    editorState().load(formFor('a'))
    assert.equal(JSON.stringify(defaultComponents.formData), before)
  })

  it('calls only the owning instance’s callbacks', () => {
    const onAddRow = { a: mock.fn(), b: mock.fn() }
    const a = editorState({ onAddRow: onAddRow.a })
    editorState({ onAddRow: onAddRow.b })

    a.rows.add()

    assert.equal(onAddRow.a.mock.callCount(), 1)
    assert.equal(onAddRow.b.mock.callCount(), 0)
  })

  it('components built by an instance point at that instance', () => {
    const a = editorState()
    a.load(formFor('a'))

    assert.strictEqual(a.rows.get('row-a').components, a)
    assert.strictEqual(a.fields.get('field-a').components, a)
  })

  it('scopes sortable groups to the instance so components cannot be dragged between editors', () => {
    const a = editorState()
    const b = editorState()
    a.load(formFor('a'))
    b.load(formFor('b'))

    // Sortable keeps `put` only as a checkPut function, so ask it which source groups it accepts
    const accepts = (sortable, groupName) =>
      sortable.options.group.checkPut(sortable, { options: { group: { name: groupName } } })
    const layout = {
      stage: { component: a.stages.get('stage-a'), put: ['row', 'column', 'controls'] },
      row: { component: a.rows.get('row-a'), put: ['row', 'column', 'controls'] },
      column: { component: a.columns.get('col-a'), put: ['column', 'controls'] },
    }

    for (const [type, { component, put }] of Object.entries(layout)) {
      const { group } = component.sortable.options
      assert.equal(group.name, `${type}-${a.instanceId}`, `${type} group name`)
      for (const source of put) {
        assert.ok(accepts(component.sortable, `${source}-${a.instanceId}`), `${type} accepts its own ${source}`)
        assert.ok(!accepts(component.sortable, `${source}-${b.instanceId}`), `${type} refuses another ${source}`)
        assert.ok(!accepts(component.sortable, source), `${type} refuses the unscoped ${source} group`)
      }
    }
  })

  it('scopes the controls panel group to the instance', async t => {
    // the TinyMCE control fetches its script from a CDN, which never loads under jsdom
    t.mock.method(Control.prototype, 'promise', () => Promise.resolve())
    // the control groups keep their order in localStorage, which Node has no store for here;
    // t.mock.property never finishes restoring Node's own localStorage getter, so swap it by hand
    const localStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true })
    t.after(() => {
      if (localStorage) {
        Object.defineProperty(globalThis, 'localStorage', localStorage)
      } else {
        delete globalThis.localStorage
      }
    })
    const a = editorState()
    const controls = await new Controls(a).init({}, false)

    assert.ok(controls.groups.length > 0)
    for (const groupEl of controls.groups) {
      assert.equal(Sortable.get(groupEl).options.group.name, `controls-${a.instanceId}`)
    }
  })

  describe('sessionStorage keys', () => {
    it('keeps the historical key for sessionStorage: true', () => {
      assert.equal(formDataStorageKey(true), SESSION_FORMDATA_KEY)
    })

    it('uses a string option as the key', () => {
      assert.equal(formDataStorageKey('orders-form'), 'orders-form')
    })

    it('falls back to the historical key for an empty string', () => {
      assert.equal(formDataStorageKey(''), SESSION_FORMDATA_KEY)
    })
  })
})
