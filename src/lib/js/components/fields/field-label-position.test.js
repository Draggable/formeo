import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import Field from './field.js'

// an editor's Components loaded with one empty stage
const editor = () => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.load({ id: 'form-lp', stages: { 's-1': { id: 's-1', config: {}, children: [] } } })
  return editorComponents
}

const textField = (editorComponents, config = {}) =>
  new Field(
    {
      id: 'f-lp',
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'Name', controlId: 'text-input', ...config },
    },
    editorComponents
  )

describe('Field label position data (#243)', () => {
  it('converts legacy labelAfter to labelPosition on load', () => {
    const field = textField(editor(), { labelAfter: true })
    assert.equal(field.get('config.labelPosition'), 'bottom')
    assert.equal('labelAfter' in field.get('config'), false)
  })

  it('maps labelAfter: false on a lone checkbox to before', () => {
    const field = new Field(
      { id: 'f-cb', tag: 'input', attrs: { type: 'checkbox' }, config: { label: 'Agree', labelAfter: false } },
      editor()
    )
    assert.equal(field.get('config.labelPosition'), 'before')
  })

  it('keeps labelPosition when both are set, and drops labelAfter', () => {
    const field = textField(editor(), { labelPosition: 'before', labelAfter: true })
    assert.equal(field.get('config.labelPosition'), 'before')
    assert.equal('labelAfter' in field.get('config'), false)
  })

  it('rewrites an unknown labelPosition to the resolved one', () => {
    const warn = mock.method(console, 'warn', () => {})
    try {
      const field = textField(editor(), { labelPosition: 'left' })
      assert.equal(field.get('config.labelPosition'), 'top')
    } finally {
      warn.mock.restore()
    }
  })

  it('leaves the data it was given, such as a control definition, untouched', () => {
    const definitionConfig = { label: 'Name', controlId: 'text-input', labelAfter: true }
    new Field({ id: 'f-def', tag: 'input', attrs: { type: 'text' }, config: definitionConfig }, editor())
    assert.deepEqual(definitionConfig, { label: 'Name', controlId: 'text-input', labelAfter: true })
  })

  it('fires no update events for the conversion', () => {
    const editorComponents = editor()
    const formeoUpdated = mock.method(editorComponents.events, 'formeoUpdated')
    textField(editorComponents, { labelAfter: true })
    const labelChanges = formeoUpdated.mock.calls.filter(({ arguments: [evt] }) =>
      /label(Position|After)/.test(evt?.changePath || '')
    )
    assert.equal(labelChanges.length, 0)
  })

  it('constructs a field with an empty config, without writing labelPosition', () => {
    const field = new Field({ id: 'f-hr', tag: 'hr', config: {} }, editor())
    assert.equal(field.get('config.labelPosition'), undefined)
  })

  it('shows the converted value in a Label Position dropdown', () => {
    const field = textField(editor(), { labelAfter: true })
    const select = field.editPanels.get('config').props.querySelector('select.config-labelPosition')
    assert.ok(select)
    assert.deepEqual(
      [...select.options].map(option => option.value),
      ['top', 'bottom', 'before', 'after']
    )
    assert.equal(select.value, 'bottom')
  })
})

describe('Field preview wrapper (#243)', () => {
  const wrapOf = field => field.dom.querySelector(':scope > .f-field')
  const partsOf = field => [...wrapOf(field).children].map(child => child.className)

  it('wraps the label and preview in f-field f-label-<position>, in position order', () => {
    const top = textField(editor())
    assert.equal(wrapOf(top).className, 'f-field f-label-top')
    assert.deepEqual(partsOf(top), ['prev-label', 'field-preview'])

    const after = textField(editor(), { labelPosition: 'after' })
    assert.equal(wrapOf(after).className, 'f-field f-label-after')
    assert.deepEqual(partsOf(after), ['field-preview', 'prev-label'])
  })

  it('renders legacy labelAfter after the preview on first render', () => {
    const field = textField(editor(), { labelAfter: true })
    assert.deepEqual(partsOf(field), ['field-preview', 'prev-label'])
  })

  it('puts the edit window after the wrapper', () => {
    const field = textField(editor())
    const children = [...field.dom.children]
    assert.ok(children.indexOf(wrapOf(field)) < children.indexOf(field.dom.querySelector('.field-edit')))
  })

  it('moves the label and swaps the class when labelPosition changes', () => {
    const field = textField(editor())
    field.set('config.labelPosition', 'before')
    field.updatePreview()
    assert.equal(wrapOf(field).className, 'f-field f-label-before')
    field.set('config.labelPosition', 'bottom')
    field.updatePreview()
    assert.deepEqual(partsOf(field), ['field-preview', 'prev-label'])
  })

  it('keeps the wrapper with only the preview while the label is hidden, and brings the label back', () => {
    const field = textField(editor(), { labelPosition: 'after' })
    field.set('config.hideLabel', true)
    assert.doesNotThrow(() => field.updatePreview())
    assert.deepEqual(partsOf(field), ['field-preview'])
    field.set('config.hideLabel', false)
    field.updatePreview()
    assert.deepEqual(partsOf(field), ['field-preview', 'prev-label'])
  })
})
