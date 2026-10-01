import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const formWith = ({ row = {}, column = {}, rowConfig = {} } = {}) => ({
  id: 'form-la',
  stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
  rows: { 'row-1': { id: 'row-1', className: ['formeo-row'], config: rowConfig, children: ['col-1'], ...row } },
  columns: {
    'col-1': { id: 'col-1', className: ['formeo-column'], config: { width: '50%' }, children: ['field-1'], ...column },
  },
  fields: {
    'field-1': { id: 'field-1', tag: 'input', attrs: { type: 'text', name: 'name' }, config: { label: 'Name' } },
  },
})

// a source field in its own row whose value "hide" hides row-1
const withSourceRow = formData => {
  formData.stages['stage-1'].children.unshift('row-src')
  formData.rows['row-src'] = { id: 'row-src', config: {}, children: ['col-src'] }
  formData.columns['col-src'] = { id: 'col-src', config: { width: '100%' }, children: ['src'] }
  formData.fields.src = {
    id: 'src',
    tag: 'input',
    attrs: { type: 'text' },
    config: { label: 'Source' },
    conditions: [
      {
        if: [{ source: 'fields.src', sourceProperty: 'value', comparison: 'equals', target: 'hide' }],
        then: [{ target: 'rows.row-1', targetProperty: 'isNotVisible', assignment: '', value: '' }],
      },
    ],
  }
  return formData
}

describe('row and column attributes in the renderer (#112)', () => {
  let dom
  let container
  const nativeEvent = global.Event

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    global.document = dom.window.document
    global.window = dom.window
    global.Element = dom.window.Element
    global.HTMLElement = dom.window.HTMLElement
    global.HTMLFormElement = dom.window.HTMLFormElement
    global.Node = dom.window.Node
    global.FormData = dom.window.FormData
    global.Event = dom.window.Event
    container = dom.window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']) {
      delete global[key]
    }
    global.Event = nativeEvent
  })

  const render = formData => {
    new FormeoRenderer({ renderContainer: container }).render(formData)
    return container
  }

  test('row attributes land on the row element conditions target, not its wrapper', () => {
    render(formWith({ row: { attrs: { 'data-section': 'contact', className: 'my-row' } } }))
    const row = container.querySelector('#f-row-1')
    assert.equal(row.getAttribute('data-section'), 'contact')
    assert.ok(row.classList.contains('formeo-row'))
    assert.ok(row.classList.contains('my-row'))
    assert.ok(row.parentElement.classList.contains('formeo-row-wrap'))
    assert.equal(row.parentElement.hasAttribute('data-section'), false)
  })

  test('a fieldset row keeps attributes on the inner row element', () => {
    render(formWith({ rowConfig: { fieldset: true, legend: 'Contact' }, row: { attrs: { 'data-x': '1' } } }))
    const row = container.querySelector('#f-row-1')
    assert.equal(row.parentElement.tagName, 'FIELDSET')
    assert.equal(row.parentElement.hasAttribute('data-x'), false)
    assert.equal(row.getAttribute('data-x'), '1')
  })

  test('class joins the class list instead of being lost', () => {
    render(formWith({ row: { attrs: { class: 'plain', className: 'named' } } }))
    const { classList } = container.querySelector('#f-row-1')
    assert.ok(classList.contains('plain'))
    assert.ok(classList.contains('named'))
    assert.ok(classList.contains('formeo-row'))
  })

  test('id and tag are ignored', () => {
    render(formWith({ row: { attrs: { id: 'hijack', tag: 'section' } }, column: { attrs: { id: 'x', tag: 'aside' } } }))
    assert.equal(container.querySelector('#hijack'), null)
    assert.equal(container.querySelector('#f-row-1').tagName, 'DIV')
    assert.equal(container.querySelector('#f-col-1').tagName, 'DIV')
  })

  test('column attributes render, and its own style merges with the width, width last', () => {
    render(formWith({ column: { attrs: { 'aria-label': 'Left', style: 'padding: 4px; width: 10px;' } } }))
    const column = container.querySelector('#f-col-1')
    assert.equal(column.getAttribute('aria-label'), 'Left')
    assert.equal(column.style.padding, '4px')
    assert.equal(column.style.width, '50%')
  })

  test('a column without a style keeps its width', () => {
    render(formWith())
    assert.equal(container.querySelector('#f-col-1').style.width, '50%')
  })

  test('attrs: null renders like no attributes', () => {
    assert.doesNotThrow(() => render(formWith({ row: { attrs: null }, column: { attrs: null } })))
    assert.ok(container.querySelector('#f-row-1'))
  })

  test('a row with attributes is still hidden by a rows.<id> condition (#277)', () => {
    render(withSourceRow(formWith({ row: { attrs: { 'data-section': 'contact' } } })))
    const source = container.querySelector('#f-src')
    source.value = 'hide'
    source.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    assert.equal(container.querySelector('#f-row-1').parentElement.hasAttribute('hidden'), true)
  })

  test('an input-group clone keeps the attributes and gets its own ids', () => {
    // clone lookup goes through baseId(), which only recognises editor-style hex ids
    render({
      id: 'form-la',
      stages: { '0a0a0a0a': { id: '0a0a0a0a', children: ['1b1b1b1b'] } },
      rows: {
        '1b1b1b1b': {
          id: '1b1b1b1b',
          config: { inputGroup: true },
          attrs: { 'data-section': 'contact' },
          children: ['2c2c2c2c'],
        },
      },
      columns: { '2c2c2c2c': { id: '2c2c2c2c', config: { width: '100%' }, children: ['3d3d3d3d'] } },
      fields: {
        '3d3d3d3d': { id: '3d3d3d3d', tag: 'input', attrs: { type: 'text', name: 'name' }, config: { label: 'Name' } },
      },
    })
    container.querySelector('.add-input-group').click()
    const rows = container.querySelectorAll('[data-section="contact"]')
    assert.equal(rows.length, 2)
    assert.ok(rows[1].getAttribute('data-clone-of'))
    const ids = [...container.querySelectorAll('[id]')].map(elem => elem.id)
    assert.equal(new Set(ids).size, ids.length, 'no duplicate ids')
  })
})
