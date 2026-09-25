import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const buildFormData = fields => {
  const fieldIds = Object.keys(fields)

  return {
    id: 'option-groups-form',
    stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
    rows: { 'row-1': { id: 'row-1', config: {}, children: fieldIds.map(id => `column-${id}`) } },
    columns: Object.fromEntries(
      fieldIds.map(id => [`column-${id}`, { id: `column-${id}`, config: { width: '100%' }, children: [id] }])
    ),
    fields,
  }
}

const groupField = (id, type, attrs = {}, extra = {}) => ({
  id,
  tag: 'input',
  attrs: { type, ...attrs },
  config: { label: `${type} group` },
  options: [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
  ],
  ...extra,
})

describe('checkbox and radio groups', () => {
  let window
  let container

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
    container = window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']) {
      delete global[key]
    }
  })

  const render = fields => {
    const renderer = new FormeoRenderer({ renderContainer: container, formData: buildFormData(fields) })
    renderer.render()
    return renderer
  }

  const inputsOf = id => Array.from(container.querySelectorAll(`#f-${id} input`))
  const form = () => container.querySelector('form')
  const change = elem => elem.dispatchEvent(new window.Event('change', { bubbles: true }))

  describe('name', () => {
    test('radio group inputs use attrs.name when it is set', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['favcolor', 'favcolor']
      )
    })

    test('checkbox group inputs use attrs.name when it is set', () => {
      render({ 'checkbox-1': groupField('checkbox-1', 'checkbox', { name: 'toppings' }) })

      assert.deepEqual(
        inputsOf('checkbox-1').map(input => input.name),
        ['toppings', 'toppings']
      )
    })

    test('falls back to the prefixed field id when no name is set', () => {
      render({ 'radio-1': groupField('radio-1', 'radio') })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['f-radio-1', 'f-radio-1']
      )
    })

    test('attrs.id still wins over the field id when no name is set (#331 workaround keeps working)', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { id: 'legacy-id' }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['legacy-id', 'legacy-id']
      )
    })

    test('userData is keyed by the configured name', () => {
      const renderer = render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })
      inputsOf('radio-1')[1].checked = true

      assert.deepEqual(renderer.userData, { favcolor: 'two' })
    })

    test('userFormData finds the label of a group with a custom name', () => {
      const renderer = render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })
      inputsOf('radio-1')[0].checked = true

      assert.deepEqual(renderer.userFormData, [{ key: 'favcolor', value: 'one', label: 'radio group' }])
    })
  })

  describe('input group clones', () => {
    test('a cloned radio group gets its own name so it does not share a selection with the original', () => {
      // clone lookup goes through baseId(), which only recognises editor-style hex ids
      const formData = {
        id: 'clone-form',
        stages: { '0a0a0a0a': { id: '0a0a0a0a', children: ['1b1b1b1b'] } },
        rows: { '1b1b1b1b': { id: '1b1b1b1b', config: { inputGroup: true }, children: ['2c2c2c2c'] } },
        columns: { '2c2c2c2c': { id: '2c2c2c2c', config: { width: '100%' }, children: ['3d3d3d3d'] } },
        fields: { '3d3d3d3d': groupField('3d3d3d3d', 'radio', { name: 'favcolor' }) },
      }
      const renderer = new FormeoRenderer({ renderContainer: container, formData })
      renderer.render()

      container.querySelector('.add-input-group').click()

      const radios = Array.from(container.querySelectorAll('input[type="radio"]'))
      assert.equal(radios.length, 4, 'the row was cloned')
      assert.equal(new Set(radios.map(input => input.name)).size, 2, 'original and clone use different names')
    })
  })
})
