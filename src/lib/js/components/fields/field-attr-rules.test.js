import { after, describe, it } from 'node:test'
import Components from '../index.js'
import Field from './field.js'

// `type` is already disabled by the default field config, so these tests use other attributes
const emailField = (config = {}) =>
  new Field(
    {
      tag: 'input',
      attrs: { type: 'email', name: 'email', required: true, className: 'custom-email' },
      config: { label: 'Email', controlId: 'email', ...config },
      id: 'e1a2b3c4',
    },
    Components
  )

const { controls: Controls } = Components

describe('Field control-level attribute rules', () => {
  after(() => {
    Controls.data.delete('ctrl-uuid')
    Controls.data.delete('locked-control')
    delete Components.fields.configVal.c0ffee02
    Controls.data.delete('union-ctrl-uuid')
    delete Components.fields.configVal['union-control']
  })

  it('locks attributes listed in config.lockedAttrs', t => {
    const field = emailField({ lockedAttrs: ['required', 'className'] })
    t.assert.strictEqual(field.isLockedProp('attrs.required'), true)
    t.assert.strictEqual(field.isLockedProp('attrs.className'), true)
    t.assert.strictEqual(field.isLockedProp('attrs.name'), false)
  })

  it('disables attributes listed in config.disabledAttrs', t => {
    const field = emailField({ disabledAttrs: ['className'] })
    t.assert.strictEqual(field.isDisabledProp('attrs.className'), true)
    t.assert.strictEqual(field.isDisabledProp('attrs.name'), false)
  })

  it('renders no remove button for a locked attribute and no row for a disabled one', t => {
    const field = emailField({ disabledAttrs: ['className'], lockedAttrs: ['required'] })
    const attrsPanel = field.dom.querySelector('.attrs-panel')
    t.assert.ok(attrsPanel, 'attrs panel rendered')
    t.assert.strictEqual(attrsPanel.querySelector('.field-attrs-className'), null)
    const requiredRow = attrsPanel.querySelector('.field-attrs-required')
    t.assert.ok(requiredRow, 'required row rendered')
    t.assert.strictEqual(requiredRow.querySelector('.prop-remove'), null)
    t.assert.ok(attrsPanel.querySelector('.field-attrs-name .prop-remove'), 'unlocked attr keeps its remove button')
  })

  it('reads the registered control definition when saved field data has no rules', t => {
    Controls.add({
      id: 'ctrl-uuid',
      controlData: { meta: { id: 'locked-control' }, config: { lockedAttrs: ['className'] } },
    })
    const field = new Field(
      {
        tag: 'input',
        attrs: { type: 'text', className: '' },
        config: { label: 'Saved', controlId: 'locked-control' },
        id: 'f1a2b3c4',
      },
      Components
    )
    t.assert.strictEqual(field.isLockedProp('attrs.className'), true)
  })

  it('does not leak one field’s rules to other fields', t => {
    emailField({ lockedAttrs: ['required'], disabledAttrs: ['className'] })
    const plain = new Field(
      {
        tag: 'input',
        attrs: { required: false, className: '' },
        config: { label: 'Plain', controlId: 'text-input' },
        id: 'aa11bb22',
      },
      Components
    )
    t.assert.strictEqual(plain.isLockedProp('attrs.required'), false)
    t.assert.strictEqual(plain.isDisabledProp('attrs.className'), false)
    t.assert.strictEqual(plain.isDisabledProp('attrs.type'), true, 'default panels.attrs.disabled still applies')
  })

  it('keeps working when the control is no longer registered', t => {
    const field = new Field(
      {
        tag: 'input',
        attrs: { required: true },
        config: { label: 'Orphan', controlId: 'removed-control', lockedAttrs: ['required'] },
        id: 'c0ffee01',
      },
      Components
    )
    t.assert.strictEqual(field.isLockedProp('attrs.required'), true)
  })

  it('lets an explicit config dropdown for an attribute override disabledAttrs', t => {
    Components.fields.config = { c0ffee02: { attrs: { className: [{ label: 'Wide', value: 'wide' }] } } }
    const field = new Field(
      {
        tag: 'input',
        attrs: { className: 'wide' },
        config: { label: 'Styled', controlId: 'text-input', disabledAttrs: ['className'] },
        id: 'c0ffee02',
      },
      Components
    )
    t.assert.strictEqual(field.isDisabledProp('attrs.className'), false)
  })

  it('unions the control rule, the editor config, and the default disabled list', t => {
    // control-level rule, from a registered control
    Controls.add({
      id: 'union-ctrl-uuid',
      controlData: { meta: { id: 'union-control' }, config: { lockedAttrs: ['className'] } },
    })
    // editor config keyed by controlId
    Components.fields.config = { 'union-control': { panels: { attrs: { locked: ['required'] } } } }

    const field = new Field(
      {
        tag: 'input',
        attrs: { type: 'text', name: 'union-name', className: 'union', required: true },
        // field's own saved config.lockedAttrs (e.g. copied from the control when it was added)
        config: { label: 'Union', controlId: 'union-control', lockedAttrs: ['name'] },
        id: 'decafbad',
      },
      Components
    )

    t.assert.strictEqual(field.isLockedProp('attrs.className'), true, 'control-level lockedAttrs still applies')
    t.assert.strictEqual(field.isLockedProp('attrs.name'), true, 'field-level lockedAttrs still applies')
    t.assert.strictEqual(field.isLockedProp('attrs.required'), true, 'editor config panels.attrs.locked still applies')
    t.assert.strictEqual(field.isDisabledProp('attrs.type'), true, 'default panels.attrs.disabled still applies')
  })
})
