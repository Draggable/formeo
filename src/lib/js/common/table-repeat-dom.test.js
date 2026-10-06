import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import dom from './dom.js'
import { matrixRowConfig } from './table.mjs'

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
  it('a display table holding repeat renders as a display table', () => {
    const table = { ...display(), repeat: { min: 3 } }
    assert.equal(mount(tableField(table)).outerHTML, mount(tableField(display())).outerHTML)
  })
})

const names = elem => [...elem.querySelectorAll('input')].map(input => input.name)
const rowsOf = wrap => [...wrap.querySelector('tbody').rows]

describe('repeating table markup (#349 phase 3)', () => {
  it('renders min rows with positional names, ids and numbered row headers', () => {
    const wrap = mount(tableField(order()))
    assert.equal(wrap.className, 'f-table-wrap f-table-matrix f-table-repeat')
    assert.equal(wrap.dataset.repeatMin, '2')
    assert.equal(wrap.dataset.repeatMax, '3')
    assert.equal(rowsOf(wrap).length, 2)
    assert.deepEqual(names(wrap), [
      'f-t1[0][qty]',
      'f-t1[0]',
      'f-t1[0][wrap]',
      'f-t1[1][qty]',
      'f-t1[1]',
      'f-t1[1][wrap]',
    ])
    assert.deepEqual(
      rowsOf(wrap).map(tr => tr.dataset.rowKey),
      ['0', '1']
    )
    assert.deepEqual(
      [...wrap.querySelectorAll('tbody th')].map(th => [th.id, th.firstChild.textContent]),
      [
        ['f-t1-r0', 'Item 1'],
        ['f-t1-r1', 'Item 2'],
      ]
    )
    assert.equal(wrap.querySelector('#f-t1-1-1').getAttribute('aria-labelledby'), 'f-t1-r1 f-t1-c1')
  })

  it('applies the template required flag to every row', () => {
    const wrap = mount(tableField(order()))
    for (const tr of rowsOf(wrap)) {
      assert.equal(tr.querySelector('input[type="text"]').required, true)
      assert.equal(tr.querySelector('input[type="radio"]').required, true)
      assert.equal(tr.getAttribute('data-formeo-required-group'), 'true')
      assert.ok(tr.querySelector('th .text-error'), 'the required mark follows the row header')
    }
  })

  it('ends each row with a remove button and adds an actions header', () => {
    const wrap = mount(tableField(order({ min: 1, max: 3 })))
    const header = [...wrap.querySelectorAll('thead th')].at(-1)
    assert.equal(header.querySelector('.f-table-sr').textContent, 'Remove')
    const button = rowsOf(wrap)[0].lastElementChild.querySelector('button')
    assert.equal(button.className, 'f-table-remove-row')
    assert.equal(button.type, 'button')
    assert.equal(button.getAttribute('aria-label'), 'Remove row 1')
    assert.equal(button.innerHTML, dom.icon('remove'), 'the remove icon')
    assert.equal(rowsOf(wrap)[0].lastElementChild.className, 'f-table-row-actions')
  })

  it('puts the Add button and a status region after the table', () => {
    const wrap = mount(tableField(order()))
    const [table, add, status] = wrap.children
    assert.equal(table.tagName, 'TABLE')
    assert.equal(add.className, 'f-table-add-row')
    assert.equal(add.type, 'button')
    assert.equal(add.textContent, '+ Row')
    assert.equal(status.className, 'f-table-status f-table-sr')
    assert.equal(status.getAttribute('role'), 'status')
    assert.equal(status.textContent, '')
  })

  it('disables remove at min rows and Add at max rows', () => {
    const atMin = mount(tableField(order({ min: 2, max: 3 })))
    assert.ok([...atMin.querySelectorAll('.f-table-remove-row')].every(button => button.disabled))
    assert.equal(atMin.querySelector('.f-table-add-row').disabled, false)
    const full = mount(tableField(order({ min: 3, max: 3 })))
    assert.equal(full.querySelector('.f-table-add-row').disabled, true)
  })

  it('starts empty with min 0, and has no data-repeat-max without a max', () => {
    const wrap = mount(tableField(order({ min: 0 })))
    assert.equal(rowsOf(wrap).length, 0)
    assert.equal(wrap.dataset.repeatMin, '0')
    assert.equal('repeatMax' in wrap.dataset, false)
  })

  it('names rows Row n without row headers', () => {
    const wrap = mount(tableField({ ...order(), rowHeaders: false }))
    assert.equal(wrap.querySelector('#f-t1-1-1').getAttribute('aria-label'), 'Row 2, Qty')
  })

  it('uses attrs.name as the base, never as a table attribute', () => {
    const wrap = mount(tableField(order(), { attrs: { className: '', name: 'order' } }))
    assert.equal(names(wrap)[0], 'order[0][qty]')
    assert.equal(wrap.querySelector('table').hasAttribute('name'), false)
  })

  it('shows max(min, 1) inert rows in the preview, with an inert Add button and no status region', () => {
    const wrap = mount(tableField(order({ min: 0 })), true)
    assert.equal(rowsOf(wrap).length, 1)
    assert.equal(wrap.hasAttribute('role'), false)
    assert.equal(wrap.querySelector('table').hasAttribute('inert'), true)
    assert.equal(wrap.querySelector('.f-table-add-row').hasAttribute('inert'), true)
    assert.equal(wrap.querySelector('.f-table-status'), null)
    assert.equal(names(wrap)[0], 'f-t1[0][qty]', 'the preview uses its own id as the base')
  })

  it('renders template text as text', () => {
    const table = { ...order(), rows: [{ cells: ['<img src=x onerror=alert(1)>', '', '', ''] }] }
    const wrap = mount(tableField(table))
    assert.equal(wrap.querySelector('img'), null)
    assert.equal(wrap.querySelector('tbody th').firstChild.textContent, '<img src=x onerror=alert(1)> 1')
  })

  it('matrixRowConfig builds rows past min with the next positional name', () => {
    const elem = dom.create(matrixRowConfig(tableField(order()), 2, dom.tableOptions(false)))
    assert.deepEqual(names(elem), ['f-t1[2][qty]', 'f-t1[2]', 'f-t1[2][wrap]'])
    assert.equal(elem.querySelector('th').firstChild.textContent, 'Item 3')
  })
})
