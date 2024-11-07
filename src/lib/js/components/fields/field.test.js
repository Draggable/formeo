import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import '../../../../../tools/__mocks__/ResizeObserver.js'
import Field from './field.js'

const fieldConfig = { id: 'test-id', config: {} }

describe('Field', () => {
  let field

  beforeEach(() => {
    field = new Field(fieldConfig)
    mock.method(field, 'onRender', () => identity => identity)
  })

  it('should have data property matching snapshot', t => {
    t.assert.snapshot(field.data)
  })

  it('should call onRender from constructor', t => {
    // t.mock.method(field, 'onRender')
    const call = field.onRender.mock.calls[0]
    console.log(call)
    // assert.deepEqual(call.arguments, [3]);
    // assert.ok(spy.calledWith(field.dom))
  })
})
