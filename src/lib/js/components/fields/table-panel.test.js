import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { defaultTable } from '../../common/table.mjs'
import { configOptionsOf } from '../edit-panel/config-options.mjs'
import { Components } from '../index.js'
import Field from './field.js'
import { TablePanel } from './table-panel.js'

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
      assert.equal(field.tablePanel, undefined)
      assert.equal(field.editPanels.get('table') instanceof TablePanel, false)
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

  it('keeps the full Config panel for a custom control with the table id but no table data (#349 workaround)', () => {
    const data = {
      id: 'f-old',
      tag: 'table',
      content: ['<tr><td>x</td></tr>'],
      config: { label: 'Table', controlId: 'table' },
    }
    const keys = [...configOptionsOf(new Field(data, editor()).config).keys()]
    for (const key of ['label', 'hideLabel', 'helpText', 'labelPosition', 'tooltip', 'disableHtmlLabel']) {
      assert.ok(keys.includes(key), key)
    }
  })

  it('restricts the Config panel by table data, whatever the control id', () => {
    const data = tableData(defaultTable(), 'f-mine')
    data.config.controlId = 'my-table'
    assert.deepEqual([...configOptionsOf(new Field(data, editor()).config).keys()], ['label'])
  })

  it('shows no label on the stage for a table saved with hideLabel false', () => {
    const data = tableData()
    data.config.hideLabel = false
    const field = new Field(data, editor())
    assert.ok(!field.label)
    assert.equal(field.dom.querySelector('.prev-label'), null)
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
    const input = panel.querySelector('[data-header-column="3"]')
    assert.equal(document.activeElement, input)
    assert.equal(input.value, 'Column 4')
    assert.equal(input.selectionStart, 0)
    assert.equal(input.selectionEnd, input.value.length)
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

const matrixTable = () => ({
  caption: '',
  headerRow: true,
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Good', value: 'good', input: 'radio' },
    { label: 'Comment', value: 'comment', input: 'text' },
  ],
  rows: [
    { value: 'speed', cells: ['Speed', '', '', ''] },
    { value: 'price', cells: ['Price', '', '', ''] },
  ],
})
const change = (input, value) => {
  if (input.type === 'checkbox') {
    input.checked = value
  } else {
    input.value = value
  }
  input.dispatchEvent(new window.Event('change', { bubbles: true }))
}

describe('Table panel: input columns (#349 phase 2)', () => {
  it('offers a type select per column, except column 0 under row headers', () => {
    const panel = mountPanel(tableField(matrixTable()))
    const selects = [...panel.querySelectorAll('[data-column-input]')]
    assert.deepEqual(
      selects.map(select => select.dataset.columnInput),
      ['1', '2', '3']
    )
    assert.deepEqual(
      selects.map(select => select.value),
      ['radio', 'radio', 'text']
    )
    assert.deepEqual(
      selects.map(select => select.getAttribute('aria-label')),
      ['Column 2 input', 'Column 3 input', 'Column 4 input']
    )
    assert.deepEqual(
      [...selects[0].options].map(option => [option.value, option.textContent]),
      [
        ['', 'Static text'],
        ['text', 'Text field'],
        ['radio', 'Radio'],
        ['checkbox', 'Checkbox'],
      ]
    )
  })

  it('a display table gets a type select per column, and no value or required controls', () => {
    const panel = mountPanel(tableField())
    assert.equal(panel.querySelectorAll('[data-column-input]').length, 3)
    assert.equal(panel.querySelectorAll('[data-column-value], [data-row-value], [data-row-required]').length, 0)
    assert.equal(panel.querySelector('[data-table-option="headerRow"]').disabled, false)
  })

  it('choosing a type makes an input column, keys the table and keeps focus on the select', () => {
    const field = tableField()
    const panel = mountPanel(field)
    change(panel.querySelector('[data-column-input="1"]'), 'radio')
    const table = field.get('table')
    assert.equal(table.columns[1].input, 'radio')
    assert.equal(table.columns[1].value, 'column-2')
    assert.equal('value' in table.columns[0], false)
    assert.deepEqual(
      table.rows.map(row => row.value),
      ['row-1', 'row-2']
    )
    assert.equal(document.activeElement, panel.querySelector('[data-column-input="1"]'))
    assert.equal(panel.querySelector('[data-row="0"][data-column="1"]'), null)
    const glyph = panel.querySelector('[data-cell-glyph="radio"]')
    assert.equal(glyph.getAttribute('aria-hidden'), 'true')
    assert.equal(glyph.closest('td').querySelector('input, select, button, [tabindex]'), null)
    assert.equal(field.preview.querySelectorAll('input[type="radio"]').length, 2)
  })

  it('an input column with an empty label gets a default one', () => {
    const table = defaultTable()
    table.columns[1].label = ''
    const field = tableField(table)
    change(mountPanel(field).querySelector('[data-column-input="1"]'), 'text')
    assert.equal(field.get('table').columns[1].label, 'Column 2')
  })

  it('switching every input column back to static leaves a display table', () => {
    const field = tableField(matrixTable())
    const panel = mountPanel(field)
    for (const c of ['1', '2', '3']) {
      change(panel.querySelector(`[data-column-input="${c}"]`), '')
    }
    assert.equal(panel.querySelectorAll('[data-row-value], [data-row-required]').length, 0)
    assert.equal(field.preview.querySelectorAll('input').length, 0)
  })

  it('labels the value and required controls by their row or column', () => {
    const panel = mountPanel(tableField(matrixTable()))
    assert.deepEqual(labelsOf(panel, '[data-column-value]'), ['Column 2 value', 'Column 3 value', 'Column 4 value'])
    assert.deepEqual(labelsOf(panel, '[data-row-value]'), ['Row 1 value', 'Row 2 value'])
    assert.deepEqual(labelsOf(panel, '[data-row-required]'), ['Row 1 required', 'Row 2 required'])
    assert.equal(panel.querySelector('[data-row-value="0"]').placeholder, 'Value')
    assert.equal(panel.querySelector('[data-row-required="0"]').closest('label').textContent, 'Required')
  })

  it('typing a value saves it as typed without rebuilding; committing fixes blanks and duplicates in place', () => {
    const field = tableField(matrixTable())
    const panel = mountPanel(field)
    const value = panel.querySelector('[data-column-value="2"]')
    typeInto(value, 'poor')
    assert.equal(field.get('table').columns[2].value, 'poor')
    assert.equal(panel.querySelector('[data-column-value="2"]'), value)
    change(value, 'poor')
    assert.equal(field.get('table').columns[2].value, 'column-3')
    assert.equal(value.value, 'column-3')
    assert.equal(panel.querySelector('[data-column-value="2"]'), value)
    const rowValue = panel.querySelector('[data-row-value="1"]')
    typeInto(rowValue, ' a[b] ')
    change(rowValue, ' a[b] ')
    assert.equal(rowValue.value, 'a-b-')
  })

  it('the Required checkbox marks the row required and refreshes the preview', () => {
    const field = tableField(matrixTable())
    const panel = mountPanel(field)
    change(panel.querySelector('[data-row-required="1"]'), true)
    assert.equal(field.get('table').rows[1].required, true)
    assert.ok([...field.preview.querySelectorAll('tbody tr:nth-child(2) input')].every(input => input.required))
    change(panel.querySelector('[data-row-required="1"]'), false)
    assert.equal('required' in field.get('table').rows[1], false)
  })

  it('locks Header row on while the table has inputs, and says why', () => {
    const field = tableField({ ...matrixTable(), headerRow: false })
    const panel = mountPanel(field)
    const headerRow = panel.querySelector('[data-table-option="headerRow"]')
    assert.equal(headerRow.checked, true)
    assert.equal(headerRow.disabled, true)
    const hint = panel.querySelector(`#${headerRow.getAttribute('aria-describedby')}`)
    assert.equal(hint.textContent, 'Input columns need a header row')
    assert.equal(hint.id, 'f-tbl-header-row-hint')
  })

  it('turning Row headers on clears column 0 input and drops its type select', () => {
    const table = { ...matrixTable(), rowHeaders: false }
    table.columns[0] = { label: 'Pick', value: 'pick', input: 'checkbox' }
    const field = tableField(table)
    const panel = mountPanel(field)
    assert.ok(panel.querySelector('[data-column-input="0"]'))
    panel.querySelector('[data-table-option="rowHeaders"]').click()
    assert.equal('input' in field.get('table').columns[0], false)
    assert.equal(panel.querySelector('[data-column-input="0"]'), null)
    assert.equal(document.activeElement, panel.querySelector('[data-table-option="rowHeaders"]'))
  })

  it('adding a row to a matrix keys it and focuses its first editable control', () => {
    const field = tableField(matrixTable())
    const panel = mountPanel(field)
    panel.querySelector('[data-table-add="row"]').click()
    assert.equal(field.get('table').rows[2].value, 'row-3')
    assert.equal(document.activeElement, panel.querySelector('[data-row="2"][data-column="0"]'))
  })

  it('adding a row whose only cells are inputs focuses its value input', () => {
    const table = { ...matrixTable(), rowHeaders: false, columns: matrixTable().columns.slice(1) }
    table.rows = table.rows.map(row => ({ ...row, cells: row.cells.slice(1) }))
    const panel = mountPanel(tableField(table))
    panel.querySelector('[data-table-add="row"]').click()
    assert.equal(document.activeElement, panel.querySelector('[data-row-value="2"]'))
  })

  it('a new column in a matrix starts static and unkeyed', () => {
    const field = tableField(matrixTable())
    mountPanel(field).querySelector('[data-table-add="column"]').click()
    const added = field.get('table').columns.at(-1)
    assert.equal(added.input, undefined)
    assert.equal(added.value, undefined)
  })

  it('preview events from inside a table never touch options or attrs.value', () => {
    const field = tableField(matrixTable())
    const radio = field.preview.querySelector('input[type="radio"]')
    const text = field.preview.querySelector('input[type="text"]')
    // jsdom reports a throwing listener to window instead of rethrowing it from dispatchEvent
    const errors = []
    const onError = evt => {
      evt.preventDefault()
      errors.push(evt.error ?? evt.message)
    }
    window.addEventListener('error', onError)
    try {
      radio.checked = true
      radio.dispatchEvent(new window.Event('change', { bubbles: true }))
      typeInto(text, 'typed')
    } finally {
      window.removeEventListener('error', onError)
    }
    assert.deepEqual(errors, [])
    assert.equal(field.get('options'), undefined)
    assert.equal(field.get('attrs.value'), undefined)
  })

  it('two editors edit their own matrices', () => {
    const first = tableField(matrixTable(), editor())
    const second = tableField(matrixTable(), editor())
    change(mountPanel(first).querySelector('[data-column-input="3"]'), 'checkbox')
    assert.equal(first.get('table').columns[3].input, 'checkbox')
    assert.equal(second.get('table').columns[3].input, 'text')
  })
})

const orderTable = (repeat = { min: 1, max: null }) => ({
  ...matrixTable(),
  repeat,
  rows: [
    { cells: ['Item', '', '', ''], required: true },
    { value: 'kept', cells: ['Kept', '', '', ''] },
  ],
})

describe('Table panel: repeating rows (#349 phase 3)', () => {
  it('locks Repeating rows off without an input column, and says why', () => {
    const field = tableField()
    const panel = mountPanel(field)
    const toggle = panel.querySelector('[data-table-option="repeat"]')
    assert.equal(toggle.disabled, true)
    assert.equal(toggle.checked, false)
    const hint = panel.querySelector(`#${toggle.getAttribute('aria-describedby')}`)
    assert.equal(hint.textContent, 'Repeating rows need an input column')
    assert.equal(toggle.parentElement.textContent, 'Repeating rows')
  })

  it('turning it on stores min 1, shows only the template row, and keeps focus on the toggle', () => {
    const field = tableField(matrixTable())
    const panel = mountPanel(field)
    change(panel.querySelector('[data-table-option="repeat"]'), true)
    assert.deepEqual(field.get('table').repeat, { min: 1, max: null })
    assert.equal(panel.querySelectorAll('tbody tr').length, 1)
    assert.equal(document.activeElement, panel.querySelector('[data-table-option="repeat"]'))
    assert.equal(panel.querySelector('[data-table-add="row"]'), null)
    assert.ok(panel.querySelector('[data-table-add="column"]'))
    assert.equal(panel.querySelectorAll('[data-row-value], [data-remove-row]').length, 0)
  })

  it('turning it off removes repeat and shows every row again', () => {
    const field = tableField(orderTable())
    const panel = mountPanel(field)
    change(panel.querySelector('[data-table-option="repeat"]'), false)
    assert.equal('repeat' in field.get('table'), false)
    assert.equal(panel.querySelectorAll('tbody tr').length, 2)
    assert.equal(panel.querySelector('[data-repeat-limit]'), null)
  })

  it('names the template Required checkbox for every row', () => {
    const panel = mountPanel(tableField(orderTable()))
    const required = panel.querySelector('[data-row-required="0"]')
    assert.equal(required.getAttribute('aria-label'), 'Every row required')
    assert.equal(required.checked, true)
  })

  it('shows Min and Max inputs, and normalises them on commit without rebuilding', () => {
    const field = tableField(orderTable({ min: 2, max: 5 }))
    const panel = mountPanel(field)
    const min = panel.querySelector('[data-repeat-limit="min"]')
    const max = panel.querySelector('[data-repeat-limit="max"]')
    assert.equal(min.type, 'number')
    assert.equal(min.value, '2')
    assert.equal(max.value, '5')
    assert.equal(max.placeholder, 'No limit')
    assert.equal(min.parentElement.textContent, 'Minimum rows')
    assert.equal(max.parentElement.textContent, 'Maximum rows')

    min.value = '6'
    change(min, '6')
    assert.deepEqual(field.get('table').repeat, { min: 6, max: 6 })
    assert.equal(max.value, '6', 'written back in place')
    assert.equal(panel.querySelector('[data-repeat-limit="min"]'), min, 'no rebuild')

    change(max, '')
    assert.deepEqual(field.get('table').repeat, { min: 6, max: null })
    change(min, '0')
    assert.equal(min.value, '0', 'a zero minimum shows as 0, not blank')
    change(min, '1.5')
    assert.deepEqual(field.get('table').repeat, { min: 1, max: null })
    assert.equal(min.value, '1')
  })

  it('a table that lost its last input column while repeating shows the toggle checked and locked', () => {
    const table = { ...orderTable(), columns: orderTable().columns.map(({ label }) => ({ label })) }
    const panel = mountPanel(tableField(table))
    const toggle = panel.querySelector('[data-table-option="repeat"]')
    assert.equal(toggle.checked, true)
    assert.equal(toggle.disabled, true)
  })

  it('the stage preview shows the template numbered', () => {
    const field = tableField(orderTable({ min: 2 }))
    const rows = field.preview.querySelectorAll('tbody tr')
    assert.equal(rows.length, 2)
    assert.equal(rows[1].querySelector('th').firstChild.textContent, 'Item 2')
  })

  it('a repeating table imported with no rows stores the template row its edits change', () => {
    const field = tableField({ ...orderTable(), rows: [] })
    const panel = mountPanel(field)
    typeInto(panel.querySelector('[data-row="0"][data-column="0"]'), 'Line')
    assert.deepEqual(field.get('table').rows, [{ cells: ['Line', '', '', ''] }])
    change(panel.querySelector('[data-row-required="0"]'), true)
    assert.deepEqual(field.get('table').rows, [{ cells: ['Line', '', '', ''], required: true }])
  })

  it('turning repeat on for a table with no rows stores the template row', () => {
    const field = tableField({ ...matrixTable(), rows: [] })
    const panel = mountPanel(field)
    change(panel.querySelector('[data-table-option="repeat"]'), true)
    assert.equal(field.get('table').rows.length, 1)
    change(panel.querySelector('[data-row-required="0"]'), true)
    assert.equal(field.get('table').rows[0].required, true)
  })

  it('a phase 2 matrix panel is unchanged apart from the new toggle', () => {
    const panel = mountPanel(tableField(matrixTable()))
    assert.equal(panel.querySelector('[data-table-option="repeat"]').checked, false)
    assert.ok(panel.querySelector('[data-table-add="row"]'))
    assert.equal(panel.querySelectorAll('[data-row-value]').length, matrixTable().rows.length)
  })
})
