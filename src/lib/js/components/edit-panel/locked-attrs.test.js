import { strict as assert } from 'node:assert'
import { after, describe, it } from 'node:test'
import Field from '../fields/field.js'
import components from '../index.js'

const { fields: Fields } = components

describe('locking attributes through config (#116)', () => {
  // Capture the prior config value before this test suite runs.
  // This is necessary because Fields.config uses a merging setter (component-data.js ~102)
  // that doesn't replace but merges into the existing configVal.
  const previousConfig = Fields.configVal

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
})
