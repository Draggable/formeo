import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const ROW_ID = 'row-1'
const COLUMN_ID = 'column-1'
const FIELD_ID = 'field-1'

/**
 * A one-field form whose row and column carry the label the editor gives them.
 */
const layoutFormData = (extraConfig = {}) => ({
  id: 'test-form',
  stages: { 'stage-1': { id: 'stage-1', children: [ROW_ID] } },
  rows: { [ROW_ID]: { id: ROW_ID, config: { label: 'row', ...extraConfig }, children: [COLUMN_ID] } },
  columns: {
    [COLUMN_ID]: { id: COLUMN_ID, config: { width: '100%', label: 'column', ...extraConfig }, children: [FIELD_ID] },
  },
  fields: {
    [FIELD_ID]: {
      id: FIELD_ID,
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'Field label' },
    },
  },
})

describe('renderer layout containers', () => {
  let dom
  let container

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })

    global.document = dom.window.document
    global.window = dom.window
    global.Element = dom.window.Element
    global.HTMLElement = dom.window.HTMLElement
    global.Node = dom.window.Node
    global.FormData = dom.window.FormData

    container = dom.window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'Node', 'FormData']) {
      delete global[key]
    }
  })

  const renderedLabels = (extraConfig = {}) => {
    new FormeoRenderer({ renderContainer: container, formData: layoutFormData(extraConfig) }).render()

    return Array.from(container.querySelectorAll('label'), label => label.textContent.trim())
  }

  test('a row does not render its own label', () => {
    assert.equal(renderedLabels().includes('row'), false)
  })

  test('a column does not render its own label', () => {
    assert.equal(renderedLabels().includes('column'), false)
  })

  test('fields keep their labels', () => {
    assert.deepEqual(renderedLabels(), ['Field label'])
  })

  test('form data that already hides the label is unaffected', () => {
    assert.deepEqual(renderedLabels({ hideLabel: true }), ['Field label'])
  })
})
