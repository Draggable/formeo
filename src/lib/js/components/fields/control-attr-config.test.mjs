import { describe, it } from 'node:test'
import { controlAttrPanelConfig, getControlConfig } from './control-attr-config.mjs'

describe('controlAttrPanelConfig', () => {
  it('returns null when no source defines disabledAttrs or lockedAttrs', t => {
    t.assert.strictEqual(controlAttrPanelConfig(undefined, { label: 'x' }), null)
  })

  it('maps disabledAttrs and lockedAttrs onto panels.attrs', t => {
    t.assert.deepStrictEqual(controlAttrPanelConfig({ disabledAttrs: ['type'], lockedAttrs: ['required'] }), {
      panels: { attrs: { disabled: ['type'], locked: ['required'] } },
    })
  })

  it('unions every source without duplicates', t => {
    const control = { disabledAttrs: ['type'], lockedAttrs: ['required'] }
    const saved = { disabledAttrs: ['type', 'name'], lockedAttrs: ['className'] }
    t.assert.deepStrictEqual(controlAttrPanelConfig(control, saved), {
      panels: { attrs: { disabled: ['type', 'name'], locked: ['required', 'className'] } },
    })
  })

  it('ignores non-array values', t => {
    t.assert.strictEqual(controlAttrPanelConfig({ disabledAttrs: 'type', lockedAttrs: null }), null)
  })
})

describe('getControlConfig', () => {
  it('reads config from a Control instance or from plain controlData', t => {
    t.assert.deepStrictEqual(getControlConfig({ controlData: { config: { label: 'a' } } }), { label: 'a' })
    t.assert.deepStrictEqual(getControlConfig({ config: { label: 'b' } }), { label: 'b' })
    t.assert.strictEqual(getControlConfig(undefined), undefined)
  })
})
