import { strict as assert } from 'node:assert'
import { before, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'

const formWithColumn = (column = {}) => ({
  id: 'form-col',
  stages: { 's-1': { id: 's-1', children: ['r-1'] } },
  rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: [], ...column } },
  fields: {},
})

const editorWith = ({ config = {}, column } = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  editorComponents.load(formWithColumn(column))
  return editorComponents
}

const columnOf = editorComponents => editorComponents.columns.get('c-1')

describe('Column edit panel (#112)', () => {
  before(() => {
    i18n.current ??= {}
  })

  it('has an edit button and an Attributes panel in its column-edit window', () => {
    const column = columnOf(editorWith())
    assert.ok(column.dom.querySelector('.column-actions .edit-toggle'))
    assert.deepEqual([...column.editPanels.keys()], ['attrs'])
    assert.ok(column.dom.querySelector('.column-edit .attrs-panel'))
  })

  it('actionButtons.disabled edit restores the old column buttons', () => {
    const column = columnOf(editorWith({ config: { columns: { all: { actionButtons: { disabled: ['edit'] } } } } }))
    assert.equal(column.dom.querySelector('.column-actions .edit-toggle'), null)
  })

  it('the edit button opens the column edit window', () => {
    const column = columnOf(editorWith())
    column.toggleEdit(true)
    assert.ok(column.dom.classList.contains('editing-column'))
  })

  it('adding an attribute saves it on the column', () => {
    const editorComponents = editorWith()
    columnOf(editorComponents).editPanels.get('attrs').addAttribute('aria-label', 'Left')
    assert.equal(editorComponents.formData.columns['c-1'].attrs['aria-label'], 'Left')
  })

  it('id and tag are reserved; style is not', () => {
    const column = columnOf(editorWith())
    const panel = column.editPanels.get('attrs')
    for (const name of ['id', 'tag']) {
      assert.equal(column.isDisabledProp(`attrs.${name}`), true, name)
      panel.addAttribute(name, 'x')
      assert.equal(column.get(`attrs.${name}`), undefined, name)
    }
    assert.equal(column.isDisabledProp('attrs.style'), false)
  })

  it('a column without attributes saves no attrs key', () => {
    assert.equal(Object.hasOwn(editorWith().formData.columns['c-1'], 'attrs'), false)
  })

  it('a column keeps its width', () => {
    const column = columnOf(editorWith({ column: { config: { width: '40%' } } }))
    assert.equal(column.dom.style.width, '40%')
  })
})
