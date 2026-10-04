import dom from '../../common/dom.js'
import {
  addColumn,
  addRow,
  cellInput,
  hasInputs,
  inputColumns,
  normalizeTable,
  removeColumn,
  removeRow,
  setCell,
  setColumnInput,
  setColumnLabel,
  setColumnValue,
  setRowRequired,
  setRowValue,
  setTableOption,
  withKeys,
} from '../../common/table.mjs'
import { tableText } from '../../common/table-text.mjs'
import { PANEL_CLASSNAME } from '../../constants.js'

export const TABLE_PANEL_CLASSNAME = 'table-panel'

// the type select's choices: '' is a static column
const INPUT_CHOICES = [
  ['', 'table.input.static'],
  ['text', 'table.input.text'],
  ['radio', 'table.input.radio'],
  ['checkbox', 'table.input.checkbox'],
]
// what an input column's cells show in the grid; the cell has nothing to edit
const CELL_GLYPHS = { radio: '○', checkbox: '☐', text: '▭' }

/**
 * A table field's Table edit panel (#349): the caption, the header options, a grid of cell inputs and add/remove
 * buttons. Columns can hold radio, checkbox or text inputs (phase 2): each gets a type select, and an input table gets
 * value inputs and per-row Required checkboxes. Typing saves without rebuilding the grid, so focus stays put. Adding
 * or removing a row or column rebuilds the grid and moves focus to the matching control.
 */
export class TablePanel {
  /**
   * @param {Field} field a field with `table` data
   */
  constructor(field) {
    this.field = field
    this.element = dom.create({ className: 'f-table-panel' })
    this.render()
  }

  get table() {
    return normalizeTable(this.field.get('table'))
  }

  /**
   * What Panels builds the tab from. The panel element is kept on this instance, so it survives a panel rebuild.
   * @return {Object} panel config
   */
  get panelConfig() {
    return {
      config: { label: tableText('panel.label.table') },
      attrs: { className: `${PANEL_CLASSNAME} ${TABLE_PANEL_CLASSNAME}` },
      action: {
        onRender: panel => panel.append(this.element),
      },
    }
  }

  /** Saves a text edit; the preview catches up after typing pauses */
  save(table) {
    this.field.set('table', table)
    this.field.debouncedUpdatePreview()
  }

  /**
   * Saves a structural change, rebuilds the grid and focuses the first enabled match of `selectors`
   * @param {Object} table
   * @param {...String} selectors in order of preference
   */
  restructure(table, ...selectors) {
    this.field.set('table', table)
    this.field.updatePreview()
    this.render()
    for (const selector of selectors) {
      const target = this.element.querySelector(selector)
      if (target && !target.disabled) {
        target.focus()
        if (target.type === 'text') target.select()
        return
      }
    }
  }

  render() {
    const table = this.table
    const parts = [this.captionField(table), this.optionFields(table), this.grid(table), this.addButtons()]
    this.element.replaceChildren(...parts.map(part => dom.create(part, true)))
  }

  captionField({ caption }) {
    return {
      tag: 'label',
      className: 'f-table-panel-caption',
      children: [
        { tag: 'span', textContent: tableText('table.caption') },
        {
          tag: 'input',
          attrs: { type: 'text', value: caption },
          dataset: { tableCaption: '' },
          action: { input: ({ target }) => this.save(setTableOption(this.table, 'caption', target.value)) },
        },
      ],
    }
  }

  optionFields(table) {
    // input columns are named by their labels, so an input table always shows its header row
    const locked = hasInputs(table)
    const hintId = `${this.field.id}-header-row-hint`
    const toggle = key => {
      const isLocked = key === 'headerRow' && locked
      return {
        tag: 'label',
        className: 'f-table-panel-option',
        children: [
          {
            tag: 'input',
            attrs: {
              type: 'checkbox',
              checked: table[key] || isLocked,
              disabled: isLocked,
              ...(isLocked ? { 'aria-describedby': hintId } : {}),
            },
            dataset: { tableOption: key },
            action: { change: ({ target }) => this.toggleOption(key, target.checked) },
          },
          { tag: 'span', textContent: tableText(`table.${key}`) },
        ],
      }
    }
    const hint = locked && {
      tag: 'span',
      attrs: { id: hintId, className: 'f-table-panel-hint' },
      textContent: tableText('table.headerRowLocked'),
    }
    return {
      className: 'f-table-panel-options',
      children: [toggle('headerRow'), toggle('rowHeaders'), hint].filter(Boolean),
    }
  }

  toggleOption(key, checked) {
    // header row switches the grid's first line; row headers adds or drops column 0's type select
    this.restructure(withKeys(setTableOption(this.table, key, checked)), `[data-table-option="${key}"]`)
  }

  textInput({ value, label, dataset, onInput, onCommit, placeholder }) {
    const action = { input: ({ target }) => onInput(target.value) }
    if (onCommit) {
      action.change = onCommit
    }
    return {
      tag: 'input',
      attrs: { type: 'text', value, 'aria-label': label, ...(placeholder ? { placeholder } : {}) },
      dataset,
      action,
    }
  }

  removeButton(kind, index, isLast) {
    const label = tableText(kind === 'row' ? 'table.removeRow' : 'table.removeColumn', { [kind]: index + 1 })
    return {
      tag: 'button',
      attrs: { type: 'button', className: 'f-table-remove', 'aria-label': label, title: label, disabled: isLast },
      dataset: kind === 'row' ? { removeRow: String(index) } : { removeColumn: String(index) },
      content: dom.icon('remove'),
      action: {
        click: () => {
          if (kind === 'row') {
            this.removeRowAt(index)
          } else {
            this.removeColumnAt(index)
          }
        },
      },
    }
  }

  typeSelect(column, c) {
    const current = cellInput(column) ?? ''
    return {
      tag: 'select',
      attrs: { className: 'f-table-input-type', 'aria-label': tableText('table.columnInput', { column: c + 1 }) },
      dataset: { columnInput: String(c) },
      children: INPUT_CHOICES.map(([value, key]) => ({
        tag: 'option',
        attrs: { value, selected: value === current },
        textContent: tableText(key),
      })),
      action: { change: ({ target }) => this.changeColumnInput(c, target.value) },
    }
  }

  valueInput(kind, index, value) {
    const vars = { [kind]: index + 1 }
    const setter = kind === 'row' ? setRowValue : setColumnValue
    return this.textInput({
      value: value ?? '',
      label: tableText(kind === 'row' ? 'table.rowValue' : 'table.columnValue', vars),
      placeholder: tableText('table.value'),
      dataset: kind === 'row' ? { rowValue: String(index) } : { columnValue: String(index) },
      onInput: text => this.save(setter(this.table, index, text)),
      onCommit: () => this.commitKeys(),
    })
  }

  requiredToggle(row, r) {
    return {
      tag: 'label',
      className: 'f-table-row-required',
      children: [
        {
          tag: 'input',
          attrs: {
            type: 'checkbox',
            checked: row.required === true,
            'aria-label': tableText('table.rowRequired', { row: r + 1 }),
          },
          dataset: { rowRequired: String(r) },
          action: {
            change: ({ target }) => {
              this.field.set('table', setRowRequired(this.table, r, target.checked))
              this.field.updatePreview()
            },
          },
        },
        { tag: 'span', attrs: { 'aria-hidden': 'true' }, textContent: tableText('table.required') },
      ],
    }
  }

  /** Gives blank or duplicate keys their resolved value, and shows it in place without rebuilding the grid */
  commitKeys() {
    const table = withKeys(this.table)
    this.field.set('table', table)
    this.field.updatePreview()
    for (const input of this.element.querySelectorAll('[data-row-value]')) {
      input.value = table.rows[Number(input.dataset.rowValue)]?.value ?? ''
    }
    for (const input of this.element.querySelectorAll('[data-column-value]')) {
      input.value = table.columns[Number(input.dataset.columnValue)]?.value ?? ''
    }
  }

  changeColumnInput(c, input) {
    let table = setColumnInput(this.table, c, input || null)
    // an input column's label names its inputs, so it can't stay blank
    if (cellInput(table.columns[c]) && !table.columns[c].label.trim()) {
      table = setColumnLabel(table, c, tableText('table.newColumn', { column: c + 1 }))
    }
    this.restructure(withKeys(table), `[data-column-input="${c}"]`)
  }

  grid(table) {
    const { headerRow, rowHeaders, columns, rows } = table
    const matrix = hasInputs(table)
    const inputs = new Set(inputColumns(table))
    const showHeader = headerRow || matrix
    const lastColumn = columns.length <= 1
    const lastRow = rows.length <= 1
    const headLine = columns.map((column, c) => ({
      tag: 'td',
      children: [
        showHeader &&
          this.textInput({
            value: column.label,
            label: tableText('table.columnLabel', { column: c + 1 }),
            dataset: { headerColumn: String(c) },
            onInput: value => this.save(setColumnLabel(this.table, c, value)),
          }),
        !(rowHeaders && c === 0) && this.typeSelect(column, c),
        inputs.has(c) && this.valueInput('column', c, column.value),
        this.removeButton('column', c, lastColumn),
      ].filter(Boolean),
    }))
    const bodyCell = (cell, r, c) => {
      const type = inputs.has(c) && cellInput(columns[c])
      if (type) {
        return {
          tag: 'td',
          className: 'f-table-editor-input',
          children: [
            {
              tag: 'span',
              attrs: { 'aria-hidden': 'true' },
              dataset: { cellGlyph: type },
              textContent: CELL_GLYPHS[type],
            },
          ],
        }
      }
      return {
        tag: 'td',
        children: [
          this.textInput({
            value: cell,
            label: tableText('table.cell', { row: r + 1, column: c + 1 }),
            dataset: { row: String(r), column: String(c) },
            onInput: value => this.save(setCell(this.table, r, c, value)),
          }),
        ],
      }
    }
    const bodyLines = rows.map((row, r) => ({
      tag: 'tr',
      children: [
        ...row.cells.map((cell, c) => bodyCell(cell, r, c)),
        {
          tag: 'td',
          className: 'f-table-editor-row-controls',
          children: [
            matrix && this.valueInput('row', r, row.value),
            matrix && this.requiredToggle(row, r),
            this.removeButton('row', r, lastRow),
          ].filter(Boolean),
        },
      ],
    }))
    return {
      className: 'f-table-editor-wrap',
      children: [
        {
          tag: 'table',
          attrs: { className: 'f-table-editor', role: 'presentation' },
          children: [
            { tag: 'thead', children: [{ tag: 'tr', children: [...headLine, { tag: 'td' }] }] },
            { tag: 'tbody', children: bodyLines },
          ],
        },
      ],
    }
  }

  addButtons() {
    const button = (kind, key) => ({
      tag: 'button',
      attrs: { type: 'button', className: 'f-table-add' },
      dataset: { tableAdd: kind },
      textContent: tableText(key),
      action: { click: () => (kind === 'row' ? this.addRowAtEnd() : this.addColumnAtEnd()) },
    })
    return {
      className: 'f-table-panel-add',
      children: [button('row', 'table.addRow'), button('column', 'table.addColumn')],
    }
  }

  addRowAtEnd() {
    const table = withKeys(addRow(this.table))
    const r = table.rows.length - 1
    this.restructure(table, `[data-row="${r}"]`, `[data-row-value="${r}"]`, '[data-table-add="row"]')
  }

  addColumnAtEnd() {
    const current = this.table
    const table = withKeys(addColumn(current, tableText('table.newColumn', { column: current.columns.length + 1 })))
    const c = table.columns.length - 1
    this.restructure(
      table,
      `[data-header-column="${c}"]`,
      `[data-row="0"][data-column="${c}"]`,
      '[data-table-add="column"]'
    )
  }

  removeRowAt(index) {
    const table = withKeys(removeRow(this.table, index))
    const next = Math.min(index, table.rows.length - 1)
    this.restructure(table, `[data-remove-row="${next}"]`, '[data-table-add="row"]')
  }

  removeColumnAt(index) {
    const table = withKeys(removeColumn(this.table, index))
    const next = Math.min(index, table.columns.length - 1)
    this.restructure(table, `[data-remove-column="${next}"]`, '[data-table-add="column"]')
  }
}
