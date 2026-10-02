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
  tableDomConfig,
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
