import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const buildFormData = fields => {
  const fieldIds = Object.keys(fields)

  return {
    id: 'option-groups-form',
    stages: { 'stage-1': { id: 'stage-1', children: ['row-1'] } },
    rows: { 'row-1': { id: 'row-1', config: {}, children: fieldIds.map(id => `column-${id}`) } },
    columns: Object.fromEntries(
      fieldIds.map(id => [`column-${id}`, { id: `column-${id}`, config: { width: '100%' }, children: [id] }])
    ),
    fields,
  }
}

const groupField = (id, type, attrs = {}, extra = {}) => ({
  id,
  tag: 'input',
  attrs: { type, ...attrs },
  config: { label: `${type} group` },
  options: [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
  ],
  ...extra,
})

describe('checkbox and radio groups', () => {
  let window
  let container

  beforeEach(() => {
    const jsdom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    window = jsdom.window
    global.document = window.document
    global.window = window
    global.Element = window.Element
    global.HTMLElement = window.HTMLElement
    global.HTMLFormElement = window.HTMLFormElement
    global.Node = window.Node
    global.FormData = window.FormData
    container = window.document.getElementById('container')
  })

  afterEach(() => {
    for (const key of ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']) {
      delete global[key]
    }
  })

  const render = fields => {
    const renderer = new FormeoRenderer({ renderContainer: container, formData: buildFormData(fields) })
    renderer.render()
    return renderer
  }

  const inputsOf = id => Array.from(container.querySelectorAll(`#f-${id} input`))
  const form = () => container.querySelector('form')
  const change = elem => elem.dispatchEvent(new window.Event('change', { bubbles: true }))

  describe('name', () => {
    test('radio group inputs use attrs.name when it is set', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['favcolor', 'favcolor']
      )
    })

    test('checkbox group inputs use attrs.name when it is set, with a [] suffix so every checked value posts (#128)', () => {
      render({ 'checkbox-1': groupField('checkbox-1', 'checkbox', { name: 'toppings' }) })

      assert.deepEqual(
        inputsOf('checkbox-1').map(input => input.name),
        ['toppings[]', 'toppings[]']
      )
    })

    test('falls back to the prefixed field id when no name is set', () => {
      render({ 'radio-1': groupField('radio-1', 'radio') })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['f-radio-1', 'f-radio-1']
      )
    })

    test('attrs.id still wins over the field id when no name is set (#331 workaround keeps working)', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { id: 'legacy-id' }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.name),
        ['legacy-id', 'legacy-id']
      )
    })

    test('userData is keyed by the configured name', () => {
      const renderer = render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })
      inputsOf('radio-1')[1].checked = true

      assert.deepEqual(renderer.userData, { favcolor: 'two' })
    })

    test('userFormData finds the label of a group with a custom name', () => {
      const renderer = render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor' }) })
      inputsOf('radio-1')[0].checked = true

      assert.deepEqual(renderer.userFormData, [{ key: 'favcolor', value: 'one', label: 'radio group' }])
    })
  })

  describe('required', () => {
    test('every radio input is required and the group label shows the required mark', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { required: true }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.required),
        [true, true]
      )
      assert.ok(container.querySelector('label[for="f-radio-1"] .text-error'), 'group label has the * mark')
    })

    test('a required radio group blocks submission until an option is chosen', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { required: true }) })

      assert.equal(form().checkValidity(), false)
      inputsOf('radio-1')[0].checked = true
      assert.equal(form().checkValidity(), true)
    })

    test('a required checkbox group needs one checked box, not all of them', () => {
      render({ 'checkbox-1': groupField('checkbox-1', 'checkbox', { required: true }) })
      const [first] = inputsOf('checkbox-1')

      assert.equal(form().checkValidity(), false, 'nothing checked is invalid')

      first.checked = true
      change(first)
      assert.equal(form().checkValidity(), true, 'one checked box is enough')

      first.checked = false
      change(first)
      assert.equal(form().checkValidity(), false, 'unchecking the last box makes it invalid again')
    })

    test('a required checkbox group with a preselected option starts valid', () => {
      render({
        'checkbox-1': groupField(
          'checkbox-1',
          'checkbox',
          { required: true },
          {
            options: [
              { label: 'One', value: 'one', selected: true },
              { label: 'Two', value: 'two' },
            ],
          }
        ),
      })

      assert.equal(form().checkValidity(), true)
    })

    test('setting userData re-validates a required checkbox group', () => {
      const renderer = render({
        'checkbox-1': groupField('checkbox-1', 'checkbox', { required: true, name: 'toppings' }),
      })

      renderer.userData = { toppings: ['two'] }

      assert.equal(form().checkValidity(), true)
    })

    test('setting userData checks the box of a single-option checkbox group', () => {
      const renderer = render({
        'checkbox-1': groupField(
          'checkbox-1',
          'checkbox',
          { name: 'agree' },
          { options: [{ label: 'I agree', value: 'yes' }] }
        ),
      })

      renderer.userData = { agree: 'yes' }

      const [box] = inputsOf('checkbox-1')
      assert.equal(box.checked, true)
      assert.equal(box.value, 'yes', 'the value is left alone')
    })

    const afterReset = () => new Promise(resolve => setTimeout(resolve, 0))

    test('resetting the form re-validates a required checkbox group', async () => {
      render({ 'checkbox-1': groupField('checkbox-1', 'checkbox', { required: true }) })
      const [first] = inputsOf('checkbox-1')
      first.checked = true
      change(first)
      assert.equal(form().checkValidity(), true, 'valid with a box checked')

      form().reset()
      await afterReset()

      assert.equal(first.checked, false, 'reset unchecked the box')
      assert.equal(form().checkValidity(), false, 'nothing checked is invalid again')
    })

    test('resetting the form back to a preselected box makes a required checkbox group valid again', async () => {
      render({
        'checkbox-1': groupField(
          'checkbox-1',
          'checkbox',
          { required: true },
          {
            options: [
              { label: 'One', value: 'one', selected: true },
              { label: 'Two', value: 'two' },
            ],
          }
        ),
      })
      const [first] = inputsOf('checkbox-1')
      first.checked = false
      change(first)
      assert.equal(form().checkValidity(), false, 'invalid with nothing checked')

      form().reset()
      await afterReset()

      assert.equal(first.checked, true, 'reset re-checked the preselected box')
      assert.equal(form().checkValidity(), true)
    })

    describe('checked by a condition', () => {
      const setOptionWhen = (value, targetProperty) => [
        {
          if: [{ source: 'fields.source-1', sourceProperty: 'value', comparison: '==', target: value }],
          then: [{ target: 'fields.checkbox-1.options[0]', targetProperty }],
        },
      ]
      const typeIntoSource = value => {
        const source = container.querySelector('#f-source-1')
        source.value = value
        source.dispatchEvent(new window.Event('input', { bubbles: true }))
      }
      const sourceField = conditions => ({
        id: 'source-1',
        tag: 'input',
        attrs: { type: 'text' },
        config: { label: 'source' },
        conditions,
      })

      test('"isChecked" on one box makes the whole required group valid', () => {
        render({
          'source-1': sourceField(setOptionWhen('check', 'isChecked')),
          'checkbox-1': groupField('checkbox-1', 'checkbox', { required: true }),
        })
        assert.equal(form().checkValidity(), false, 'nothing checked')

        typeIntoSource('check')

        assert.equal(inputsOf('checkbox-1')[0].checked, true)
        assert.equal(form().checkValidity(), true, 'the other box is no longer required')
      })

      test('"isNotChecked" on the only checked box makes the required group invalid again', () => {
        render({
          'source-1': sourceField(setOptionWhen('uncheck', 'isNotChecked')),
          'checkbox-1': groupField(
            'checkbox-1',
            'checkbox',
            { required: true },
            {
              options: [
                { label: 'One', value: 'one', selected: true },
                { label: 'Two', value: 'two' },
              ],
            }
          ),
        })
        assert.equal(form().checkValidity(), true, 'the preselected box satisfies the group')

        typeIntoSource('uncheck')

        assert.equal(inputsOf('checkbox-1')[0].checked, false)
        assert.equal(form().checkValidity(), false, 'nothing checked is invalid again')
      })
    })

    test('a group that is not required renders no required inputs', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { required: false }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.required),
        [false, false]
      )
    })
  })

  describe('other attributes', () => {
    test('custom and data attributes land on the group wrapper', () => {
      render({
        'checkbox-1': groupField('checkbox-1', 'checkbox', { 'data-foo': 'bar', title: 'Pick some', role: 'group' }),
      })
      const wrapper = container.querySelector('#f-checkbox-1')

      assert.equal(wrapper.getAttribute('data-foo'), 'bar')
      assert.equal(wrapper.getAttribute('title'), 'Pick some')
      assert.equal(wrapper.getAttribute('role'), 'group')
    })

    test('disabled is applied to every option input, not the wrapper', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { disabled: true }) })

      assert.deepEqual(
        inputsOf('radio-1').map(input => input.disabled),
        [true, true]
      )
      assert.equal(container.querySelector('#f-radio-1').hasAttribute('disabled'), false)
    })

    test('the wrapper does not receive type, name or required', () => {
      render({ 'radio-1': groupField('radio-1', 'radio', { name: 'favcolor', required: true }) })
      const wrapper = container.querySelector('#f-radio-1')

      for (const attr of ['type', 'name', 'required']) {
        assert.equal(wrapper.hasAttribute(attr), false, `wrapper has no ${attr}`)
      }
    })
  })

  describe('input group clones', () => {
    test('a cloned radio group gets its own name so it does not share a selection with the original', () => {
      // clone lookup goes through baseId(), which only recognises editor-style hex ids
      const formData = {
        id: 'clone-form',
        stages: { '0a0a0a0a': { id: '0a0a0a0a', children: ['1b1b1b1b'] } },
        rows: { '1b1b1b1b': { id: '1b1b1b1b', config: { inputGroup: true }, children: ['2c2c2c2c'] } },
        columns: { '2c2c2c2c': { id: '2c2c2c2c', config: { width: '100%' }, children: ['3d3d3d3d'] } },
        fields: { '3d3d3d3d': groupField('3d3d3d3d', 'radio', { name: 'favcolor' }) },
      }
      const renderer = new FormeoRenderer({ renderContainer: container, formData })
      renderer.render()

      container.querySelector('.add-input-group').click()

      const radios = Array.from(container.querySelectorAll('input[type="radio"]'))
      assert.equal(radios.length, 4, 'the row was cloned')
      assert.equal(new Set(radios.map(input => input.name)).size, 2, 'original and clone use different names')
    })

    test('a cloned select keeps its configured name (selects also carry top-level options)', () => {
      // clone lookup goes through baseId(), which only recognises editor-style hex ids
      const selectField = (id, attrs = {}) => ({
        id,
        tag: 'select',
        attrs,
        config: { label: 'select group' },
        options: [
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ],
      })
      const formData = {
        id: 'clone-form',
        stages: { '0a0a0a0a': { id: '0a0a0a0a', children: ['1b1b1b1b'] } },
        rows: { '1b1b1b1b': { id: '1b1b1b1b', config: { inputGroup: true }, children: ['2c2c2c2c'] } },
        columns: { '2c2c2c2c': { id: '2c2c2c2c', config: { width: '100%' }, children: ['3d3d3d3d'] } },
        fields: { '3d3d3d3d': selectField('3d3d3d3d', { name: 'favcolor' }) },
      }
      const renderer = new FormeoRenderer({ renderContainer: container, formData })
      renderer.render()

      container.querySelector('.add-input-group').click()

      const selects = Array.from(container.querySelectorAll('select'))
      assert.equal(selects.length, 2, 'the row was cloned')
      assert.deepEqual(
        selects.map(select => select.name),
        ['favcolor', 'favcolor']
      )
    })
  })
})
