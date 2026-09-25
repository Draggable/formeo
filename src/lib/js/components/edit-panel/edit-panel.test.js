import { strict as assert } from 'node:assert'
import { describe, it, mock } from 'node:test'
import Field from '../fields/field.js'

const radioField = () =>
  new Field({
    tag: 'input',
    attrs: { type: 'radio' },
    config: { label: 'Colour', controlId: 'radio' },
    options: [
      { label: 'Red', value: 'red', selected: false },
      { label: 'Green', value: 'green', selected: true },
      { label: 'Blue', value: 'blue', selected: false },
    ],
  })

const optionItems = panel => panel.props.querySelectorAll(':scope > li')

describe('EditPanel option ordering (#114)', () => {
  it('renders a .prop-order drag handle on every option', () => {
    const panel = radioField().editPanels.get('options')
    assert.equal(optionItems(panel).length, 3)
    for (const li of optionItems(panel)) {
      assert.ok(li.querySelector('.prop-order'), 'each option has a handle')
    }
  })

  it('makes the options list sortable by that handle', () => {
    const panel = radioField().editPanels.get('options')
    assert.equal(panel.sortable.el, panel.props)
    assert.equal(panel.sortable.options.handle, '.prop-order')
  })

  it('moving option 3 above option 1 reorders the field options and keeps selection with it', () => {
    const field = radioField()
    mock.method(field, 'debouncedUpdatePreview', () => {})
    field.editPanels.get('options').moveOption(2, 0)
    assert.deepEqual(
      field.get('options').map(o => o.value),
      ['blue', 'red', 'green']
    )
    assert.equal(field.get('options')[2].selected, true)
    assert.equal(field.debouncedUpdatePreview.mock.callCount(), 1)
  })

  it('re-keys option items so an edit after a move lands on the moved option', () => {
    const field = radioField()
    const panel = field.editPanels.get('options')
    panel.moveOption(2, 0)
    const firstLabel = optionItems(panel)[0].querySelector('input[name$="-label"]')
    assert.equal(firstLabel.value, 'Blue')
    firstLabel.value = 'Navy'
    firstLabel.dispatchEvent(new window.Event('input', { bubbles: true }))
    assert.equal(field.get('options[0].label'), 'Navy')
    assert.equal(field.get('options[1].label'), 'Red')
  })

  it('keeps the rebuilt list sortable and destroys the old instance', () => {
    const panel = radioField().editPanels.get('options')
    const previous = panel.sortable
    const destroy = mock.method(previous, 'destroy')
    panel.moveOption(0, 1)
    assert.equal(destroy.mock.callCount(), 1)
    assert.notEqual(panel.sortable, previous)
    assert.equal(panel.sortable.el, panel.props)
  })

  it('ignores a drop in place', () => {
    const field = radioField()
    const before = field.get('options')
    field.editPanels.get('options').moveOption(1, 1)
    assert.equal(field.get('options'), before)
  })
})
