import { strict as assert } from 'node:assert'
import { after, describe, it } from 'node:test'
import Field from '../fields/field.js'
import Fields from '../fields/index.js'

describe('locking attributes through config (#116)', () => {
  after(() => {
    // Reset Fields.config to avoid leaking state to other test files
    Fields.config = {}
  })

  it('config.fields.all.panels.attrs.locked removes the delete button for required', () => {
    Fields.config = { all: { panels: { attrs: { locked: ['required'] } } } }
    const field = new Field({ tag: 'input', attrs: { type: 'text', required: true }, config: { label: 'Name' } })
    const item = field.editPanels.get('attrs').editPanelItems.find(i => i.itemKey === 'attrs.required')
    assert.equal(item.isLocked, true)
    assert.equal(item.dom.querySelector('.prop-remove'), null)
  })
})
