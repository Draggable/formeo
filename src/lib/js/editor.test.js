/**
 * Unit tests for editor initialization utilities
 * Tests the getFormData function and Components.load behavior
 *
 * Note: FormeoEditor class tests are handled by Playwright e2e tests
 * since the editor imports SCSS which requires a build step.
 */

import { strict as assert } from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import Components from './components/index.js'
import { DEFAULT_FORMDATA } from './constants.js'

describe('Components.load - Form Data Handling', () => {
  beforeEach(() => {
    // Clear any existing data
    Components.empty()
  })

  describe('form data validation', () => {
    it('should return default form data when formData is null', () => {
      const result = Components.load(null, { sessionStorage: false })

      assert.ok(result, 'Should return a result')
      assert.ok(result.id, 'Should have an id')
      assert.ok(result.stages, 'Should have stages')
      assert.ok(result.rows, 'Should have rows')
      assert.ok(result.columns, 'Should have columns')
      assert.ok(result.fields, 'Should have fields')
    })

    it('should return default form data when formData is undefined', () => {
      const result = Components.load(undefined, { sessionStorage: false })

      assert.ok(result, 'Should return a result')
      assert.ok(result.id, 'Should have an id')
    })

    it('should preserve provided form data id', () => {
      const testData = {
        id: 'preserved-form-id',
        stages: { 'my-stage': { id: 'my-stage' } },
        rows: {},
        columns: {},
        fields: {},
      }

      const result = Components.load(testData, { sessionStorage: false })

      assert.equal(result.id, 'preserved-form-id', 'Form id should be preserved')
    })

    it('should preserve stage data', () => {
      const testData = {
        id: 'test-form',
        stages: {
          'stage-123': {
            id: 'stage-123',
            children: [],
          },
        },
        rows: {},
        columns: {},
        fields: {},
      }

      const result = Components.load(testData, { sessionStorage: false })

      assert.ok(result.stages['stage-123'], 'Stage should be preserved')
    })

    it('should handle JSON string formData', () => {
      const testData = {
        id: 'json-form',
        stages: { 'stage-1': { id: 'stage-1' } },
        rows: {},
        columns: {},
        fields: {},
      }

      const result = Components.load(JSON.stringify(testData), { sessionStorage: false })

      assert.equal(result.id, 'json-form', 'Should parse JSON string formData')
    })

    it('should handle empty object formData', () => {
      const result = Components.load({}, { sessionStorage: false })

      // Empty object should still get default structure
      assert.ok(result.id, 'Should have an id')
      assert.ok(result.stages, 'Should have stages')
    })

    it('should handle formData with missing fields', () => {
      const testData = {
        id: 'partial-form',
        stages: { 'stage-1': {} },
        // Missing rows, columns, fields
      }

      const result = Components.load(testData, { sessionStorage: false })

      assert.equal(result.id, 'partial-form', 'Id should be preserved')
      assert.ok(result.stages, 'Stages should exist')
      assert.ok(result.rows, 'Rows should be initialized')
      assert.ok(result.columns, 'Columns should be initialized')
      assert.ok(result.fields, 'Fields should be initialized')
    })

    it('should not modify original formData object', () => {
      const testData = {
        id: 'original-form',
        stages: { 'stage-1': { id: 'stage-1' } },
        rows: {},
        columns: {},
        fields: {},
      }

      const originalId = testData.id
      Components.load(testData, { sessionStorage: false })

      assert.equal(testData.id, originalId, 'Original formData should not be modified')
    })
  })

  describe('formData getter', () => {
    it('should return current form data structure', () => {
      const testData = {
        id: 'getter-test-form',
        stages: { 'stage-1': { id: 'stage-1' } },
        rows: {},
        columns: {},
        fields: {},
      }

      Components.load(testData, { sessionStorage: false })

      const formData = Components.formData

      assert.ok(formData, 'formData should be returned')
      assert.equal(formData.id, 'getter-test-form', 'Id should match loaded data')
      assert.ok(formData.stages, 'Should have stages')
      assert.ok(formData.rows, 'Should have rows')
      assert.ok(formData.columns, 'Should have columns')
      assert.ok(formData.fields, 'Should have fields')
    })
  })

  describe('json getter', () => {
    it('should return JSON string of form data', () => {
      const testData = {
        id: 'json-getter-test',
        stages: { 'stage-1': { id: 'stage-1' } },
        rows: {},
        columns: {},
        fields: {},
      }

      Components.load(testData, { sessionStorage: false })

      const json = Components.json

      assert.equal(typeof json, 'string', 'Should return a string')

      const parsed = JSON.parse(json)
      assert.equal(parsed.id, 'json-getter-test', 'Parsed JSON should have correct id')
      assert.ok(parsed.$schema, 'Should include $schema field')
    })
  })
})

describe('DEFAULT_FORMDATA', () => {
  it('should return a new object each time', () => {
    const data1 = DEFAULT_FORMDATA()
    const data2 = DEFAULT_FORMDATA()

    assert.notEqual(data1, data2, 'Should return different objects')
    assert.notEqual(data1.id, data2.id, 'Should have different ids')
  })

  it('should have required structure', () => {
    const data = DEFAULT_FORMDATA()

    assert.ok(data.id, 'Should have id')
    assert.ok(data.stages, 'Should have stages')
    assert.ok(data.rows, 'Should have rows')
    assert.ok(data.columns, 'Should have columns')
    assert.ok(data.fields, 'Should have fields')
  })

  it('should have at least one empty stage', () => {
    const data = DEFAULT_FORMDATA()

    const stageIds = Object.keys(data.stages)
    assert.equal(stageIds.length, 1, 'Should have exactly one stage')
  })
})
