import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import events from '../common/events.js'
import Columns from './columns/index.js'
import Fields from './fields/index.js'
import Components from './index.js'
import Rows from './rows/index.js'

const formData = {
  id: 'form-added-events',
  stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
  rows: { 'row-1': { id: 'row-1', config: {}, children: ['col-1'] } },
  columns: { 'col-1': { id: 'col-1', config: { width: '100%' }, children: ['field-1'] } },
  fields: { 'field-1': { id: 'field-1', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } } },
}

describe('ComponentData added events', () => {
  afterEach(() => {
    events.init({})
  })

  it('calls onAddRow, onAddColumn and onAddField when a store adds a component', () => {
    const callbacks = { onAddRow: mock.fn(), onAddColumn: mock.fn(), onAddField: mock.fn() }
    events.init(callbacks)

    const row = Rows.add()
    Columns.add()
    Fields.add(null, { tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } })

    assert.equal(callbacks.onAddRow.mock.callCount(), 1)
    assert.equal(callbacks.onAddColumn.mock.callCount(), 1)
    assert.equal(callbacks.onAddField.mock.callCount(), 1)
    const [{ detail }] = callbacks.onAddRow.mock.calls[0].arguments
    assert.equal(detail.componentId, row.id)
    assert.equal(detail.componentType, 'row')
  })

  it('does not report components loaded from formData as added', () => {
    const onAdd = mock.fn()
    events.init({ onAdd })

    Components.load(formData, {})

    assert.equal(onAdd.mock.callCount(), 0)
  })
})
