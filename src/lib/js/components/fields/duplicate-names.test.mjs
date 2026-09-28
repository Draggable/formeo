import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { duplicateNameIds, fieldNameKey } from './duplicate-names.mjs'

describe('fieldNameKey', () => {
  test('drops a trailing [], as userData does', () => {
    assert.equal(fieldNameKey('hobbies[]'), 'hobbies')
  })
  test('keeps whitespace, since the renderer submits the name verbatim', () => {
    assert.equal(fieldNameKey(' email '), ' email ')
  })
  test('is empty for missing names', () => {
    for (const name of [undefined, null, '', '[]']) {
      assert.equal(fieldNameKey(name), '')
    }
  })
})

describe('duplicateNameIds', () => {
  test('returns every field sharing a name', () => {
    const ids = duplicateNameIds([
      ['a', 'email'],
      ['b', 'email'],
      ['c', 'phone'],
      ['d', 'email[]'],
    ])
    assert.deepEqual([...ids].sort(), ['a', 'b', 'd'])
  })
  test('compares names verbatim, so whitespace makes a different key', () => {
    const ids = duplicateNameIds([
      ['a', 'email'],
      ['b', ' email '],
      ['c', ' '],
      ['d', ' '],
    ])
    assert.deepEqual([...ids].sort(), ['c', 'd'])
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
