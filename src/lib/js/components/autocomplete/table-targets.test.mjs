import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import Autocomplete from './autocomplete.mjs'
import { componentOptions, HIGHLIGHT_CLASSNAME, tableAddressLabel } from './helpers.mjs'

const matrix = () => ({
  caption: '',
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Note', value: 'note' },
    { label: '', value: 'c', input: 'text' },
  ],
  rows: [
    { value: 'speed', cells: ['Speed', '', 'n', ''] },
    { value: 'price', cells: ['', '', 'n', ''] },
  ],
})

const editorWith = fields => {
  const events = new Events().init({})
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load({
    id: 'form-m',
    stages: { 's-1': { id: 's-1', config: {}, children: ['r-1'] } },
    rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
    columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: Object.keys(fields) } },
    fields,
  })
  return components
}
const tableFieldData = (id, table) => ({
  [id]: { id, tag: 'table', attrs: {}, config: { label: 'Survey', hideLabel: true }, table },
})

const tableItems = (components, key = 'if.condition.source') =>
  componentOptions({ components, key, value: '' })
    .flatMap(item => [...item.querySelectorAll('.component-type-table-row, .component-type-table-cell')])
    .map(item => ({
      value: item.dataset.value,
      label: item.dataset.label,
      depth1: item.classList.contains('f-autocomplete-list-item-depth-1'),
    }))

describe('condition picker: matrix rows and cells (#349 phase 2)', () => {
  it('lists each row, then its input cells, under a matrix field', () => {
    assert.deepEqual(tableItems(editorWith(tableFieldData('m1', matrix()))), [
      { value: 'fields.m1.table.rows[0]', label: 'Speed', depth1: true },
      { value: 'fields.m1.table.rows[0].cells[1]', label: 'Speed \u203a Poor', depth1: false },
      { value: 'fields.m1.table.rows[0].cells[3]', label: 'Speed \u203a Column 4', depth1: false },
      { value: 'fields.m1.table.rows[1]', label: 'Row 2', depth1: true },
      { value: 'fields.m1.table.rows[1].cells[1]', label: 'Row 2 \u203a Poor', depth1: false },
      { value: 'fields.m1.table.rows[1].cells[3]', label: 'Row 2 \u203a Column 4', depth1: false },
    ])
  })

  it('lists nothing under a display table', () => {
    const display = { columns: [{ label: 'A' }], rows: [{ cells: ['x'] }] }
    assert.deepEqual(tableItems(editorWith(tableFieldData('t1', display))), [])
  })

  it('names stored row and cell addresses by their row and column', () => {
    const components = editorWith(tableFieldData('m1', matrix()))
    assert.equal(tableAddressLabel('fields.m1.table.rows[0]', components), 'Speed')
    assert.equal(tableAddressLabel('fields.m1.table.rows[1].cells[1]', components), 'Row 2 \u203a Poor')
    assert.equal(tableAddressLabel('fields.m1.table.rows[7]', components), null)
    assert.equal(tableAddressLabel('fields.m1', components), null)
    const autocomplete = new Autocomplete({
      key: 'if.condition.source',
      value: 'fields.m1.table.rows[0].cells[1]',
      components,
    })
    assert.equal(autocomplete.label, 'Speed \u203a Poor')
  })

  it('highlights the row or cell in the stage preview', () => {
    const components = editorWith(tableFieldData('m1', matrix()))
    const autocomplete = new Autocomplete({ key: 'if.condition.source', value: '', components })
    const field = components.getAddress('fields.m1')
    autocomplete.highlightComponent({ dataset: { value: 'fields.m1.table.rows[1].cells[3]' } })
    const cell = field.preview.querySelectorAll('tbody tr')[1].children[3]
    assert.equal(cell.classList.contains(HIGHLIGHT_CLASSNAME), true)
    autocomplete.removeHighlight()
    autocomplete.highlightComponent({ dataset: { value: 'fields.m1.table.rows[0]' } })
    assert.equal(field.preview.querySelector('tbody tr').classList.contains(HIGHLIGHT_CLASSNAME), true)
  })

  it('clears every highlight: the field and its row or cell alike', () => {
    const components = editorWith(tableFieldData('m1', matrix()))
    const autocomplete = new Autocomplete({ key: 'if.condition.source', value: '', components })
    const field = components.getAddress('fields.m1')
    document.body.append(field.dom)
    try {
      for (const value of ['fields.m1.table.rows[1].cells[3]', 'fields.m1.table.rows[0]']) {
        autocomplete.highlightComponent({ dataset: { value } })
        assert.equal(document.getElementsByClassName(HIGHLIGHT_CLASSNAME).length, 2)
        autocomplete.removeHighlight()
        assert.equal(document.getElementsByClassName(HIGHLIGHT_CLASSNAME).length, 0)
      }
    } finally {
      field.dom.remove()
    }
  })
})
