import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'
import { SKIPPED_ATTR } from './pagination.js'

const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']

/** One stage per entry; each stage holds one row and one column with those fields */
const pagesOf = (...pages) => {
  const data = { id: 'repeat-form', stages: {}, rows: {}, columns: {}, fields: {} }
  pages.forEach((fields, i) => {
    const n = i + 1
    data.stages[`p-${n}`] = { id: `p-${n}`, config: {}, children: [`r-${n}`] }
    data.rows[`r-${n}`] = { id: `r-${n}`, config: {}, children: [`c-${n}`] }
    data.columns[`c-${n}`] = { id: `c-${n}`, config: { width: '100%' }, children: Object.keys(fields) }
    Object.assign(data.fields, fields)
  })
  return data
}

const order = (repeat = { min: 1, max: 3 }, extra = {}) => ({
  caption: 'Order',
  headerRow: true,
  rowHeaders: true,
  repeat,
  columns: [
    { label: 'Item', value: 'item' },
    { label: 'Qty', value: 'qty', input: 'text' },
    { label: 'Size', value: 'size', input: 'radio' },
    { label: 'Large', value: 'large', input: 'radio' },
    { label: 'Wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [{ cells: ['Item', '', '', '', ''] }],
  ...extra,
})

const repeatField = (id, table = order(), extra = {}) => ({
  [id]: {
    id,
    tag: 'table',
    attrs: { className: '', name: 'order' },
    config: { label: 'Order', hideLabel: true },
    table,
    ...extra,
  },
})

describe('repeating rows (#349 phase 3)', () => {
  let window
  let container
  const nativeEvent = global.Event

  beforeEach(() => {
    const jsdom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    window = jsdom.window
    for (const name of GLOBALS) {
      global[name] = name === 'window' ? window : name === 'document' ? window.document : window[name]
    }
    global.Event = window.Event
    container = window.document.getElementById('container')
  })

  afterEach(() => {
    for (const name of GLOBALS) delete global[name]
    global.Event = nativeEvent
  })

  const render = (data, opts = {}) => {
    const renderer = new FormeoRenderer({ renderContainer: container, ...opts })
    renderer.render(data)
    return renderer
  }
  const $ = selector => container.querySelector(selector)
  const $$ = selector => [...container.querySelectorAll(selector)]
  const rows = () => $$('.f-table-repeat tbody tr')
  const addButton = () => $('.f-table-add-row')
  const removeButtons = () => $$('.f-table-remove-row')
  const status = () => $('.f-table-status')
  const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))
  const type = (input, value) => {
    input.value = value
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  }
  const check = input => {
    input.checked = true
    input.dispatchEvent(new window.Event('change', { bubbles: true }))
  }

  test('Add appends a row with the next names, focuses its first input and announces it', async () => {
    render(pagesOf(repeatField('t1')))
    addButton().click()
    assert.equal(rows().length, 2)
    assert.deepEqual(
      [...rows()[1].querySelectorAll('input')].map(input => input.name),
      ['order[1][qty]', 'order[1]', 'order[1]', 'order[1][wrap]']
    )
    assert.equal(window.document.activeElement, rows()[1].querySelector('input'))
    await nextFrames()
    assert.equal(status().textContent, 'Item 2 added')
  })

  test('a click on the icon inside a button still acts', () => {
    render(pagesOf(repeatField('t1')))
    addButton().click()
    const icon = removeButtons()[1].querySelector('svg') ?? removeButtons()[1].firstChild
    icon.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    assert.equal(rows().length, 1)
  })

  test('limits: remove is disabled at min, Add at max', () => {
    render(pagesOf(repeatField('t1')))
    assert.equal(removeButtons()[0].disabled, true)
    addButton().click()
    assert.deepEqual(
      removeButtons().map(button => button.disabled),
      [false, false]
    )
    assert.equal(addButton().disabled, false)
    addButton().click()
    assert.equal(addButton().disabled, true)
    assert.deepEqual(
      removeButtons().map(button => button.disabled),
      [false, false, false],
      'a row built after render has an enabled remove button'
    )
    removeButtons()[2].click()
    assert.equal(addButton().disabled, false, 'removing from max re-enables Add')
    removeButtons()[1].click()
    assert.deepEqual(
      removeButtons().map(button => button.disabled),
      [true],
      'back at min, the last remove button is disabled'
    )
    addButton().click()
    addButton().click()
    addButton().click()
    assert.equal(rows().length, 3, 'a disabled Add does nothing')
  })

  test('removing a middle row renumbers later rows and keeps their answers', async () => {
    render(pagesOf(repeatField('t1')))
    addButton().click()
    addButton().click()
    type($('#f-t1-1-1'), 'two')
    type($('#f-t1-2-1'), 'three')
    check($('#f-t1-2-3'))
    check($('#f-t1-2-4'))
    removeButtons()[1].click()
    assert.equal(rows().length, 2)
    const last = rows()[1]
    assert.equal(last.dataset.rowKey, '1')
    assert.equal(last.querySelector('th').firstChild.textContent, 'Item 2')
    assert.equal(last.querySelector('input[type="text"]').name, 'order[1][qty]')
    assert.equal(last.querySelector('input[type="text"]').id, 'f-t1-1-1')
    assert.equal(last.querySelector('input[type="text"]').value, 'three')
    assert.equal(last.querySelector('input[value="large"]').checked, true)
    assert.equal(last.querySelector('input[value="size"]').checked, false)
    assert.equal(last.querySelector('input[type="checkbox"]').checked, true)
    assert.equal(last.querySelector('.f-table-remove-row').getAttribute('aria-label'), 'Remove row 2')
    await nextFrames()
    assert.equal(status().textContent, 'Item 2 removed')
  })

  test('renumbering never links two rows radios', () => {
    const renderer = render(pagesOf(repeatField('t1')))
    addButton().click()
    addButton().click()
    check($('#f-t1-0-2'))
    check($('#f-t1-1-3'))
    check($('#f-t1-2-2'))
    removeButtons()[0].click()
    assert.deepEqual(renderer.userData, {
      'order[0][qty]': '',
      'order[0]': 'large',
      'order[1][qty]': '',
      'order[1]': 'size',
    })
  })

  test('removing a middle row whose radio is checked never links radios, even mid-renumber', () => {
    render(pagesOf(repeatField('t1', order({ min: 1, max: null }))))
    for (let i = 0; i < 3; i++) addButton().click()
    check($('#f-t1-0-2'))
    check($('#f-t1-1-3'))
    check($('#f-t1-2-2'))
    check($('#f-t1-3-3'))
    // after every row swap, no radio name may be shared by two rows
    const proto = window.HTMLElement.prototype
    const original = proto.replaceWith
    const snapshots = []
    proto.replaceWith = function (...nodes) {
      original.apply(this, nodes)
      const names = rows().map(tr => tr.querySelector('input[type="radio"]').name)
      snapshots.push(names)
    }
    try {
      removeButtons()[1].click()
    } finally {
      proto.replaceWith = original
    }
    assert.ok(snapshots.length > 0, 'later rows were rebuilt')
    for (const names of snapshots) {
      assert.equal(new Set(names).size, names.length, `radio names stay distinct: ${names}`)
    }
    assert.deepEqual(
      rows().map(tr => tr.querySelector('input[type="radio"]:checked')?.value),
      ['size', 'size', 'large']
    )
    assert.deepEqual(
      rows().map(tr => tr.querySelector('input[type="radio"]').name),
      ['order[0]', 'order[1]', 'order[2]']
    )
  })

  test('focus after remove: the button now at that index, else the previous one, else Add', () => {
    render(pagesOf(repeatField('t1', order({ min: 1, max: null }))))
    addButton().click()
    addButton().click()
    removeButtons()[1].click()
    assert.equal(window.document.activeElement, removeButtons()[1])
    removeButtons()[1].click()
    assert.equal(window.document.activeElement, addButton(), 'the only remove button left is disabled')
  })

  test('a required checkbox row stays satisfied by its checked box after renumbering', () => {
    const table = order({ min: 1, max: 3 }, { rows: [{ cells: ['Item', '', '', '', ''], required: true }] })
    render(pagesOf(repeatField('t1', table)))
    addButton().click()
    addButton().click()
    check($('#f-t1-2-4'))
    removeButtons()[0].click()
    const box = rows()[1].querySelector('input[type="checkbox"]')
    assert.equal(box.checked, true)
    assert.equal(box.required, false)
    assert.equal(rows()[0].querySelector('input[type="checkbox"]').required, true)
  })

  test('add and remove fire onChange with a formeo:rowschange event', () => {
    const calls = []
    render(pagesOf(repeatField('t1')), { events: { onChange: detail => calls.push(detail) } })
    addButton().click()
    removeButtons()[0].click()
    const changes = calls.filter(({ event }) => event.type === 'formeo:rowschange')
    assert.deepEqual(
      changes.map(({ event }) => event.detail),
      [
        { action: 'add', index: 1 },
        { action: 'remove', index: 0 },
      ]
    )
    assert.ok(changes[1].userData['order[0][qty]'] !== undefined)
  })

  test('two renderers add rows to their own tables', () => {
    const second = window.document.createElement('div')
    window.document.body.append(second)
    render(pagesOf(repeatField('t1')))
    const other = new FormeoRenderer({ renderContainer: second })
    other.render(pagesOf(repeatField('t2')))
    second.querySelector('.f-table-add-row').click()
    assert.equal(rows().length, 1, 'the first renderer table is untouched')
    assert.equal(second.querySelectorAll('tbody tr').length, 2)
  })

  test('a matrix without repeat gets no buttons and no behaviour', () => {
    const { repeat: _repeat, ...matrix } = order()
    render(pagesOf(repeatField('t1', { ...matrix, rows: [{ value: 'a', cells: ['A', '', '', '', ''] }] })))
    assert.equal(addButton(), null)
    assert.equal(removeButtons().length, 0)
  })
  test('the getter reads every row; the setter creates the rows it needs and fills them', () => {
    const first = render(pagesOf(repeatField('t1')))
    addButton().click()
    type($('#f-t1-0-1'), '2')
    check($('#f-t1-1-3'))
    check($('#f-t1-1-4'))
    const saved = first.userData
    assert.deepEqual(saved, {
      'order[0][qty]': '2',
      'order[1][qty]': '',
      'order[1]': 'large',
      'order[1][wrap]': 'wrap',
    })

    const fresh = render(pagesOf(repeatField('t1')))
    assert.equal(rows().length, 1)
    fresh.userData = saved
    assert.equal(rows().length, 2)
    assert.deepEqual(fresh.userData, saved)
    assert.notEqual(window.document.activeElement, rows()[1].querySelector('input'), 'the setter never moves focus')
  })

  test('the setter grows quietly: no rowschange event, no onChange, no announcement', () => {
    const changes = []
    const events = []
    const renderer = render(pagesOf(repeatField('t1')), { events: { onChange: detail => changes.push(detail) } })
    $('form').addEventListener('formeo:rowschange', event => events.push(event))
    renderer.userData = { 'order[2][qty]': 'x' }
    assert.equal(rows().length, 3)
    assert.equal(events.length, 0)
    assert.equal(changes.length, 0)
    assert.equal(status().textContent, '')
  })

  test('the setter never shrinks the table and stops at max', t => {
    const warn = t.mock.method(console, 'warn', () => {})
    const renderer = render(pagesOf(repeatField('t1', order({ min: 2, max: 3 }))))
    renderer.userData = { 'order[0][qty]': 'a' }
    assert.equal(rows().length, 2)
    renderer.userData = { 'order[4][qty]': 'e', 'order[2][qty]': 'c' }
    assert.equal(rows().length, 3)
    assert.equal($('#f-t1-2-1').value, 'c')
    assert.match(warn.mock.calls.at(-1).arguments[0], /order\[4\]\[qty\]/)
  })

  test('a huge saved index stops at the setter limit when there is no max', t => {
    const warn = t.mock.method(console, 'warn', () => {})
    const renderer = render(pagesOf(repeatField('t1', order({ min: 1 }))))
    renderer.userData = { 'order[99999][qty]': 'x' }
    assert.equal(rows().length, 500)
    assert.match(warn.mock.calls.at(-1).arguments[0], /order\[99999\]\[qty\]/)
  })

  test('keys that are not positional rows are left to the unmatched warning', t => {
    const warn = t.mock.method(console, 'warn', () => {})
    const renderer = render(pagesOf(repeatField('t1')))
    renderer.userData = { 'order[speed][qty]': 'x', 'order[-1][qty]': 'y', 'order[01][qty]': 'z' }
    assert.equal(rows().length, 1)
    assert.equal(warn.mock.calls.length, 1)
  })

  test('rows the setter adds inside a condition-hidden table are not required until it shows', () => {
    const table = order({ min: 1, max: 3 }, { rows: [{ cells: ['Item', '', '', '', ''], required: true }] })
    const data = pagesOf({
      tx: { id: 'tx', tag: 'input', attrs: { type: 'text', name: 'tx' }, config: { label: 'Tx' } },
      ...repeatField('t1', table),
    })
    data.stages['p-1'].conditions = [
      {
        if: [{ source: 'fields.tx', sourceProperty: 'value', comparison: 'equals', target: '' }],
        then: [{ target: 'fields.t1', targetProperty: 'isNotVisible' }],
      },
      // conditions don't undo themselves when they stop matching, so showing it again is its own condition
      {
        if: [{ source: 'fields.tx', sourceProperty: 'value', comparison: 'notEquals', target: '' }],
        then: [{ target: 'fields.t1', targetProperty: 'isVisible' }],
      },
    ]
    const renderer = render(data)
    renderer.userData = { 'order[2][qty]': 'x' }
    assert.equal(rows().length, 3)
    assert.ok(rows().every(tr => !tr.querySelector('input[type="text"]').required))
    type($('#f-tx'), 'show')
    assert.ok(rows().every(tr => tr.querySelector('input[type="text"]').required))
  })

  test('rows the setter adds on a skipped page are disabled, and come back enabled with the limits applied', () => {
    const renderer = render(pagesOf(repeatField('t1', order({ min: 1, max: 2 }))))
    const stage = $('.formeo-stage')
    stage.setAttribute(SKIPPED_ATTR, '')
    renderer.userData = { 'order[1][qty]': 'x' }
    const added = rows()[1]
    assert.ok([...added.querySelectorAll('input, button')].every(control => control.disabled))
    renderer.setStageSkipped(stage, false)
    assert.ok([...added.querySelectorAll('input')].every(control => !control.disabled))
    assert.equal(addButton().disabled, true, 'at max after the page comes back')
    assert.deepEqual(
      removeButtons().map(button => button.disabled),
      [false, false]
    )
  })

  test('userFormData labels positional rows by their numbered name', () => {
    const renderer = render(pagesOf(repeatField('t1')))
    addButton().click()
    check($('#f-t1-1-2'))
    const labels = Object.fromEntries(renderer.userFormData.map(({ key, label }) => [key, label]))
    assert.equal(labels['order[1][qty]'], 'Order: Item 2, Qty')
    assert.equal(labels['order[1]'], 'Order: Item 2')
  })

  test('userFormData falls back to Row n without row headers', () => {
    const renderer = render(pagesOf(repeatField('t1', { ...order(), rowHeaders: false })))
    const [entry] = renderer.userFormData
    assert.equal(entry.label, 'Order: Row 1, Qty')
  })

  test('a required empty row blocks Next', () => {
    const table = order({ min: 1, max: 3 }, { rows: [{ cells: ['Item', '', '', '', ''], required: true }] })
    const renderer = render(
      pagesOf(repeatField('t1', table), {
        n1: { id: 'n1', tag: 'input', attrs: { type: 'text', name: 'n1' }, config: { label: 'N' } },
      }),
      { pagination: 'wizard' }
    )
    addButton().click()
    type($('#f-t1-0-1'), '1')
    check($('#f-t1-0-2'))
    check($('#f-t1-0-4'))
    $('.formeo-pages-next').click()
    assert.equal(renderer.page, 0, 'row 2 is empty and required')
    // jsdom's reportValidity doesn't move focus; tests/table-repeat.spec.js checks where the report lands
  })

  test('row and cell addresses on a repeating table never match and never act', () => {
    const data = pagesOf({
      ...repeatField('t1'),
      tx: { id: 'tx', tag: 'input', attrs: { type: 'text', name: 'tx' }, config: { label: 'Tx' } },
    })
    data.stages['p-1'].conditions = [
      {
        if: [{ source: 'fields.t1.table.rows[0].cells[1]', sourceProperty: 'value', comparison: 'equals', target: '' }],
        then: [{ target: 'fields.tx', targetProperty: 'isNotVisible' }],
      },
      {
        if: [{ source: 'fields.tx', sourceProperty: 'value', comparison: 'equals', target: '' }],
        then: [{ target: 'fields.t1.table.rows[0]', targetProperty: 'isNotVisible' }],
      },
    ]
    render(data)
    assert.equal($('#f-tx').parentElement.hidden, false)
    assert.equal(rows()[0].hidden, false)
  })

  test('the whole repeating table can still be hidden', () => {
    const data = pagesOf({
      ...repeatField('t1'),
      tx: { id: 'tx', tag: 'input', attrs: { type: 'text', name: 'tx' }, config: { label: 'Tx' } },
    })
    data.stages['p-1'].conditions = [
      {
        if: [{ source: 'fields.tx', sourceProperty: 'value', comparison: 'equals', target: 'hide' }],
        then: [{ target: 'fields.t1', targetProperty: 'isNotVisible' }],
      },
    ]
    render(data)
    type($('#f-tx'), 'hide')
    assert.equal($('.f-table-repeat').hidden, true)
  })

  test('a reset keeps the rows', async () => {
    render(pagesOf(repeatField('t1')))
    addButton().click()
    $('form').reset()
    await nextFrames()
    assert.equal(rows().length, 2)
  })

  test('renderer.html holds min rows and both buttons', () => {
    const renderer = render(pagesOf(repeatField('t1', order({ min: 2, max: 3 }))))
    const { html } = renderer
    assert.equal((html.match(/data-row-key="/g) ?? []).length, 2)
    assert.match(html, /class="f-table-add-row"/)
    assert.match(html, /class="f-table-remove-row"/)
  })

  test('a max above the setter limit lets a saved row past 500 grow the table up to the max', t => {
    t.mock.method(console, 'warn', () => {})
    const renderer = render(pagesOf(repeatField('t1', order({ min: 1, max: 600 }))))
    renderer.userData = { 'order[549][qty]': 'x' }
    assert.equal(rows().length, 550)
    assert.equal($('#f-t1-549-1').value, 'x')
  })
})
