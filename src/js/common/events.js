// Default options
const defaults = {
  debug: false, // enable debug mode
  bubbles: false, // bubble events from components
  formeoLoaded: evt => {},
  onAdd: () => {},
  onUpdate: evt => {
    if (events.opts.debug) {
      console.log(evt)
    }
  },
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
    const evt = new window.CustomEvent('formeoUpdated', {
      detail: evtData,
      bubbles: events.opts.debug || events.opts.bubbles,
    })
    evt.data = (src || document).dispatchEvent(evt)
    return evt
  },
}

document.addEventListener('formeoUpdated', function(evt) {
  const { timeStamp, type, detail } = evt
  events.opts.onUpdate({
    timeStamp,
    type,
    detail,
  })
})

document.addEventListener('confirmClearAll', function(evt) {
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

document.addEventListener('formeoLoaded', function(evt) {
  events.opts.formeoLoaded(evt.detail.formeo)
})

export default events
