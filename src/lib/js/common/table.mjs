/**
 * A table field's data (#349): `{ caption, headerRow, rowHeaders, columns: [{ label, value?, input? }],
 * rows: [{ cells: [], value?, required? }], repeat?: { min?, max? } }`. A column with an `input` makes the table a
 * matrix (phase 2). A plain-object `repeat` on a matrix lets the person filling in the form add and remove rows
 * copied from rows[0] (phase 3).
 * Pure: no DOM and no i18n. The editor's Table panel edits it with the functions below, which normalise their input
 * and return a new table without changing it.
 */

import { fillTokens } from './utils/string.mjs'

export const TABLE_DEFAULTS = Object.freeze({ caption: '', headerRow: true, rowHeaders: false })
const TABLE_OPTION_KEYS = Object.freeze(Object.keys(TABLE_DEFAULTS))
const DEFAULT_COLUMN_COUNT = 3
const DEFAULT_ROW_COUNT = 2

/**
 * English label for a new column; the editor passes a translated one
 * @param {Number} number 1-based column number
 * @return {String}
 */
export const defaultColumnLabel = number => `Column ${number}`

/**
 * English label for a new row; the editor passes a translated one
 * @param {Number} number 1-based row number
 * @return {String}
 */
export const defaultRowLabel = number => `Row ${number}`

/** The input types a column can render in its cells (#349 phase 2) */
export const CELL_INPUTS = Object.freeze(['radio', 'checkbox', 'text'])

/** English for the strings tableDomConfig needs when no translator is passed; table-text.mjs has the same text */
export const MATRIX_TEXT = Object.freeze({
  remove: 'Remove',
  'table.addRow': '+ Row',
  'table.cellInput': '{row}, {column}',
  'table.newColumn': 'Column {column}',
  'table.newRow': 'Row {row}',
  'table.removeRow': 'Remove row {row}',
  'table.repeatRow': '{label} {row}',
})
const englishText = (key, vars = {}) => fillTokens(MATRIX_TEXT[key] ?? key, vars)

/** A required checkbox row reuses the checkbox group's attribute, so form reset and conditions re-sync it */
export const REQUIRED_ROW_ATTR = 'data-formeo-required-group'

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = value => (value === null || value === undefined ? '' : String(value))
const inRange = (list, index) => Number.isInteger(index) && index >= 0 && index < list.length

/**
 * Whether a field (or dom.create element) carries table data
 * @param {*} elem
 * @return {Boolean}
 */
export const isTableField = elem => isPlainObject(elem) && isPlainObject(elem.table)

const normalizeColumn = column =>
  isPlainObject(column) ? { ...column, label: text(column.label) } : { label: text(column) }

const cellsOf = row => {
  if (Array.isArray(row)) {
    return row
  }
  return Array.isArray(row?.cells) ? row.cells : []
}

const normalizeRow = (row, width) => {
  const cells = cellsOf(row)
  const base = isPlainObject(row) ? row : {}
  return { ...base, cells: Array.from({ length: width }, (_, index) => text(cells[index])) }
}

/**
 * A complete, rectangular copy of a table: missing keys get their defaults, every cell is a string and every row has
 * one cell per column. Unknown keys are kept. Never throws.
 * @param {Object} table
 * @return {Object} table
 */
export function normalizeTable(table) {
  const source = isPlainObject(table) ? table : {}
  const columns = (Array.isArray(source.columns) ? source.columns : []).map(normalizeColumn)
  const rows = (Array.isArray(source.rows) ? source.rows : []).map(row => normalizeRow(row, columns.length))
  return {
    ...source,
    caption: text(source.caption),
    headerRow: typeof source.headerRow === 'boolean' ? source.headerRow : TABLE_DEFAULTS.headerRow,
    rowHeaders: typeof source.rowHeaders === 'boolean' ? source.rowHeaders : TABLE_DEFAULTS.rowHeaders,
    columns,
    rows,
  }
}

/**
 * A new table control's data: 3 columns and 2 rows of empty cells
 * @param {Function} [columnLabel] number => label
 * @return {Object} table
 */
export function defaultTable(columnLabel = defaultColumnLabel) {
  const columns = Array.from({ length: DEFAULT_COLUMN_COUNT }, (_, index) => ({ label: columnLabel(index + 1) }))
  const rows = Array.from({ length: DEFAULT_ROW_COUNT }, () => ({ cells: [] }))
  return normalizeTable({ ...TABLE_DEFAULTS, columns, rows })
}

export function addRow(table) {
  const current = normalizeTable(table)
  return { ...current, rows: [...current.rows, { cells: current.columns.map(() => '') }] }
}

export function addColumn(table, label) {
  const current = normalizeTable(table)
  const columnLabel = label === undefined ? defaultColumnLabel(current.columns.length + 1) : text(label)
  return {
    ...current,
    columns: [...current.columns, { label: columnLabel }],
    rows: current.rows.map(row => ({ ...row, cells: [...row.cells, ''] })),
  }
}

export function removeRow(table, index) {
  const current = normalizeTable(table)
  if (current.rows.length <= 1 || !inRange(current.rows, index)) {
    return current
  }
  return { ...current, rows: current.rows.filter((_, rowIndex) => rowIndex !== index) }
}

export function removeColumn(table, index) {
  const current = normalizeTable(table)
  if (current.columns.length <= 1 || !inRange(current.columns, index)) {
    return current
  }
  return {
    ...current,
    columns: current.columns.filter((_, columnIndex) => columnIndex !== index),
    rows: current.rows.map(row => ({ ...row, cells: row.cells.filter((_, columnIndex) => columnIndex !== index) })),
  }
}

export function setCell(table, rowIndex, columnIndex, value) {
  const current = normalizeTable(table)
  if (!inRange(current.rows, rowIndex) || !inRange(current.columns, columnIndex)) {
    return current
  }
  const rows = current.rows.map((row, r) => {
    if (r !== rowIndex) {
      return row
    }
    return { ...row, cells: row.cells.map((cell, c) => (c === columnIndex ? text(value) : cell)) }
  })
  return { ...current, rows }
}

export function setColumnLabel(table, columnIndex, value) {
  const current = normalizeTable(table)
  if (!inRange(current.columns, columnIndex)) {
    return current
  }
  const columns = current.columns.map((column, c) => (c === columnIndex ? { ...column, label: text(value) } : column))
  return { ...current, columns }
}

export function setTableOption(table, key, value) {
  const current = normalizeTable(table)
  if (!TABLE_OPTION_KEYS.includes(key)) {
    return current
  }
  const next = { ...current, [key]: key === 'caption' ? text(value) : Boolean(value) }
  // with row headers on, column 0 holds the row labels, so it can't hold inputs
  if (key === 'rowHeaders' && next.rowHeaders && next.columns.length && cellInput(next.columns[0])) {
    const { input: _input, ...first } = next.columns[0]
    next.columns = [first, ...next.columns.slice(1)]
  }
  return next
}

/**
 * The input a column renders in its cells, or null for a static column
 * @param {Object} column
 * @return {String|null} 'radio', 'checkbox' or 'text'
 */
export const cellInput = column => (isPlainObject(column) && CELL_INPUTS.includes(column.input) ? column.input : null)

/**
 * Indexes of the columns that render inputs. With row headers on, column 0 is the row labels and never an input.
 * @param {Object} table
 * @return {Number[]}
 */
export function inputColumns(table) {
  const { columns, rowHeaders } = normalizeTable(table)
  return columns.reduce((acc, column, index) => {
    if (cellInput(column) && !(rowHeaders && index === 0)) {
      acc.push(index)
    }
    return acc
  }, [])
}

/**
 * Whether the table is a matrix: at least one column renders inputs
 * @param {Object} table
 * @return {Boolean}
 */
export const hasInputs = table => inputColumns(table).length > 0

// a key goes inside `name[...]`, so brackets would end it early
const sanitizeKey = value => text(value).trim().replace(/[[\]]/g, '-')

/**
 * @param {Object} column
 * @param {Number} index
 * @return {String} the column's name key: its value, trimmed and without brackets, else `column-<n>`
 */
export const columnKey = (column, index) => sanitizeKey(column?.value) || `column-${index + 1}`

/**
 * @param {Object} row
 * @param {Number} index
 * @return {String} the row's name key: its value, trimmed and without brackets, else `row-<n>`
 */
export const rowKey = (row, index) => sanitizeKey(row?.value) || `row-${index + 1}`

/**
 * Unique keys for a list. Usable explicit keys are kept (first occurrence wins); a blank or duplicate one becomes
 * `<prefix>-<position>`, else the smallest free `<prefix>-<n>`.
 * @param {Array<String|null>} values null for an entry that needs no key
 * @param {String} prefix
 * @return {Array<String|null>}
 */
const assignKeys = (values, prefix) => {
  const used = new Set()
  const kept = values.map(value => {
    if (value === null) {
      return null
    }
    const key = sanitizeKey(value)
    if (!key || used.has(key)) {
      return undefined
    }
    used.add(key)
    return key
  })
  return kept.map((key, index) => {
    if (key !== undefined) {
      return key
    }
    let candidate = `${prefix}-${index + 1}`
    for (let n = 1; used.has(candidate); n++) {
      candidate = `${prefix}-${n}`
    }
    used.add(candidate)
    return candidate
  })
}

/**
 * A matrix with a unique, non-blank key in every input column's `value`, and in every row's unless the table repeats
 * (rows are then keyed by position when rendered), so each row is its own radio group and every cell its own name.
 * A table without inputs comes back normalised and nothing more.
 * @param {Object} table
 * @return {Object} table
 */
export function withKeys(table) {
  const current = normalizeTable(table)
  const inputs = new Set(inputColumns(current))
  if (!inputs.size) {
    return current
  }
  const columnKeys = assignKeys(
    current.columns.map((column, index) => (inputs.has(index) ? text(column.value) : null)),
    'column'
  )
  // a repeating table's rows are keyed by position when rendered, so its template carries no key
  const repeating = isPlainObject(current.repeat)
  const rowKeys = repeating
    ? null
    : assignKeys(
        current.rows.map(row => text(row.value)),
        'row'
      )
  return {
    ...current,
    columns: current.columns.map((column, index) =>
      inputs.has(index) ? { ...column, value: columnKeys[index] } : column
    ),
    rows: repeating ? current.rows : current.rows.map((row, index) => ({ ...row, value: rowKeys[index] })),
  }
}

const updateAt = (list, index, update) => list.map((item, i) => (i === index ? update(item) : item))

/**
 * @param {Object} table
 * @param {Number} index column index
 * @param {String|null} input 'radio', 'checkbox' or 'text'; anything else makes the column static
 * @return {Object} table
 */
export function setColumnInput(table, index, input) {
  const current = normalizeTable(table)
  if (!inRange(current.columns, index) || (current.rowHeaders && index === 0)) {
    return current
  }
  const columns = updateAt(current.columns, index, ({ input: _input, ...column }) =>
    CELL_INPUTS.includes(input) ? { ...column, input } : column
  )
  return { ...current, columns }
}

export function setColumnValue(table, index, value) {
  const current = normalizeTable(table)
  if (!inRange(current.columns, index)) {
    return current
  }
  return { ...current, columns: updateAt(current.columns, index, column => ({ ...column, value: text(value) })) }
}

export function setRowValue(table, index, value) {
  const current = normalizeTable(table)
  if (!inRange(current.rows, index)) {
    return current
  }
  return { ...current, rows: updateAt(current.rows, index, row => ({ ...row, value: text(value) })) }
}

export function setRowRequired(table, index, required) {
  const current = normalizeTable(table)
  if (!inRange(current.rows, index)) {
    return current
  }
  const rows = updateAt(current.rows, index, ({ required: _required, ...row }) =>
    required ? { ...row, required: true } : row
  )
  return { ...current, rows }
}

/**
 * The Matrix control's data: a row-label column, 3 radio columns and 2 rows, all keyed
 * @param {Function} [columnLabel] number => label
 * @param {Function} [rowLabel] number => label
 * @return {Object} table
 */
export function defaultMatrix(columnLabel = defaultColumnLabel, rowLabel = defaultRowLabel) {
  const choices = Array.from({ length: DEFAULT_COLUMN_COUNT }, (_, index) => ({
    label: columnLabel(index + 1),
    value: `column-${index + 1}`,
    input: 'radio',
  }))
  const rows = Array.from({ length: DEFAULT_ROW_COUNT }, (_, index) => ({
    value: `row-${index + 1}`,
    cells: [rowLabel(index + 1)],
  }))
  return normalizeTable({ ...TABLE_DEFAULTS, rowHeaders: true, columns: [{ label: '' }, ...choices], rows })
}

/**
 * A matrix input's name: `base[row]` for a row's radio group, `base[row][column]` for a checkbox or text cell
 * @param {String} base
 * @param {String} row row key
 * @param {String} [column] column key
 * @return {String}
 */
export const matrixName = (base, row, column) =>
  column === undefined ? `${base}[${row}]` : `${base}[${row}][${column}]`

const MATRIX_KEY_TAIL = /^\[([^[\]]+)\](?:\[([^[\]]+)\])?$/

/**
 * Reads a userData key back into its row and column keys. The base is known, so a base holding brackets is fine.
 * @param {String} key e.g. 'f-x[speed][good]'
 * @param {String} base e.g. 'f-x'
 * @return {{row: String, column: String|null}|null}
 */
export function parseMatrixKey(key, base) {
  if (typeof key !== 'string' || !base || !key.startsWith(`${base}[`)) {
    return null
  }
  const match = MATRIX_KEY_TAIL.exec(key.slice(base.length))
  return match ? { row: match[1], column: match[2] ?? null } : null
}

const TABLE_ADDRESS = /^fields\.([^.[\]]+)\.table\.rows\[(\d+)\](?:\.cells\[(\d+)\])?$/

/**
 * Reads a condition address for a table row or cell
 * @param {String} address e.g. 'fields.abc.table.rows[1].cells[2]'
 * @return {{fieldId: String, row: Number, cell: Number|null}|null}
 */
export function parseTableAddress(address) {
  const match = TABLE_ADDRESS.exec(typeof address === 'string' ? address : '')
  if (!match) {
    return null
  }
  return { fieldId: match[1], row: Number(match[2]), cell: match[3] === undefined ? null : Number(match[3]) }
}

/** A repeating table's limits when `repeat` leaves them out (#349 phase 3) */
export const REPEAT_DEFAULTS = Object.freeze({ min: 1, max: null })

const isCount = (value, floor) => Number.isInteger(value) && value >= floor

/**
 * A repeating table's row limits: `min` is a non-negative integer (default 1); `max` is an integer of at least 1 and
 * never below `min`, or null for no limit
 * @param {Object} table
 * @return {{min: Number, max: Number|null}}
 */
export function repeatOf(table) {
  const repeat = isPlainObject(table?.repeat) ? table.repeat : {}
  const min = isCount(repeat.min, 0) ? repeat.min : REPEAT_DEFAULTS.min
  const max = isCount(repeat.max, 1) ? Math.max(repeat.max, min) : REPEAT_DEFAULTS.max
  return { min, max }
}

/**
 * Whether the person filling in the form adds and removes the table's rows: `repeat` is an object and some column
 * renders an input. A display table ignores `repeat`.
 * @param {Object} table
 * @return {Boolean}
 */
export const isRepeating = table => isPlainObject(table?.repeat) && hasInputs(table)

/**
 * @param {Object} table
 * @param {Object|null} repeat `{ min, max }` turns repeating on with those limits, normalised; anything else turns it off
 * @return {Object} table
 */
export function setRepeat(table, repeat) {
  const { repeat: _repeat, ...current } = normalizeTable(table)
  return isPlainObject(repeat) ? { ...current, repeat: repeatOf({ repeat }) } : current
}

/**
 * The row every rendered row of a repeating table copies: rows[0], or a blank row when there is none
 * @param {Object} table
 * @return {Object} row
 */
export function templateRow(table) {
  const current = normalizeTable(table)
  return current.rows[0] ?? { cells: current.columns.map(() => '') }
}

/**
 * A repeating table's name for row r: the template's row header numbered ("Item 2"), else "Row 2"
 * @param {Object} table
 * @param {Number} r 0-based row index
 * @param {Function} [translate] (key, vars) => text
 * @return {String}
 */
export function repeatRowName(table, r, translate = englishText) {
  const current = normalizeTable(table)
  const label = current.rowHeaders ? templateRow(current).cells[0]?.trim() : ''
  return label ? translate('table.repeatRow', { label, row: r + 1 }) : translate('table.newRow', { row: r + 1 })
}

/**
 * A label as plain text: tags stripped, trimmed
 * @param {*} value
 * @return {String}
 */
export const plainText = value =>
  text(value)
    .replace(/<[^>]*>/g, '')
    .trim()

/**
 * The dom.create config for a table field (#349): a scroll wrapper around the <table>. The field's id, attrs, action
 * and dataset go on the <table>, so conditions, custom classes and `elements` actions reach it. Every cell is set as
 * textContent, never parsed as HTML.
 * @param {Object} field { id, attrs, config, action, dataset, table }
 * @param {Object} [opts]
 * @param {Boolean} [opts.isPreview] the editor stage preview: no region role and no tab stop
 * @param {String} [opts.fallbackLabel] the region's name when there is no caption and no label
 * @param {Function} [opts.translate] (key, vars) => text, for the matrix's fallback names; English by default
 * @param {Function} [opts.requiredMark] () => dom config of a required row's mark
 * @param {Function} [opts.onRequiredRowChange] (tr) => void, re-syncs a required checkbox row on change
 * @return {Object} dom.create config
 */
export function tableDomConfig(field, options = {}) {
  const table = normalizeTable(field.table)
  if (hasInputs(table)) {
    return matrixDomConfig(field, withKeys(table), options)
  }
  const { isPreview = false, fallbackLabel = 'Table' } = options
  const { id, action, dataset } = field
  const attrs = field.attrs ?? {}
  const config = field.config ?? {}
  const { caption, headerRow, rowHeaders, columns, rows } = table
  // dom.create reads attrs.tag as a tag override, which would swap the <table> for another element
  const { className, tag: _tagOverride, ...tableAttrs } = attrs
  // a caption of only spaces names nothing, so it doesn't replace the label as the region's name
  const hasCaption = caption.trim() !== ''
  const captionId = hasCaption && id ? `${id}-caption` : undefined
  const headerCell = (textContent, scope) => ({ tag: 'th', attrs: { scope }, textContent })

  const children = []
  if (hasCaption) {
    children.push({ tag: 'caption', attrs: captionId ? { id: captionId } : {}, textContent: caption })
  }
  if (headerRow && columns.length) {
    children.push({
      tag: 'thead',
      children: [{ tag: 'tr', children: columns.map(({ label }) => headerCell(label, 'col')) }],
    })
  }
  children.push({
    tag: 'tbody',
    children: rows.map(({ cells }) => ({
      tag: 'tr',
      children: cells.map((cell, index) =>
        rowHeaders && index === 0 ? headerCell(cell, 'row') : { tag: 'td', textContent: cell }
      ),
    })),
  })

  const tableConfig = {
    tag: 'table',
    attrs: { ...tableAttrs, className: ['f-table', ...[className].flat().filter(Boolean)] },
    children,
  }
  if (id) {
    tableConfig.id = id
  }
  if (action) {
    tableConfig.action = action
  }
  if (dataset) {
    tableConfig.dataset = dataset
  }

  const name = captionId ? { 'aria-labelledby': captionId } : { 'aria-label': plainText(config.label) || fallbackLabel }
  // tabindex is a string: dom.processAttrValue turns a falsy 0 into ''
  const region = isPreview ? {} : { role: 'region', tabindex: '0', ...name }
  return { tag: 'div', attrs: { className: 'f-table-wrap', ...region }, children: [tableConfig] }
}

/**
 * A matrix (#349 phase 2): every input column renders a radio, checkbox or text input per row. Radios share their
 * row's name (`base[row]`), every other input has its own (`base[row][column]`). Each input is named by its row and
 * column headers. Explicit table roles keep the semantics when narrow screens stack the rows.
 * @param {Object} field
 * @param {Object} table normalised, with keys
 * @param {Object} options see tableDomConfig
 * @return {Object} dom.create config
 */
function matrixDomConfig(field, table, options) {
  const {
    isPreview = false,
    fallbackLabel = 'Table',
    translate = englishText,
    requiredMark,
    onRequiredRowChange,
  } = options
  const { id, action, dataset } = field
  const attrs = field.attrs ?? {}
  const config = field.config ?? {}
  // attrs.name is the base of every input name, never an attribute of the <table>
  const { className, tag: _tagOverride, name, required: _required, ...tableAttrs } = attrs
  const base = (!isPreview && text(name).trim()) || text(id)
  const { caption, rowHeaders, columns, rows } = table
  const inputs = new Set(inputColumns(table))
  const hasCaption = caption.trim() !== ''
  const captionId = hasCaption && id ? `${id}-caption` : undefined
  const idOf = suffix => (id ? { id: `${id}-${suffix}` } : {})
  const columnLabel = c => columns[c].label || translate('table.newColumn', { column: c + 1 })
  const rowHeaderText = r => (rowHeaders ? rows[r].cells[0] : '')
  // a required row's mark follows its row header, else its first static cell
  const markColumn = columns.findIndex((_, c) => !inputs.has(c))

  // aria-labelledby only when both headers have text; otherwise it would name too little
  const inputName = (r, c) => {
    if (id && rowHeaderText(r).trim() && columns[c].label.trim()) {
      return { 'aria-labelledby': `${id}-r${r} ${id}-c${c}` }
    }
    const row = rowHeaderText(r).trim() || translate('table.newRow', { row: r + 1 })
    return { 'aria-label': translate('table.cellInput', { row, column: columnLabel(c) }) }
  }

  const inputCell = (row, r, c) => {
    const type = cellInput(columns[c])
    const inputAttrs = {
      ...idOf(`${r}-${c}`),
      type,
      name: type === 'radio' ? matrixName(base, row.value) : matrixName(base, row.value, columns[c].value),
      ...(type === 'text' ? {} : { value: columns[c].value }),
      ...inputName(r, c),
      required: row.required === true,
    }
    const cellLabel = {
      tag: 'span',
      attrs: { className: 'f-table-cell-label', 'aria-hidden': 'true' },
      textContent: columnLabel(c),
    }
    return {
      tag: 'td',
      attrs: { role: 'cell' },
      children: [
        {
          tag: 'label',
          attrs: { className: 'f-table-cell' },
          children: [cellLabel, { tag: 'input', attrs: inputAttrs }],
        },
      ],
    }
  }

  const staticCell = (row, r, c) => {
    const content =
      row.required === true && c === markColumn && requiredMark
        ? { children: [{ tag: 'span', textContent: row.cells[c] }, requiredMark()] }
        : { textContent: row.cells[c] }
    if (rowHeaders && c === 0) {
      return { tag: 'th', attrs: { role: 'rowheader', scope: 'row', ...idOf(`r${r}`) }, ...content }
    }
    return { tag: 'td', attrs: { role: 'cell' }, ...content }
  }

  const bodyRows = rows.map((row, r) => {
    const requiredGroup = row.required === true && [...inputs].some(c => cellInput(columns[c]) === 'checkbox')
    const tr = {
      tag: 'tr',
      attrs: { role: 'row', ...(requiredGroup ? { [REQUIRED_ROW_ATTR]: 'true' } : {}) },
      dataset: { rowKey: row.value },
      children: columns.map((_, c) => (inputs.has(c) ? inputCell(row, r, c) : staticCell(row, r, c))),
    }
    if (requiredGroup && !isPreview && onRequiredRowChange) {
      tr.action = { change: ({ currentTarget }) => onRequiredRowChange(currentTarget) }
    }
    return tr
  })

  const children = []
  if (hasCaption) {
    children.push({ tag: 'caption', attrs: captionId ? { id: captionId } : {}, textContent: caption })
  }
  // input columns are named by their labels, so the header row always renders
  children.push({
    tag: 'thead',
    attrs: { role: 'rowgroup' },
    children: [
      {
        tag: 'tr',
        attrs: { role: 'row' },
        children: columns.map((column, c) => ({
          tag: 'th',
          attrs: { role: 'columnheader', scope: 'col', ...idOf(`c${c}`) },
          textContent: column.label,
        })),
      },
    ],
  })
  children.push({ tag: 'tbody', attrs: { role: 'rowgroup' }, children: bodyRows })

  const tableConfig = {
    tag: 'table',
    attrs: {
      ...tableAttrs,
      className: ['f-table', ...[className].flat().filter(Boolean)],
      role: 'table',
      ...(captionId ? { 'aria-labelledby': captionId } : {}),
      // the stage preview is a picture of the form: no focus, no clicks, so no preview action sees a change
      ...(isPreview ? { inert: true } : {}),
    },
    children,
  }
  if (id) {
    tableConfig.id = id
  }
  if (action) {
    tableConfig.action = action
  }
  if (dataset) {
    tableConfig.dataset = dataset
  }

  const groupName = captionId
    ? { 'aria-labelledby': captionId }
    : { 'aria-label': plainText(config.label) || fallbackLabel }
  // inputs are focusable and scroll themselves into view, so the wrapper needs no tab stop
  const wrapAttrs = { className: 'f-table-wrap f-table-matrix', ...(isPreview ? {} : { role: 'group', ...groupName }) }
  return { tag: 'div', attrs: wrapAttrs, children: [tableConfig] }
}
