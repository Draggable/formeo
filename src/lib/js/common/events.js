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

// @todo
// Refactor events as part of https://github.com/Draggable/formeo/issues/381
// should have a consolidated approach to events

/**
 * Option callbacks each DOM event triggers, in call order. formeoUpdated is handled on its own:
 * it is throttled and reports the whole formData.
 */
const EVENT_CALLBACKS = new Map([
  [EVENT_FORMEO_UPDATED_STAGE, ['onUpdate', 'onUpdateStage']],
  [EVENT_FORMEO_UPDATED_ROW, ['onUpdate', 'onUpdateRow']],
  [EVENT_FORMEO_UPDATED_COLUMN, ['onUpdate', 'onUpdateColumn']],
  [EVENT_FORMEO_UPDATED_FIELD, ['onUpdate', 'onUpdateField']],
  [EVENT_FORMEO_ADDED_ROW, ['onAdd', 'onAddRow']],
  [EVENT_FORMEO_ADDED_COLUMN, ['onAdd', 'onAddColumn']],
  [EVENT_FORMEO_ADDED_FIELD, ['onAdd', 'onAddField']],
  [EVENT_FORMEO_REMOVED_ROW, ['onRemove', 'onRemoveRow']],
  [EVENT_FORMEO_REMOVED_COLUMN, ['onRemove', 'onRemoveColumn']],
  [EVENT_FORMEO_REMOVED_FIELD, ['onRemove', 'onRemoveField']],
  [EVENT_FORMEO_ON_RENDER, ['onRender']],
])

// Before #152 every callback ran from a page-wide `document` listener, so only events that got to the
// document triggered one. Keep that rule so single-editor pages see exactly the same calls.
const reachesDocument = evt => evt.target === document || Boolean(evt.bubbles && evt.target?.isConnected)

/**
 * One editor's event hub: dispatches formeo DOM events (unchanged, for page listeners) and calls
 * that editor's own option callbacks.
 */
export class Events {
  components = null

  constructor() {
    this.opts = this.defaults()
    this.formeoUpdatedThrottled = throttle(
      () => {
        const eventData = {
          timeStamp: globalThis.performance.now(),
          type: EVENT_FORMEO_UPDATED,
          detail: this.components?.formData,
        }
        this.opts.onUpdate(eventData)
        // Also call onChange if it's different from onUpdate
        if (this.opts.onChange !== this.opts.onUpdate) {
          this.opts.onChange(eventData)
        }
      },
      ANIMATION_SPEED_FAST,
      { trailing: true }
    )
  }

  defaults() {
    const log = evt => this.opts?.debug && console.log(evt)
    return {
      debug: false, // enable debug mode
      bubbles: true, // bubble events from components
      formeoLoaded: _formeo => {},
      onAdd: () => {},
      onRemove: () => {},
      onChange: log,
      onUpdate: log,
      onUpdateStage: log,
      onUpdateRow: log,
      onUpdateColumn: log,
      onUpdateField: log,
      onAddRow: log,
      onAddColumn: log,
      onAddField: log,
      onRemoveRow: log,
      onRemoveColumn: log,
      onRemoveField: log,
      onRender: log,
      onSave: _evt => {},
      confirmClearAll: evt => {
        if (globalThis.confirm(evt.confirmationMessage)) {
          evt.clearAllAction(evt)
        }
      },
    }
  }

  init(options) {
    this.opts = { ...this.defaults(), ...options }
    return this
  }

  dispatch(type, { src, ...evtData }) {
    const eventInit = { detail: evtData, bubbles: this.opts.debug || this.opts.bubbles }
    const evt = new globalThis.CustomEvent(type, eventInit)
    evt.data = (src || document).dispatchEvent(evt)

    // Also dispatch formeoChanged as an alias for formeoUpdated
    if (type === EVENT_FORMEO_UPDATED) {
      ;(src || document).dispatchEvent(new globalThis.CustomEvent(EVENT_FORMEO_CHANGED, eventInit))
    }

    if (reachesDocument(evt)) {
      this.runCallbacks(evt)
    }

    return evt
  }

  runCallbacks({ type, timeStamp, detail }) {
    if (type === EVENT_FORMEO_UPDATED) {
      return this.formeoUpdatedThrottled()
    }
    if (type === EVENT_FORMEO_SAVED) {
      return this.opts.onSave({ timeStamp, type, formData: detail.formData })
    }
    for (const name of EVENT_CALLBACKS.get(type) || []) {
      this.opts[name]({ timeStamp, type, detail })
    }
  }

  formeoSaved = evt => this.dispatch(EVENT_FORMEO_SAVED, evt)
  formeoUpdated = (evt, eventType) => this.dispatch(eventType || EVENT_FORMEO_UPDATED, evt)
  formeoCleared = evt => this.dispatch(EVENT_FORMEO_CLEARED, evt)
  formeoOnRender = evt => this.dispatch(EVENT_FORMEO_ON_RENDER, evt)
  formeoConditionUpdated = evt => this.dispatch(EVENT_FORMEO_CONDITION_UPDATED, evt)
  formeoAddedRow = evt => this.dispatch(EVENT_FORMEO_ADDED_ROW, evt)
  formeoAddedColumn = evt => this.dispatch(EVENT_FORMEO_ADDED_COLUMN, evt)
  formeoAddedField = evt => this.dispatch(EVENT_FORMEO_ADDED_FIELD, evt)
  formeoRemovedRow = evt => this.dispatch(EVENT_FORMEO_REMOVED_ROW, evt)
  formeoRemovedColumn = evt => this.dispatch(EVENT_FORMEO_REMOVED_COLUMN, evt)
  formeoRemovedField = evt => this.dispatch(EVENT_FORMEO_REMOVED_FIELD, evt)

  /** detail: { confirmationMessage, clearAllAction, btnCoords } */
  confirmClearAll = detail => {
    const evt = new globalThis.CustomEvent('confirmClearAll', { detail })
    document.dispatchEvent(evt)
    this.opts.confirmClearAll({ timeStamp: evt.timeStamp, type: evt.type, ...detail })
  }

  formeoLoaded = formeo => {
    document.dispatchEvent(new globalThis.CustomEvent('formeoLoaded', { detail: { formeo } }))
    this.opts.formeoLoaded(formeo)
  }

  columnResized = detail => document.dispatchEvent(new globalThis.CustomEvent('columnResized', { detail }))

  /**
   * Window resize handler for one editor; FormeoEditor registers it (and can remove it, see #166)
   */
  onResizeWindow = () => {
    const { columns, controls } = this.components || {}
    if (!columns || !controls?.dom || this.resizeFrame) {
      return
    }
    this.resizeFrame = window.requestAnimationFrame(() => {
      this.resizeFrame = null
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
}

// standalone instance for existing tests; editor code must use its own (see singletons.test.mjs)
const events = new Events()

export default events
