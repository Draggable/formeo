import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { MATRIX_TEXT } from './table.mjs'
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
      'controls.form.matrix',
      'controls.html.table',
      'panel.label.table',
      'remove',
      'table.addColumn',
      'table.addRow',
      'table.caption',
      'table.cell',
      'table.cellInput',
      'table.columnInput',
      'table.columnLabel',
      'table.columnValue',
      'table.entryCell',
      'table.entryRow',
      'table.headerRow',
      'table.headerRowLocked',
      'table.input.checkbox',
      'table.input.radio',
      'table.input.static',
      'table.input.text',
      'table.newColumn',
      'table.newRow',
      'table.removeColumn',
      'table.removeRow',
      'table.repeat',
      'table.repeatLocked',
      'table.repeatMax',
      'table.repeatMin',
      'table.repeatNoMax',
      'table.repeatRequired',
      'table.repeatRow',
      'table.required',
      'table.rowAdded',
      'table.rowHeaders',
      'table.rowRemoved',
      'table.rowRequired',
      'table.rowValue',
      'table.value',
    ])
  })

  it("matches table.mjs's own English strings, which it uses without a translator", () => {
    for (const [key, english] of Object.entries(MATRIX_TEXT)) {
      assert.equal(TABLE_TEXT[key], english, key)
    }
  })

  it('fills the matrix patterns without adding spaces', () => {
    assert.equal(tableText('table.cellInput', { row: 'Speed', column: 'Good' }), 'Speed, Good')
    assert.equal(tableText('table.entryRow', { table: 'Visit', row: 'Speed' }), 'Visit: Speed')
    assert.equal(tableText('table.entryCell', { table: 'Visit', row: 'Speed', column: 'Good' }), 'Visit: Speed, Good')
  })
})
