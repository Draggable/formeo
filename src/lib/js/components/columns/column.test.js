import { strict as assert } from 'node:assert'
import { afterEach, before, describe, it } from 'node:test'
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

const mounted = []
const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))

const editorWith = ({ config = {}, column, form } = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  editorComponents.load(form ?? formWithColumn(column))
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

  describe('with its edit button disabled', () => {
    afterEach(() => {
      for (const node of mounted.splice(0)) {
        node.remove()
      }
    })

    it("leaves its field's edit button alone", async () => {
      const form = formWithColumn({ children: ['f-1'] })
      form.fields['f-1'] = {
        id: 'f-1',
        tag: 'input',
        attrs: { type: 'text' },
        config: { label: 'Name', controlId: 'text-input' },
        meta: { id: 'text-input' },
      }
      const config = {
        columns: { all: { actionButtons: { disabled: ['edit'] }, panels: { disabled: ['attrs'] } } },
      }
      const editorComponents = editorWith({ config, form })
      const stageDom = editorComponents.stages.get('s-1').dom
      document.body.appendChild(stageDom)
      mounted.push(stageDom)
      await nextFrames()
      const column = columnOf(editorComponents)
      assert.equal(column.dom.querySelector('.column-actions .edit-toggle'), null)
      assert.ok(column.dom.querySelector('.field-actions .edit-toggle'))
    })
  })
})
