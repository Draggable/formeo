import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

describe('FormeoRenderer', () => {
  let dom
  let document
  let window
  let container
  // the value condition action dispatches `new Event(...)`, which jsdom only accepts from its own window
  const nativeEvent = global.Event

  beforeEach(() => {
    // Set up JSDOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    document = dom.window.document
    window = dom.window

    // Set globals for the renderer
    global.document = document
    global.window = window
    global.Element = window.Element
    global.HTMLElement = window.HTMLElement
    global.HTMLFormElement = window.HTMLFormElement
    global.Node = window.Node
    global.FormData = window.FormData
    global.Event = window.Event

    container = document.getElementById('container')
  })

  afterEach(() => {
    // Clean up globals
    delete global.document
    delete global.window
    delete global.Element
    delete global.HTMLElement
    delete global.HTMLFormElement
    delete global.Node
    delete global.FormData
    global.Event = nativeEvent
  })

  describe('userFormData getter', () => {
    test('should return empty array when no form is rendered', () => {
      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: {
          id: 'test-form',
          stages: {},
          rows: {},
          columns: {},
          fields: {},
        },
      })

      const userFormData = renderer.userFormData
      assert.equal(Array.isArray(userFormData), true, 'userFormData should be an array')
      assert.equal(userFormData.length, 0, 'userFormData should be empty when no fields exist')
    })

    test('should return field data with key, value, and label', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              label: 'Username',
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
              value: 'john_doe',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      // Set a value in the form
      const input = container.querySelector('input[name="f-field-1"]')
      input.value = 'john_doe'

      const userFormData = renderer.userFormData

      assert.equal(Array.isArray(userFormData), true, 'userFormData should be an array')
      assert.equal(userFormData.length, 1, 'userFormData should have one field')
      assert.equal(userFormData[0].key, 'f-field-1', 'Field should have correct key')
      assert.equal(userFormData[0].value, 'john_doe', 'Field should have correct value')
      assert.equal(userFormData[0].label, 'Username', 'Field should have correct label')
    })

    test('should return multiple fields with their respective data', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1', 'field-2', 'field-3'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              label: 'Username',
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
            },
          },
          'field-2': {
            id: 'field-2',
            tag: 'input',
            config: {
              label: 'Email Address',
            },
            attrs: {
              type: 'email',
              name: 'f-field-2',
            },
          },
          'field-3': {
            id: 'field-3',
            tag: 'select',
            config: {
              label: 'Country',
            },
            attrs: {
              name: 'f-field-3',
            },
            children: [
              { tag: 'option', attrs: { value: 'us' }, children: 'United States' },
              { tag: 'option', attrs: { value: 'uk' }, children: 'United Kingdom' },
            ],
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      // Set values in the form
      container.querySelector('input[name="f-field-1"]').value = 'john_doe'
      container.querySelector('input[name="f-field-2"]').value = 'john@example.com'
      container.querySelector('select[name="f-field-3"]').value = 'uk'

      const userFormData = renderer.userFormData

      assert.equal(userFormData.length, 3, 'userFormData should have three fields')

      const usernameField = userFormData.find(f => f.key === 'f-field-1')
      assert.ok(usernameField, 'Username field should exist')
      assert.equal(usernameField.value, 'john_doe', 'Username should have correct value')
      assert.equal(usernameField.label, 'Username', 'Username should have correct label')

      const emailField = userFormData.find(f => f.key === 'f-field-2')
      assert.ok(emailField, 'Email field should exist')
      assert.equal(emailField.value, 'john@example.com', 'Email should have correct value')
      assert.equal(emailField.label, 'Email Address', 'Email should have correct label')

      const countryField = userFormData.find(f => f.key === 'f-field-3')
      assert.ok(countryField, 'Country field should exist')
      assert.equal(countryField.value, 'uk', 'Country should have correct value')
      assert.equal(countryField.label, 'Country', 'Country should have correct label')
    })

    test('should handle fields without labels gracefully', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              // No label specified
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()
      container.querySelector('input[name="f-field-1"]').value = 'test_value'

      const userFormData = renderer.userFormData

      assert.equal(userFormData.length, 1, 'userFormData should have one field')
      assert.equal(userFormData[0].label, '', 'Field without label should have empty string')
      assert.equal(userFormData[0].value, 'test_value', 'Field should still have value')
    })

    test('should handle checkbox groups with multiple values', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'div',
            config: {
              label: 'Hobbies',
            },
            children: [
              {
                tag: 'input',
                attrs: {
                  type: 'checkbox',
                  name: 'f-field-1',
                  value: 'reading',
                },
              },
              {
                tag: 'input',
                attrs: {
                  type: 'checkbox',
                  name: 'f-field-1',
                  value: 'gaming',
                },
              },
              {
                tag: 'input',
                attrs: {
                  type: 'checkbox',
                  name: 'f-field-1',
                  value: 'coding',
                },
              },
            ],
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      // Check multiple checkboxes
      const checkboxes = container.querySelectorAll('input[name="f-field-1"]')
      checkboxes[0].checked = true // reading
      checkboxes[2].checked = true // coding

      const userFormData = renderer.userFormData

      assert.equal(userFormData.length, 1, 'userFormData should have one entry for checkbox group')

      const hobbiesField = userFormData[0]
      assert.equal(hobbiesField.key, 'f-field-1', 'Checkbox group should have correct key')
      assert.equal(hobbiesField.label, 'Hobbies', 'Checkbox group should have correct label')
      assert.equal(Array.isArray(hobbiesField.value), true, 'Checkbox group value should be an array')
      assert.equal(hobbiesField.value.length, 2, 'Should have two selected values')
      assert.ok(hobbiesField.value.includes('reading'), 'Should include reading')
      assert.ok(hobbiesField.value.includes('coding'), 'Should include coding')
    })

    test('should handle checkbox group with single value', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'div',
            config: {
              label: 'Preferences',
            },
            children: [
              {
                tag: 'input',
                attrs: {
                  type: 'checkbox',
                  name: 'f-field-1',
                  value: 'newsletter',
                },
              },
              {
                tag: 'input',
                attrs: {
                  type: 'checkbox',
                  name: 'f-field-1',
                  value: 'updates',
                },
              },
            ],
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      // Check only one checkbox
      const checkboxes = container.querySelectorAll('input[name="f-field-1"]')
      checkboxes[0].checked = true

      const userFormData = renderer.userFormData

      const preferencesField = userFormData[0]
      assert.equal(preferencesField.value, 'newsletter', 'Single checkbox value should be a string, not array')
    })

    test('should reflect real-time changes in form values', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              label: 'Name',
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      const input = container.querySelector('input[name="f-field-1"]')

      // Initial value
      input.value = 'John'
      let userFormData = renderer.userFormData
      assert.equal(userFormData[0].value, 'John', 'Should get initial value')

      // Updated value
      input.value = 'Jane'
      userFormData = renderer.userFormData
      assert.equal(userFormData[0].value, 'Jane', 'Should get updated value')
    })

    test('should use baseId to match components with prefixed field IDs', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['my-field'],
          },
        },
        fields: {
          'my-field': {
            id: 'my-field',
            tag: 'input',
            config: {
              label: 'Test Field',
            },
            attrs: {
              type: 'text',
              name: 'f-my-field',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      const input = container.querySelector('input[name="f-my-field"]')
      input.value = 'test'

      const userFormData = renderer.userFormData

      // The renderer adds a prefix to IDs, so baseId should strip it
      assert.equal(userFormData[0].label, 'Test Field', 'Should find label using baseId')
    })

    test('should handle empty form values', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              label: 'Optional Field',
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      // Leave field empty
      const input = container.querySelector('input[name="f-field-1"]')
      input.value = ''

      const userFormData = renderer.userFormData

      assert.equal(userFormData[0].value, '', 'Empty field should have empty string value')
    })
  })

  describe('userData getter integration with userFormData', () => {
    test('userFormData should use userData as source', () => {
      const formData = {
        id: 'test-form',
        stages: {
          'stage-1': {
            id: 'stage-1',
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            config: {},
            children: ['column-1'],
          },
        },
        columns: {
          'column-1': {
            id: 'column-1',
            config: { width: '100%' },
            children: ['field-1', 'field-2'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            config: {
              label: 'First Name',
            },
            attrs: {
              type: 'text',
              name: 'f-field-1',
            },
          },
          'field-2': {
            id: 'field-2',
            tag: 'input',
            config: {
              label: 'Last Name',
            },
            attrs: {
              type: 'text',
              name: 'f-field-2',
            },
          },
        },
      }

      const renderer = new FormeoRenderer({
        renderContainer: container,
        formData: formData,
      })

      renderer.render()

      container.querySelector('input[name="f-field-1"]').value = 'John'
      container.querySelector('input[name="f-field-2"]').value = 'Doe'

      const userData = renderer.userData
      const userFormData = renderer.userFormData

      // Verify userData
      assert.equal(userData['f-field-1'], 'John')
      assert.equal(userData['f-field-2'], 'Doe')

      // Verify userFormData has same keys and values
      assert.equal(userFormData.length, 2)
      assert.equal(userFormData[0].value, userData['f-field-1'])
      assert.equal(userFormData[1].value, userData['f-field-2'])
    })
  })

  describe('events option (#209)', () => {
    const textFormData = () => ({
      id: 'events-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['nickname'] } },
      fields: {
        nickname: {
          id: 'nickname',
          tag: 'input',
          attrs: { type: 'text', name: 'nickname' },
          config: { label: 'Nickname' },
        },
      },
    })

    test('onRender runs once per render() with the attached form', () => {
      const calls = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: { onRender: evt => calls.push(evt) },
      })
      renderer.render(textFormData())
      // asserted before the next render() replaces (and detaches) this form
      assert.equal(calls.length, 1)
      assert.equal(calls[0].form.tagName, 'FORM')
      assert.equal(calls[0].form.isConnected, true)
      assert.equal(calls[0].renderer, renderer)

      renderer.render(textFormData())
      assert.equal(calls.length, 2)
      assert.equal(calls[1].form, container.querySelector('.formeo-render'))
    })

    test('reading html does not fire onRender', () => {
      const onRender = []
      const renderer = new FormeoRenderer({ renderContainer: container, events: { onRender: e => onRender.push(e) } })
      renderer.formData = textFormData()
      assert.ok(renderer.html.startsWith('<form'))
      assert.equal(onRender.length, 0)
    })

    test('onChange receives userData after input', () => {
      const values = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: { onChange: ({ userData }) => values.push(userData.nickname) },
      })
      renderer.render(textFormData())
      const input = container.querySelector('input[name="nickname"]')
      input.value = 'Ada'
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
      assert.deepEqual(values, ['Ada'])
    })

    test('onSubmit receives the event and userData', () => {
      const submits = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: {
          onSubmit: ({ event, userData }) => {
            event.preventDefault()
            submits.push(userData)
          },
        },
      })
      renderer.render(textFormData())
      container.querySelector('input[name="nickname"]').value = 'Grace'
      const submit = new window.Event('submit', { cancelable: true })
      container.querySelector('form').dispatchEvent(submit)
      assert.deepEqual(submits, [{ nickname: 'Grace' }])
      assert.equal(submit.defaultPrevented, true)
    })

    test('getRenderedForm() with no renderContainer still fires onChange/onSubmit without throwing', () => {
      const values = []
      const submits = []
      const renderer = new FormeoRenderer({
        events: {
          onChange: ({ userData }) => values.push(userData.nickname),
          onSubmit: ({ event, userData }) => {
            event.preventDefault()
            submits.push(userData)
          },
        },
      })
      const form = renderer.getRenderedForm(textFormData())
      const input = form.querySelector('input[name="nickname"]')
      input.value = 'Ada'
      assert.doesNotThrow(() => input.dispatchEvent(new window.Event('input', { bubbles: true })))
      assert.deepEqual(values, ['Ada'])

      const submit = new window.Event('submit', { cancelable: true })
      assert.doesNotThrow(() => form.dispatchEvent(submit))
      assert.equal(submit.defaultPrevented, true)
      assert.deepEqual(submits, [{ nickname: 'Ada' }])
    })

    test('onChange after a re-render still reads userData from the form the handler is bound to', () => {
      const values = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: { onChange: ({ userData }) => values.push(userData.nickname) },
      })
      renderer.render(textFormData())
      const oldForm = container.querySelector('.formeo-render')
      oldForm.querySelector('input[name="nickname"]').value = 'Ada'

      // replaces oldForm in the container with a fresh (empty) form
      renderer.render(textFormData())

      // a stale listener on the detached oldForm must still report oldForm's own data
      oldForm.dispatchEvent(new window.Event('input', { bubbles: true }))
      assert.deepEqual(values, ['Ada'])
    })

    // nickname starts as 'x', so the condition sets greeting (firing a bubbling input) on every render
    const valueConditionFormData = () => ({
      id: 'value-condition-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['nickname', 'greeting'] } },
      fields: {
        nickname: {
          id: 'nickname',
          tag: 'input',
          attrs: { type: 'text', name: 'nickname', value: 'x' },
          config: { label: 'Nickname' },
        },
        greeting: {
          id: 'greeting',
          tag: 'input',
          attrs: { type: 'text', name: 'greeting' },
          config: { label: 'Greeting' },
          conditions: [
            {
              if: [{ source: 'fields.nickname', sourceProperty: 'value', comparison: '==', target: 'x' }],
              then: [{ target: 'fields.greeting', targetProperty: 'value', assignment: '=', value: 'hello' }],
            },
          ],
        },
      },
    })

    test('onChange never reports userData from a form that render() replaced', () => {
      const values = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: { onChange: ({ userData }) => values.push(userData) },
      })
      renderer.render(valueConditionFormData())
      container.querySelector('input[name="nickname"]').value = 'typed'

      renderer.render(valueConditionFormData())

      // the second render's value action fires input while the old form is still in the container
      assert.deepEqual(values, [], `onChange fired during render: ${JSON.stringify(values)}`)
    })

    test('a value condition applied during render does not fire onChange', () => {
      const values = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        events: { onChange: ({ userData }) => values.push(userData) },
      })
      renderer.render(valueConditionFormData())
      assert.equal(container.querySelector('input[name="greeting"]').value, 'hello')
      assert.deepEqual(values, [])

      const nickname = container.querySelector('input[name="nickname"]')
      nickname.value = 'Ada'
      nickname.dispatchEvent(new window.Event('input', { bubbles: true }))
      assert.deepEqual(values, [{ nickname: 'Ada', greeting: 'hello' }])

      // a value action that user input triggers after render still reaches onChange: first its own
      // input on greeting, then the user's input on nickname
      container.querySelector('input[name="greeting"]').value = ''
      nickname.value = 'x'
      nickname.dispatchEvent(new window.Event('input', { bubbles: true }))
      assert.equal(values.length, 3)
      assert.equal(values[1].greeting, 'hello')
      assert.deepEqual(values[2], { nickname: 'x', greeting: 'hello' })
    })

    test('legacy config.action.onRender still fires once the form is in the page', async () => {
      const seen = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        config: { action: { onRender: form => seen.push(form.tagName) } },
      })
      renderer.render(textFormData())
      await new Promise(resolve => window.requestAnimationFrame(resolve))
      assert.deepEqual(seen, ['FORM'])
    })
  })

  describe('containers (#266)', () => {
    const emptyForm = { id: 'c-form', stages: {}, rows: {}, columns: {}, fields: {} }

    test('can be constructed without options', () => {
      assert.doesNotThrow(() => new FormeoRenderer())
    })

    test('render() without a container explains what is missing', () => {
      assert.throws(() => new FormeoRenderer().render(emptyForm), /renderContainer/)
    })

    test('html works without a container', () => {
      const renderer = new FormeoRenderer()
      renderer.formData = emptyForm
      assert.ok(renderer.html.startsWith('<form'))
    })

    test('accepts a jQuery object as renderContainer', () => {
      const renderer = new FormeoRenderer({ renderContainer: { jquery: '3.7.1', 0: container, length: 1 } })
      renderer.render(emptyForm)
      assert.ok(container.querySelector('.formeo-render'))
    })
  })

  describe('form attributes and file inputs (#313)', () => {
    const uploadFormData = () => ({
      id: 'upload-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['resume'] } },
      fields: {
        resume: {
          id: 'resume',
          tag: 'input',
          attrs: { type: 'file', name: 'resume' },
          config: { label: 'Resume', controlId: 'upload' },
        },
      },
    })

    test('config.attrs sets attributes on the rendered <form>', () => {
      const renderer = new FormeoRenderer({
        renderContainer: container,
        config: { attrs: { method: 'post', enctype: 'multipart/form-data', action: '/upload' } },
      })
      renderer.render(uploadFormData())
      const form = container.querySelector('form.formeo-render')
      assert.equal(form.getAttribute('method'), 'post')
      assert.equal(form.getAttribute('enctype'), 'multipart/form-data')
      assert.equal(form.getAttribute('action'), '/upload')
    })

    test('the upload field renders a named file input', () => {
      const renderer = new FormeoRenderer({ renderContainer: container })
      renderer.render(uploadFormData())
      assert.ok(container.querySelector('input[type="file"][name="resume"]'))
    })
  })

  describe('checkbox group names for native posts (#128)', () => {
    const checkboxGroup = (attrs, count = 3) => ({
      id: 'cb-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['hobbies-1'] } },
      fields: {
        'hobbies-1': {
          id: 'hobbies-1',
          tag: 'input',
          attrs: { type: 'checkbox', ...attrs },
          config: { label: 'Hobbies' },
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Gaming', value: 'gaming' },
            { label: 'Coding', value: 'coding' },
          ].slice(0, count),
        },
      },
    })
    const boxes = () => [...container.querySelectorAll('input[type="checkbox"]')]

    test('options share a name ending in [] so every checked value is posted', () => {
      new FormeoRenderer({ renderContainer: container }).render(checkboxGroup({ name: 'hobbies' }))
      assert.deepEqual([...new Set(boxes().map(b => b.name))], ['hobbies[]'])
      boxes()[0].checked = true
      boxes()[2].checked = true
      assert.deepEqual(new window.FormData(container.querySelector('form')).getAll('hobbies[]'), ['reading', 'coding'])
    })

    test('userData strips the [] suffix and keeps arrays', () => {
      const renderer = new FormeoRenderer({ renderContainer: container })
      renderer.render(checkboxGroup({ name: 'hobbies' }))
      boxes()[0].checked = true
      boxes()[2].checked = true
      assert.deepEqual(renderer.userData, { hobbies: ['reading', 'coding'] })
    })

    test('a single checked value stays a string', () => {
      const renderer = new FormeoRenderer({ renderContainer: container })
      renderer.render(checkboxGroup({ name: 'hobbies' }))
      boxes()[1].checked = true
      assert.deepEqual(renderer.userData, { hobbies: 'gaming' })
    })

    test('the userData setter accepts the plain name', () => {
      const renderer = new FormeoRenderer({ renderContainer: container })
      renderer.render(checkboxGroup({ name: 'hobbies' }))
      renderer.userData = { hobbies: ['gaming'] }
      assert.deepEqual(
        boxes().map(b => b.checked),
        [false, true, false]
      )
    })

    test('a single-option checkbox keeps its plain name', () => {
      new FormeoRenderer({ renderContainer: container }).render(checkboxGroup({ name: 'agree' }, 1))
      assert.equal(boxes()[0].name, 'agree')
    })

    test('a configured name already ending in [] still resolves a label via componentByName', () => {
      const renderer = new FormeoRenderer({ renderContainer: container })
      renderer.render(checkboxGroup({ name: 'hobbies[]' }))
      boxes()[0].checked = true
      const [hobbiesField] = renderer.userFormData
      assert.equal(hobbiesField.key, 'hobbies')
      assert.equal(hobbiesField.label, 'Hobbies')
    })
  })

  describe('custom controls (#228)', () => {
    test('elements[controlId].action.onRender runs for a custom control once it is in the page', async () => {
      const seen = []
      const renderer = new FormeoRenderer({
        renderContainer: container,
        elements: { 'image-annotate': { action: { onRender: elem => seen.push(elem) } } },
      })
      renderer.render({
        id: 'custom-form',
        stages: { 's-1': { id: 's-1', children: ['r-1'] } },
        rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
        columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['annotate-1'] } },
        fields: {
          'annotate-1': {
            id: 'annotate-1',
            tag: 'div',
            attrs: { className: 'image-annotate' },
            config: { label: 'Annotate', controlId: 'image-annotate' },
            children: [{ tag: 'input', attrs: { type: 'hidden', name: 'annotation', value: '' } }],
          },
        },
      })
      await new Promise(resolve => window.requestAnimationFrame(resolve))
      const elem = seen.find(el => el.id === 'f-annotate-1')
      assert.ok(elem, 'onRender ran for the custom control')
      // docs/controls/custom-controls.md passes elem straight to the library, so elem must be the control itself
      assert.ok(elem.classList.contains('image-annotate'))
      assert.equal(renderer.userData.annotation, '')
    })
  })
})
