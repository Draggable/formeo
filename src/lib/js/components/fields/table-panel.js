import dom from '../../common/dom.js'
import {
  addColumn,
  addRow,
  normalizeTable,
  removeColumn,
  removeRow,
  setCell,
  setColumnLabel,
  setTableOption,
} from '../../common/table.mjs'
import { tableText } from '../../common/table-text.mjs'
import { PANEL_CLASSNAME } from '../../constants.js'

export const TABLE_PANEL_CLASSNAME = 'table-panel'

/**
 * A table field's Table edit panel (#349): the caption, the header options, a grid of cell inputs and add/remove
 * buttons. Typing saves without rebuilding the grid, so focus stays put. Adding or removing a row or column rebuilds
 * the grid and moves focus to the matching control.
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
    const toggle = key => ({
      tag: 'label',
      className: 'f-table-panel-option',
      children: [
        {
          tag: 'input',
          attrs: { type: 'checkbox', checked: table[key] },
          dataset: { tableOption: key },
          action: { change: ({ target }) => this.toggleOption(key, target.checked) },
        },
        { tag: 'span', textContent: tableText(`table.${key}`) },
      ],
    })
    return { className: 'f-table-panel-options', children: [toggle('headerRow'), toggle('rowHeaders')] }
  }

  toggleOption(key, checked) {
    const table = setTableOption(this.table, key, checked)
    if (key === 'headerRow') {
      // the grid's first line switches between header inputs and bare remove-column buttons
      this.restructure(table, `[data-table-option="${key}"]`)
      return
    }
    this.field.set('table', table)
    this.field.updatePreview()
  }

  textInput({ value, label, dataset, onInput }) {
    return {
      tag: 'input',
      attrs: { type: 'text', value, 'aria-label': label },
      dataset,
      action: { input: ({ target }) => onInput(target.value) },
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

  grid({ headerRow, columns, rows }) {
    const lastColumn = columns.length <= 1
    const lastRow = rows.length <= 1
    const headLine = columns.map((column, c) => ({
      tag: 'td',
      children: [
        headerRow &&
          this.textInput({
            value: column.label,
            label: tableText('table.columnLabel', { column: c + 1 }),
            dataset: { headerColumn: String(c) },
            onInput: value => this.save(setColumnLabel(this.table, c, value)),
          }),
        this.removeButton('column', c, lastColumn),
      ].filter(Boolean),
    }))
    const bodyLines = rows.map((row, r) => ({
      tag: 'tr',
      children: [
        ...row.cells.map((cell, c) => ({
          tag: 'td',
          children: [
            this.textInput({
              value: cell,
              label: tableText('table.cell', { row: r + 1, column: c + 1 }),
              dataset: { row: String(r), column: String(c) },
              onInput: value => this.save(setCell(this.table, r, c, value)),
            }),
          ],
        })),
        { tag: 'td', children: [this.removeButton('row', r, lastRow)] },
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
    const table = addRow(this.table)
    this.restructure(table, `[data-row="${table.rows.length - 1}"][data-column="0"]`, '[data-table-add="row"]')
  }

  addColumnAtEnd() {
    const current = this.table
    const table = addColumn(current, tableText('table.newColumn', { column: current.columns.length + 1 }))
    const c = table.columns.length - 1
    this.restructure(
      table,
      `[data-header-column="${c}"]`,
      `[data-row="0"][data-column="${c}"]`,
      '[data-table-add="column"]'
    )
  }

  removeRowAt(index) {
    const table = removeRow(this.table, index)
    const next = Math.min(index, table.rows.length - 1)
    this.restructure(table, `[data-remove-row="${next}"]`, '[data-table-add="row"]')
  }

  removeColumnAt(index) {
    const table = removeColumn(this.table, index)
    const next = Math.min(index, table.columns.length - 1)
    this.restructure(table, `[data-remove-column="${next}"]`, '[data-table-add="column"]')
  }
}
