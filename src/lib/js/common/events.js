import components, { Columns, Controls } from '../components/index.js'
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

// Default options
const defaults = {
  debug: false, // enable debug mode
  bubbles: true, // bubble events from components
  formeoLoaded: _evt => {},
  onAdd: () => {},
  onChange: evt => events.opts?.debug && console.log(evt),
  onUpdate: evt => events.opts?.debug && console.log(evt),
  onUpdateStage: evt => events.opts?.debug && console.log(evt),
  onUpdateRow: evt => events.opts?.debug && console.log(evt),
  onUpdateColumn: evt => events.opts?.debug && console.log(evt),
  onUpdateField: evt => events.opts?.debug && console.log(evt),
  onAddRow: evt => events.opts?.debug && console.log(evt),
  onAddColumn: evt => events.opts?.debug && console.log(evt),
  onAddField: evt => events.opts?.debug && console.log(evt),
  onRemoveRow: evt => events.opts?.debug && console.log(evt),
  onRemoveColumn: evt => events.opts?.debug && console.log(evt),
  onRemoveField: evt => events.opts?.debug && console.log(evt),
  onRender: evt => events.opts?.debug && console.log(evt),
  onSave: _evt => {},
  confirmClearAll: evt => {
    if (globalThis.confirm(evt.confirmationMessage)) {
      evt.clearAllAction(evt)
    }
  },
}

const defaultCustomEvent = ({ src, ...evtData }, type = EVENT_FORMEO_UPDATED) => {
  const evt = new globalThis.CustomEvent(type, {
    detail: evtData,
    bubbles: events.opts?.debug || events.opts?.bubbles,
  })
  evt.data = (src || document).dispatchEvent(evt)

  // Also dispatch formeoChanged as an alias for formeoUpdated
  if (type === EVENT_FORMEO_UPDATED) {
    const changedEvt = new globalThis.CustomEvent(EVENT_FORMEO_CHANGED, {
      detail: evtData,
      bubbles: events.opts?.debug || events.opts?.bubbles,
    })
    ;(src || document).dispatchEvent(changedEvt)
  }

  return evt
}

/**
 * Events class is used to register events and throttle their callbacks
 */
const events = {
  init: function (options) {
    this.opts = { ...defaults, ...options }
    return this
  },
  formeoSaved: evt => defaultCustomEvent(evt, EVENT_FORMEO_SAVED),
  formeoUpdated: (evt, eventType) => defaultCustomEvent(evt, eventType || EVENT_FORMEO_UPDATED),
  formeoCleared: evt => defaultCustomEvent(evt, EVENT_FORMEO_CLEARED),
  formeoOnRender: evt => defaultCustomEvent(evt, EVENT_FORMEO_ON_RENDER),
  formeoConditionUpdated: evt => defaultCustomEvent(evt, EVENT_FORMEO_CONDITION_UPDATED),
  formeoAddedRow: evt => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_ROW),
  formeoAddedColumn: evt => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_COLUMN),
  formeoAddedField: evt => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_FIELD),
  formeoRemovedRow: evt => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_ROW),
  formeoRemovedColumn: evt => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_COLUMN),
  formeoRemovedField: evt => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_FIELD),
}

const formeoUpdatedThrottled = throttle(() => {
  const eventData = {
    timeStamp: globalThis.performance.now(),
    type: EVENT_FORMEO_UPDATED,
    detail: components.formData,
  }
  events.opts.onUpdate(eventData)
  // Also call onChange if it's different from onUpdate
  if (events.opts.onChange !== events.opts.onUpdate) {
    events.opts.onChange(eventData)
  }
}, ANIMATION_SPEED_FAST)

document.addEventListener(EVENT_FORMEO_UPDATED, formeoUpdatedThrottled)
document.addEventListener(EVENT_FORMEO_UPDATED_STAGE, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onUpdate(eventData)
  events.opts.onUpdateStage(eventData)
})
document.addEventListener(EVENT_FORMEO_UPDATED_ROW, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onUpdate(eventData)
  events.opts.onUpdateRow(eventData)
})
document.addEventListener(EVENT_FORMEO_UPDATED_COLUMN, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onUpdate(eventData)
  events.opts.onUpdateColumn(eventData)
})
document.addEventListener(EVENT_FORMEO_UPDATED_FIELD, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onUpdate(eventData)
  events.opts.onUpdateField(eventData)
})

document.addEventListener(EVENT_FORMEO_ADDED_ROW, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onAddRow(eventData)
})

document.addEventListener(EVENT_FORMEO_ADDED_COLUMN, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onAddColumn(eventData)
})

document.addEventListener(EVENT_FORMEO_ADDED_FIELD, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onAddField(eventData)
})

document.addEventListener(EVENT_FORMEO_REMOVED_ROW, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onRemoveRow(eventData)
})

document.addEventListener(EVENT_FORMEO_REMOVED_COLUMN, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onRemoveColumn(eventData)
})

document.addEventListener(EVENT_FORMEO_REMOVED_FIELD, evt => {
  const { timeStamp, type, detail } = evt
  const eventData = { timeStamp, type, detail }
  events.opts.onRemoveField(eventData)
})

document.addEventListener(EVENT_FORMEO_ON_RENDER, evt => {
  const { timeStamp, type, detail } = evt
  events.opts.onRender({
    timeStamp,
    type,
    detail,
  })
})

document.addEventListener('confirmClearAll', evt => {
  evt = {
    timeStamp: evt.timeStamp,
    type: evt.type,
    confirmationMessage: evt.detail.confirmationMessage,
    clearAllAction: evt.detail.clearAllAction,
    btnCoords: evt.detail.btnCoords,
  }

  events.opts.confirmClearAll(evt)
})

document.addEventListener(EVENT_FORMEO_SAVED, ({ timeStamp, type, detail: { formData } }) => {
  const evt = {
    timeStamp,
    type,
    formData,
  }
  events.opts.onSave(evt)
})

document.addEventListener('formeoLoaded', evt => {
  events.opts.formeoLoaded(evt.detail.formeo)
})

let throttling

function onResizeWindow() {
  throttling =
    throttling ||
    window.requestAnimationFrame(() => {
      throttling = false
      for (const column of Object.values(Columns.data)) {
        column.dom.classList.add(NO_TRANSITION_CLASS_NAME)
        Controls.dom.classList.add(NO_TRANSITION_CLASS_NAME)
        Controls.panels.nav.refresh()
        column.refreshFieldPanels()
        throttle(() => {
          column.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
          Controls.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
        }, ANIMATION_SPEED_BASE)
      }
    })
}

// handle event
window.addEventListener('resize', onResizeWindow)

export default events
