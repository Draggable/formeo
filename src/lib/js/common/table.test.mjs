import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  addColumn,
  addRow,
  defaultTable,
  isTableField,
  normalizeTable,
  removeColumn,
  removeRow,
  setCell,
  setColumnLabel,
  setTableOption,
  TABLE_DEFAULTS,
} from './table.mjs'

const twoByTwo = () => ({
  caption: 'Hours',
  headerRow: true,
  rowHeaders: false,
  columns: [{ label: 'Day' }, { label: 'Open' }],
  rows: [{ cells: ['Mon', '9–5'] }, { cells: ['Tue', '9–1'] }],
})

describe('table data (#349)', () => {
  it('defaults to a captionless 3 × 2 table with a header row', () => {
    assert.deepEqual(defaultTable(), {
      caption: '',
      headerRow: true,
      rowHeaders: false,
      columns: [{ label: 'Column 1' }, { label: 'Column 2' }, { label: 'Column 3' }],
      rows: [{ cells: ['', '', ''] }, { cells: ['', '', ''] }],
    })
    assert.deepEqual(TABLE_DEFAULTS, { caption: '', headerRow: true, rowHeaders: false })
  })

  it('names default columns with the label function it is given', () => {
    const { columns } = defaultTable(n => `Spalte ${n}`)
    assert.deepEqual(columns, [{ label: 'Spalte 1' }, { label: 'Spalte 2' }, { label: 'Spalte 3' }])
  })

  it('isTableField is true only for an element whose table is an object', () => {
    assert.equal(isTableField({ tag: 'table', table: twoByTwo() }), true)
    assert.equal(isTableField({ tag: 'table', content: [] }), false)
    assert.equal(isTableField({ table: 'yes' }), false)
    assert.equal(isTableField({ table: [] }), false)
    assert.equal(isTableField(undefined), false)
    assert.equal(isTableField('table'), false)
  })

  describe('normalizeTable', () => {
    it('fills missing keys and coerces cells to strings', () => {
      assert.deepEqual(normalizeTable({ columns: [{ label: 'A' }, { label: 2 }], rows: [{ cells: [null, 7] }] }), {
        caption: '',
        headerRow: true,
        rowHeaders: false,
        columns: [{ label: 'A' }, { label: '2' }],
        rows: [{ cells: ['', '7'] }],
      })
    })

    it('pads short rows and drops extra cells, so the table is rectangular', () => {
      const { rows } = normalizeTable({
        columns: [{ label: 'A' }, { label: 'B' }],
        rows: [{ cells: ['1'] }, { cells: ['1', '2', '3'] }],
      })
      assert.deepEqual(rows, [{ cells: ['1', ''] }, { cells: ['1', '2'] }])
    })

    it('accepts string columns and array rows from hand-written formData', () => {
      const table = normalizeTable({ columns: ['Day', 'Open'], rows: [['Mon', '9–5']] })
      assert.deepEqual(table.columns, [{ label: 'Day' }, { label: 'Open' }])
      assert.deepEqual(table.rows, [{ cells: ['Mon', '9–5'] }])
    })

    it('returns an empty table for missing or malformed data instead of throwing', () => {
      for (const value of [undefined, null, 'table', [], { columns: 'x', rows: 5 }]) {
        const table = normalizeTable(value)
        assert.deepEqual(table.columns, [], String(value))
        assert.deepEqual(table.rows, [], String(value))
      }
    })

    it('keeps unknown keys on the table, its columns and its rows (room for phase 2)', () => {
      const table = normalizeTable({
        input: 'radio',
        columns: [{ label: 'A', value: 'a' }],
        rows: [{ cells: ['x'], value: 'r1' }],
      })
      assert.equal(table.input, 'radio')
      assert.deepEqual(table.columns, [{ label: 'A', value: 'a' }])
      assert.deepEqual(table.rows, [{ cells: ['x'], value: 'r1' }])
    })
  })

  describe('edits', () => {
    it('never mutate their input', () => {
      const original = twoByTwo()
      const frozen = structuredClone(original)
      addRow(original)
      addColumn(original, 'Close')
      removeRow(original, 0)
      removeColumn(original, 0)
      setCell(original, 0, 0, 'x')
      setColumnLabel(original, 0, 'x')
      setTableOption(original, 'caption', 'x')
      assert.deepEqual(original, frozen)
    })

    it('addRow appends a row of empty cells', () => {
      assert.deepEqual(addRow(twoByTwo()).rows.at(-1), { cells: ['', ''] })
    })

    it('addColumn appends a column and an empty cell to every row', () => {
      const table = addColumn(twoByTwo(), 'Close')
      assert.deepEqual(table.columns.at(-1), { label: 'Close' })
      assert.deepEqual(
        table.rows.map(row => row.cells.at(-1)),
        ['', '']
      )
      assert.equal(addColumn(twoByTwo()).columns.at(-1).label, 'Column 3')
    })

    it('removeRow and removeColumn remove by index', () => {
      assert.deepEqual(removeRow(twoByTwo(), 0).rows, [{ cells: ['Tue', '9–1'] }])
      const table = removeColumn(twoByTwo(), 0)
      assert.deepEqual(table.columns, [{ label: 'Open' }])
      assert.deepEqual(table.rows, [{ cells: ['9–5'] }, { cells: ['9–1'] }])
    })

    it('never remove the last row or column, or an index out of range', () => {
      const single = { columns: [{ label: 'A' }], rows: [{ cells: ['x'] }] }
      assert.deepEqual(removeRow(single, 0).rows, [{ cells: ['x'] }])
      assert.deepEqual(removeColumn(single, 0).columns, [{ label: 'A' }])
      assert.equal(removeRow(twoByTwo(), 5).rows.length, 2)
      assert.equal(removeColumn(twoByTwo(), -1).columns.length, 2)
    })

    it('setCell and setColumnLabel write text at a position and ignore positions outside the table', () => {
      assert.equal(setCell(twoByTwo(), 1, 1, 'closed').rows[1].cells[1], 'closed')
      assert.deepEqual(setCell(twoByTwo(), 9, 0, 'x'), normalizeTable(twoByTwo()))
      assert.equal(setColumnLabel(twoByTwo(), 1, 'Hours').columns[1].label, 'Hours')
      assert.deepEqual(setColumnLabel(twoByTwo(), 4, 'x'), normalizeTable(twoByTwo()))
    })

    it('setTableOption sets caption as text and the header options as booleans, and ignores other keys', () => {
      assert.equal(setTableOption(twoByTwo(), 'caption', 42).caption, '42')
      assert.equal(setTableOption(twoByTwo(), 'rowHeaders', 'on').rowHeaders, true)
      assert.equal(setTableOption(twoByTwo(), 'headerRow', 0).headerRow, false)
      assert.deepEqual(setTableOption(twoByTwo(), 'columns', []), normalizeTable(twoByTwo()))
    })

    it('turning the header row off and on keeps the column labels', () => {
      const off = setTableOption(twoByTwo(), 'headerRow', false)
      assert.deepEqual(off.columns, [{ label: 'Day' }, { label: 'Open' }])
      assert.deepEqual(setTableOption(off, 'headerRow', true).columns, [{ label: 'Day' }, { label: 'Open' }])
    })
  })
})
