import {
  ANIMATION_SPEED_BASE,
  ANIMATION_SPEED_FAST,
  EVENT_FORMEO_ADDED_COLUMN,
  EVENT_FORMEO_ADDED_FIELD,
  EVENT_FORMEO_ADDED_ROW,
  EVENT_FORMEO_ADDED_STAGE,
  EVENT_FORMEO_BEFORE_ADD,
  EVENT_FORMEO_BEFORE_CLONE,
  EVENT_FORMEO_BEFORE_REMOVE,
  EVENT_FORMEO_BEFORE_SAVE,
  EVENT_FORMEO_CHANGED,
  EVENT_FORMEO_CLEARED,
  EVENT_FORMEO_CONDITION_UPDATED,
  EVENT_FORMEO_ON_RENDER,
  EVENT_FORMEO_PAGE_CHANGED,
  EVENT_FORMEO_REMOVED_COLUMN,
  EVENT_FORMEO_REMOVED_FIELD,
  EVENT_FORMEO_REMOVED_ROW,
  EVENT_FORMEO_REMOVED_STAGE,
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
 * Before-hooks (#281): what the user is about to do → [option callback, cancelable DOM event]
 */
const BEFORE_HOOKS = {
  add: ['onBeforeAdd', EVENT_FORMEO_BEFORE_ADD],
  remove: ['onBeforeRemove', EVENT_FORMEO_BEFORE_REMOVE],
  clone: ['onBeforeClone', EVENT_FORMEO_BEFORE_CLONE],
  save: ['onBeforeSave', EVENT_FORMEO_BEFORE_SAVE],
}

/**
 * Option callbacks each DOM event triggers, in call order. formeoUpdated is handled on its own:
 * it is throttled and reports the whole formData.
 */
const EVENT_CALLBACKS = new Map([
  [EVENT_FORMEO_UPDATED_STAGE, ['onUpdate', 'onUpdateStage']],
  [EVENT_FORMEO_UPDATED_ROW, ['onUpdate', 'onUpdateRow']],
  [EVENT_FORMEO_UPDATED_COLUMN, ['onUpdate', 'onUpdateColumn']],
  [EVENT_FORMEO_UPDATED_FIELD, ['onUpdate', 'onUpdateField']],
  [EVENT_FORMEO_ADDED_STAGE, ['onAdd', 'onAddStage']],
  [EVENT_FORMEO_ADDED_ROW, ['onAdd', 'onAddRow']],
  [EVENT_FORMEO_ADDED_COLUMN, ['onAdd', 'onAddColumn']],
  [EVENT_FORMEO_ADDED_FIELD, ['onAdd', 'onAddField']],
  [EVENT_FORMEO_REMOVED_STAGE, ['onRemove', 'onRemoveStage']],
  [EVENT_FORMEO_REMOVED_ROW, ['onRemove', 'onRemoveRow']],
  [EVENT_FORMEO_REMOVED_COLUMN, ['onRemove', 'onRemoveColumn']],
  [EVENT_FORMEO_REMOVED_FIELD, ['onRemove', 'onRemoveField']],
  [EVENT_FORMEO_PAGE_CHANGED, ['onPageChange']],
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
  destroyed = false
  // guard keys of before-hooks still waiting on a Promise
  pendingBefore = new Set()

  constructor() {
    this.opts = this.defaults()
    this.formeoUpdatedThrottled = throttle(
      () => {
        // a trailing call can already be scheduled when the editor is destroyed
        if (this.destroyed) {
          return
        }
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
      onAddStage: log,
      onAddRow: log,
      onAddColumn: log,
      onAddField: log,
      onRemoveStage: log,
      onRemoveRow: log,
      onRemoveColumn: log,
      onRemoveField: log,
      onRender: log,
      onPageChange: () => {},
      onSave: _evt => {},
      onBeforeAdd: () => {},
      onBeforeRemove: () => {},
      onBeforeClone: () => {},
      onBeforeSave: () => {},
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
    if (this.destroyed) {
      return
    }
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

  /**
   * Lets page listeners and this editor's onBefore* callback cancel, or hold, something a user is about to do (#281).
   * A DOM listener cancels with preventDefault(). The callback cancels with preventDefault(), by returning false,
   * or by returning a Promise that resolves to false or rejects. When nothing returned a Promise, proceed runs
   * synchronously. After destroy() nothing runs.
   * @param {String} name 'add', 'remove', 'clone' or 'save'
   * @param {Object} detail what is about to happen
   * @param {Function} proceed does it
   * @param {Object} [options]
   * @param {EventTarget} [options.src] where the DOM event is dispatched, document by default
   * @param {String} [options.guardKey] while a request with this key waits, more requests with it are ignored
   * @return {Boolean|Promise<Boolean>} whether proceed ran
   */
  before(name, detail, proceed, { src, guardKey } = {}) {
    const [callbackName, type] = BEFORE_HOOKS[name]
    if (this.destroyed || (guardKey && this.pendingBefore.has(guardKey))) {
      return false
    }
    const domEvent = new globalThis.CustomEvent(type, {
      detail,
      bubbles: Boolean(this.opts.debug || this.opts.bubbles),
      cancelable: true,
    })
    ;(src || document).dispatchEvent(domEvent)
    if (domEvent.defaultPrevented) {
      return false
    }

    let prevented = false
    const evt = {
      timeStamp: domEvent.timeStamp,
      type,
      detail,
      preventDefault: () => {
        prevented = true
      },
      get defaultPrevented() {
        return prevented
      },
    }
    const cancelOnError = error => {
      console.error(`formeo: ${callbackName} failed, so the ${name} was cancelled.`, error)
      return false
    }
    const settle = result => {
      if (prevented || result === false || this.destroyed) {
        return false
      }
      proceed()
      return true
    }

    let result
    try {
      result = this.opts[callbackName]?.(evt)
    } catch (error) {
      return cancelOnError(error)
    }
    if (typeof result?.then !== 'function') {
      return settle(result)
    }
    if (guardKey) {
      this.pendingBefore.add(guardKey)
    }
    return Promise.resolve(result)
      .then(value => {
        if (guardKey) {
          this.pendingBefore.delete(guardKey)
        }
        return settle(value)
      }, cancelOnError)
      .finally(() => guardKey && this.pendingBefore.delete(guardKey))
  }

  formeoSaved = evt => this.dispatch(EVENT_FORMEO_SAVED, evt)
  formeoUpdated = (evt, eventType) => this.dispatch(eventType || EVENT_FORMEO_UPDATED, evt)
  formeoCleared = evt => this.dispatch(EVENT_FORMEO_CLEARED, evt)
  formeoOnRender = evt => this.dispatch(EVENT_FORMEO_ON_RENDER, evt)
  formeoConditionUpdated = evt => this.dispatch(EVENT_FORMEO_CONDITION_UPDATED, evt)
  formeoAddedStage = evt => this.dispatch(EVENT_FORMEO_ADDED_STAGE, evt)
  formeoAddedRow = evt => this.dispatch(EVENT_FORMEO_ADDED_ROW, evt)
  formeoAddedColumn = evt => this.dispatch(EVENT_FORMEO_ADDED_COLUMN, evt)
  formeoAddedField = evt => this.dispatch(EVENT_FORMEO_ADDED_FIELD, evt)
  formeoRemovedStage = evt => this.dispatch(EVENT_FORMEO_REMOVED_STAGE, evt)
  formeoRemovedRow = evt => this.dispatch(EVENT_FORMEO_REMOVED_ROW, evt)
  formeoRemovedColumn = evt => this.dispatch(EVENT_FORMEO_REMOVED_COLUMN, evt)
  formeoRemovedField = evt => this.dispatch(EVENT_FORMEO_REMOVED_FIELD, evt)
  formeoPageChanged = evt => this.dispatch(EVENT_FORMEO_PAGE_CHANGED, evt)

  /** detail: { confirmationMessage, clearAllAction, btnCoords } */
  confirmClearAll = detail => {
    const evt = new globalThis.CustomEvent('confirmClearAll', { detail })
    document.dispatchEvent(evt)
    if (this.destroyed) {
      return
    }
    this.opts.confirmClearAll({ timeStamp: evt.timeStamp, type: evt.type, ...detail })
  }

  formeoLoaded = formeo => {
    document.dispatchEvent(new globalThis.CustomEvent('formeoLoaded', { detail: { formeo } }))
    if (!this.destroyed) {
      this.opts.formeoLoaded(formeo)
    }
  }

  columnResized = detail => document.dispatchEvent(new globalThis.CustomEvent('columnResized', { detail }))

  /**
   * Window resize handler for one editor; FormeoEditor registers it (and can remove it, see #166).
   * It stays registered when the editor leaves the page, since its controls may be put back
   * (the #122 tab workaround), so it does nothing while they are detached.
   */
  onResizeWindow = () => {
    const { columns, controls } = this.components || {}
    if (this.destroyed || !columns || !controls?.dom?.isConnected || this.resizeFrame) {
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

  /**
   * Stop calling this editor's option callbacks, including a trailing onUpdate/onChange that is
   * already scheduled, and cancel a pending resize frame. FormeoEditor#destroy (#166) calls it.
   * DOM events are still dispatched, so page listeners are unaffected.
   */
  destroy() {
    this.destroyed = true
    if (this.resizeFrame) {
      window.cancelAnimationFrame(this.resizeFrame)
      this.resizeFrame = null
    }
  }
}

// standalone instance for existing tests; editor code must use its own (see singletons.test.mjs)
const events = new Events()

export default events
