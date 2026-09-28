import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { duplicateNameIds, fieldNameKey } from './duplicate-names.mjs'

describe('fieldNameKey', () => {
  test('trims and drops a trailing []', () => {
    assert.equal(fieldNameKey('  hobbies[] '), 'hobbies')
  })
  test('is empty for missing names', () => {
    for (const name of [undefined, null, '', '   ', '[]']) {
      assert.equal(fieldNameKey(name), '')
    }
  })
})

describe('duplicateNameIds', () => {
  test('returns every field sharing a name', () => {
    const ids = duplicateNameIds([
      ['a', 'email'],
      ['b', 'email '],
      ['c', 'phone'],
      ['d', 'email[]'],
    ])
    assert.deepEqual([...ids].sort(), ['a', 'b', 'd'])
  })
  test('ignores fields without a name', () => {
    assert.equal(
      duplicateNameIds([
        ['a', ''],
        ['b', undefined],
        ['c', ''],
      ]).size,
      0
    )
  })
})
