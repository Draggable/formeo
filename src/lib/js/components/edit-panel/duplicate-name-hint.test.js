import { strict as assert } from 'node:assert'
import { before, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'

const textField = (id, attrs = {}) => ({ id, tag: 'input', attrs: { type: 'text', ...attrs }, config: { label: id } })

const formWith = (key, fields) => ({
  id: `form-${key}`,
  stages: { [`stage-${key}`]: { id: `stage-${key}`, children: [`row-${key}`] } },
  rows: { [`row-${key}`]: { id: `row-${key}`, config: {}, children: [`col-${key}`] } },
  columns: { [`col-${key}`]: { id: `col-${key}`, config: { width: '100%' }, children: fields.map(({ id }) => id) } },
  fields: Object.fromEntries(fields.map(field => [field.id, field])),
})

const editorWith = (key, fields, fieldsConfig) => {
  const events = new Events().init({})
  const components = new Components({ events, actions: new Actions(events).init({}) })
  if (fieldsConfig) {
    components.fields.config = fieldsConfig
  }
  components.load(formWith(key, fields))
  return components
}

// hints are refreshed in a microtask so a whole load or clone costs one scan
const flush = () => new Promise(resolve => setImmediate(resolve))

const nameRow = field => field.dom.querySelector('.field-attrs-name')
const nameInput = field => nameRow(field).querySelector('input')
const visibleHint = field => {
  const hint = nameRow(field)?.querySelector('.duplicate-name-hint')
  return hint?.textContent.trim() ? hint : null
}

describe('duplicate field name hint (#331)', () => {
  before(() => {
    i18n.current ??= {}
  })

  it('shows a warning under the name of every field sharing it', async () => {
    const editor = editorWith('dup', [textField('a', { name: 'email' }), textField('b', { name: 'email' })])
    await flush()

    for (const id of ['a', 'b']) {
      const field = editor.fields.get(id)
      const hint = visibleHint(field)
      assert.ok(hint, `field ${id} shows the hint`)
      assert.match(hint.textContent, /email/)
      assert.equal(hint.tagName, 'SMALL')
      assert.ok(hint.classList.contains('f-help-text'))
      assert.ok(hint.classList.contains('text-warning'))
      assert.equal(hint.getAttribute('role'), 'status')
      assert.equal(nameInput(field).getAttribute('aria-describedby'), hint.id)
    }
  })

  it('clears both hints once one field is renamed', async () => {
    const editor = editorWith('rename', [textField('a', { name: 'email' }), textField('b', { name: 'email' })])
    await flush()

    editor.fields.get('b').set('attrs.name', 'phone')
    await flush()

    for (const id of ['a', 'b']) {
      const field = editor.fields.get(id)
      assert.equal(visibleHint(field), null, `field ${id} hint is hidden`)
      assert.equal(nameInput(field).hasAttribute('aria-describedby'), false)
    }
  })

  it('shows nothing for a field whose name is unique', async () => {
    const editor = editorWith('single', [textField('a', { name: 'email' }), textField('b')])
    await flush()

    assert.equal(visibleHint(editor.fields.get('a')), null)
  })

  it('ignores fields in another editor', async () => {
    const one = editorWith('one', [textField('one-a', { name: 'email' })])
    const two = editorWith('two', [textField('two-a', { name: 'email' })])
    await flush()

    assert.equal(visibleHint(one.fields.get('one-a')), null)
    assert.equal(visibleHint(two.fields.get('two-a')), null)
  })

  it('warns about a clone, and stops once the clone is removed', async () => {
    const editor = editorWith('clone', [textField('a', { name: 'email' })])
    await flush()
    const original = editor.fields.get('a')

    const copy = original.clone()
    await flush()
    assert.ok(visibleHint(original), 'original shows the hint')
    assert.ok(visibleHint(copy), 'clone shows the hint')

    copy.remove()
    await flush()
    assert.equal(visibleHint(original), null)
  })

  it('leaves an unchanged hint alone while another field is renamed', async () => {
    const editor = editorWith('quiet', [
      textField('a', { name: 'email' }),
      textField('b', { name: 'email' }),
      textField('c', { name: 'phone' }),
    ])
    await flush()
    const textNode = visibleHint(editor.fields.get('a')).firstChild

    editor.fields.get('c').set('attrs.name', 'mobile')
    await flush()

    // rewriting the same text would make the status region announce it again
    assert.strictEqual(visibleHint(editor.fields.get('a')).firstChild, textNode)
  })

  it('warns when a field without a name row is given a duplicate name in code', async () => {
    const editor = editorWith('api', [textField('a', { name: 'email' }), textField('b')])
    await flush()
    assert.equal(nameRow(editor.fields.get('b')), null, 'b has no name row')

    editor.fields.get('b').set('attrs.name', 'email')
    await flush()

    assert.ok(visibleHint(editor.fields.get('a')), 'a shows the hint')
  })

  it('describes a picklist name control too', async () => {
    const picklist = [
      { label: 'email', value: 'email' },
      { label: 'phone', value: 'phone' },
    ]
    const withControl = (id, name) => ({ ...textField(id, { name }), config: { label: id, controlId: 'text-input' } })
    const editor = editorWith('picklist', [withControl('a', 'email'), withControl('b', 'email')], {
      'text-input': { attrs: { name: picklist } },
    })
    await flush()

    const field = editor.fields.get('a')
    const select = nameRow(field).querySelector('select')
    assert.ok(select, 'name renders as a select')
    assert.equal(select.getAttribute('aria-describedby'), visibleHint(field).id)
  })

  it('stops warning when the other field loses its name attribute', async () => {
    const editor = editorWith('attr', [textField('a', { name: 'email' }), textField('b', { name: 'email' })])
    await flush()

    const nameItem = editor.fields
      .get('b')
      .editPanels.get('attrs')
      .editPanelItems.find(item => item.itemKey === 'attrs.name')
    nameItem.removeItem()
    await flush()

    assert.equal(visibleHint(editor.fields.get('a')), null)
  })

  it('warns about a cloned matrix that keeps its name (#349 phase 2)', async () => {
    const matrix = {
      id: 'm',
      tag: 'table',
      attrs: { className: '', name: 'visit' },
      config: { label: 'Matrix', hideLabel: true },
      table: {
        rowHeaders: true,
        columns: [{ label: '' }, { label: 'A', value: 'a', input: 'radio' }],
        rows: [{ value: 'r', cells: ['R', ''] }],
      },
    }
    const editor = editorWith('matrix-clone', [matrix])
    await flush()
    const copy = editor.fields.get('m').clone()
    await flush()
    assert.ok(visibleHint(editor.fields.get('m')), 'original shows the hint')
    assert.ok(visibleHint(copy), 'clone shows the hint')
  })
})
