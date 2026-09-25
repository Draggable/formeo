import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { targetPropertyMap } from './helpers.js'
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
  // the value action dispatches `new Event(...)`, which jsdom only accepts from its own window
  const nativeEvent = global.Event

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
    global.Event = dom.window.Event

    container = dom.window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'Node', 'FormData']) {
      delete global[key]
    }
    global.Event = nativeEvent
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

  describe('value actions', () => {
    const setValue = (target, value) => ({ target, targetProperty: 'value', assignment: '=', value })
    const typeInto = (elem, value) => {
      elem.value = value
      elem.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    }

    test('"=" sets the target value and re-runs conditions that read the target', () => {
      render({
        'source-1': inputField('source-1', 'text', {
          conditions: [
            {
              if: [{ source: 'fields.source-1', sourceProperty: 'value', comparison: '==', target: 'go' }],
              then: [setValue('fields.source-2', 'set')],
            },
          ],
        }),
        'source-2': inputField('source-2'),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: 'fields.source-2', target: 'set' }),
        }),
      })

      typeInto(container.querySelector('#f-source-1'), 'go')

      assert.equal(container.querySelector('#f-source-2').value, 'set')
      assert.equal(isTargetHidden(), true, 'the input event re-ran the condition reading source-2')
    })

    test('a value action on a field its own condition watches runs once, not forever', () => {
      const originalValue = targetPropertyMap.value
      let calls = 0
      targetPropertyMap.value = (...args) => {
        calls += 1
        // a safety cap so an unguarded loop fails the assertion instead of overflowing the stack
        return calls > 50 ? undefined : originalValue(...args)
      }

      try {
        // A == 'x' || B != 'q'  then  B = 'q': setting B fires input on B, which B's clause watches
        render({
          'field-a': inputField('field-a', 'text', { attrs: { type: 'text', value: 'x' } }),
          'field-b': inputField('field-b', 'text', {
            conditions: [
              {
                if: [
                  { source: 'fields.field-a', sourceProperty: 'value', comparison: '==', target: 'x' },
                  { logical: '||', source: 'fields.field-b', sourceProperty: 'value', comparison: '!=', target: 'q' },
                ],
                then: [setValue('fields.field-b', 'q')],
              },
            ],
          }),
        })
      } finally {
        targetPropertyMap.value = originalValue
      }

      assert.ok(container.querySelector('form'), 'the form renders')
      assert.equal(calls, 1, 'the action ran once on render')
      assert.equal(container.querySelector('#f-field-b').value, 'q')
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

    test('a half-filled clause with no source never matches on render', () => {
      render({
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhen({ source: '', comparison: '!=', target: 'x' }),
        }),
      })

      assert.equal(isTargetHidden(), false)
    })

    test('renders and keeps applying the other conditions when one uses the old `if` object shape', () => {
      const [working] = hideTargetWhen({ source: 'fields.source-1', target: 'b' })
      // the shape older docs showed: `if` is a single clause object, not an array
      const oldShape = { if: { source: 'fields.source-1', sourceProperty: 'value', comparison: 'equals', target: 'a' } }
      const conditions = [oldShape, ...hideTargetWhen({ source: 'fields.broken id!', target: 'x' }), working]

      const originalError = console.error
      const errors = []
      console.error = (...args) => errors.push(args)
      try {
        assert.doesNotThrow(() =>
          render({
            'source-1': optionField('source-1', 'select', [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]),
            [TARGET_ID]: inputField(TARGET_ID, 'text', { conditions }),
          })
        )
      } finally {
        console.error = originalError
      }

      assert.ok(container.querySelector('form'), 'the form renders')
      assert.equal(errors.length, 1, 'only the old-shape condition is skipped')
      assert.equal(errors[0][0], 'formeo: condition skipped')
      assert.deepEqual(errors[0][1], oldShape)

      const select = container.querySelector('#f-source-1')
      select.value = 'b'
      change(select)

      assert.equal(isTargetHidden(), true, 'the healthy condition still works')
    })
  })

  describe('hidden targets and required', () => {
    const form = () => container.querySelector('form')
    const typeInto = (elem, value) => {
      elem.value = value
      elem.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    }
    const hideWhenSourceIsHide = targetAddress => [
      {
        if: [{ source: 'fields.source-1', sourceProperty: 'value', comparison: 'equals', target: 'hide' }],
        then: [{ target: targetAddress, targetProperty: 'isNotVisible', assignment: '', value: '' }],
      },
      {
        if: [{ source: 'fields.source-1', sourceProperty: 'value', comparison: 'notEquals', target: 'hide' }],
        then: [{ target: targetAddress, targetProperty: 'isVisible', assignment: '', value: '' }],
      },
    ]

    test('required inputs inside a hidden row do not block submission', () => {
      const formData = buildFormData({
        'source-1': inputField('source-1', 'text', { conditions: hideWhenSourceIsHide('rows.row-2') }),
      })
      formData.stages['stage-1'].children.push('row-2')
      formData.rows['row-2'] = { id: 'row-2', config: {}, children: ['column-inner'] }
      formData.columns['column-inner'] = { id: 'column-inner', config: { width: '100%' }, children: ['inner'] }
      formData.fields.inner = inputField('inner', 'text', { attrs: { type: 'text', required: true } })
      new FormeoRenderer({ renderContainer: container, formData }).render()

      typeInto(container.querySelector('#f-source-1'), 'hide')

      assert.equal(form().checkValidity(), true)
    })

    test('showing a field whose row is still hidden keeps it from blocking submission', () => {
      const when = (value, then) => ({
        if: [{ source: 'fields.source-1', sourceProperty: 'value', comparison: 'equals', target: value }],
        then: then.map(([target, targetProperty]) => ({ target, targetProperty, assignment: '', value: '' })),
      })
      const formData = buildFormData({
        'source-1': inputField('source-1', 'text', {
          conditions: [
            when('hide', [
              ['rows.row-2', 'isNotVisible'],
              ['fields.inner', 'isNotVisible'],
            ]),
            when('field', [['fields.inner', 'isVisible']]),
            when('row', [['rows.row-2', 'isVisible']]),
          ],
        }),
      })
      formData.stages['stage-1'].children.push('row-2')
      formData.rows['row-2'] = { id: 'row-2', config: {}, children: ['column-inner'] }
      formData.columns['column-inner'] = { id: 'column-inner', config: { width: '100%' }, children: ['inner'] }
      formData.fields.inner = inputField('inner', 'text', { attrs: { type: 'text', required: true } })
      new FormeoRenderer({ renderContainer: container, formData }).render()
      const source = container.querySelector('#f-source-1')
      const inner = container.querySelector('#f-inner')

      typeInto(source, 'hide')
      typeInto(source, 'field')
      assert.equal(inner.parentElement.hasAttribute('hidden'), false, 'the field itself is shown')
      assert.equal(form().checkValidity(), true, 'but its row is still hidden, so it is not required')

      typeInto(source, 'row')
      assert.equal(inner.required, true, 'required again once the row is shown')
      assert.equal(form().checkValidity(), false)
    })

    test('"isVisible" on a field that was never hidden keeps its required attribute', () => {
      render({
        'source-1': inputField('source-1', 'text', { conditions: hideWhenSourceIsHide(`fields.${TARGET_ID}`) }),
        [TARGET_ID]: inputField(TARGET_ID, 'text', { attrs: { type: 'text', required: true } }),
      })

      assert.equal(container.querySelector(`#f-${TARGET_ID}`).required, true)
    })

    test('a hidden required radio group no longer blocks submission, and blocks again once shown', () => {
      render({
        'source-1': inputField('source-1', 'text', { conditions: hideWhenSourceIsHide(`fields.${TARGET_ID}`) }),
        [TARGET_ID]: optionField(TARGET_ID, 'radio', [{ label: 'One', value: 'r1' }], {
          attrs: { type: 'radio', required: true },
        }),
      })
      const source = container.querySelector('#f-source-1')

      assert.equal(form().checkValidity(), false, 'visible and unanswered')

      typeInto(source, 'hide')
      assert.equal(isTargetHidden(), true)
      assert.equal(form().checkValidity(), true, 'hidden radios are not required')

      typeInto(source, 'show')
      assert.equal(isTargetHidden(), false)
      assert.equal(form().checkValidity(), false, 'required again once visible')
    })
  })

  describe('combining if-clauses', () => {
    const TEXT_A = 'text-a'
    const TEXT_B = 'text-b'
    const clause = (source, value, logical) => ({
      ...(logical && { logical }),
      source: `fields.${source}`,
      sourceProperty: 'value',
      comparison: 'equals',
      target: value,
      targetProperty: '',
    })
    const hideTargetWhenAll = ifClauses => [
      {
        if: ifClauses,
        then: [{ target: `fields.${TARGET_ID}`, targetProperty: 'isNotVisible', assignment: '', value: '' }],
      },
    ]
    const typeInto = (id, value) => {
      const elem = container.querySelector(`#f-${id}`)
      elem.value = value
      elem.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    }
    const renderWith = ifClauses =>
      render({
        [TEXT_A]: inputField(TEXT_A),
        [TEXT_B]: inputField(TEXT_B),
        'text-c': inputField('text-c'),
        [TARGET_ID]: inputField(TARGET_ID, 'text', { conditions: hideTargetWhenAll(ifClauses) }),
      })

    test('"&&" only fires when every clause matches', () => {
      renderWith([clause(TEXT_A, 'a'), clause(TEXT_B, 'b', '&&')])

      typeInto(TEXT_A, 'a')
      assert.equal(isTargetHidden(), false, 'one of two AND clauses is not enough')

      typeInto(TEXT_B, 'b')
      assert.equal(isTargetHidden(), true, 'both AND clauses match')
    })

    test('"||" fires when any clause matches', () => {
      renderWith([clause(TEXT_A, 'a'), clause(TEXT_B, 'b', '||')])

      typeInto(TEXT_B, 'b')
      assert.equal(isTargetHidden(), true)
    })

    test('a clause without "logical" is OR-ed, as before', () => {
      renderWith([clause(TEXT_A, 'a'), clause(TEXT_B, 'b')])

      typeInto(TEXT_A, 'a')
      assert.equal(isTargetHidden(), true)
    })

    test('accepts "and" as well as "&&"', () => {
      renderWith([clause(TEXT_A, 'a'), clause(TEXT_B, 'b', 'and')])

      typeInto(TEXT_A, 'a')
      assert.equal(isTargetHidden(), false)
    })

    test('"&&" binds tighter than "||": A || B && C', () => {
      renderWith([clause(TEXT_A, 'a'), clause(TEXT_B, 'b', '||'), clause('text-c', 'c', '&&')])

      typeInto(TEXT_B, 'b')
      assert.equal(isTargetHidden(), false, 'B alone does not satisfy B && C')

      typeInto(TEXT_A, 'a')
      assert.equal(isTargetHidden(), true, 'A alone satisfies the OR')
    })

    test('an AND condition whose clauses already match fires on load', () => {
      render({
        [TEXT_A]: inputField(TEXT_A, 'text', { attrs: { type: 'text', value: 'a' } }),
        [TEXT_B]: inputField(TEXT_B, 'text', { attrs: { type: 'text', value: 'b' } }),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhenAll([clause(TEXT_A, 'a'), clause(TEXT_B, 'b', '&&')]),
        }),
      })

      assert.equal(isTargetHidden(), true)
    })

    test('a "notEquals" clause on a removed source field never matches', () => {
      render({
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: hideTargetWhenAll([{ ...clause('deleted-field', 'x'), comparison: 'notEquals' }]),
        }),
      })

      assert.equal(isTargetHidden(), false)
    })
  })

  describe('documented examples (docs/renderer/renderer.md)', () => {
    test('"Show a field for Other" works as documented', () => {
      render({
        country: {
          id: 'country',
          tag: 'select',
          attrs: {},
          config: { label: 'Country' },
          options: [
            { label: 'Canada', value: 'ca' },
            { label: 'Other', value: 'other' },
          ],
        },
        'country-other': {
          id: 'country-other',
          tag: 'input',
          attrs: { type: 'text', required: true },
          config: { label: 'Which country?' },
          conditions: [
            {
              if: [{ source: 'fields.country', sourceProperty: 'value', comparison: '!=', target: 'other' }],
              then: [{ target: 'fields.country-other', targetProperty: 'isNotVisible' }],
            },
            {
              if: [{ source: 'fields.country', sourceProperty: 'value', comparison: '==', target: 'other' }],
              then: [{ target: 'fields.country-other', targetProperty: 'isVisible' }],
            },
          ],
        },
      })
      const other = container.querySelector('#f-country-other')
      const select = container.querySelector('#f-country')

      assert.equal(other.parentElement.hasAttribute('hidden'), true, 'hidden while Canada is selected')
      assert.equal(other.required, false, 'not required while hidden')

      select.value = 'other'
      change(select)

      assert.equal(other.parentElement.hasAttribute('hidden'), false, 'shown for Other')
      assert.equal(other.required, true, 'required again once shown')
    })

    test('"Require two answers" (AND) works as documented', () => {
      render({
        plan: optionField('plan', 'radio', [
          { label: 'Free', value: 'free' },
          { label: 'Team', value: 'team' },
        ]),
        seats: inputField('seats', 'number'),
        [TARGET_ID]: inputField(TARGET_ID, 'text', {
          conditions: [
            {
              if: [
                { source: 'fields.plan', sourceProperty: 'value', comparison: '==', target: 'team' },
                { logical: '&&', source: 'fields.seats', sourceProperty: 'value', comparison: '==', target: '10' },
              ],
              then: [{ target: `fields.${TARGET_ID}`, targetProperty: 'isNotVisible' }],
            },
          ],
        }),
      })
      const [, team] = container.querySelectorAll('#f-plan input')
      team.checked = true
      change(team)
      assert.equal(isTargetHidden(), false, 'one answer is not enough')

      const seats = container.querySelector('#f-seats')
      seats.value = '10'
      seats.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      assert.equal(isTargetHidden(), true, 'both answers match')
    })
  })
})
