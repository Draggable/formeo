import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import {
  FIELD_WRAP_CLASSNAME,
  isLabelAfter,
  LABEL_POSITIONS,
  labelWrapClassNames,
  normalizeLabelConfig,
  resolveLabelPosition,
} from './label-position.mjs'

const text = config => ({ tag: 'input', attrs: { type: 'text' }, config })
const checkbox = config => ({ tag: 'input', attrs: { type: 'checkbox' }, config })
const radio = config => ({ tag: 'input', attrs: { type: 'radio' }, config })
const group = config => ({ tag: 'input', attrs: { type: 'checkbox' }, config, options: [{ label: 'A', value: 'a' }] })

describe('resolveLabelPosition (#243)', () => {
  it('uses a valid config.labelPosition as is', () => {
    for (const position of LABEL_POSITIONS) {
      assert.equal(resolveLabelPosition(text({ labelPosition: position })), position)
      assert.equal(resolveLabelPosition(checkbox({ labelPosition: position })), position)
    }
  })

  it('defaults to after for a lone checkbox or radio and top for everything else', () => {
    assert.equal(resolveLabelPosition(text({})), 'top')
    assert.equal(resolveLabelPosition(checkbox({})), 'after')
    assert.equal(resolveLabelPosition(radio({})), 'after')
    assert.equal(resolveLabelPosition(group({})), 'top')
    assert.equal(resolveLabelPosition({ tag: 'select', config: {} }), 'top')
    assert.equal(resolveLabelPosition({ config: {} }), 'top')
    assert.equal(resolveLabelPosition(), 'top')
  })

  it('maps legacy labelAfter: stacked for most controls, beside for a lone checkbox or radio', () => {
    assert.equal(resolveLabelPosition(text({ labelAfter: true })), 'bottom')
    assert.equal(resolveLabelPosition(text({ labelAfter: false })), 'top')
    assert.equal(resolveLabelPosition(checkbox({ labelAfter: true })), 'after')
    assert.equal(resolveLabelPosition(checkbox({ labelAfter: false })), 'before')
    assert.equal(resolveLabelPosition(radio({ labelAfter: false })), 'before')
    assert.equal(resolveLabelPosition(group({ labelAfter: true })), 'bottom')
    assert.equal(resolveLabelPosition({ config: { labelAfter: true } }), 'bottom')
  })

  it('lets labelPosition win over labelAfter', () => {
    assert.equal(resolveLabelPosition(text({ labelPosition: 'before', labelAfter: true })), 'before')
  })

  it('warns once about an unknown labelPosition and falls back', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      assert.equal(resolveLabelPosition(text({ labelPosition: 'left' })), 'top')
      assert.equal(resolveLabelPosition(checkbox({ labelPosition: 'left', labelAfter: false })), 'before')
      assert.equal(warn.mock.callCount(), 1, 'one warning per unknown value')
      assert.match(warn.mock.calls[0].arguments[0], /^formeo: unknown labelPosition "left"/)
    } finally {
      warn.mock.restore()
    }
  })
})

describe('isLabelAfter and labelWrapClassNames', () => {
  it('puts the label after the control for bottom and after only', () => {
    assert.deepEqual(LABEL_POSITIONS.map(isLabelAfter), [false, true, false, true])
  })

  it('names the wrapper f-field plus a position modifier', () => {
    assert.equal(FIELD_WRAP_CLASSNAME, 'f-field')
    assert.deepEqual(labelWrapClassNames('before'), ['f-field', 'f-label-before'])
  })
})

describe('normalizeLabelConfig', () => {
  it('returns the same config when there is nothing to convert', () => {
    const plain = { label: 'Name' }
    const positioned = { label: 'Name', labelPosition: 'after' }
    assert.equal(normalizeLabelConfig(text(plain)), plain)
    assert.equal(normalizeLabelConfig(text(positioned)), positioned)
    assert.equal(normalizeLabelConfig({ tag: 'hr' }), undefined)
  })

  it('replaces labelAfter with the position it resolves to, without mutating the input', () => {
    const legacy = { label: 'Name', labelAfter: true }
    assert.deepEqual(normalizeLabelConfig(text(legacy)), { label: 'Name', labelPosition: 'bottom' })
    assert.deepEqual(legacy, { label: 'Name', labelAfter: true })
    assert.deepEqual(normalizeLabelConfig(checkbox({ labelAfter: false })), { labelPosition: 'before' })
  })

  it('drops labelAfter when labelPosition is already set', () => {
    assert.deepEqual(normalizeLabelConfig(text({ labelPosition: 'after', labelAfter: false })), {
      labelPosition: 'after',
    })
  })

  it('replaces an unknown labelPosition with the resolved one', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      assert.deepEqual(normalizeLabelConfig(text({ labelPosition: 'sideways' })), { labelPosition: 'top' })
    } finally {
      warn.mock.restore()
    }
  })
})
