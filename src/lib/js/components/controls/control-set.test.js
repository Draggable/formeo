import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import { expandControlSet, isControlSet } from './control-set.mjs'

const controls = {
  'text-input': {
    tag: 'input',
    attrs: { type: 'text', required: false, className: '' },
    config: { label: 'Text Input' },
  },
  select: {
    tag: 'select',
    attrs: { required: false },
    config: { label: 'Select' },
    options: [
      { label: 'Option 1', value: 'option-1', selected: false },
      { label: 'Option 2', value: 'option-2', selected: false },
    ],
  },
}
const lookup = controlId => (controls[controlId] ? structuredClone(controls[controlId]) : undefined)

/**
 * A set definition around the given members
 * @param {Array} fields controlSet.fields
 * @param {Object} [controlSet] more controlSet keys (layout, row)
 * @return {Object} control definition
 */
const setOf = (fields, controlSet = {}) => ({
  meta: { group: 'common', id: 'test-set', icon: 'rows' },
  config: { label: 'Test set' },
  controlSet: { fields, ...controlSet },
})

afterEach(() => mock.restoreAll())

describe('isControlSet (#227)', () => {
  it('is true only for a definition with controlSet.fields', () => {
    assert.equal(isControlSet(setOf([])), true)
    assert.equal(isControlSet(controls['text-input']), false)
    assert.equal(isControlSet({ controlSet: {} }), false)
    assert.equal(isControlSet(undefined), false)
  })
})

describe('expandControlSet (#227)', () => {
  it('starts a member from its control and merges the overrides', () => {
    const member = { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } }
    const { fields } = expandControlSet(setOf([member]), lookup)
    assert.deepEqual(fields, [
      {
        tag: 'input',
        attrs: { type: 'text', required: false, className: '', name: 'street' },
        config: { label: 'Street', controlId: 'text-input' },
      },
    ])
  })

  it('replaces arrays instead of appending to them', () => {
    const options = [{ label: 'Canada', value: 'ca', selected: false }]
    const { fields } = expandControlSet(setOf([{ control: 'select', options }]), lookup)
    assert.deepEqual(fields[0].options, options)
    assert.notEqual(fields[0].options, options, 'a copy')
  })

  it('uses a member without a control as it is, minus its id; its meta.id becomes config.controlId', () => {
    const member = { id: 'x-1', tag: 'input', attrs: { type: 'text' }, config: { label: 'Note' }, meta: { id: 'note' } }
    const { fields } = expandControlSet(setOf([member]), lookup)
    assert.deepEqual(fields, [{ tag: 'input', attrs: { type: 'text' }, config: { label: 'Note', controlId: 'note' } }])
  })

  it('returns fresh copies each time and never changes the definition', () => {
    const definition = setOf([{ control: 'text-input', config: { label: 'Street' } }], {
      row: { config: { legend: 'Address' } },
    })
    const original = structuredClone(definition)
    const first = expandControlSet(definition, lookup)
    const second = expandControlSet(definition, lookup)
    first.fields[0].config.label = 'changed'
    first.row.config.legend = 'changed'
    assert.equal(second.fields[0].config.label, 'Street')
    assert.equal(second.row.config.legend, 'Address')
    assert.deepEqual(definition, original)
  })

  it('skips and warns about a null or non-object member instead of throwing', () => {
    const warn = mock.method(console, 'warn', () => {})
    const { fields } = expandControlSet(setOf([null, 'text', { control: 'text-input' }]), lookup)
    assert.equal(fields.length, 1)
    assert.equal(warn.mock.callCount(), 2)
    for (const call of warn.mock.calls) {
      assert.match(call.arguments[0], /^formeo: control set "test-set" skips a member: it is not an object\.$/)
    }
  })

  it('skips and warns about a member whose control is unknown', () => {
    const warn = mock.method(console, 'warn', () => {})
    const { fields } = expandControlSet(setOf([{ control: 'nope' }, { control: 'text-input' }]), lookup)
    assert.equal(fields.length, 1)
    assert.equal(warn.mock.callCount(), 1)
    const [message] = warn.mock.calls[0].arguments
    assert.match(message, /^formeo: control set "test-set"/)
    assert.match(message, /"nope"/)
  })

  it('warns when a set ends up with no fields', () => {
    const warn = mock.method(console, 'warn', () => {})
    const { fields } = expandControlSet(setOf([{ control: 'nope' }]), lookup)
    assert.deepEqual(fields, [])
    assert.equal(warn.mock.callCount(), 2)
    assert.match(warn.mock.calls[1].arguments[0], /^formeo: control set "test-set" has no fields/)
  })

  it('defaults to a stacked layout and an empty row, and copies the row without its id', () => {
    assert.deepEqual(expandControlSet(setOf([{ control: 'text-input' }]), lookup).row, {})
    assert.equal(expandControlSet(setOf([{ control: 'text-input' }]), lookup).layout, 'stacked')
    const columns = expandControlSet(
      setOf([{ control: 'text-input' }], { layout: 'columns', row: { id: 'r-1', config: { legend: 'A' } } }),
      lookup
    )
    assert.equal(columns.layout, 'columns')
    assert.deepEqual(columns.row, { config: { legend: 'A' } })
    assert.equal(expandControlSet(setOf([{ control: 'text-input' }], { layout: 'grid' }), lookup).layout, 'stacked')
  })

  it('a table member keeps its own columns and rows over the control default (#349)', () => {
    const tableControl = {
      tag: 'table',
      config: { label: 'Table', hideLabel: true },
      table: {
        caption: '',
        headerRow: true,
        rowHeaders: false,
        columns: [{ label: 'Column 1' }, { label: 'Column 2' }, { label: 'Column 3' }],
        rows: [{ cells: ['', '', ''] }, { cells: ['', '', ''] }],
      },
    }
    const member = {
      control: 'table',
      table: { caption: 'Hours', columns: [{ label: 'Day' }, { label: 'Open' }], rows: [{ cells: ['Mon', '9–5'] }] },
    }
    const lookupTable = id => (id === 'table' ? structuredClone(tableControl) : undefined)
    const {
      fields: [field],
    } = expandControlSet(setOf([member]), lookupTable)
    assert.equal(field.table.caption, 'Hours')
    assert.deepEqual(field.table.columns, [{ label: 'Day' }, { label: 'Open' }])
    assert.deepEqual(field.table.rows, [{ cells: ['Mon', '9–5'] }])
  })

  it('a matrix member keeps its own columns and rows over the control default (#349 phase 2)', () => {
    const matrixControl = {
      tag: 'table',
      config: { label: 'Matrix', hideLabel: true },
      table: {
        caption: '',
        headerRow: true,
        rowHeaders: true,
        columns: [{ label: '' }, { label: 'Column 1', value: 'column-1', input: 'radio' }],
        rows: [{ value: 'row-1', cells: ['Row 1', ''] }],
      },
    }
    const member = {
      control: 'matrix',
      table: {
        columns: [{ label: '' }, { label: 'Yes', value: 'yes', input: 'checkbox' }],
        rows: [{ value: 'tea', required: true, cells: ['Tea', ''] }],
      },
    }
    const lookupMatrix = id => (id === 'matrix' ? structuredClone(matrixControl) : undefined)
    const {
      fields: [field],
    } = expandControlSet(setOf([member]), lookupMatrix)
    assert.equal(field.table.rowHeaders, true)
    assert.deepEqual(field.table.columns, member.table.columns)
    assert.deepEqual(field.table.rows, member.table.rows)
  })
})
