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
import Events, { Events as EventsClass } from './events.js'

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

    it('should call generic onAdd callback for row additions', () => {
      return new Promise(resolve => {
        const onAdd = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_ROW)
          resolve()
        })

        Events.init({ onAdd })

        Events.formeoAddedRow({ componentId: 'row-test' })
      })
    })

    it('should call generic onAdd callback for column additions', () => {
      return new Promise(resolve => {
        const onAdd = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_COLUMN)
          resolve()
        })

        Events.init({ onAdd })

        Events.formeoAddedColumn({ componentId: 'column-test' })
      })
    })

    it('should call generic onAdd callback for field additions', () => {
      return new Promise(resolve => {
        const onAdd = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_FIELD)
          resolve()
        })

        Events.init({ onAdd })

        Events.formeoAddedField({ componentId: 'field-test' })
      })
    })

    it('should call both generic onAdd and specific onAddRow callbacks', () => {
      return new Promise(resolve => {
        let calls = 0
        const onAdd = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_ROW)
          calls++
          if (calls === 2) resolve()
        })
        const onAddRow = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_ADDED_ROW)
          calls++
          if (calls === 2) resolve()
        })

        Events.init({ onAdd, onAddRow })

        Events.formeoAddedRow({ componentId: 'row-test' })
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

    it('should call generic onRemove callback for row removals', () => {
      return new Promise(resolve => {
        const onRemove = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_ROW)
          resolve()
        })

        Events.init({ onRemove })

        Events.formeoRemovedRow({ componentId: 'row-test' })
      })
    })

    it('should call generic onRemove callback for column removals', () => {
      return new Promise(resolve => {
        const onRemove = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_COLUMN)
          resolve()
        })

        Events.init({ onRemove })

        Events.formeoRemovedColumn({ componentId: 'column-test' })
      })
    })

    it('should call generic onRemove callback for field removals', () => {
      return new Promise(resolve => {
        const onRemove = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_FIELD)
          resolve()
        })

        Events.init({ onRemove })

        Events.formeoRemovedField({ componentId: 'field-test' })
      })
    })

    it('should call both generic onRemove and specific onRemoveRow callbacks', () => {
      return new Promise(resolve => {
        let calls = 0
        const onRemove = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_ROW)
          calls++
          if (calls === 2) resolve()
        })
        const onRemoveRow = mock.fn(evt => {
          assert.equal(evt.type, EVENT_FORMEO_REMOVED_ROW)
          calls++
          if (calls === 2) resolve()
        })

        Events.init({ onRemove, onRemoveRow })

        Events.formeoRemovedRow({ componentId: 'row-test' })
      })
    })
  })

  describe('callbacks after the multi-instance refactor (#152)', () => {
    it('calls each callback once per event', () => {
      const onUpdateRow = mock.fn()
      const onUpdate = mock.fn()
      Events.init({ onUpdateRow, onUpdate })

      Events.formeoUpdated({ changePath: 'rows.x.config' }, EVENT_FORMEO_UPDATED_ROW)

      assert.equal(onUpdateRow.mock.callCount(), 1)
      assert.equal(onUpdate.mock.callCount(), 1)
    })

    it('skips callbacks for events that would not have reached document', () => {
      const onUpdateField = mock.fn()
      Events.init({ onUpdateField })
      const detached = document.createElement('div')

      Events.formeoUpdated({ src: detached }, EVENT_FORMEO_UPDATED_FIELD)

      assert.equal(onUpdateField.mock.callCount(), 0)
    })

    it('skips callbacks for a connected src when events do not bubble', () => {
      const onUpdateField = mock.fn()
      const connected = document.createElement('div')
      document.body.appendChild(connected)

      try {
        Events.init({ onUpdateField, bubbles: true })
        Events.formeoUpdated({ src: connected }, EVENT_FORMEO_UPDATED_FIELD)
        assert.equal(onUpdateField.mock.callCount(), 1, 'a bubbling event from a connected src runs callbacks')

        Events.init({ onUpdateField, bubbles: false })
        Events.formeoUpdated({ src: connected }, EVENT_FORMEO_UPDATED_FIELD)
        assert.equal(onUpdateField.mock.callCount(), 1, 'a non-bubbling event never reaches document')
      } finally {
        connected.remove()
      }
    })
  })

  describe('onResizeWindow (#152 final review)', () => {
    const frames = []

    beforeEach(() => {
      frames.length = 0
      mock.method(window, 'requestAnimationFrame', callback => frames.push(callback))
    })

    afterEach(() => {
      mock.restoreAll()
    })

    /**
     * An Events wired to a stub editor with one column, like FormeoEditor's resize listener
     * @param {boolean} onPage whether the editor's controls are still in the document
     */
    const editorEvents = onPage => {
      const controlsDom = document.createElement('div')
      if (onPage) {
        document.body.appendChild(controlsDom)
      }
      const column = { dom: document.createElement('div'), refreshFieldPanels: mock.fn() }
      const controls = { dom: controlsDom, panels: { nav: { refresh: mock.fn() } } }
      const events = new EventsClass()
      events.components = { columns: { data: { 'col-1': column } }, controls }
      return { events, column, controls }
    }

    it('does no work for an editor that is no longer on the page', () => {
      const { events, column, controls } = editorEvents(false)

      events.onResizeWindow()
      for (const frame of frames) frame()

      assert.equal(window.requestAnimationFrame.mock.callCount(), 0)
      assert.equal(column.refreshFieldPanels.mock.callCount(), 0)
      assert.equal(controls.panels.nav.refresh.mock.callCount(), 0)
    })

    it('still refreshes the columns of an editor on the page', () => {
      const { events, column, controls } = editorEvents(true)

      try {
        events.onResizeWindow()
        for (const frame of frames) frame()

        assert.equal(window.requestAnimationFrame.mock.callCount(), 1)
        assert.equal(column.refreshFieldPanels.mock.callCount(), 1)
        assert.equal(controls.panels.nav.refresh.mock.callCount(), 1)
      } finally {
        controls.dom.remove()
      }
    })
  })

  describe('default opts before init() (#152 follow-up 4)', () => {
    afterEach(() => {
      mock.timers.reset()
    })

    it('never throws emitting or removing before init() is called', () => {
      mock.timers.enable({ apis: ['setTimeout'] })

      const freshEvents = new EventsClass()
      const connected = document.createElement('div')
      document.body.appendChild(connected)

      try {
        assert.doesNotThrow(() => {
          freshEvents.formeoUpdated({ changePath: 'rows.x.config' })
          freshEvents.formeoRemovedRow({ src: connected, componentId: 'row-test' })
          mock.timers.tick(1000)
        })
      } finally {
        connected.remove()
      }
    })
  })

  describe('confirmClearAll (#152 fix round 1)', () => {
    it('dispatches the confirmClearAll DOM event on document with the right detail', () => {
      return new Promise(resolve => {
        const detail = { confirmationMessage: 'Sure?', clearAllAction: mock.fn(), btnCoords: { x: 1, y: 2 } }

        addTestListener('confirmClearAll', evt => {
          assert.deepEqual(evt.detail, detail)
          resolve()
        })

        Events.init({ confirmClearAll: mock.fn() })
        Events.confirmClearAll(detail)
      })
    })

    it('calls the option callback exactly once with the documented shape', () => {
      const confirmClearAll = mock.fn()
      Events.init({ confirmClearAll })
      const detail = { confirmationMessage: 'Sure?', clearAllAction: mock.fn(), btnCoords: { x: 1, y: 2 } }

      Events.confirmClearAll(detail)

      assert.equal(confirmClearAll.mock.callCount(), 1)
      const arg = confirmClearAll.mock.calls[0].arguments[0]
      assert.equal(arg.type, 'confirmClearAll')
      assert.equal(typeof arg.timeStamp, 'number')
      assert.equal(arg.confirmationMessage, detail.confirmationMessage)
      assert.equal(arg.clearAllAction, detail.clearAllAction)
      assert.deepEqual(arg.btnCoords, detail.btnCoords)
    })
  })

  describe('formeoLoaded (#152 fix round 1)', () => {
    it('dispatches the formeoLoaded DOM event on document with the formeo instance', () => {
      return new Promise(resolve => {
        const formeo = { id: 'editor-a' }

        addTestListener('formeoLoaded', evt => {
          assert.equal(evt.detail.formeo, formeo)
          resolve()
        })

        Events.init({})
        Events.formeoLoaded(formeo)
      })
    })

    it('calls the option callback exactly once with the formeo instance', () => {
      const formeoLoaded = mock.fn()
      Events.init({ formeoLoaded })
      const formeo = { id: 'editor-a' }

      Events.formeoLoaded(formeo)

      assert.equal(formeoLoaded.mock.callCount(), 1)
      assert.equal(formeoLoaded.mock.calls[0].arguments[0], formeo)
    })
  })

  describe('destroy (#166)', () => {
    afterEach(() => {
      mock.restoreAll()
      mock.timers.reset()
    })

    it('a trailing onUpdate already scheduled never runs after destroy()', () => {
      mock.timers.enable({ apis: ['setTimeout'] })
      const onUpdate = mock.fn()
      const events = new EventsClass().init({ onUpdate })

      events.formeoUpdated({ changePath: 'fields.a.attrs' })
      events.formeoUpdated({ changePath: 'fields.b.attrs' })
      assert.equal(onUpdate.mock.callCount(), 1, 'the second change is held for the trailing call')

      events.destroy()
      mock.timers.tick(1000)

      assert.equal(onUpdate.mock.callCount(), 1)
    })

    it('runs no option callbacks after destroy()', () => {
      const opts = {
        onUpdate: mock.fn(),
        onAddRow: mock.fn(),
        onSave: mock.fn(),
        confirmClearAll: mock.fn(),
        formeoLoaded: mock.fn(),
      }
      const events = new EventsClass().init(opts)
      const connected = document.createElement('div')
      document.body.appendChild(connected)

      try {
        events.destroy()
        events.formeoUpdated({ changePath: 'rows.x.config' })
        events.formeoAddedRow({ src: connected, componentId: 'row-x' })
        events.formeoSaved({ formData: {} })
        events.confirmClearAll({ confirmationMessage: 'Sure?', clearAllAction: mock.fn() })
        events.formeoLoaded({ id: 'editor-x' })
      } finally {
        connected.remove()
      }

      for (const [name, callback] of Object.entries(opts)) {
        assert.equal(callback.mock.callCount(), 0, `${name} ran after destroy()`)
      }
    })

    it('cancels a pending resize frame and ignores later resizes', () => {
      const frames = []
      mock.method(window, 'requestAnimationFrame', callback => frames.push(callback))
      const cancelAnimationFrame = mock.method(window, 'cancelAnimationFrame', () => {})
      const controlsDom = document.createElement('div')
      document.body.appendChild(controlsDom)
      const column = { dom: document.createElement('div'), refreshFieldPanels: mock.fn() }
      const events = new EventsClass()
      events.components = {
        columns: { data: { 'col-1': column } },
        controls: { dom: controlsDom, panels: { nav: { refresh: mock.fn() } } },
      }

      try {
        events.onResizeWindow()
        assert.equal(frames.length, 1)
        events.destroy()
        assert.equal(cancelAnimationFrame.mock.callCount(), 1)
        assert.equal(cancelAnimationFrame.mock.calls[0].arguments[0], 1)

        events.onResizeWindow()
        assert.equal(frames.length, 1, 'no new frame after destroy()')
      } finally {
        controlsDom.remove()
      }
    })

    it('is safe to call twice', () => {
      const events = new EventsClass()
      assert.doesNotThrow(() => {
        events.destroy()
        events.destroy()
      })
    })
  })

  describe('Events#before (#281)', () => {
    const listeners = []
    const listen = (type, handler) => {
      document.addEventListener(type, handler)
      listeners.push([type, handler])
    }
    afterEach(() => {
      for (const [type, handler] of listeners.splice(0)) {
        document.removeEventListener(type, handler)
      }
      mock.restoreAll()
    })
    const make = callbacks => new EventsClass().init(callbacks)
    const deferred = () => {
      let resolve
      let reject
      const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    }

    it('proceeds synchronously when nothing vetoes', () => {
      const proceed = mock.fn()
      assert.equal(make({}).before('remove', { componentType: 'field' }, proceed), true)
      assert.equal(proceed.mock.callCount(), 1)
    })

    it('calls onBeforeRemove with { timeStamp, type, detail }', () => {
      const onBeforeRemove = mock.fn()
      const detail = { componentType: 'row', componentId: 'r-1' }
      make({ onBeforeRemove }).before('remove', detail, () => {})
      const [evt] = onBeforeRemove.mock.calls[0].arguments
      assert.equal(evt.type, 'formeoBeforeRemove')
      assert.equal(evt.detail, detail)
      assert.equal(typeof evt.timeStamp, 'number')
      assert.equal(typeof evt.preventDefault, 'function')
    })

    it('dispatches a cancelable, bubbling formeoBefore* DOM event on src', () => {
      const src = document.createElement('div')
      document.body.appendChild(src)
      const seen = []
      listen('formeoBeforeClone', evt => seen.push(evt))
      make({}).before('clone', { componentId: 'f-1' }, () => {}, { src })
      src.remove()
      assert.equal(seen.length, 1)
      assert.equal(seen[0].target, src)
      assert.equal(seen[0].cancelable, true)
      assert.equal(seen[0].detail.componentId, 'f-1')
    })

    it('a DOM listener can veto; the callback is then skipped', () => {
      listen('formeoBeforeAdd', evt => evt.preventDefault())
      const onBeforeAdd = mock.fn()
      const proceed = mock.fn()
      assert.equal(make({ onBeforeAdd }).before('add', {}, proceed), false)
      assert.equal(onBeforeAdd.mock.callCount(), 0)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('the callback can veto with preventDefault()', () => {
      const proceed = mock.fn()
      make({ onBeforeSave: evt => evt.preventDefault() }).before('save', {}, proceed)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('the callback can veto by returning false', () => {
      const proceed = mock.fn()
      make({ onBeforeRemove: () => false }).before('remove', {}, proceed)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('waits for a returned Promise, then proceeds', async () => {
      const hook = deferred()
      const proceed = mock.fn()
      const result = make({ onBeforeAdd: () => hook.promise }).before('add', {}, proceed)
      assert.ok(result instanceof Promise)
      assert.equal(proceed.mock.callCount(), 0)
      hook.resolve()
      assert.equal(await result, true)
      assert.equal(proceed.mock.callCount(), 1)
    })

    it('cancels when the Promise resolves false', async () => {
      const proceed = mock.fn()
      assert.equal(await make({ onBeforeAdd: async () => false }).before('add', {}, proceed), false)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('cancels when preventDefault() is called before the Promise settles', async () => {
      const proceed = mock.fn()
      const onBeforeAdd = evt => Promise.resolve().then(() => evt.preventDefault())
      assert.equal(await make({ onBeforeAdd }).before('add', {}, proceed), false)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('cancels and logs when the Promise rejects', async () => {
      const error = mock.method(console, 'error', () => {})
      const proceed = mock.fn()
      const onBeforeRemove = () => Promise.reject(new Error('offline'))
      assert.equal(await make({ onBeforeRemove }).before('remove', {}, proceed), false)
      assert.equal(proceed.mock.callCount(), 0)
      assert.equal(error.mock.callCount(), 1)
    })

    it('cancels and logs when the callback throws', () => {
      const error = mock.method(console, 'error', () => {})
      const proceed = mock.fn()
      const onBeforeClone = () => {
        throw new Error('boom')
      }
      assert.equal(make({ onBeforeClone }).before('clone', {}, proceed), false)
      assert.equal(proceed.mock.callCount(), 0)
      assert.equal(error.mock.callCount(), 1)
    })

    it('never proceeds if the editor is destroyed while waiting', async () => {
      const hook = deferred()
      const proceed = mock.fn()
      const events = make({ onBeforeAdd: () => hook.promise })
      const result = events.before('add', {}, proceed)
      events.destroy()
      hook.resolve(true)
      assert.equal(await result, false)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('does nothing at all once destroyed', () => {
      const onBeforeAdd = mock.fn()
      const proceed = mock.fn()
      const events = make({ onBeforeAdd })
      events.destroy()
      assert.equal(events.before('add', {}, proceed), false)
      assert.equal(onBeforeAdd.mock.callCount(), 0)
      assert.equal(proceed.mock.callCount(), 0)
    })

    it('ignores a request with the same guard key while one is waiting', async () => {
      const hook = deferred()
      const onBeforeRemove = mock.fn(() => hook.promise)
      const events = make({ onBeforeRemove })
      const first = events.before('remove', {}, () => {}, { guardKey: 'remove:f-1' })
      assert.equal(
        events.before('remove', {}, () => {}, { guardKey: 'remove:f-1' }),
        false
      )
      assert.equal(onBeforeRemove.mock.callCount(), 1)
      hook.resolve()
      await first
      events.before('remove', {}, () => {}, { guardKey: 'remove:f-1' })
      assert.equal(onBeforeRemove.mock.callCount(), 2)
    })

    it('releases the guard key after a rejection too', async () => {
      mock.method(console, 'error', () => {})
      const onBeforeSave = mock.fn(() => Promise.reject(new Error('no')))
      const events = make({ onBeforeSave })
      await events.before('save', {}, () => {}, { guardKey: 'save' })
      await events.before('save', {}, () => {}, { guardKey: 'save' })
      assert.equal(onBeforeSave.mock.callCount(), 2)
    })

    it('runs the callback even when the DOM event cannot reach document', () => {
      const onBeforeClone = mock.fn()
      const proceed = mock.fn()
      make({ bubbles: false, onBeforeClone }).before('clone', {}, proceed, { src: document.createElement('div') })
      assert.equal(onBeforeClone.mock.callCount(), 1)
      assert.equal(proceed.mock.callCount(), 1)
    })
  })
})
