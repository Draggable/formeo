import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { defaultTable } from '../../common/table.mjs'
import { configOptionsOf } from '../edit-panel/config-options.mjs'
import { Components } from '../index.js'
import Field from './field.js'

const editor = (config = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  editorComponents.load({ id: 'form-tbl', stages: { 's-1': { id: 's-1', config: {}, children: [] } } })
  return editorComponents
}

const tableData = (table = defaultTable(), id = 'f-tbl') => ({
  id,
  tag: 'table',
  attrs: { className: '' },
  config: { label: 'Table', hideLabel: true, controlId: 'table' },
  table,
})

const tableField = (table, components = editor()) => new Field(tableData(table), components)

/** Mounts the field's Table panel so focus and clicks work in jsdom */
const mountPanel = field => {
  document.body.replaceChildren(field.tablePanel.element)
  return field.tablePanel.element
}
const typeInto = (input, value) => {
  input.value = value
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const labelsOf = (panel, selector) => [...panel.querySelectorAll(selector)].map(el => el.getAttribute('aria-label'))

afterEach(() => document.body.replaceChildren())

describe('Table panel (#349)', () => {
  it('a table field gets a Table panel first, before Attributes', () => {
    const field = tableField()
    const panels = [...field.editPanels.keys()]
    assert.equal(panels[0], 'table')
    assert.ok(panels.includes('attrs'))
  })

  it('a field without table data gets no Table panel', () => {
    const field = new Field({ id: 'f-txt', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } }, editor())
    assert.equal(field.editPanels.has('table'), false)
    assert.equal(field.tablePanel, undefined)
  })

  it('table data that is not an object gets no Table panel', () => {
    for (const table of [[], 'yes']) {
      const field = tableField(table)
      assert.equal(field.editPanels.has('table'), false)
      assert.equal(field.tablePanel, undefined)
    }
  })

  it('panels.disabled table hides it', () => {
    const field = tableField(defaultTable(), editor({ fields: { all: { panels: { disabled: ['table'] } } } }))
    assert.equal(field.editPanels.has('table'), false)
  })

  it("its Config panel offers only the label, since the caption is the table's visible name", () => {
    const field = tableField()
    assert.deepEqual([...configOptionsOf(field.config).keys()], ['label'])
  })

  it('sits inside the field edit window once the panels render', async () => {
    const field = tableField()
    document.body.replaceChildren(field.dom)
    await wait(50)
    assert.ok(field.dom.querySelector('.field-edit .table-panel .f-table-panel [data-table-caption]'))
  })

  it('labels every header and cell input by its position', () => {
    const panel = mountPanel(tableField())
    assert.deepEqual(labelsOf(panel, '[data-header-column]'), ['Column 1 header', 'Column 2 header', 'Column 3 header'])
    assert.equal(labelsOf(panel, '[data-row][data-column]')[4], 'Row 2, column 2')
    assert.deepEqual(labelsOf(panel, '[data-remove-row]'), ['Remove row 1', 'Remove row 2'])
    assert.equal(panel.querySelector('[data-table-option="headerRow"]').checked, true)
    assert.equal(panel.querySelector('[data-table-option="rowHeaders"]').checked, false)
  })

  it('typing in a cell saves it without rebuilding the grid, then refreshes the preview', async () => {
    const field = tableField()
    const panel = mountPanel(field)
    const cell = panel.querySelector('[data-row="0"][data-column="1"]')
    typeInto(cell, '9–5')
    assert.equal(field.get('table').rows[0].cells[1], '9–5')
    assert.equal(cell.isConnected, true)
    await wait(250)
    assert.equal(field.preview.querySelector('tbody tr td:nth-child(2)').textContent, '9–5')
  })

  it('typing a caption or header label saves it', () => {
    const field = tableField()
    const panel = mountPanel(field)
    typeInto(panel.querySelector('[data-table-caption]'), 'Opening hours')
    typeInto(panel.querySelector('[data-header-column="0"]'), 'Day')
    assert.equal(field.get('table').caption, 'Opening hours')
    assert.equal(field.get('table').columns[0].label, 'Day')
  })

  it('+ Row appends a row and focuses its first cell', () => {
    const field = tableField()
    const panel = mountPanel(field)
    panel.querySelector('[data-table-add="row"]').click()
    assert.equal(field.get('table').rows.length, 3)
    assert.equal(document.activeElement, panel.querySelector('[data-row="2"][data-column="0"]'))
    assert.equal(field.preview.querySelectorAll('tbody tr').length, 3)
  })

  it('+ Column adds a labelled column and a cell to every row, and focuses its header input', () => {
    const field = tableField()
    const panel = mountPanel(field)
    panel.querySelector('[data-table-add="column"]').click()
    const table = field.get('table')
    assert.equal(table.columns[3].label, 'Column 4')
    assert.deepEqual(
      table.rows.map(row => row.cells.length),
      [4, 4]
    )
    assert.equal(document.activeElement, panel.querySelector('[data-header-column="3"]'))
  })

  it('+ Column without a header row focuses the new column in the first row', () => {
    const panel = mountPanel(tableField({ ...defaultTable(), headerRow: false }))
    panel.querySelector('[data-table-add="column"]').click()
    assert.equal(document.activeElement, panel.querySelector('[data-row="0"][data-column="3"]'))
  })

  it('removing a row focuses the remove button now at that index, or the previous one', () => {
    const field = tableField({ ...defaultTable(), rows: [{ cells: ['a'] }, { cells: ['b'] }, { cells: ['c'] }] })
    const panel = mountPanel(field)
    panel.querySelector('[data-remove-row="1"]').click()
    assert.deepEqual(
      field.get('table').rows.map(row => row.cells[0]),
      ['a', 'c']
    )
    assert.equal(document.activeElement, panel.querySelector('[data-remove-row="1"]'))
    panel.querySelector('[data-remove-row="1"]').click()
    assert.equal(document.activeElement, panel.querySelector('[data-table-add="row"]'))
  })

  it('removing a column removes its cells', () => {
    const field = tableField({ columns: [{ label: 'A' }, { label: 'B' }], rows: [{ cells: ['1', '2'] }] })
    const panel = mountPanel(field)
    panel.querySelector('[data-remove-column="0"]').click()
    assert.deepEqual(field.get('table').columns, [{ label: 'B' }])
    assert.deepEqual(field.get('table').rows, [{ cells: ['2'] }])
    assert.equal(document.activeElement, panel.querySelector('[data-table-add="column"]'))
  })

  it('the last row and column cannot be removed', () => {
    const field = tableField({ columns: [{ label: 'A' }], rows: [{ cells: ['1'] }] })
    const panel = mountPanel(field)
    const removeRow = panel.querySelector('[data-remove-row="0"]')
    const removeColumn = panel.querySelector('[data-remove-column="0"]')
    assert.equal(removeRow.disabled, true)
    assert.equal(removeColumn.disabled, true)
    removeRow.click()
    removeColumn.click()
    assert.deepEqual(field.get('table').rows, [{ cells: ['1'] }])
    assert.deepEqual(field.get('table').columns, [{ label: 'A' }])
  })

  it('turning the header row off keeps the labels and a remove button per column, and keeps focus on the toggle', () => {
    const field = tableField()
    const panel = mountPanel(field)
    const toggle = panel.querySelector('[data-table-option="headerRow"]')
    toggle.click()
    assert.equal(field.get('table').headerRow, false)
    assert.equal(field.get('table').columns[2].label, 'Column 3')
    assert.equal(panel.querySelectorAll('[data-header-column]').length, 0)
    assert.equal(panel.querySelectorAll('[data-remove-column]').length, 3)
    assert.equal(document.activeElement, panel.querySelector('[data-table-option="headerRow"]'))
    assert.equal(field.preview.querySelector('thead'), null)
    panel.querySelector('[data-table-option="headerRow"]').click()
    assert.equal(labelsOf(panel, '[data-header-column]').length, 3)
    assert.equal(panel.querySelector('[data-header-column="2"]').value, 'Column 3')
  })

  it('the row headers toggle updates the preview', () => {
    const field = tableField()
    const panel = mountPanel(field)
    panel.querySelector('[data-table-option="rowHeaders"]').click()
    assert.equal(field.get('table').rowHeaders, true)
    assert.equal(field.preview.querySelectorAll('tbody th').length, 2)
  })

  it('the stage preview is the table without a region role or tab stop', () => {
    const wrap = tableField().preview.querySelector('.f-table-wrap')
    assert.ok(wrap.querySelector('table.f-table'))
    assert.equal(wrap.hasAttribute('role'), false)
    assert.equal(wrap.hasAttribute('tabindex'), false)
  })

  it('a loaded table saves back unchanged', () => {
    const table = {
      caption: 'Hours',
      headerRow: false,
      rowHeaders: true,
      columns: [{ label: 'Day' }, { label: 'Open' }],
      rows: [{ cells: ['Mon', '9–5'] }],
    }
    const components = editor()
    components.load({
      id: 'form-rt',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['f-rt'] } },
      fields: { 'f-rt': tableData(table, 'f-rt') },
    })
    assert.deepEqual(components.formData.fields['f-rt'].table, table)
  })

  it('two editors edit their own tables (#152)', () => {
    const a = tableField(defaultTable(), editor())
    const b = tableField(defaultTable(), editor())
    const panel = mountPanel(a)
    panel.querySelector('[data-table-add="row"]').click()
    typeInto(panel.querySelector('[data-table-caption]'), 'A only')
    assert.equal(a.get('table').rows.length, 3)
    assert.equal(b.get('table').rows.length, 2)
    assert.equal(b.get('table').caption, '')
  })
})
