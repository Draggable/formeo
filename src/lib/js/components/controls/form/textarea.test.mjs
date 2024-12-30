import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import '../../../../../../tools/__mocks__/ResizeObserver.js'
import TextAreaControl from './textarea.js'
import Field from '../../fields/field.js'
import controls from '../index.js'

describe('TextAreaControl', () => {
  let controlInstance

  beforeEach(() => {
    controlInstance = new TextAreaControl()
  })

  it('should create a TextAreaControl instance', () => {
    assert.strictEqual(controlInstance instanceof TextAreaControl, true)
  })

  it('should have correct tag and actions', () => {
    assert.strictEqual(controlInstance.controlData.tag, 'textarea')
    assert.strictEqual(typeof controlInstance.controlData.action.input, 'function')
  })

  it('should have correct meta information', () => {
    assert.strictEqual(controlInstance.controlData.meta.group, 'common')
    assert.strictEqual(controlInstance.controlData.meta.icon, 'textarea')
    assert.strictEqual(controlInstance.controlData.meta.id, 'textarea')
  })

  it('should have required attribute set to false', () => {
    assert.strictEqual(controlInstance.controlData.attrs.required, false)
  })

  it('should set data on input', () => {
    controls.add(controlInstance)
    const controlData = controlInstance.controlData
    const fieldData = { ...controlData, config: { controlId: controlData.meta.id } }
    const fieldInstance = new Field(fieldData)
    const mockSetData = mock.fn()
    fieldInstance.setData = mockSetData

    fieldInstance.updatePreview()
    const textarea = fieldInstance.preview.querySelector('textarea')
    textarea.value = 'test value'
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }))

    assert.strictEqual(mockSetData.mock.calls.length, 1)
    assert.deepStrictEqual(mockSetData.mock.calls[0].arguments, ['value', 'test value'])
  })
})
