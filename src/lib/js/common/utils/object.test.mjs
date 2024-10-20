import assert from 'assert'
import { test, suite } from 'node:test'

import { set, get } from './object'

suite('set', () => {
  test('set should set a value at a simple path', () => {
    const obj = {}
    set(obj, 'a', 1)
    assert.deepStrictEqual(obj, { a: 1 })
  })

  test('set should set a value at a nested path', () => {
    const obj = {}
    set(obj, 'a.b.c', 2)
    assert.deepStrictEqual(obj, { a: { b: { c: 2 } } })
  })

  test('set should set a value at an array index path', () => {
    const obj = {}
    set(obj, 'a[0].b', 3)
    assert.deepStrictEqual(obj, { a: [{ b: 3 }] })
  })

  test('set should overwrite existing value at the path', () => {
    const obj = { a: { b: { c: 1 } } }
    set(obj, 'a.b.c', 4)
    assert.deepStrictEqual(obj, { a: { b: { c: 4 } } })
  })

  test('set should create nested objects if they do not exist', () => {
    const obj = {}
    set(obj, 'a.b.c.d', 5)
    assert.deepStrictEqual(obj, { a: { b: { c: { d: 5 } } } })
  })

  test('set should create nested arrays if they do not exist', () => {
    const obj = {}
    set(obj, 'a[0].b[1].c', 6)
    assert.deepStrictEqual(obj, { a: [{ b: [null, { c: 6 }] }] })
  })

  test('set should handle mixed object and array paths', () => {
    const obj = {}
    set(obj, 'a[0].b.c[1].d', 7)
    assert.deepStrictEqual(obj, { a: [{ b: { c: [null, { d: 7 }] } }] })
  })
  test('set should set a value at a simple path', () => {
    const obj = {}
    set(obj, 'a', 1)
    assert.deepStrictEqual(obj, { a: 1 })
  })

  test('set should set a value at a nested path', () => {
    const obj = {}
    set(obj, 'a.b.c', 2)
    assert.deepStrictEqual(obj, { a: { b: { c: 2 } } })
  })

  test('set should set a value at an array index path', () => {
    const obj = {}
    set(obj, 'a[0].b', 3)
    assert.deepStrictEqual(obj, { a: [{ b: 3 }] })
  })

  test('set should overwrite existing value at the path', () => {
    const obj = { a: { b: { c: 1 } } }
    set(obj, 'a.b.c', 4)
    assert.deepStrictEqual(obj, { a: { b: { c: 4 } } })
  })

  test('set should create nested objects if they do not exist', () => {
    const obj = {}
    set(obj, 'a.b.c.d', 5)
    assert.deepStrictEqual(obj, { a: { b: { c: { d: 5 } } } })
  })

  test('set should create nested arrays if they do not exist', () => {
    const obj = {}
    set(obj, 'a[0].b[1].c', 6)
    assert.deepStrictEqual(obj, { a: [{ b: [null, { c: 6 }] }] })
  })

  test('set should handle mixed object and array paths', () => {
    const obj = {}
    set(obj, 'a[0].b.c[1].d', 7)
    assert.deepStrictEqual(obj, { a: [{ b: { c: [null, { d: 7 }] } }] })
  })
})


suite('get', () => {
  test('get should retrieve a value at a simple path', () => {
    const obj = { a: 1 }
    const value = get(obj, 'a')
    assert.strictEqual(value, 1)
  })

  test('get should retrieve a value at a nested path', () => {
    const obj = { a: { b: { c: 2 } } }
    const value = get(obj, 'a.b.c')
    assert.strictEqual(value, 2)
  })

  test('get should retrieve a value at an array index path', () => {
    const obj = { a: [{ b: 3 }] }
    const value = get(obj, 'a[0].b')
    assert.strictEqual(value, 3)
  })

  test('get should return undefined for non-existing path', () => {
    const obj = { a: { b: { c: 1 } } }
    const value = get(obj, 'a.b.d')
    assert.strictEqual(value, undefined)
  })

  test('get should handle mixed object and array paths', () => {
    const obj = { a: [{ b: { c: [null, { d: 7 }] } }] }
    const value = get(obj, 'a[0].b.c[1].d')
    assert.strictEqual(value, 7)
  })

  test('get should retrieve a value from a path array', () => {
    const obj = { foo: [{ bar: 'baz' }] }
    const value = get(obj, ['foo', '0', 'bar'])
    assert.strictEqual(value, 'baz')
  })
})
