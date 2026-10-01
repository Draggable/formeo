import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, mock, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const formWith = (fields, rowConfig = {}) => {
  const ids = Object.keys(fields)
  return {
    id: 'label-position-form',
    stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
    rows: { 'row-1': { id: 'row-1', config: rowConfig, children: ids.map(id => `column-${id}`) } },
    columns: Object.fromEntries(
      ids.map(id => [`column-${id}`, { id: `column-${id}`, config: { width: '100%' }, children: [id] }])
    ),
    fields,
  }
}

const textField = (id, config = {}, attrs = {}) => ({
  id,
  tag: 'input',
  attrs: { type: 'text', ...attrs },
  config: { label: 'Name', ...config },
})

const groupField = (id, type, config = {}, attrs = {}) => ({
  id,
  tag: 'input',
  attrs: { type, ...attrs },
  config: { label: 'Colour', ...config },
  options: [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
  ],
})

const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']

describe('label position in the renderer (#243)', () => {
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

  const render = (fields, rowConfig) => {
    const renderer = new FormeoRenderer({ renderContainer: container, formData: formWith(fields, rowConfig) })
    renderer.render()
    return renderer
  }

  /** The element that holds a field's label and control: the parent of its `#f-<id>` control */
  const wrapperOf = id => container.querySelector(`#f-${id}`).parentElement
  const tagsIn = elem => [...elem.children].map(child => child.tagName.toLowerCase())

  describe('wrapper classes', () => {
    for (const labelPosition of ['top', 'bottom', 'before', 'after']) {
      test(`a ${labelPosition} label's wrapper is f-field f-label-${labelPosition}`, () => {
        render({ name: textField('name', { labelPosition }) })
        assert.deepEqual([...wrapperOf('name').classList], ['f-field', `f-label-${labelPosition}`])
      })
    }

    test('label and control are in position order', () => {
      render({ top: textField('top', { labelPosition: 'top' }), after: textField('after', { labelPosition: 'after' }) })
      assert.deepEqual(tagsIn(wrapperOf('top')), ['label', 'input'])
      assert.deepEqual(tagsIn(wrapperOf('after')), ['input', 'label'])
    })

    test('without labelPosition a text field is top and a lone checkbox is after', () => {
      render({
        name: textField('name'),
        agree: { id: 'agree', tag: 'input', attrs: { type: 'checkbox' }, config: { label: 'I agree' } },
      })
      assert.ok(wrapperOf('name').classList.contains('f-label-top'))
      assert.ok(wrapperOf('agree').classList.contains('f-label-after'))
    })

    test('legacy labelAfter on a text field renders as bottom', () => {
      render({ name: textField('name', { labelAfter: true }) })
      assert.ok(wrapperOf('name').classList.contains('f-label-bottom'))
      assert.deepEqual(tagsIn(wrapperOf('name')), ['input', 'label'])
    })

    test('a configured inputWrap class stays on the wrapper', () => {
      render({ name: textField('name', { inputWrap: 'my-wrap', labelPosition: 'before' }) })
      assert.deepEqual([...wrapperOf('name').classList], ['my-wrap', 'f-field', 'f-label-before'])
    })

    test('a field whose label is hidden gets no wrapper, even with a labelPosition', () => {
      render({
        quiet: textField('quiet', { hideLabel: true, labelPosition: 'before' }),
        secret: { id: 'secret', tag: 'input', attrs: { type: 'hidden' }, config: { label: 'S', hideLabel: true } },
        heading: { id: 'heading', tag: 'h1', config: { label: 'H', hideLabel: true }, content: 'Heading' },
      })
      assert.equal(container.querySelectorAll('.f-field').length, 0)
      assert.equal(wrapperOf('quiet').id, 'f-column-quiet', 'the bare input sits in its column')
    })

    test('an unknown labelPosition warns and renders as the default', () => {
      const warn = mock.method(console, 'warn', () => {})
      try {
        render({ name: textField('name', { labelPosition: 'upside-down' }) })
        assert.ok(wrapperOf('name').classList.contains('f-label-top'))
        assert.ok(warn.mock.calls.some(({ arguments: [message] }) => message.includes('"upside-down"')))
      } finally {
        warn.mock.restore()
      }
    })

    test('an input group clone of a positioned field keeps its wrapper classes', () => {
      render({ name: textField('name', { labelPosition: 'before' }) }, { inputGroup: true })
      container.querySelector('.add-input-group').click()
      const wrappers = [...container.querySelectorAll('.f-field.f-label-before')]
      assert.equal(wrappers.length, 2, 'original and clone')
    })

    test('a condition that hides a positioned field hides only its wrapper', () => {
      const source = {
        id: 'source',
        tag: 'select',
        attrs: {},
        config: { label: 'Source' },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      }
      const target = textField('target', { labelPosition: 'before' })
      target.conditions = [
        {
          if: [
            { source: 'fields.source', sourceProperty: 'value', comparison: 'equals', target: 'b', targetProperty: '' },
          ],
          then: [{ target: 'fields.target', targetProperty: 'isNotVisible', assignment: '', value: '' }],
        },
      ]
      render({ source, target })
      const select = container.querySelector('#f-source')
      select.value = 'b'
      select.dispatchEvent(new window.Event('change', { bubbles: true }))
      assert.equal(wrapperOf('target').hasAttribute('hidden'), true)
      assert.equal(container.querySelector('#f-column-target').hasAttribute('hidden'), false)
    })
  })

  describe('group class names', () => {
    test("a group's attrs.className lands on the group and on its wrapper, next to f-field", () => {
      render({ colour: groupField('colour', 'radio', { labelPosition: 'before' }, { className: 'my-group' }) })
      const group = container.querySelector('#f-colour')
      assert.ok(group.classList.contains('my-group'))
      assert.deepEqual([...group.parentElement.classList], ['f-field', 'f-label-before', 'my-group'])
    })
  })
})
