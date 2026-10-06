import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import dom, { REQUIRED_GROUP_ATTR } from './dom.js'
import { REQUIRED_ROW_ATTR, tableDomConfig } from './table.mjs'

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

const matrixField = (table = rating(), extra = {}) => ({
  id: 'f-m1',
  tag: 'table',
  attrs: { className: '' },
  config: { label: 'Visit <b>survey</b>', hideLabel: true },
  table,
  ...extra,
})

/** Renders through dom.create's table hook and mounts it, so change events reach the row */
const mount = (field, isPreview = false) => {
  const elem = dom.create(field, isPreview)
  document.body.replaceChildren(elem)
  return elem
}
const names = (elem, selector = 'input') => [...elem.querySelectorAll(selector)].map(input => input.name)

afterEach(() => document.body.replaceChildren())

describe('matrix markup (#349 phase 2)', () => {
  it('leaves a table without input columns as phase 1 renders it', () => {
    const table = { ...rating(), columns: rating().columns.map(({ label }) => ({ label })) }
    const wrap = mount(matrixField(table))
    assert.equal(wrap.className, 'f-table-wrap')
    assert.equal(wrap.getAttribute('role'), 'region')
    assert.equal(wrap.querySelector('table').hasAttribute('role'), false)
    assert.equal(wrap.querySelectorAll('input').length, 0)
  })

  it('names radios by row and other cells by row and column, valued by the column key', () => {
    const wrap = mount(matrixField())
    assert.deepEqual(names(wrap), [
      'f-m1[speed]',
      'f-m1[speed]',
      'f-m1[speed][comment]',
      'f-m1[price]',
      'f-m1[price]',
      'f-m1[price][comment]',
    ])
    const [poor, good, comment] = wrap.querySelectorAll('tbody tr:first-child input')
    assert.deepEqual([poor.type, poor.value, poor.id], ['radio', 'poor', 'f-m1-0-1'])
    assert.deepEqual([good.type, good.value], ['radio', 'good'])
    assert.deepEqual([comment.type, comment.hasAttribute('value'), comment.id], ['text', false, 'f-m1-0-3'])
  })

  it('makes a checkbox cell its own name, valued by the column key', () => {
    const table = rating()
    table.columns[2].input = 'checkbox'
    const wrap = mount(matrixField(table))
    const box = wrap.querySelector('#f-m1-1-2')
    assert.deepEqual([box.type, box.name, box.value], ['checkbox', 'f-m1[price][good]', 'good'])
  })

  it('uses a trimmed attrs.name as the base and never puts it on the <table>', () => {
    const wrap = mount(matrixField(rating(), { attrs: { className: '', name: ' visit ' } }))
    assert.equal(names(wrap)[0], 'visit[speed]')
    assert.equal(wrap.querySelector('table').hasAttribute('name'), false)
  })

  it('keys blank and duplicate values with withKeys', () => {
    const table = rating()
    table.rows[1].value = 'speed'
    table.columns[2].value = ''
    const wrap = mount(matrixField(table))
    assert.deepEqual(names(wrap, 'tbody tr:nth-child(2) input'), ['f-m1[row-2]', 'f-m1[row-2]', 'f-m1[row-2][comment]'])
    assert.equal(wrap.querySelector('#f-m1-0-2').value, 'column-3')
  })

  it('labels each input by its row header and column header', () => {
    const wrap = mount(matrixField())
    assert.equal(wrap.querySelector('#f-m1-0-1').getAttribute('aria-labelledby'), 'f-m1-r0 f-m1-c1')
    assert.equal(wrap.querySelector('#f-m1-r0').textContent, 'Speed*')
    assert.equal(wrap.querySelector('#f-m1-c1').textContent, 'Poor')
  })

  it('falls back to an aria-label when a row header or column label is missing', () => {
    const noRowHeaders = { ...rating(), rowHeaders: false }
    const wrap = mount(matrixField(noRowHeaders))
    const input = wrap.querySelector('#f-m1-0-1')
    assert.equal(input.hasAttribute('aria-labelledby'), false)
    assert.equal(input.getAttribute('aria-label'), 'Row 1, Poor')
    const blankLabel = rating()
    blankLabel.columns[2].label = ''
    const second = mount(matrixField(blankLabel))
    assert.equal(second.querySelector('#f-m1-0-2').getAttribute('aria-label'), 'Speed, Column 3')
    assert.equal(second.querySelector('#f-m1-0-2').previousElementSibling.textContent, 'Column 3')
  })

  it('always renders the header row once the table has inputs', () => {
    const wrap = mount(matrixField({ ...rating(), headerRow: false }))
    assert.equal(wrap.querySelectorAll('thead th').length, 4)
  })

  it('carries explicit table roles, so stacking keeps the semantics', () => {
    const wrap = mount(matrixField())
    const table = wrap.querySelector('table')
    assert.equal(table.getAttribute('role'), 'table')
    assert.equal(table.getAttribute('aria-labelledby'), 'f-m1-caption')
    assert.deepEqual(
      [...table.querySelectorAll('thead, tbody')].map(el => el.getAttribute('role')),
      ['rowgroup', 'rowgroup']
    )
    assert.ok([...table.querySelectorAll('tr')].every(tr => tr.getAttribute('role') === 'row'))
    assert.ok([...table.querySelectorAll('thead th')].every(th => th.getAttribute('role') === 'columnheader'))
    assert.equal(table.querySelector('tbody th').getAttribute('role'), 'rowheader')
    assert.equal(table.querySelector('tbody th').getAttribute('scope'), 'row')
    assert.ok([...table.querySelectorAll('td')].every(td => td.getAttribute('role') === 'cell'))
  })

  it('wraps the matrix in a group named by its caption, else the plain label, with no tab stop', () => {
    const wrap = mount(matrixField())
    assert.equal(wrap.className, 'f-table-wrap f-table-matrix')
    assert.equal(wrap.getAttribute('role'), 'group')
    assert.equal(wrap.getAttribute('aria-labelledby'), 'f-m1-caption')
    assert.equal(wrap.hasAttribute('tabindex'), false)
    const unnamed = mount(matrixField({ ...rating(), caption: '' }))
    assert.equal(unnamed.getAttribute('aria-label'), 'Visit survey')
  })

  it('puts each input in a label.f-table-cell with an aria-hidden column label', () => {
    const wrap = mount(matrixField())
    const input = wrap.querySelector('#f-m1-0-1')
    const cell = input.parentElement
    assert.equal(cell.tagName, 'LABEL')
    assert.equal(cell.className, 'f-table-cell')
    const label = cell.querySelector('.f-table-cell-label')
    assert.equal(label.getAttribute('aria-hidden'), 'true')
    assert.equal(label.textContent, 'Poor')
  })

  it('a required row requires its radios and text inputs, and marks its header', () => {
    const wrap = mount(matrixField())
    const [speed, price] = wrap.querySelectorAll('tbody tr')
    assert.ok([...speed.querySelectorAll('input')].every(input => input.required))
    assert.ok([...price.querySelectorAll('input')].every(input => !input.required))
    const mark = speed.querySelector('th .text-error')
    assert.equal(mark.textContent, '*')
    assert.equal(mark.getAttribute('aria-hidden'), 'true')
    assert.equal(price.querySelector('.text-error'), null)
  })

  it('a required checkbox row needs at least one box checked', () => {
    assert.equal(REQUIRED_ROW_ATTR, `data-${REQUIRED_GROUP_ATTR}`)
    const table = rating()
    table.columns[1].input = 'checkbox'
    table.columns[2].input = 'checkbox'
    const wrap = mount(matrixField(table))
    const row = wrap.querySelector('tbody tr')
    assert.equal(row.getAttribute(REQUIRED_ROW_ATTR), 'true')
    const [first, second] = row.querySelectorAll('input[type="checkbox"]')
    assert.deepEqual([first.required, second.required], [true, true])
    first.checked = true
    first.dispatchEvent(new window.Event('change', { bubbles: true }))
    assert.deepEqual([first.required, second.required], [false, false])
    assert.equal(row.querySelector('input[type="text"]').required, true)
    assert.equal(wrap.querySelectorAll(`[${REQUIRED_ROW_ATTR}]`).length, 1)
  })

  it('marks the first static cell of a required row when there are no row headers', () => {
    const table = { ...rating(), rowHeaders: false }
    const wrap = mount(matrixField(table))
    const firstCell = wrap.querySelector('tbody tr td')
    assert.equal(firstCell.textContent, 'Speed*')
    assert.equal(firstCell.querySelector('.text-error').getAttribute('aria-hidden'), 'true')
  })

  it('makes the editor preview inert, unnamed by attrs.name, with no role and no row sync', () => {
    const table = rating()
    table.columns[1].input = 'checkbox'
    table.columns[2].input = 'checkbox'
    const wrap = mount(matrixField(table, { id: 'prev-m1', attrs: { className: '', name: 'visit' } }), true)
    assert.equal(wrap.querySelector('table').hasAttribute('inert'), true)
    assert.equal(wrap.hasAttribute('role'), false)
    assert.equal(wrap.className, 'f-table-wrap f-table-matrix')
    assert.equal(names(wrap)[0], 'prev-m1[speed][poor]')
    const [first, second] = wrap.querySelectorAll('tbody tr:first-child input[type="checkbox"]')
    first.checked = true
    first.dispatchEvent(new window.Event('change', { bubbles: true }))
    assert.equal(second.required, true)
  })

  it('renders header, cell and caption text as text', () => {
    const table = rating()
    table.caption = '<img src=x onerror=alert(1)>'
    table.columns[1].label = '<img src=x onerror=alert(2)>'
    table.rows[0].cells[0] = '<img src=x onerror=alert(3)>'
    const wrap = mount(matrixField(table))
    assert.equal(wrap.querySelector('img'), null)
    assert.equal(wrap.querySelector('caption').textContent, '<img src=x onerror=alert(1)>')
    assert.equal(wrap.querySelector('#f-m1-0-1').previousElementSibling.textContent, '<img src=x onerror=alert(2)>')
  })

  it('works without an id (no ids, aria-label names)', () => {
    const config = tableDomConfig({ table: rating() })
    const elem = dom.create(config)
    assert.equal(elem.querySelector('[id]'), null)
    assert.equal(elem.querySelector('input').getAttribute('aria-label'), 'Speed, Poor')
  })
})
