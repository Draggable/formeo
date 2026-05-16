import {
  ANIMATION_SPEED_BASE,
  ANIMATION_SPEED_FAST,
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
import { throttle } from './utils/index.mjs'

const NO_TRANSITION_CLASS_NAME = 'no-transition'

/**
 * Creates default callback handlers for events.
 * @param {Events} self - reference to the Events instance for accessing opts
 * @return {Object} default callbacks
 */
function createDefaults(self) {
  return {
    debug: false,
    bubbles: true,
    formeoLoaded: _evt => {},
    onAdd: () => {},
    onChange: evt => self.opts?.debug && console.log(evt),
    onUpdate: evt => self.opts?.debug && console.log(evt),
    onUpdateStage: evt => self.opts?.debug && console.log(evt),
    onUpdateRow: evt => self.opts?.debug && console.log(evt),
    onUpdateColumn: evt => self.opts?.debug && console.log(evt),
    onUpdateField: evt => self.opts?.debug && console.log(evt),
    onAddRow: evt => self.opts?.debug && console.log(evt),
    onAddColumn: evt => self.opts?.debug && console.log(evt),
    onAddField: evt => self.opts?.debug && console.log(evt),
    onRemoveRow: evt => self.opts?.debug && console.log(evt),
    onRemoveColumn: evt => self.opts?.debug && console.log(evt),
    onRemoveField: evt => self.opts?.debug && console.log(evt),
    onRender: evt => self.opts?.debug && console.log(evt),
    onSave: _evt => {},
    confirmClearAll: evt => {
      if (globalThis.confirm(evt.confirmationMessage)) {
        evt.clearAllAction(evt)
      }
    },
  }
}

/**
 * Events class is used to register events and throttle their callbacks.
 * Each FormeoEditor instance creates its own Events object so that
 * multiple editors on the same page don't share event state.
 */
export class Events {
  /** @type {Object} */
  opts = null

  /**
   * @param {Element} [container=document] - DOM element to dispatch events on
   */
  constructor(container = document) {
    this.container = container
    this._listeners = []
  }

  init(options = {}) {
    this.opts = { ...createDefaults(this), ...options }

    // Auto-register listeners for the singleton (backward compatibility with tests)
    // Per-instance Events objects should call registerListeners() explicitly
    if (this === events) {
      this._autoRegistered = true
      for (const { event, handler } of this._getBasicListeners()) {
        this.container.addEventListener(event, handler)
        this._listeners.push({ event, handler })
      }
    }

    return this
  }

  /**
   * Get basic event listeners (those that don't require components/columns/controls).
   * @return {Array} listener objects
   */
  _getBasicListeners() {
    return [
      {
        event: EVENT_FORMEO_UPDATED_STAGE,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateStage(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_ROW,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateRow(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_COLUMN,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateColumn(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_FIELD,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateField(eventData)
        },
      },
      {
        event: EVENT_FORMEO_ADDED_ROW,
        handler: evt => {
          this.opts.onAddRow({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ADDED_COLUMN,
        handler: evt => {
          this.opts.onAddColumn({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ADDED_FIELD,
        handler: evt => {
          this.opts.onAddField({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_ROW,
        handler: evt => {
          this.opts.onRemoveRow({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_COLUMN,
        handler: evt => {
          this.opts.onRemoveColumn({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_FIELD,
        handler: evt => {
          this.opts.onRemoveField({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ON_RENDER,
        handler: evt => {
          this.opts.onRender({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_SAVED,
        handler: ({ timeStamp, type, detail: { formData } }) => {
          this.opts.onSave({ timeStamp, type, formData })
        },
      },
      {
        event: 'formeoLoaded',
        handler: evt => {
          this.opts.formeoLoaded(evt.detail.formeo)
        },
      },
    ]
  }

  /**
   * Create and dispatch a CustomEvent on this editor's container.
   */
  dispatchCustomEvent(evtData, type) {
    const { src, ...detail } = evtData
    const evt = new globalThis.CustomEvent(type, {
      detail,
      bubbles: this.opts?.debug || this.opts?.bubbles,
    })
    evt.data = (src || this.container).dispatchEvent(evt)
    return evt
  }

  formeoSaved(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_SAVED)
  }

  formeoUpdated(evtData, type = EVENT_FORMEO_UPDATED) {
    const result = this.dispatchCustomEvent(evtData, type)
    // Also dispatch formeoChanged as an alias for formeoUpdated
    if (type === EVENT_FORMEO_UPDATED) {
      const { src, ...detail } = evtData
      const changedEvt = new globalThis.CustomEvent(EVENT_FORMEO_CHANGED, {
        detail,
        bubbles: this.opts?.debug || this.opts?.bubbles,
      })
      ;(src || this.container).dispatchEvent(changedEvt)
    }
    return result
  }

  formeoCleared(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_CLEARED)
  }

  formeoOnRender(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_ON_RENDER)
  }

  formeoConditionUpdated(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_CONDITION_UPDATED)
  }

  formeoAddedRow(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_ADDED_ROW)
  }

  formeoAddedColumn(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_ADDED_COLUMN)
  }

  formeoAddedField(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_ADDED_FIELD)
  }

  formeoRemovedRow(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_REMOVED_ROW)
  }

  formeoRemovedColumn(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_REMOVED_COLUMN)
  }

  formeoRemovedField(evtData) {
    return this.dispatchCustomEvent(evtData, EVENT_FORMEO_REMOVED_FIELD)
  }

  /**
   * Register DOM event listeners for this editor instance.
   * @param {Object} components - The Components instance for formData access
   * @param {Object} columns - The Columns data store for resize handling
   * @param {Object} controls - The Controls instance for resize handling
   */
  registerListeners(components, columns, controls) {
    // Throttled formeoUpdated handler
    const formeoUpdatedThrottled = throttle(() => {
      const eventData = {
        timeStamp: globalThis.performance.now(),
        type: EVENT_FORMEO_UPDATED,
        detail: components.formData,
      }
      this.opts.onUpdate(eventData)
      if (this.opts.onChange !== this.opts.onUpdate) {
        this.opts.onChange(eventData)
      }
    }, ANIMATION_SPEED_FAST)

    const listeners = [
      { event: EVENT_FORMEO_UPDATED, handler: formeoUpdatedThrottled },
      {
        event: EVENT_FORMEO_UPDATED_STAGE,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateStage(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_ROW,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateRow(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_COLUMN,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateColumn(eventData)
        },
      },
      {
        event: EVENT_FORMEO_UPDATED_FIELD,
        handler: evt => {
          const eventData = { timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail }
          this.opts.onUpdate(eventData)
          this.opts.onUpdateField(eventData)
        },
      },
      {
        event: EVENT_FORMEO_ADDED_ROW,
        handler: evt => {
          this.opts.onAddRow({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ADDED_COLUMN,
        handler: evt => {
          this.opts.onAddColumn({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ADDED_FIELD,
        handler: evt => {
          this.opts.onAddField({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_ROW,
        handler: evt => {
          this.opts.onRemoveRow({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_COLUMN,
        handler: evt => {
          this.opts.onRemoveColumn({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_REMOVED_FIELD,
        handler: evt => {
          this.opts.onRemoveField({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: EVENT_FORMEO_ON_RENDER,
        handler: evt => {
          this.opts.onRender({ timeStamp: evt.timeStamp, type: evt.type, detail: evt.detail })
        },
      },
      {
        event: 'confirmClearAll',
        handler: evt => {
          const evtData = {
            timeStamp: evt.timeStamp,
            type: evt.type,
            confirmationMessage: evt.detail.confirmationMessage,
            clearAllAction: evt.detail.clearAllAction,
            btnCoords: evt.detail.btnCoords,
          }
          this.opts.confirmClearAll(evtData)
        },
      },
      {
        event: EVENT_FORMEO_SAVED,
        handler: ({ timeStamp, type, detail: { formData } }) => {
          this.opts.onSave({ timeStamp, type, formData })
        },
      },
      {
        event: 'formeoLoaded',
        handler: evt => {
          this.opts.formeoLoaded(evt.detail.formeo)
        },
      },
    ]

    // Attach listeners to the container
    for (const { event, handler } of listeners) {
      this.container.addEventListener(event, handler)
      this._listeners.push({ event, handler })
    }

    // Window resize handler - scoped to this editor's columns and controls
    let throttling
    const onResizeWindow = () => {
      throttling =
        throttling ||
        globalThis.requestAnimationFrame(() => {
          throttling = false
          for (const column of Object.values(columns.data)) {
            column.dom.classList.add(NO_TRANSITION_CLASS_NAME)
            controls.dom.classList.add(NO_TRANSITION_CLASS_NAME)
            controls.panels.nav.refresh()
            column.refreshFieldPanels()
            throttle(() => {
              column.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
              controls.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
            }, ANIMATION_SPEED_BASE)
          }
        })
    }
    globalThis.window.addEventListener('resize', onResizeWindow)
    this._listeners.push({ event: 'resize', handler: onResizeWindow, target: globalThis.window })
  }

  /**
   * Remove all registered DOM event listeners (cleanup on destroy).
   */
  removeListeners() {
    for (const { event, handler, target } of this._listeners) {
      ;(target || this.container).removeEventListener(event, handler)
    }
    this._listeners = []
  }
}

// Singleton instance for backward compatibility with existing tests and code
const events = new Events()

export default events
