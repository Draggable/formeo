/**
 * A table field's data (#349): `{ caption, headerRow, rowHeaders, columns: [{ label }], rows: [{ cells: [] }] }`.
 * Pure: no DOM and no i18n. The editor's Table panel edits it with the functions below, which normalise their input
 * and return a new table without changing it.
 */

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
  return { ...current, [key]: key === 'caption' ? text(value) : Boolean(value) }
}
