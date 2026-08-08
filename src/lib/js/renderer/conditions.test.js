import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const TARGET_ID = 'target-1'

const column = fieldId => [
  `column-${fieldId}`,
  { id: `column-${fieldId}`, config: { width: '100%' }, children: [fieldId] },
]

const buildFormData = fields => {
  const fieldIds = Object.keys(fields)

  return {
    id: 'test-form',
    stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
    rows: { 'row-1': { id: 'row-1', config: {}, children: fieldIds.map(id => `column-${id}`) } },
    columns: Object.fromEntries(fieldIds.map(column)),
    fields,
  }
}

const optionField = (id, type, options, extra = {}) => ({
  id,
  tag: type === 'select' ? 'select' : 'input',
  attrs: type === 'select' ? {} : { type },
  config: { label: `${type} field` },
  options,
  ...extra,
})

const inputField = (id, type = 'text', extra = {}) => ({
  id,
  tag: 'input',
  attrs: { type },
  config: { label: `${type} field` },
  ...extra,
})

/**
 * A condition hiding the target field while the source matches.
 */
const hideTargetWhen = ({ source, sourceProperty = 'value', comparison = 'equals', target }) => [
  {
    if: [{ source, sourceProperty, comparison, target, targetProperty: '' }],
    then: [{ target: `fields.${TARGET_ID}`, targetProperty: 'isNotVisible', assignment: '', value: '' }],
  },
]

describe('renderer conditions', () => {
  let dom
  let container

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })

    global.document = dom.window.document
    global.window = dom.window
    global.Element = dom.window.Element
    global.HTMLElement = dom.window.HTMLElement
    global.Node = dom.window.Node
    global.FormData = dom.window.FormData

    container = dom.window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'Node', 'FormData']) {
      delete global[key]
    }
  })

  const render = fields => {
    const renderer = new FormeoRenderer({ renderContainer: container, formData: buildFormData(fields) })
    renderer.render()

    return renderer
  }

  const isTargetHidden = () => container.querySelector(`#f-${TARGET_ID}`).parentElement.hasAttribute('hidden')

  const change = elem => elem.dispatchEvent(new dom.window.Event('change', { bubbles: true }))

  describe('select sources', () => {
    test('re-evaluates when the selection changes', () => {
      render({
        'source-1': optionField('source-1', 'select', [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'b' }),
        }),
      })

      assert.equal(isTargetHidden(), false, 'target starts visible')

      const select = container.querySelector('#f-source-1')
      select.value = 'b'
      change(select)

      assert.equal(isTargetHidden(), true, 'selecting the matching option hides the target')
    })

    test('listens on the select itself, not on its options', () => {
      render({
        'source-1': optionField('source-1', 'select', [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'b' }),
        }),
      })

      const select = container.querySelector('#f-source-1')
      select.value = 'b'
      // an option-level listener would never see this event
      change(select.options[1])

      assert.equal(isTargetHidden(), true, 'the event bubbling from an option still triggers the condition')
    })

    test('supports the legacy "checked" source property', () => {
      render({
        'source-1': optionField('source-1', 'select', [
          { label: 'Gold', value: 'zlato' },
          { label: 'Platinum', value: 'platina' },
        ]),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', sourceProperty: 'checked', target: 'platina' }),
        }),
      })

      const select = container.querySelector('#f-source-1')
      select.value = 'platina'
      change(select)

      assert.equal(isTargetHidden(), true, '"checked" resolves to the selected value')
    })
  })

  describe('radio group sources', () => {
    const radioOptions = [
      { label: 'One', value: 'r1' },
      { label: 'Two', value: 'r2' },
    ]

    test('evaluates the checked option, not the group wrapper', () => {
      render({
        'source-1': optionField('source-1', 'radio', radioOptions),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'r2' }),
        }),
      })

      assert.equal(isTargetHidden(), false, 'nothing checked means no match')

      const [, second] = container.querySelectorAll('#f-source-1 input')
      second.checked = true
      change(second)

      assert.equal(isTargetHidden(), true, 'checking the matching radio hides the target')
    })

    test('applies a preselected option on load', () => {
      render({
        'source-1': optionField('source-1', 'radio', [
          { label: 'One', value: 'r1' },
          { label: 'Two', value: 'r2', selected: true },
        ]),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'r2' }),
        }),
      })

      assert.equal(isTargetHidden(), true, 'the preselected option is evaluated during render')
    })

    test('does not match another option', () => {
      render({
        'source-1': optionField('source-1', 'radio', radioOptions),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'r2' }),
        }),
      })

      const [first] = container.querySelectorAll('#f-source-1 input')
      first.checked = true
      change(first)

      assert.equal(isTargetHidden(), false, 'a non-matching selection leaves the target alone')
    })
  })

  describe('checkbox group sources', () => {
    const checkboxOptions = [
      { label: 'One', value: 'c1' },
      { label: 'Two', value: 'c2' },
    ]

    test('matches a checked value with "equals"', () => {
      render({
        'source-1': optionField('source-1', 'checkbox', checkboxOptions),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: 'c2' }),
        }),
      })

      assert.equal(isTargetHidden(), false, 'nothing checked means no match')

      const [, second] = container.querySelectorAll('#f-source-1 input')
      second.checked = true
      change(second)

      assert.equal(isTargetHidden(), true, 'equals matches any checked value of the group')
    })

    test('matches a checked value with "contains" when several are checked', () => {
      render({
        'source-1': optionField('source-1', 'checkbox', checkboxOptions),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', comparison: 'contains', target: 'c2' }),
        }),
      })

      const inputs = container.querySelectorAll('#f-source-1 input')
      inputs[0].checked = true
      inputs[1].checked = true
      change(inputs[1])

      assert.equal(isTargetHidden(), true, 'contains matches against every checked value')
    })

    test('"isNotChecked" resolves against the checked options of the group', () => {
      render({
        'source-1': optionField('source-1', 'checkbox', [
          { label: 'One', value: 'c1', selected: true },
          { label: 'Two', value: 'c2' },
        ]),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', sourceProperty: 'isNotChecked', target: '' }),
        }),
      })

      assert.equal(isTargetHidden(), false, 'a boolean property resolving to false must not fall through')
    })

    test('"isNotChecked" matches an untouched group', () => {
      render({
        'source-1': optionField('source-1', 'checkbox', checkboxOptions),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', sourceProperty: 'isNotChecked', target: '' }),
        }),
      })

      assert.equal(isTargetHidden(), true, 'no option checked means the group is not checked')
    })
  })

  describe('text-like sources', () => {
    test('re-evaluates a number input on input events', () => {
      render({
        'source-1': inputField('source-1', 'number'),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-1', target: '42' }),
        }),
      })

      const input = container.querySelector('#f-source-1')
      input.value = '42'
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))

      assert.equal(isTargetHidden(), true, 'non-text input types are listened to as well')
    })
  })

  describe('unusable conditions', () => {
    test('renders a form whose condition points at a removed field', () => {
      assert.doesNotThrow(() =>
        render({
          [TARGET_ID]: inputField(TARGET_ID, 'text', {
            conditions: hideTargetWhen({ source: 'fields.deleted-field', target: 'x' }),
          }),
        })
      )

      assert.equal(isTargetHidden(), false, 'an unresolvable source never matches')
    })

    test('keeps applying the remaining conditions when one blows up', () => {
      const conditions = [
        ...hideTargetWhen({ source: 'fields.broken id!', target: 'x' }),
        ...hideTargetWhen({ source: 'fields.source-1', target: 'b' }),
      ]

      assert.doesNotThrow(() =>
        render({
          'source-1': optionField('source-1', 'select', [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ]),
          [TARGET_ID]: inputField(TARGET_ID, 'text', { conditions }),
        })
      )

      const select = container.querySelector('#f-source-1')
      select.value = 'b'
      change(select)

      assert.equal(isTargetHidden(), true, 'the healthy condition still works')
    })
  })
})
