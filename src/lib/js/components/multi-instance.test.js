/**
 * Multi-instance isolation tests (Issue #152)
 * Verifies that multiple FormeoEditor instances on the same page
 * maintain separate state (Components, Events, Actions).
 */

import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { Components } from './index.js'

describe('Multi-instance isolation (Issue #152)', () => {
  describe('Components isolation', () => {
    it('should maintain separate formData between two Components instances', () => {
      // Create two independent Components instances
      const events1 = new Events()
      events1.init({})
      const actions1 = new Actions(events1)
      actions1.init({})
      const components1 = new Components(events1, actions1)

      const events2 = new Events()
      events2.init({})
      const actions2 = new Actions(events2)
      actions2.init({})
      const components2 = new Components(events2, actions2)

      // Load different data into each
      const formData1 = {
        id: 'form-editor-1',
        stages: {
          'stage-1': {
            id: 'stage-1',
            attrs: { title: 'Editor 1 Stage' },
            children: ['row-1'],
          },
        },
        rows: {
          'row-1': {
            id: 'row-1',
            children: ['col-1'],
          },
        },
        columns: {
          'col-1': {
            id: 'col-1',
            config: { width: '100%' },
            children: ['field-1'],
          },
        },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            attrs: { type: 'text', label: 'Editor 1 Field' },
            config: { label: 'Editor 1 Field' },
          },
        },
      }

      const formData2 = {
        id: 'form-editor-2',
        stages: {
          'stage-2': {
            id: 'stage-2',
            attrs: { title: 'Editor 2 Stage' },
            children: ['row-2'],
          },
        },
        rows: {
          'row-2': {
            id: 'row-2',
            children: ['col-2'],
          },
        },
        columns: {
          'col-2': {
            id: 'col-2',
            config: { width: '100%' },
            children: ['field-2'],
          },
        },
        fields: {
          'field-2': {
            id: 'field-2',
            tag: 'textarea',
            attrs: { label: 'Editor 2 Field' },
            config: { label: 'Editor 2 Field' },
          },
        },
      }

      components1.load(formData1)

      // Verify components1 has its data
      assert.equal(components1.formData.id, 'form-editor-1')
      assert.equal(Object.keys(components1.formData.stages).length, 1)
      assert.equal(Object.keys(components1.formData.fields).length, 1)

      // Load data into components2 - this should NOT affect components1
      components2.load(formData2)

      // Verify components2 has its own data
      assert.equal(components2.formData.id, 'form-editor-2')
      assert.equal(Object.keys(components2.formData.stages).length, 1)
      assert.equal(Object.keys(components2.formData.fields).length, 1)

      // CRITICAL: Verify components1 data was NOT overwritten
      assert.equal(components1.formData.id, 'form-editor-1')
      assert.equal(Object.keys(components1.formData.stages).length, 1)
      assert.equal(Object.keys(components1.formData.fields).length, 1)
      assert.equal(Object.keys(components1.formData.stages)[0], 'stage-1')
      assert.equal(Object.keys(components1.formData.fields)[0], 'field-1')

      // Verify the field types are correct
      const field1 = components1.formData.fields['field-1']
      const field2 = components2.formData.fields['field-2']
      assert.equal(field1.tag, 'input')
      assert.equal(field2.tag, 'textarea')
    })

    it('should have independent data stores (stages, rows, columns, fields)', () => {
      const events1 = new Events()
      events1.init({})
      const actions1 = new Actions(events1)
      actions1.init({})
      const components1 = new Components(events1, actions1)

      const events2 = new Events()
      events2.init({})
      const actions2 = new Actions(events2)
      actions2.init({})
      const components2 = new Components(events2, actions2)

      // Verify data stores are NOT the same object
      assert.notStrictEqual(components1.stages, components2.stages)
      assert.notStrictEqual(components1.rows, components2.rows)
      assert.notStrictEqual(components1.columns, components2.columns)
      assert.notStrictEqual(components1.fields, components2.fields)

      // Verify data stores start empty
      assert.equal(components1.stages.size, 0)
      assert.equal(components2.stages.size, 0)
    })

    it('should not share Components between editors when created via new Components()', () => {
      const events1 = new Events()
      events1.init({})
      const actions1 = new Actions(events1)
      actions1.init({})
      const components1 = new Components(events1, actions1)

      const events2 = new Events()
      events2.init({})
      const actions2 = new Actions(events2)
      actions2.init({})
      const components2 = new Components(events2, actions2)

      // Load data into first
      components1.load({
        id: 'form-a',
        stages: { 's-a': { id: 's-a', attrs: {}, children: [] } },
        rows: {},
        columns: {},
        fields: {},
      })

      // Load data into second
      components2.load({
        id: 'form-b',
        stages: { 's-b': { id: 's-b', attrs: {}, children: [] } },
        rows: {},
        columns: {},
        fields: {},
      })

      // Verify isolation
      assert.equal(components1.formData.id, 'form-a')
      assert.equal(components2.formData.id, 'form-b')
      assert.equal(Object.keys(components1.formData.stages)[0], 's-a')
      assert.equal(Object.keys(components2.formData.stages)[0], 's-b')
    })
  })

  describe('Events isolation', () => {
    it('should maintain separate event options between two Events instances', () => {
      const events1 = new Events()
      events1.init({ debug: true, onSave: () => {} })

      const events2 = new Events()
      events2.init({ debug: false })

      assert.equal(events1.opts.debug, true)
      assert.equal(events2.opts.debug, false)
      assert.notStrictEqual(events1.opts, events2.opts)
    })

    it('should dispatch events on the correct container', () => {
      const container1 = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }
      const container2 = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }

      const events1 = new Events(container1)
      events1.init({})

      const events2 = new Events(container2)
      events2.init({})

      assert.strictEqual(events1.container, container1)
      assert.strictEqual(events2.container, container2)
    })
  })

  describe('Actions isolation', () => {
    it('should maintain separate action options between two Actions instances', () => {
      const events1 = new Events()
      events1.init({})
      const actions1 = new Actions(events1)
      actions1.init({ sessionStorage: true })

      const events2 = new Events()
      events2.init({})
      const actions2 = new Actions(events2)
      actions2.init({ sessionStorage: false })

      assert.equal(actions1.opts.sessionStorage, true)
      assert.equal(actions2.opts.sessionStorage, false)
    })

    it('should reference the correct Events instance', () => {
      const events1 = new Events()
      events1.init({})
      const actions1 = new Actions(events1)

      const events2 = new Events()
      events2.init({})
      const actions2 = new Actions(events2)

      assert.strictEqual(actions1.events, events1)
      assert.strictEqual(actions2.events, events2)
    })
  })
})
