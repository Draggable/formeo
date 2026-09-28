import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { Components } from './index.js'

const oneField = () => ({
  id: 'form-e',
  stages: { 'stage-e': { id: 'stage-e', children: ['row-e'] } },
  rows: { 'row-e': { id: 'row-e', config: {}, children: ['col-e'] } },
  columns: { 'col-e': { id: 'col-e', config: { width: '100%' }, children: ['field-e'] } },
  fields: { 'field-e': { id: 'field-e', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } } },
})

const cleanup = []
afterEach(() => {
  for (const fn of cleanup.splice(0)) {
    fn()
  }
})

const setup = callbacks => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load(oneField())
  const stage = components.stages.get('stage-e')
  document.body.appendChild(stage.dom)
  cleanup.push(() => stage.dom.remove())
  return { components, field: components.fields.get('field-e'), row: components.rows.get('row-e') }
}

describe('edit panel events (#316)', () => {
  it('onEditOpen and onEditClose fire when a field panel opens and closes', () => {
    const onEditOpen = mock.fn()
    const onEditClose = mock.fn()
    const { field } = setup({ onEditOpen, onEditClose })
    field.dom.querySelector('.field-actions .edit-toggle').click()
    assert.equal(onEditOpen.mock.callCount(), 1)
    const [evt] = onEditOpen.mock.calls[0].arguments
    assert.equal(evt.type, 'formeoEditOpened')
    assert.deepEqual(evt.detail, { component: field, componentType: 'field', componentId: 'field-e' })
    field.dom.querySelector('.field-actions .edit-toggle').click()
    assert.equal(onEditClose.mock.callCount(), 1)
    assert.equal(onEditClose.mock.calls[0].arguments[0].type, 'formeoEditClosed')
  })

  it('fires for rows too', () => {
    const onEditOpen = mock.fn()
    const { row } = setup({ onEditOpen })
    row.toggleEdit(true)
    assert.equal(onEditOpen.mock.calls[0].arguments[0].detail.componentType, 'row')
  })

  it('fires nothing when the panel is already in that state', () => {
    const onEditOpen = mock.fn()
    const onEditClose = mock.fn()
    const { field } = setup({ onEditOpen, onEditClose })
    field.toggleEdit(false)
    field.toggleEdit(true)
    field.toggleEdit(true)
    assert.equal(onEditOpen.mock.callCount(), 1)
    assert.equal(onEditClose.mock.callCount(), 0)
  })

  it('dispatches formeoEditOpened from the component, bubbling to document', () => {
    const seen = []
    const listener = evt => seen.push(evt)
    document.addEventListener('formeoEditOpened', listener)
    cleanup.push(() => document.removeEventListener('formeoEditOpened', listener))
    const { field } = setup({})
    field.toggleEdit(true)
    assert.equal(seen.length, 1)
    assert.equal(seen[0].target, field.dom)
    assert.equal(seen[0].detail.componentId, 'field-e')
  })

  it('still calls the callbacks with bubbles: false', () => {
    const onEditOpen = mock.fn()
    const { field } = setup({ bubbles: false, onEditOpen })
    field.toggleEdit(true)
    assert.equal(onEditOpen.mock.callCount(), 1)
  })
})
