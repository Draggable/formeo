import { strict as assert } from 'node:assert'
import { describe, it, mock } from 'node:test'
import { configOptionsOf } from './config-options.mjs'
import { labelHelper } from './helpers.mjs'

const withOptions = (options, disabled) => ({ panels: { config: { options, disabled } } })

describe('configOptionsOf', () => {
  it('offers nothing without panels.config', () => {
    assert.equal(configOptionsOf(undefined).size, 0)
    assert.equal(configOptionsOf({ panels: {} }).size, 0)
  })

  it('keeps declaration order, defaults and labels', () => {
    const declared = configOptionsOf(
      withOptions({
        tooltip: { default: '', label: 'Hover text' },
        hideLabel: { default: false },
        size: { default: 3 },
      })
    )
    assert.deepEqual([...declared.keys()], ['tooltip', 'hideLabel', 'size'])
    assert.deepEqual(declared.get('tooltip'), { label: 'Hover text', default: '' })
    assert.deepEqual(declared.get('hideLabel'), { label: labelHelper('config.hideLabel'), default: false })
    assert.deepEqual(declared.get('size'), { label: labelHelper('config.size'), default: 3 })
  })

  it('drops disabled keys', () => {
    const declared = configOptionsOf(withOptions({ label: { default: '' }, tooltip: { default: '' } }, ['tooltip']))
    assert.deepEqual([...declared.keys()], ['label'])
  })

  it('drops, and warns once about, a declaration the panel cannot edit', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const config = withOptions({
        ruleSet: { default: { min: 1 } },
        flagList: { default: [] },
        nulled: null,
        fine: { default: '' },
      })
      assert.deepEqual([...configOptionsOf(config).keys()], ['fine'])
      configOptionsOf(config)
      assert.equal(warn.mock.callCount(), 3, 'one warning per bad key, not per call')
      assert.match(warn.mock.calls[0].arguments[0], /^formeo: config option "ruleSet"/)
    } finally {
      warn.mock.restore()
    }
  })

  it('keeps declared options, labelling each one', () => {
    const declared = configOptionsOf(
      withOptions({
        density: {
          default: 'cosy',
          options: [{ value: 'cosy' }, { value: 'compact', label: 'Tight' }],
        },
      })
    )
    assert.deepEqual(declared.get('density'), {
      label: labelHelper('config.density'),
      default: 'cosy',
      options: [
        { value: 'cosy', label: 'Cosy' },
        { value: 'compact', label: 'Tight' },
      ],
    })
  })

  it('drops, and warns once about, options it cannot offer', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const config = withOptions({
        emptyChoice: { default: 'a', options: [] },
        numberChoice: { default: 'a', options: [{ value: 1 }] },
        missingDefault: { default: 'z', options: [{ value: 'a' }] },
        notAList: { default: 'a', options: 'a,b' },
      })
      assert.equal(configOptionsOf(config).size, 0)
      configOptionsOf(config)
      assert.equal(warn.mock.callCount(), 4, 'one warning per bad key, not per call')
      assert.match(warn.mock.calls[0].arguments[0], /^formeo: config option "emptyChoice" needs options/)
    } finally {
      warn.mock.restore()
    }
  })
})
