import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { throttle } from './index.mjs'

describe('throttle', () => {
  beforeEach(() => mock.timers.enable({ apis: ['Date', 'setTimeout'], now: Date.now() + 10_000 }))
  afterEach(() => mock.timers.reset())

  it('drops calls inside the window by default', () => {
    const calls = []
    const fn = throttle(value => calls.push(value), 100)
    fn(1)
    fn(2)
    mock.timers.tick(150)
    assert.deepEqual(calls, [1])
  })

  it('with trailing: true, delivers the last call once the window closes', () => {
    const calls = []
    const fn = throttle(value => calls.push(value), 100, { trailing: true })
    fn(1)
    fn(2)
    fn(3)
    assert.deepEqual(calls, [1])
    mock.timers.tick(100)
    assert.deepEqual(calls, [1, 3])
  })

  it('with trailing: true, a call after the window runs immediately and cancels nothing it should keep', () => {
    const calls = []
    const fn = throttle(value => calls.push(value), 100, { trailing: true })
    fn(1)
    mock.timers.tick(150)
    fn(2)
    assert.deepEqual(calls, [1, 2])
  })
})
