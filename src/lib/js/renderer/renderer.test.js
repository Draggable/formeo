import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

describe('FormeoRenderer', () => {
  let dom
  let document
  let window
  let container

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
})
