import { strict as assert } from 'node:assert'
import { after, before, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import Field from '../fields/field.js'
import components from '../index.js'

const { fields: Fields } = components

describe('locking attributes through config (#116)', () => {
  // Capture the prior config value before this test suite runs.
  // This is necessary because Fields.config uses a merging setter (component-data.js ~102)
  // that doesn't replace but merges into the existing configVal.
  const previousConfig = Fields.configVal

  // addAttribute writes a label into the current language, which the editor loads before this runs
  before(() => {
    i18n.current ??= {}
  })

  after(() => {
    // Restore by assigning directly to configVal to bypass the merging setter
    Fields.configVal = previousConfig
  })

  it('config.fields.all.panels.attrs.locked removes the delete button for required', () => {
    Fields.config = { all: { panels: { attrs: { locked: ['required'] } } } }
    const field = new Field(
      { tag: 'input', attrs: { type: 'text', required: true }, config: { label: 'Name' } },
      components
    )
    const item = field.editPanels.get('attrs').editPanelItems.find(i => i.itemKey === 'attrs.required')
    assert.equal(item.isLocked, true)
    assert.equal(item.dom.querySelector('.prop-remove'), null)
  })

  it('a locked boolean attribute renders a disabled checkbox, not readonly', () => {
    Fields.config = { all: { panels: { attrs: { locked: ['required'] } } } }
    const field = new Field(
      { tag: 'input', attrs: { type: 'text', required: true }, config: { label: 'Name' } },
      components
    )
    const item = field.editPanels.get('attrs').editPanelItems.find(i => i.itemKey === 'attrs.required')
    const checkbox = item.dom.querySelector('input[type="checkbox"]')
    assert.ok(checkbox, 'checkbox exists')
    assert.equal(checkbox.disabled, true)
    assert.equal(checkbox.hasAttribute('readonly'), false)
  })

  it('a locked string attribute renders a readonly text input, not disabled', () => {
    Fields.config = { all: { panels: { attrs: { locked: ['className'] } } } }
    const field = new Field(
      { tag: 'input', attrs: { type: 'text', className: 'x' }, config: { label: 'Name' } },
      components
    )
    const item = field.editPanels.get('attrs').editPanelItems.find(i => i.itemKey === 'attrs.className')
    const textInput = item.dom.querySelector('input[type="text"]')
    assert.ok(textInput, 'text input exists')
    assert.equal(textInput.readOnly, true)
    assert.equal(textInput.disabled, false)
  })

  it('a locked array (picklist) attribute renders a disabled select', () => {
    Fields.config = {
      all: { panels: { attrs: { locked: ['type'] } } },
      'text-input': {
        attrs: {
          type: [
            { label: 'text', value: 'text' },
            { label: 'phone', value: 'phone' },
          ],
        },
      },
    }
    const field = new Field(
      { tag: 'input', attrs: { type: 'text' }, config: { label: 'Name', controlId: 'text-input' } },
      components
    )
    const item = field.editPanels.get('attrs').editPanelItems.find(i => i.itemKey === 'attrs.type')
    const select = item.dom.querySelector('select')
    assert.ok(select, 'select exists')
    assert.equal(select.disabled, true)
  })

  it("EditPanel#addAttribute won't overwrite a locked attribute", () => {
    Fields.config = { all: { panels: { attrs: { locked: ['required'] } } } }
    const field = new Field(
      { tag: 'input', attrs: { type: 'text', required: true }, config: { label: 'Name' } },
      components
    )
    const panel = field.editPanels.get('attrs')
    panel.addAttribute('required', false)
    assert.equal(field.get('attrs.required'), true)
  })
})
