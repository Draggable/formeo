import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { TABLE_TEXT, tableText } from './table-text.mjs'

// i18n.get(key) reads i18n.langs[i18n.locale], then any other loaded language
describe('table strings (#349)', () => {
  let savedLangs
  beforeEach(() => {
    savedLangs = i18n.langs
    i18n.langs = Object.create(null)
  })
  afterEach(() => {
    i18n.langs = savedLangs
  })

  it('falls back to English with the tokens filled', () => {
    assert.equal(tableText('table.cell', { row: 2, column: 3 }), 'Row 2, column 3')
    assert.equal(tableText('table.removeRow', { row: 1 }), 'Remove row 1')
    assert.equal(tableText('controls.html.table'), 'Table')
  })

  it('uses the current locale when it has the key', () => {
    i18n.langs[i18n.locale] = { 'table.addRow': '+ Zeile', 'table.cell': 'Zeile {row}, Spalte {column}' }
    assert.equal(tableText('table.addRow'), '+ Zeile')
    assert.equal(tableText('table.cell', { row: 1, column: 4 }), 'Zeile 1, Spalte 4')
  })

  it('has an English fallback for every key the spec lists', () => {
    assert.deepEqual(Object.keys(TABLE_TEXT).sort(), [
      'controls.html.table',
      'panel.label.table',
      'table.addColumn',
      'table.addRow',
      'table.caption',
      'table.cell',
      'table.columnLabel',
      'table.headerRow',
      'table.newColumn',
      'table.removeColumn',
      'table.removeRow',
      'table.rowHeaders',
    ])
  })
})
