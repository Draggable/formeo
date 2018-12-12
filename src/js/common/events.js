import throttle from 'lodash/throttle'
import {
  EVENT_FORMEO_UPDATED,
  EVENT_FORMEO_ON_RENDER,
  EVENT_FORMEO_CONDITION_UPDATED,
  EVENT_FORMEO_SAVED,
  EVENT_FORMEO_CLEARED,
} from '../constants'
import { Columns, Controls } from '../components'

const NO_TRANSITION_CLASS_NAME = 'no-transition'

// Default options
const defaults = {
  debug: false, // enable debug mode
  bubbles: true, // bubble events from components
  formeoLoaded: evt => {},
  onAdd: () => {},
  onUpdate: evt => events.opts.debug && console.log(evt),
  onRender: evt => events.opts.debug && console.log(evt),
  onSave: evt => {},
  confirmClearAll: evt => {
    if (window.confirm(evt.confirmationMessage)) {
      evt.clearAllAction(evt)
    }
  },
}

const defaultCustomEvent = ({ src, ...evtData }, type = EVENT_FORMEO_UPDATED) => {
  const evt = new window.CustomEvent(type, {
    detail: evtData,
    bubbles: events.opts.debug || events.opts.bubbles,
  })
  evt.data = (src || document).dispatchEvent(evt)
  return evt
}

/**
 * Events class is used to register events and throttle their callbacks
 */
const events = {
  init: function(options) {
    this.opts = Object.assign({}, defaults, options)
    return this
  },
  formeoSaved: evt => defaultCustomEvent(evt, EVENT_FORMEO_SAVED),
  formeoUpdated: evt => defaultCustomEvent(evt, EVENT_FORMEO_UPDATED),
  formeoCleared: evt => defaultCustomEvent(evt, EVENT_FORMEO_CLEARED),
  formeoOnRender: evt => defaultCustomEvent(evt, EVENT_FORMEO_ON_RENDER),
  formeoConditionUpdated: evt => defaultCustomEvent(evt, EVENT_FORMEO_CONDITION_UPDATED),
}

document.addEventListener(EVENT_FORMEO_UPDATED, evt => {
  const { timeStamp, type, detail } = evt
  events.opts.onUpdate({
    timeStamp,
    type,
    detail,
  })
})

document.addEventListener(EVENT_FORMEO_UPDATED, evt => {
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
      Object.values(Columns.data).forEach(column => {
        column.dom.classList.add(NO_TRANSITION_CLASS_NAME)
        Controls.dom.classList.add(NO_TRANSITION_CLASS_NAME)
        Controls.panels.nav.refresh()
        column.refreshFieldPanels()
        throttle(
          () => {
            column.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
            Controls.dom.classList.remove(NO_TRANSITION_CLASS_NAME)
          },
          1000,
          { leading: false }
        )
      })
    })
}

// handle event
window.addEventListener('resize', onResizeWindow)

export default events
