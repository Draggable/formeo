import assert from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import '../../../../../../tools/__mocks__/ResizeObserver.js'
import TextAreaControl from './textarea.js'

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
  })

  it('should have correct meta information', () => {
    assert.strictEqual(controlInstance.controlData.meta.group, 'common')
    assert.strictEqual(controlInstance.controlData.meta.icon, 'textarea')
    assert.strictEqual(controlInstance.controlData.meta.id, 'textarea')
  })

  it('should have required attribute set to false', () => {
    assert.strictEqual(controlInstance.controlData.attrs.required, false)
  })
})
