import i18n from '@draggable/i18n'
import { fillTokens } from './utils/string.mjs'

/**
 * English fallbacks for the table element's strings (#349), for locales that don't have them yet.
 * @draggable/formeo-languages ships these keys from 3.10.2 (pinned in i18n-fallbacks.test.mjs).
 */
export const TABLE_TEXT = Object.freeze({
  'controls.form.matrix': 'Matrix',
  'controls.html.table': 'Table',
  'panel.label.table': 'Table',
  remove: 'Remove',
  'table.addColumn': '+ Column',
  'table.addRow': '+ Row',
  'table.caption': 'Caption',
  'table.cell': 'Row {row}, column {column}',
  'table.cellInput': '{row}, {column}',
  'table.columnInput': 'Column {column} input',
  'table.columnLabel': 'Column {column} header',
  'table.columnValue': 'Column {column} value',
  'table.entryCell': '{table}: {row}, {column}',
  'table.entryRow': '{table}: {row}',
  'table.headerRow': 'Header row',
  'table.headerRowLocked': 'Input columns need a header row',
  'table.input.checkbox': 'Checkbox',
  'table.input.radio': 'Radio',
  'table.input.static': 'Static text',
  'table.input.text': 'Text field',
  'table.newColumn': 'Column {column}',
  'table.newRow': 'Row {row}',
  'table.removeColumn': 'Remove column {column}',
  'table.removeRow': 'Remove row {row}',
  'table.repeat': 'Repeating rows',
  'table.repeatLocked': 'Repeating rows need an input column',
  'table.repeatMax': 'Maximum rows',
  'table.repeatMin': 'Minimum rows',
  'table.repeatNoMax': 'No limit',
  'table.repeatRequired': 'Every row required',
  'table.repeatRow': '{label} {row}',
  'table.required': 'Required',
  'table.rowAdded': '{row} added',
  'table.rowHeaders': 'Row headers',
  'table.rowRemoved': '{row} removed',
  'table.rowRequired': 'Row {row} required',
  'table.rowValue': 'Row {row} value',
  'table.value': 'Value',
})

/**
 * A table string in the current locale, or its English fallback, with `{tokens}` filled from `vars`
 * @param {String} key e.g. 'table.cell'
 * @param {Object} [vars] e.g. { row: 2, column: 3 }
 * @return {String}
 */
export const tableText = (key, vars = {}) => fillTokens(i18n.get(key) || TABLE_TEXT[key] || key, vars)
