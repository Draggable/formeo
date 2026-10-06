import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import Autocomplete from './autocomplete.mjs'
import { componentOptions, filterListItems, HIGHLIGHT_CLASSNAME, tableAddressLabel } from './helpers.mjs'

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

describe('condition picker: repeating tables, filtering and keyboard (#349 phase 3)', () => {
  const repeating = () => ({ ...matrix(), repeat: { min: 1 } })

  it('lists no rows or cells for a repeating table, and shows a stored row address raw', () => {
    const components = editorWith(tableFieldData('m1', repeating()))
    assert.deepEqual(tableItems(components), [])
    assert.equal(tableAddressLabel('fields.m1.table.rows[0]', components), null)
  })

  const pickerFor = table => {
    const plain = { t1: { id: 't1', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } } }
    const components = editorWith({ ...tableFieldData('m1', table), ...plain })
    const autocomplete = new Autocomplete({ key: 'if.condition.source', value: '', components })
    autocomplete.updateOptions()
    const { list } = autocomplete
    const item = value => list.querySelector(`li[data-value="${value}"]`)
    const shown = elem => elem.style.display !== 'none'
    return { autocomplete, list, item, shown }
  }

  it('typing a row name keeps that row and its cells', () => {
    const { list, item, shown } = pickerFor(matrix())
    filterListItems(list, 'speed')
    assert.equal(shown(item('fields.m1')), true, 'the field holding the match')
    assert.equal(shown(item('fields.m1.table.rows[0]')), true)
    assert.equal(shown(item('fields.m1.table.rows[0].cells[1]')), true, 'a cell under the matching row')
    assert.equal(shown(item('fields.m1.table.rows[1]')), false)
  })

  it('typing the field name keeps its rows and cells (an ancestor matches)', () => {
    const { list, item, shown } = pickerFor(matrix())
    filterListItems(list, 'survey')
    assert.equal(shown(item('fields.m1')), true)
    assert.equal(shown(item('fields.m1.table.rows[1]')), true)
    assert.equal(shown(item('fields.m1.table.rows[1].cells[3]')), true)
    assert.equal(shown(item('fields.t1')), false)
  })

  it('typing a cell name keeps every row holding one', () => {
    const { list, item, shown } = pickerFor(matrix())
    const left = filterListItems(list, 'poor')
    assert.equal(shown(item('fields.m1')), true, 'the field above the match')
    assert.equal(shown(item('fields.m1.table.rows[0]')), true)
    assert.equal(shown(item('fields.m1.table.rows[1]')), true)
    assert.equal(shown(item('fields.m1.table.rows[0].cells[3]')), false)
    assert.ok(left.includes(item('fields.m1.table.rows[1].cells[1]')))
  })

  it('Right enters a nested list, Left goes back, Up and Down stay on one level', () => {
    const { autocomplete, item } = pickerFor(matrix())
    const active = () => autocomplete.list.querySelector('.active-option')
    autocomplete.selectOption(item('fields.m1'))
    assert.equal(autocomplete.handleKey('ArrowRight'), true)
    assert.equal(active(), item('fields.m1.table.rows[0]'))
    autocomplete.handleKey('ArrowDown')
    assert.equal(active(), item('fields.m1.table.rows[1]'))
    autocomplete.handleKey('ArrowRight')
    assert.equal(active(), item('fields.m1.table.rows[1].cells[1]'))
    autocomplete.handleKey('ArrowDown')
    assert.equal(active(), item('fields.m1.table.rows[1].cells[3]'))
    autocomplete.handleKey('ArrowDown')
    assert.equal(active(), item('fields.m1.table.rows[1].cells[3]'), 'no item below the last cell')
    assert.equal(autocomplete.handleKey('ArrowLeft'), true)
    assert.equal(active(), item('fields.m1.table.rows[1]'))
    autocomplete.handleKey('ArrowLeft')
    assert.equal(active(), item('fields.m1'))
  })

  it('Left and Right leave the caret alone on a top-level item without a nested list', () => {
    const { autocomplete, list, item } = pickerFor(matrix())
    const plain = item('fields.t1')
    autocomplete.selectOption(plain)
    assert.equal(autocomplete.handleKey('ArrowRight'), false)
    assert.equal(autocomplete.handleKey('ArrowLeft'), false)
    assert.equal(list.querySelector('.active-option'), plain)
  })

  it('Left and Right leave the caret alone once the list is hidden', () => {
    const { autocomplete, list, item } = pickerFor(matrix())
    autocomplete.stage = document.createElement('div')
    autocomplete.stage.append(list)
    autocomplete.selectOption(item('fields.m1'))
    autocomplete.hideList()
    assert.equal(autocomplete.handleKey('ArrowRight'), false)
    assert.equal(list.querySelector('.active-option'), item('fields.m1'))
    autocomplete.selectOption(item('fields.m1.table.rows[0]'))
    assert.equal(autocomplete.handleKey('ArrowLeft'), false)
    assert.equal(list.querySelector('.active-option'), item('fields.m1.table.rows[0]'))
  })

  it('field options follow the same filter rule', () => {
    const group = {
      g1: {
        id: 'g1',
        tag: 'input',
        attrs: { type: 'checkbox' },
        config: { label: 'Colours', controlId: 'checkbox' },
        options: [
          { label: 'Red', value: 'red' },
          { label: 'Blue', value: 'blue' },
        ],
      },
    }
    const components = editorWith(group)
    const autocomplete = new Autocomplete({ key: 'if.condition.source', value: '', components })
    autocomplete.updateOptions()
    const { list } = autocomplete
    const item = value => list.querySelector(`li[data-value="${value}"]`)
    const shown = elem => elem.style.display !== 'none'
    assert.ok(item('fields.g1.options[0]'), 'the group lists its options')
    filterListItems(list, 'colours')
    assert.equal(shown(item('fields.g1.options[0]')), true)
    assert.equal(shown(item('fields.g1.options[1]')), true)
    filterListItems(list, 'blue')
    assert.equal(shown(item('fields.g1')), true)
    assert.equal(shown(item('fields.g1.options[1]')), true)
    assert.equal(shown(item('fields.g1.options[0]')), false)
  })
})
