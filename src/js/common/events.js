import { EVENT_FORMEO_UPDATED, EVENT_FORMEO_ON_RENDER } from '../constants'

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

/**
 * Events class is used to register events and throttle their callbacks
 */
const events = {
  init: function(options) {
    this.opts = Object.assign({}, defaults, options)
    return this
  },
  formeoSaved: new window.CustomEvent('formeoSaved', {}),
  formeoUpdated: ({ src, ...evtData }) => {
    const evt = new window.CustomEvent(EVENT_FORMEO_UPDATED, {
      detail: evtData,
      bubbles: events.opts.debug || events.opts.bubbles,
    })
    evt.data = (src || document).dispatchEvent(evt)
    return evt
  },
  formeoOnRender: ({ src, ...evtData }) => {
    const evt = new window.CustomEvent(EVENT_FORMEO_ON_RENDER, {
      detail: evtData,
      bubbles: events.opts.debug || events.opts.bubbles,
    })
    evt.data = (src || document).dispatchEvent(evt)
    return evt
  },
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

document.addEventListener('formeoSaved', ({ timeStamp, type, detail: { formData } }) => {
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

export default events
