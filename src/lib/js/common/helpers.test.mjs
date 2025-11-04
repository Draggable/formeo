import { suite, test } from 'node:test'
import { safeAttrName, subtract } from './helpers.mjs'

suite('Helpers', () => {
  suite('subtract', () => {
    test('should subtract the contents of one array from another', t => {
      const remove = ['two']
      const from = ['one', 'two', 'three']
      t.assert.deepEqual(subtract(remove, from), ['one', 'three'])
    })
  })

  suite('safeAttrName', () => {
    test('should return "class" for "className"', t => {
      t.assert.strictEqual(safeAttrName('className'), 'class')
    })

    test('should return sanitized attribute name', t => {
      t.assert.strictEqual(safeAttrName('123data-name'), 'data-name')
    })

    test('should return the same name if no sanitization is needed', t => {
      t.assert.strictEqual(safeAttrName('validName'), 'validName')
    })

    test('should cache sanitized attribute names', t => {
      const firstCall = safeAttrName('123data-name')
      const secondCall = safeAttrName('123data-name')
      t.assert.strictEqual(firstCall, secondCall)
    })
  })
})
