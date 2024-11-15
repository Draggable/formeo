import { describe, it, beforeEach, mock } from 'node:test'
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
})
