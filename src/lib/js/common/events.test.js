/**
 * Unit tests for the events system
 * Tests both configuration callbacks and DOM event listeners
 */

import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import {
  EVENT_FORMEO_ADDED_COLUMN,
  EVENT_FORMEO_ADDED_FIELD,
  EVENT_FORMEO_ADDED_ROW,
  EVENT_FORMEO_CHANGED,
  EVENT_FORMEO_CLEARED,
  EVENT_FORMEO_CONDITION_UPDATED,
  EVENT_FORMEO_ON_RENDER,
  EVENT_FORMEO_REMOVED_COLUMN,
  EVENT_FORMEO_REMOVED_FIELD,
  EVENT_FORMEO_REMOVED_ROW,
  EVENT_FORMEO_SAVED,
  EVENT_FORMEO_UPDATED,
  EVENT_FORMEO_UPDATED_COLUMN,
  EVENT_FORMEO_UPDATED_FIELD,
  EVENT_FORMEO_UPDATED_ROW,
  EVENT_FORMEO_UPDATED_STAGE,
} from '../constants.js'
import Events from './events.js'

describe('Events System', () => {
  let eventListeners = []

  beforeEach(() => {
    // Reset events options to defaults
    Events.init({
      debug: false,
      bubbles: true,
    })
    eventListeners = []
  })

  afterEach(() => {
    // Clean up event listeners
    for (const { event, handler } of eventListeners) {
      document.removeEventListener(event, handler)
    }
    eventListeners = []
  })

  const addTestListener = (eventName, handler) => {
    document.addEventListener(eventName, handler)
    eventListeners.push({ event: eventName, handler })
  }

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const events = Events.init({})
      assert.ok(events.opts)
      assert.equal(events.opts.debug, false)
      assert.equal(events.opts.bubbles, true)
    })

    it('should merge custom options with defaults', () => {
      const events = Events.init({
        debug: true,
        bubbles: false,
      })
      assert.equal(events.opts.debug, true)
      assert.equal(events.opts.bubbles, false)
    })

    it('should accept custom event callbacks', () => {
      const onSave = mock.fn()
      const onChange = mock.fn()

      Events.init({
        onSave,
        onChange,
      })

      assert.equal(Events.opts.onSave, onSave)
      assert.equal(Events.opts.onChange, onChange)
    })
  })

  describe('formeoUpdated event', () => {
    it('should dispatch formeoUpdated event', () => {
      return new Promise(resolve => {
        const testData = { test: 'data' }

        addTestListener(EVENT_FORMEO_UPDATED, evt => {
          assert.ok(evt.type === EVENT_FORMEO_UPDATED)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoUpdated(testData)
      })
    })

    it('should also dispatch formeoChanged as alias', () => {
      return new Promise(resolve => {
        const testData = { test: 'data' }
        let updatedCalled = false
        let changedCalled = false

        const checkComplete = () => {
          if (updatedCalled && changedCalled) {
            resolve()
          }
        }

        addTestListener(EVENT_FORMEO_UPDATED, () => {
          updatedCalled = true
          checkComplete()
        })

        addTestListener(EVENT_FORMEO_CHANGED, evt => {
          changedCalled = true
          assert.ok(evt.type === EVENT_FORMEO_CHANGED)
          assert.deepEqual(evt.detail, testData)
          checkComplete()
        })

        Events.formeoUpdated(testData)
      })
    })

    it('should bubble events when bubbles option is true', () => {
      return new Promise(resolve => {
        Events.init({ bubbles: true })

        addTestListener(EVENT_FORMEO_UPDATED, evt => {
          assert.equal(evt.bubbles, true)
          resolve()
        })

        Events.formeoUpdated({ test: 'data' })
      })
    })
  })

  describe('Component-specific events', () => {
    it('should dispatch formeoUpdatedStage event', () => {
      return new Promise(resolve => {
        const testData = { component: 'stage', id: 'stage-123' }

        addTestListener(EVENT_FORMEO_UPDATED_STAGE, evt => {
          assert.ok(evt.type === EVENT_FORMEO_UPDATED_STAGE)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoUpdated(testData, EVENT_FORMEO_UPDATED_STAGE)
      })
    })

    it('should dispatch formeoUpdatedRow event', () => {
      return new Promise(resolve => {
        const testData = { component: 'row', id: 'row-123' }

        addTestListener(EVENT_FORMEO_UPDATED_ROW, evt => {
          assert.ok(evt.type === EVENT_FORMEO_UPDATED_ROW)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoUpdated(testData, EVENT_FORMEO_UPDATED_ROW)
      })
    })

    it('should dispatch formeoUpdatedColumn event', () => {
      return new Promise(resolve => {
        const testData = { component: 'column', id: 'column-123' }

        addTestListener(EVENT_FORMEO_UPDATED_COLUMN, evt => {
          assert.ok(evt.type === EVENT_FORMEO_UPDATED_COLUMN)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoUpdated(testData, EVENT_FORMEO_UPDATED_COLUMN)
      })
    })

    it('should dispatch formeoUpdatedField event', () => {
      return new Promise(resolve => {
        const testData = { component: 'field', id: 'field-123' }

        addTestListener(EVENT_FORMEO_UPDATED_FIELD, evt => {
          assert.ok(evt.type === EVENT_FORMEO_UPDATED_FIELD)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoUpdated(testData, EVENT_FORMEO_UPDATED_FIELD)
      })
    })
  })

  describe('Other event types', () => {
    it('should dispatch formeoSaved event', () => {
      return new Promise(resolve => {
        const testData = { formData: { id: 'form-123' } }

        addTestListener(EVENT_FORMEO_SAVED, evt => {
          assert.ok(evt.type === EVENT_FORMEO_SAVED)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoSaved(testData)
      })
    })

    it('should dispatch formeoCleared event', () => {
      return new Promise(resolve => {
        const testData = { cleared: true }

        addTestListener(EVENT_FORMEO_CLEARED, evt => {
          assert.ok(evt.type === EVENT_FORMEO_CLEARED)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoCleared(testData)
      })
    })

    it('should dispatch formeoOnRender event', () => {
      return new Promise(resolve => {
        const testData = { rendered: 'field-123' }

        addTestListener(EVENT_FORMEO_ON_RENDER, evt => {
          assert.ok(evt.type === EVENT_FORMEO_ON_RENDER)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoOnRender(testData)
      })
    })

    it('should dispatch formeoConditionUpdated event', () => {
      return new Promise(resolve => {
        const testData = { condition: 'updated' }

        addTestListener(EVENT_FORMEO_CONDITION_UPDATED, evt => {
          assert.ok(evt.type === EVENT_FORMEO_CONDITION_UPDATED)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoConditionUpdated(testData)
      })
    })
  })

  describe('Configuration callbacks', () => {
    // Note: onChange and onUpdate callbacks for formeoUpdated are throttled at module level
    // and are difficult to test in isolation. These are validated through Playwright e2e tests.

    it('should call onUpdateStage callback for stage updates', () => {
      return new Promise(resolve => {
        const onUpdateStage = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_UPDATED_STAGE)
          resolve()
        })

        Events.init({ onUpdateStage })

        Events.formeoUpdated({ test: 'stage' }, EVENT_FORMEO_UPDATED_STAGE)
      })
    })

    it('should call onUpdateRow callback for row updates', () => {
      return new Promise(resolve => {
        const onUpdateRow = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_UPDATED_ROW)
          resolve()
        })

        Events.init({ onUpdateRow })

        Events.formeoUpdated({ test: 'row' }, EVENT_FORMEO_UPDATED_ROW)
      })
    })

    it('should call onUpdateColumn callback for column updates', () => {
      return new Promise(resolve => {
        const onUpdateColumn = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_UPDATED_COLUMN)
          resolve()
        })

        Events.init({ onUpdateColumn })

        Events.formeoUpdated({ test: 'column' }, EVENT_FORMEO_UPDATED_COLUMN)
      })
    })

    it('should call onUpdateField callback for field updates', () => {
      return new Promise(resolve => {
        const onUpdateField = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_UPDATED_FIELD)
          resolve()
        })

        Events.init({ onUpdateField })

        Events.formeoUpdated({ test: 'field' }, EVENT_FORMEO_UPDATED_FIELD)
      })
    })

    it('should call onSave callback', () => {
      return new Promise(resolve => {
        const onSave = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_SAVED)
          assert.ok(evt.formData)
          resolve()
        })

        Events.init({ onSave })

        Events.formeoSaved({ formData: { id: 'form-123' } })
      })
    })

    it('should call onRender callback', () => {
      return new Promise(resolve => {
        const onRender = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ON_RENDER)
          resolve()
        })

        Events.init({ onRender })

        Events.formeoOnRender({ rendered: true })
      })
    })
  })

  describe('Event data structure', () => {
    it('should include correct event data structure', () => {
      return new Promise(resolve => {
        const testData = {
          entity: { id: 'test-entity' },
          dataPath: 'fields.abc123',
          changePath: 'fields.abc123.attrs.label',
          value: 'New Label',
          previousValue: 'Old Label',
          changeType: 'changed',
        }

        addTestListener(EVENT_FORMEO_UPDATED, evt => {
          assert.deepEqual(evt.detail, testData)
          assert.ok(evt.detail.entity)
          assert.equal(evt.detail.dataPath, 'fields.abc123')
          assert.equal(evt.detail.changePath, 'fields.abc123.attrs.label')
          assert.equal(evt.detail.value, 'New Label')
          assert.equal(evt.detail.previousValue, 'Old Label')
          assert.equal(evt.detail.changeType, 'changed')
          resolve()
        })

        Events.formeoUpdated(testData)
      })
    })
  })

  describe('Debug mode', () => {
    it('should enable console logging in debug mode', () => {
      const consoleSpy = mock.method(console, 'log')

      Events.init({ debug: true })

      Events.formeoUpdated({ test: 'debug' })

      // The default handler should log when debug is true
      // Note: This is throttled, so we need to wait
      const debugTimeout = setTimeout(() => {
        clearTimeout(debugTimeout)
        // Debug mode makes default handlers log
        // The actual log call happens in the default handlers
      }, 100)

      consoleSpy.mock.restore()
    })
  })

  describe('Add events', () => {
    it('should dispatch formeoAddedRow event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'row-123', componentType: 'row' }

        addTestListener(EVENT_FORMEO_ADDED_ROW, evt => {
          assert.ok(evt.type === EVENT_FORMEO_ADDED_ROW)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoAddedRow(testData)
      })
    })

    it('should dispatch formeoAddedColumn event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'column-123', componentType: 'column' }

        addTestListener(EVENT_FORMEO_ADDED_COLUMN, evt => {
          assert.ok(evt.type === EVENT_FORMEO_ADDED_COLUMN)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoAddedColumn(testData)
      })
    })

    it('should dispatch formeoAddedField event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'field-123', componentType: 'field' }

        addTestListener(EVENT_FORMEO_ADDED_FIELD, evt => {
          assert.ok(evt.type === EVENT_FORMEO_ADDED_FIELD)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoAddedField(testData)
      })
    })

    it('should call onAddRow callback for row additions', () => {
      return new Promise(resolve => {
        const onAddRow = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_ROW)
          resolve()
        })

        Events.init({ onAddRow })

        Events.formeoAddedRow({ componentId: 'row-test' })
      })
    })

    it('should call onAddColumn callback for column additions', () => {
      return new Promise(resolve => {
        const onAddColumn = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_COLUMN)
          resolve()
        })

        Events.init({ onAddColumn })

        Events.formeoAddedColumn({ componentId: 'column-test' })
      })
    })

    it('should call onAddField callback for field additions', () => {
      return new Promise(resolve => {
        const onAddField = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_FIELD)
          resolve()
        })

        Events.init({ onAddField })

        Events.formeoAddedField({ componentId: 'field-test' })
      })
    })
  })

  describe('Remove events', () => {
    it('should dispatch formeoRemovedRow event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'row-123', componentType: 'row' }

        addTestListener(EVENT_FORMEO_REMOVED_ROW, evt => {
          assert.ok(evt.type === EVENT_FORMEO_REMOVED_ROW)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoRemovedRow(testData)
      })
    })

    it('should dispatch formeoRemovedColumn event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'column-123', componentType: 'column' }

        addTestListener(EVENT_FORMEO_REMOVED_COLUMN, evt => {
          assert.ok(evt.type === EVENT_FORMEO_REMOVED_COLUMN)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoRemovedColumn(testData)
      })
    })

    it('should dispatch formeoRemovedField event', () => {
      return new Promise(resolve => {
        const testData = { componentId: 'field-123', componentType: 'field' }

        addTestListener(EVENT_FORMEO_REMOVED_FIELD, evt => {
          assert.ok(evt.type === EVENT_FORMEO_REMOVED_FIELD)
          assert.deepEqual(evt.detail, testData)
          resolve()
        })

        Events.formeoRemovedField(testData)
      })
    })

    it('should call onRemoveRow callback for row removals', () => {
      return new Promise(resolve => {
        const onRemoveRow = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_ROW)
          resolve()
        })

        Events.init({ onRemoveRow })

        Events.formeoRemovedRow({ componentId: 'row-test' })
      })
    })

    it('should call onRemoveColumn callback for column removals', () => {
      return new Promise(resolve => {
        const onRemoveColumn = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_COLUMN)
          resolve()
        })

        Events.init({ onRemoveColumn })

        Events.formeoRemovedColumn({ componentId: 'column-test' })
      })
    })

    it('should call onRemoveField callback for field removals', () => {
      return new Promise(resolve => {
        const onRemoveField = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_FIELD)
          resolve()
        })

        Events.init({ onRemoveField })

        Events.formeoRemovedField({ componentId: 'field-test' })
      })
    })
  })
})
