import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  addColumn,
  addRow,
  CELL_INPUTS,
  cellInput,
  columnKey,
  defaultMatrix,
  defaultTable,
  hasInputs,
  inputColumns,
  isTableField,
  MATRIX_TEXT,
  matrixName,
  normalizeTable,
  parseMatrixKey,
  parseTableAddress,
  removeColumn,
  removeRow,
  rowKey,
  setCell,
  setColumnInput,
  setColumnLabel,
  setColumnValue,
  setRowRequired,
  setRowValue,
  setTableOption,
  TABLE_DEFAULTS,
  tableDomConfig,
  withKeys,
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

describe('tableDomConfig (#349)', () => {
  const field = (table, extra = {}) => ({
    id: 'f-t1',
    attrs: { className: 'table table-bordered', 'data-kind': 'hours' },
    config: { label: 'Opening <b>hours</b>' },
    table,
    ...extra,
  })
  const tableOf = config => config.children[0]
  const partsOf = config => tableOf(config).children
  const tagsOf = list => list.map(({ tag }) => tag)

  it('tolerates null attrs and config', () => {
    const config = tableDomConfig({
      id: 'f-n',
      attrs: null,
      config: null,
      table: { columns: [{ label: 'A' }], rows: [] },
    })
    assert.deepEqual(tableOf(config).attrs.className, ['f-table'])
    assert.equal(config.attrs['aria-label'], 'Table')
  })

  it('keeps the <table> tag when attrs carry a tag override', () => {
    const table = tableOf(tableDomConfig(field(twoByTwo(), { attrs: { tag: 'div', 'data-kind': 'hours' } })))
    assert.equal(table.tag, 'table')
    assert.deepEqual(table.attrs, { className: ['f-table'], 'data-kind': 'hours' })
  })

  it('treats a whitespace-only caption as no caption, so the region falls back to the label', () => {
    const config = tableDomConfig(field({ ...twoByTwo(), caption: '   ' }))
    assert.equal(config.attrs['aria-label'], 'Opening hours')
    assert.equal('aria-labelledby' in config.attrs, false)
    assert.deepEqual(tagsOf(partsOf(config)), ['thead', 'tbody'])
  })

  it('wraps the table in a focusable region named by its caption', () => {
    const config = tableDomConfig(field(twoByTwo()))
    assert.equal(config.tag, 'div')
    assert.deepEqual(config.attrs, {
      className: 'f-table-wrap',
      role: 'region',
      tabindex: '0',
      'aria-labelledby': 'f-t1-caption',
    })
    const [caption] = partsOf(config)
    assert.deepEqual(caption, { tag: 'caption', attrs: { id: 'f-t1-caption' }, textContent: 'Hours' })
  })

  it('puts the field id, attrs, action and dataset on the <table>, with the f-table class first', () => {
    const action = { onRender: () => {} }
    const table = tableOf(tableDomConfig(field(twoByTwo(), { action, dataset: { foo: 'bar' } })))
    assert.equal(table.tag, 'table')
    assert.equal(table.id, 'f-t1')
    assert.deepEqual(table.attrs, { className: ['f-table', 'table table-bordered'], 'data-kind': 'hours' })
    assert.equal(table.action, action)
    assert.deepEqual(table.dataset, { foo: 'bar' })
  })

  it('renders the header row as th scope=col and body cells as td text', () => {
    const [, thead, tbody] = partsOf(tableDomConfig(field(twoByTwo())))
    assert.deepEqual(thead, {
      tag: 'thead',
      children: [
        {
          tag: 'tr',
          children: [
            { tag: 'th', attrs: { scope: 'col' }, textContent: 'Day' },
            { tag: 'th', attrs: { scope: 'col' }, textContent: 'Open' },
          ],
        },
      ],
    })
    assert.deepEqual(tbody.children[0], {
      tag: 'tr',
      children: [
        { tag: 'td', textContent: 'Mon' },
        { tag: 'td', textContent: '9–5' },
      ],
    })
  })

  it('leaves out <thead> without a header row, and makes each first cell a th scope=row with row headers', () => {
    const parts = partsOf(tableDomConfig(field({ ...twoByTwo(), headerRow: false, rowHeaders: true })))
    assert.deepEqual(tagsOf(parts), ['caption', 'tbody'])
    assert.deepEqual(parts[1].children[1].children[0], { tag: 'th', attrs: { scope: 'row' }, textContent: 'Tue' })
  })

  it('without a caption, names the region by the plain-text label, then the fallback', () => {
    const noCaption = { ...twoByTwo(), caption: '' }
    const named = tableDomConfig(field(noCaption))
    assert.equal(named.attrs['aria-label'], 'Opening hours')
    assert.equal('aria-labelledby' in named.attrs, false)
    assert.deepEqual(tagsOf(partsOf(named)), ['thead', 'tbody'])
    const unnamed = tableDomConfig(field(noCaption, { config: {} }), { fallbackLabel: 'Tabelle' })
    assert.equal(unnamed.attrs['aria-label'], 'Tabelle')
  })

  it('gives the editor preview no region role and no tab stop', () => {
    const config = tableDomConfig(field(twoByTwo()), { isPreview: true })
    assert.deepEqual(config.attrs, { className: 'f-table-wrap' })
  })

  it('renders an empty tbody for a table without rows, and no thead without columns', () => {
    const parts = partsOf(tableDomConfig(field({ caption: '' })))
    assert.deepEqual(parts, [{ tag: 'tbody', children: [] }])
  })
})

const rating = () => ({
  caption: 'Visit',
  headerRow: true,
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Good', value: 'good', input: 'radio' },
    { label: 'Comment', value: 'comment', input: 'text' },
  ],
  rows: [
    { value: 'speed', required: true, cells: ['Speed', '', '', ''] },
    { value: 'price', cells: ['Price', '', '', ''] },
  ],
})

describe('matrix data (#349 phase 2)', () => {
  it('cellInput accepts only radio, checkbox and text', () => {
    assert.deepEqual(CELL_INPUTS, ['radio', 'checkbox', 'text'])
    assert.equal(cellInput({ label: 'A', input: 'radio' }), 'radio')
    assert.equal(cellInput({ label: 'A', input: 'checkbox' }), 'checkbox')
    assert.equal(cellInput({ label: 'A', input: 'text' }), 'text')
    assert.equal(cellInput({ label: 'A', input: 'select' }), null)
    assert.equal(cellInput({ label: 'A' }), null)
    assert.equal(cellInput('A'), null)
    assert.equal(cellInput(null), null)
  })

  it('normalizeTable keeps input, value and required as written, even an unknown input', () => {
    const table = normalizeTable({
      columns: [{ label: 'A', value: 'a', input: 'select' }],
      rows: [{ value: 'r', required: true, cells: ['x'] }],
    })
    assert.deepEqual(table.columns, [{ label: 'A', value: 'a', input: 'select' }])
    assert.deepEqual(table.rows, [{ value: 'r', required: true, cells: ['x'] }])
  })

  it('a phase 1 table is unchanged by normalizeTable and withKeys', () => {
    assert.deepEqual(normalizeTable(twoByTwo()), twoByTwo())
    assert.deepEqual(withKeys(twoByTwo()), twoByTwo())
  })

  it('inputColumns skips static columns, unknown inputs and column 0 under row headers', () => {
    assert.deepEqual(inputColumns(rating()), [1, 2, 3])
    const firstIsRadio = { ...rating(), columns: [{ label: 'X', input: 'radio' }, ...rating().columns.slice(1)] }
    assert.deepEqual(inputColumns(firstIsRadio), [1, 2, 3])
    assert.deepEqual(inputColumns({ ...firstIsRadio, rowHeaders: false }), [0, 1, 2, 3])
    assert.deepEqual(inputColumns({ columns: [{ label: 'A', input: 'select' }], rows: [] }), [])
  })

  it('hasInputs is true only when some column renders an input', () => {
    assert.equal(hasInputs(twoByTwo()), false)
    assert.equal(hasInputs(rating()), true)
    assert.equal(hasInputs({ rowHeaders: true, columns: [{ label: 'A', input: 'radio' }], rows: [] }), false)
    assert.equal(hasInputs(undefined), false)
  })

  it('columnKey and rowKey trim, replace brackets and fall back to the 1-based position', () => {
    assert.equal(columnKey({ label: 'A', value: ' a[b] ' }, 0), 'a-b-')
    assert.equal(columnKey({ label: 'A', value: '   ' }, 1), 'column-2')
    assert.equal(columnKey({ label: 'A' }, 2), 'column-3')
    assert.equal(rowKey({ value: 'Ünïcode row', cells: [] }, 0), 'Ünïcode row')
    assert.equal(rowKey({ cells: [] }, 0), 'row-1')
    assert.equal(rowKey(undefined, 4), 'row-5')
  })

  it('withKeys fills blank and duplicate keys of rows and input columns, first occurrence wins', () => {
    const input = {
      rowHeaders: true,
      columns: [
        { label: '' },
        { label: 'A', value: '', input: 'radio' },
        { label: 'B', value: 'x', input: 'radio' },
        { label: 'C', value: 'x', input: 'radio' },
        { label: 'D', value: 'a]b', input: 'text' },
      ],
      rows: [{ value: 'same', cells: [] }, { value: 'same', cells: [] }, { cells: [] }],
    }
    const before = structuredClone(input)
    const table = withKeys(input)
    assert.deepEqual(input, before)
    assert.deepEqual(
      table.columns.map(column => column.value),
      [undefined, 'column-2', 'x', 'column-4', 'a-b']
    )
    assert.deepEqual(
      table.rows.map(row => row.value),
      ['same', 'row-2', 'row-3']
    )
  })

  it('withKeys never hands out a key an explicit value already uses', () => {
    const table = withKeys({
      columns: [{ label: 'A', input: 'text' }],
      rows: [{ cells: [] }, { value: 'row-1', cells: [] }],
    })
    assert.deepEqual(
      table.rows.map(row => row.value),
      ['row-2', 'row-1']
    )
  })

  it('setColumnInput sets or clears a column input, and never makes column 0 an input under row headers', () => {
    const table = rating()
    const before = structuredClone(table)
    assert.equal(setColumnInput(table, 3, 'checkbox').columns[3].input, 'checkbox')
    assert.equal('input' in setColumnInput(table, 3, null).columns[3], false)
    assert.equal('input' in setColumnInput(table, 3, 'bogus').columns[3], false)
    assert.equal(setColumnInput(table, 3, null).columns[3].value, 'comment')
    assert.deepEqual(setColumnInput(table, 0, 'radio').columns[0], { label: '' })
    assert.equal(setColumnInput({ ...table, rowHeaders: false }, 0, 'radio').columns[0].input, 'radio')
    assert.deepEqual(setColumnInput(table, 9, 'radio'), normalizeTable(table))
    assert.deepEqual(table, before)
  })

  it('setColumnValue and setRowValue store the text as typed', () => {
    assert.equal(setColumnValue(rating(), 1, ' Bad ').columns[1].value, ' Bad ')
    assert.equal(setRowValue(rating(), 1, 7).rows[1].value, '7')
    assert.deepEqual(setRowValue(rating(), 5, 'x'), normalizeTable(rating()))
  })

  it('setRowRequired sets required, and removes the key when turned off', () => {
    assert.equal(setRowRequired(rating(), 1, true).rows[1].required, true)
    assert.equal('required' in setRowRequired(rating(), 0, false).rows[0], false)
  })

  it('turning row headers on clears column 0 input', () => {
    const table = {
      ...rating(),
      rowHeaders: false,
      columns: [{ label: 'X', input: 'text' }, ...rating().columns.slice(1)],
    }
    assert.deepEqual(setTableOption(table, 'rowHeaders', true).columns[0], { label: 'X' })
    assert.equal(setTableOption(table, 'rowHeaders', false).columns[0].input, 'text')
  })

  it('defaultMatrix is a radio grid with a row-label column', () => {
    assert.deepEqual(defaultMatrix(), {
      caption: '',
      headerRow: true,
      rowHeaders: true,
      columns: [
        { label: '' },
        { label: 'Column 1', value: 'column-1', input: 'radio' },
        { label: 'Column 2', value: 'column-2', input: 'radio' },
        { label: 'Column 3', value: 'column-3', input: 'radio' },
      ],
      rows: [
        { value: 'row-1', cells: ['Row 1', '', '', ''] },
        { value: 'row-2', cells: ['Row 2', '', '', ''] },
      ],
    })
    const translated = defaultMatrix(
      n => `Spalte ${n}`,
      n => `Zeile ${n}`
    )
    assert.equal(translated.columns[1].label, 'Spalte 1')
    assert.equal(translated.rows[1].cells[0], 'Zeile 2')
  })

  it('matrixName nests the row key, then the column key', () => {
    assert.equal(matrixName('f-x', 'speed'), 'f-x[speed]')
    assert.equal(matrixName('f-x', 'speed', 'good'), 'f-x[speed][good]')
  })

  it('parseMatrixKey reads a key back against a known base', () => {
    assert.deepEqual(parseMatrixKey('f-x[speed]', 'f-x'), { row: 'speed', column: null })
    assert.deepEqual(parseMatrixKey('f-x[speed][good]', 'f-x'), { row: 'speed', column: 'good' })
    assert.deepEqual(parseMatrixKey('survey[q1][speed]', 'survey[q1]'), { row: 'speed', column: null })
    assert.equal(parseMatrixKey('f-xy[speed]', 'f-x'), null)
    assert.equal(parseMatrixKey('f-x', 'f-x'), null)
    assert.equal(parseMatrixKey('f-x[a][b][c]', 'f-x'), null)
    assert.equal(parseMatrixKey('f-x[]', 'f-x'), null)
  })

  it('parseTableAddress reads row and cell condition addresses only', () => {
    assert.deepEqual(parseTableAddress('fields.abc.table.rows[1]'), { fieldId: 'abc', row: 1, cell: null })
    assert.deepEqual(parseTableAddress('fields.abc.table.rows[0].cells[2]'), { fieldId: 'abc', row: 0, cell: 2 })
    assert.equal(parseTableAddress('fields.abc.options[1]'), null)
    assert.equal(parseTableAddress('fields.abc.table.rows.1'), null)
    assert.equal(parseTableAddress('fields.abc'), null)
    assert.equal(parseTableAddress(undefined), null)
  })
})

describe('tableDomConfig: matrix (#349 phase 2)', () => {
  // rating() has a caption, so the <table>'s children are [caption, thead, tbody]
  const firstInput = config => {
    const tbody = config.children[0].children[2]
    // row 1 > the Poor cell (td) > label.f-table-cell > [span, input]
    return tbody.children[0].children[1].children[0].children[1]
  }

  it('uses the translate option for its fallback names', () => {
    const translate = (key, vars) => `${key}|${Object.values(vars).join('|')}`
    const input = firstInput(tableDomConfig({ id: 'f-m', table: { ...rating(), rowHeaders: false } }, { translate }))
    assert.equal(input.tag, 'input')
    assert.equal(input.attrs['aria-label'], 'table.cellInput|table.newRow|1|Poor')
  })

  it('falls back to its own English strings', () => {
    assert.deepEqual(Object.keys(MATRIX_TEXT).sort(), ['table.cellInput', 'table.newColumn', 'table.newRow'])
    const input = firstInput(tableDomConfig({ id: 'f-m', table: { ...rating(), rowHeaders: false } }))
    assert.equal(input.attrs['aria-label'], 'Row 1, Poor')
  })
})
