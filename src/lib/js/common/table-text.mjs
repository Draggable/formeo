import i18n from '@draggable/i18n'
import { fillTokens } from './utils/string.mjs'

/**
 * English fallbacks for the table element's strings (#349), for locales that don't have them yet.
 * @draggable/formeo-languages ships these keys from the release after Draggable/formeo#349.
 */
export const TABLE_TEXT = Object.freeze({
  'controls.html.table': 'Table',
  'panel.label.table': 'Table',
  'table.addColumn': '+ Column',
  'table.addRow': '+ Row',
  'table.caption': 'Caption',
  'table.cell': 'Row {row}, column {column}',
  'table.columnLabel': 'Column {column} header',
  'table.headerRow': 'Header row',
  'table.newColumn': 'Column {column}',
  'table.removeColumn': 'Remove column {column}',
  'table.removeRow': 'Remove row {row}',
  'table.rowHeaders': 'Row headers',
})

/**
 * A table string in the current locale, or its English fallback, with `{tokens}` filled from `vars`
 * @param {String} key e.g. 'table.cell'
 * @param {Object} [vars] e.g. { row: 2, column: 3 }
 * @return {String}
 */
export const tableText = (key, vars = {}) => fillTokens(i18n.get(key) || TABLE_TEXT[key] || key, vars)
