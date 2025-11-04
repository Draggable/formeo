import { suite, test } from 'node:test'

import { deepClone, mergeActions } from './object.mjs'

suite('object', () => {
  suite('mergeActions', () => {
    test('mergeActions should merge two objects with no conflicts', ({ assert }) => {
      const target = { a: 1 }
      const source = { b: 2 }
      const result = mergeActions(target, source)
      assert.deepStrictEqual(result, { a: 1, b: 2 })
    })

    test('mergeActions should merge two objects with conflicting keys', ({ assert }) => {
      const target = { a: 1 }
      const source = { a: 2 }
      const result = mergeActions(target, source)
      assert.deepStrictEqual(result, { a: [1, 2] })
    })

    test('mergeActions should merge two objects with array values', ({ assert }) => {
      const target = { a: [1] }
      const source = { a: 2 }
      const result = mergeActions(target, source)
      assert.deepStrictEqual(result, { a: [1, 2] })
    })

    suite('deepCLone', () => {
      test('deepClone should deeply clone an object', ({ assert }) => {
        const obj = { a: 1, b: { c: 2 } }
        const result = deepClone(obj)
        assert.deepStrictEqual(result, obj)
        assert.notStrictEqual(result, obj)
        assert.notStrictEqual(result.b, obj.b)
      })

      test('deepClone should deeply clone an array', ({ assert }) => {
        const arr = [1, [2, 3]]
        const result = deepClone(arr)
        assert.deepStrictEqual(result, arr)
        assert.notStrictEqual(result, arr)
        assert.notStrictEqual(result[1], arr[1])
      })

      test('deepClone should return non-object values as is', ({ assert }) => {
        assert.strictEqual(deepClone(1), 1)
        assert.strictEqual(deepClone('string'), 'string')
        assert.strictEqual(deepClone(null), null)
        assert.strictEqual(deepClone(undefined), undefined)
      })

      test('deepClone should handle objects with circular references', ({ assert }) => {
        const obj = { a: 1 }
        obj.self = obj
        const result = deepClone(obj)
        assert.strictEqual(result.a, 1)
        assert.strictEqual(result.self, result)
      })
    })
  })
})
