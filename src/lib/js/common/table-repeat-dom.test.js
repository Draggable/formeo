import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import dom from './dom.js'

const display = () => ({
  caption: 'Hours',
  headerRow: true,
  rowHeaders: true,
  columns: [{ label: 'Day' }, { label: 'Open' }],
  rows: [{ cells: ['Mon', '9–5'] }, { cells: ['Tue', '<img src=x onerror=alert(1)>'] }],
})

const rating = () => ({
  caption: 'Visit',
  headerRow: true,
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Comment', value: 'comment', input: 'text' },
    { label: 'Wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [
    { value: 'speed', required: true, cells: ['Speed', '', '', ''] },
    { value: 'price', cells: ['Price', '', '', ''] },
  ],
})

const order = (repeat = { min: 2, max: 3 }) => ({
  caption: 'Order',
  headerRow: true,
  rowHeaders: true,
  repeat,
  columns: [
    { label: 'Item', value: 'item' },
    { label: 'Qty', value: 'qty', input: 'text' },
    { label: 'Size', value: 'size', input: 'radio' },
    { label: 'Wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [{ cells: ['Item', '', '', ''], required: true }],
})

const tableField = (table, extra = {}) => ({
  id: 'f-t1',
  tag: 'table',
  attrs: { className: '' },
  config: { label: 'Order form', hideLabel: true },
  table,
  ...extra,
})

const mount = (field, isPreview = false) => {
  const elem = dom.create(field, isPreview)
  document.body.replaceChildren(elem)
  return elem
}

afterEach(() => document.body.replaceChildren())

describe('phase 1 and 2 markup stays byte-identical (#349 phase 3)', () => {
  it('a display table', t => {
    t.assert.snapshot(mount(tableField(display())).outerHTML)
  })
  it('a display table in the preview', t => {
    t.assert.snapshot(mount(tableField(display()), true).outerHTML)
  })
  it('a matrix', t => {
    t.assert.snapshot(mount(tableField(rating(), { attrs: { className: 'x', name: 'visit' } })).outerHTML)
  })
  it('a matrix in the preview', t => {
    t.assert.snapshot(mount(tableField(rating()), true).outerHTML)
  })
  it('a matrix without row headers', t => {
    t.assert.snapshot(mount(tableField({ ...rating(), rowHeaders: false })).outerHTML)
  })
  it('a display table holding repeat renders as a display table', t => {
    const table = { ...display(), repeat: { min: 3 } }
    assert.equal(mount(tableField(table)).outerHTML, mount(tableField(display())).outerHTML)
  })
})
