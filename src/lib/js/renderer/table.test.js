import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const formWith = fields => {
  const ids = Object.keys(fields)
  return {
    id: 'table-form',
    stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
    rows: { 'row-1': { id: 'row-1', config: {}, children: ids.map(id => `column-${id}`) } },
    columns: Object.fromEntries(
      ids.map(id => [`column-${id}`, { id: `column-${id}`, config: { width: '100%' }, children: [id] }])
    ),
    fields,
  }
}

const hours = () => ({
  caption: 'Opening hours',
  headerRow: true,
  rowHeaders: false,
  columns: [{ label: 'Day' }, { label: 'Hours' }],
  rows: [{ cells: ['Mon', '9–5'] }, { cells: ['Tue', '9–1'] }],
})

const tableField = (id, table = hours(), extra = {}) => ({
  id,
  tag: 'table',
  attrs: { className: 'table table-bordered' },
  config: { label: 'Table', hideLabel: true, controlId: 'table' },
  table,
  ...extra,
})

const textField = (id, name) => ({ id, tag: 'input', attrs: { type: 'text', name }, config: { label: 'Name' } })

const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']

describe('table fields in the renderer (#349)', () => {
  let window
  let container
  const nativeEvent = global.Event

  beforeEach(() => {
    const jsdom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    window = jsdom.window
    global.document = window.document
    global.window = window
    global.Element = window.Element
    global.HTMLElement = window.HTMLElement
    global.HTMLFormElement = window.HTMLFormElement
    global.Node = window.Node
    global.FormData = window.FormData
    global.Event = window.Event
    container = window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of GLOBALS) {
      delete global[key]
    }
    global.Event = nativeEvent
  })

  const render = (fields, opts = {}) => {
    const renderer = new FormeoRenderer({ renderContainer: container, formData: formWith(fields), ...opts })
    renderer.render()
    return renderer
  }
  const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))

  test('renders a captioned, semantic table inside a focusable region', () => {
    render({ t1: tableField('t1') })
    const table = container.querySelector('#f-t1')
    assert.equal(table.tagName, 'TABLE')
    assert.equal(table.className, 'f-table table table-bordered')
    const wrap = table.parentElement
    assert.equal(wrap.className, 'f-table-wrap')
    assert.equal(wrap.getAttribute('role'), 'region')
    assert.equal(wrap.getAttribute('tabindex'), '0')
    assert.equal(wrap.getAttribute('aria-labelledby'), 'f-t1-caption')
    assert.equal(table.querySelector('caption').id, 'f-t1-caption')
    assert.equal(table.querySelector('caption').textContent, 'Opening hours')
    assert.deepEqual(
      [...table.querySelectorAll('thead th')].map(th => [th.getAttribute('scope'), th.textContent]),
      [
        ['col', 'Day'],
        ['col', 'Hours'],
      ]
    )
    assert.deepEqual(
      [...table.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(cell => cell.textContent)),
      [
        ['Mon', '9–5'],
        ['Tue', '9–1'],
      ]
    )
  })

  test('row headers render as th scope=row, and no thead without a header row', () => {
    render({ t1: tableField('t1', { ...hours(), headerRow: false, rowHeaders: true }) })
    const table = container.querySelector('#f-t1')
    assert.equal(table.querySelector('thead'), null)
    const rowHeaders = [...table.querySelectorAll('tbody th[scope="row"]')].map(th => th.textContent)
    assert.deepEqual(rowHeaders, ['Mon', 'Tue'])
  })

  test('cell, header and caption text that looks like markup stays text', () => {
    const hostile = '<img src=x onerror="window.__pwned = 1">'
    render({
      t1: tableField('t1', { caption: hostile, columns: [{ label: hostile }], rows: [{ cells: [hostile] }] }),
    })
    const table = container.querySelector('#f-t1')
    assert.equal(table.querySelector('img'), null)
    assert.equal(table.querySelector('caption').textContent, hostile)
    assert.equal(table.querySelector('th').textContent, hostile)
    assert.equal(table.querySelector('td').textContent, hostile)
  })

  test('hand-written ragged data renders a rectangular table', () => {
    render({ t1: tableField('t1', { columns: ['A', 'B', 'C'], rows: [['1'], { cells: ['1', '2', '3', '4'] }] }) })
    const rows = [...container.querySelectorAll('#f-t1 tbody tr')].map(tr => tr.children.length)
    assert.deepEqual(rows, [3, 3])
  })

  test('renders only the table, with no <label>, even when hideLabel is false', () => {
    render({ t1: tableField('t1', hours(), { config: { label: 'Hours', hideLabel: false, controlId: 'table' } }) })
    const column = container.querySelector('#f-column-t1')
    assert.equal(column.querySelector('label'), null)
  })

  test('the static html getter includes the whole table', () => {
    const renderer = new FormeoRenderer({ formData: formWith({ t1: tableField('t1') }) })
    const { html } = renderer
    assert.match(html, /<div class="f-table-wrap" role="region" tabindex="0" aria-labelledby="f-t1-caption">/)
    assert.match(html, /<th scope="col">Day<\/th>/)
    assert.match(html, /<td>9–5<\/td>/)
  })

  test('a condition can hide the whole table region', () => {
    render({
      s1: { id: 's1', tag: 'input', attrs: { type: 'text', name: 'hide' }, config: { label: 'Hide?' } },
      t1: tableField('t1', hours(), {
        conditions: [
          {
            if: [
              { source: 'fields.s1', sourceProperty: 'value', comparison: 'equals', target: 'yes', targetProperty: '' },
            ],
            then: [{ target: 'fields.t1', targetProperty: 'isNotVisible', assignment: '', value: '' }],
          },
        ],
      }),
    })
    const wrap = container.querySelector('#f-t1').parentElement
    assert.equal(wrap.hasAttribute('hidden'), false)
    const input = container.querySelector('#f-s1')
    input.value = 'yes'
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
    assert.equal(wrap.hasAttribute('hidden'), true)
    assert.equal(wrap.className, 'f-table-wrap')
  })

  test('adds nothing to userData', () => {
    assert.deepEqual(render({ t1: tableField('t1') }).userData, {})
    const renderer = render({ t1: tableField('t1'), n1: textField('n1', 'name') })
    container.querySelector('#f-n1').value = 'Ada'
    assert.deepEqual(renderer.userData, { name: 'Ada' })
  })

  describe('custom table controls from before the built-in (#349, #260)', () => {
    test('the content table from the #349 reply renders as before', () => {
      render({
        legacy: {
          id: 'legacy',
          tag: 'table',
          config: { label: 'Table', hideLabel: true, controlId: 'table' },
          content: [{ tag: 'tr', children: [{ tag: 'td', children: 'Cell' }] }],
        },
      })
      const table = container.querySelector('#f-legacy')
      assert.equal(table.tagName, 'TABLE')
      assert.equal(table.querySelector('td').textContent, 'Cell')
      assert.equal(table.parentElement.classList.contains('f-table-wrap'), false)
    })

    test('the #260 data-rows/data-cols control still gets its onRender action from elements', async () => {
      const seen = []
      render(
        {
          rowsCols: {
            id: 'rowsCols',
            tag: 'div',
            attrs: { 'data-rows': 2, 'data-cols': 3 },
            config: { label: 'Custom Table Rows', controlId: 'html.TableRows' },
          },
        },
        { elements: { 'html.TableRows': { action: { onRender: elem => seen.push(elem.dataset) } } } }
      )
      await nextFrames()
      assert.equal(seen.length, 1)
      assert.equal(seen[0].rows, '2')
      assert.equal(seen[0].cols, '3')
    })
  })
})
