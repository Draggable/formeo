import i18n from '@draggable/i18n'
import { CONDITION_TEMPLATE, SESSION_FORMDATA_KEY } from '../constants.js'
import { identity, sessionStorage } from './utils/index.mjs'

// Default options
const defaultActions = {
  add: {
    attr: evt => {
      const attr = globalThis.prompt(evt.message.attr)
      if (attr && evt.isDisabled(attr)) {
        globalThis.alert(i18n.get('attributeNotPermitted', attr))
        return this.add.attrs(evt)
      }
      let val
      if (attr) {
        val = String(globalThis.prompt(evt.message.value, ''))
        evt.addAction(attr, val)
      }
    },
    option: evt => {
      evt.addAction()
    },
    condition: evt => {
      evt.addAction(evt)
    },
    config: evt => {
      evt.addAction(evt)
    },
  },
  remove: {
    attrs: evt => {
      evt.removeAction()
    },
    options: evt => {
      evt.removeAction()
    },
    conditions: evt => {
      evt.removeAction()
    },
  },
  click: {
    btn: evt => {
      evt.action()
    },
  },
  save: {
    form: identity,
  },
}

/**
 * Actions class handles user actions (add, remove, clone, edit components).
 * Each FormeoEditor instance creates its own Actions object so that
 * multiple editors on the same page don't share action state.
 */
export class Actions {
  /** @type {Object} */
  opts = null

  /** @type {Events} */
  events = null

  /**
   * @param {Events} events - The Events instance for dispatching events
   */
  constructor(events) {
    this.events = events
  }

  init(options = {}) {
    const actionKeys = Object.keys(defaultActions)
    this.opts = actionKeys.reduce((acc, key) => {
      acc[key] = { ...defaultActions[key], ...options[key] }
      return acc
    }, options)
    return this
  }

  add = {
    attrs: evt => {
      return this.opts.add.attr(evt)
    },
    options: evt => {
      return this.opts.add.option(evt)
    },
    conditions: evt => {
      evt.template = evt.template || CONDITION_TEMPLATE()
      return this.opts.add.condition(evt)
    },
    config: evt => {
      return this.opts.add.config(evt)
    },
  }

  remove = {
    attrs: evt => {
      return this.opts.remove.attrs(evt)
    },
    options: evt => {
      return this.opts.remove.options(evt)
    },
    conditions: evt => {
      return this.opts.remove.conditions(evt)
    },
  }

  click = {
    btn: evt => {
      return this.opts.click.btn(evt)
    },
  }

  save = {
    form: formData => {
      if (this.opts.sessionStorage) {
        sessionStorage.set(SESSION_FORMDATA_KEY, formData)
      }
      this.events.formeoSaved({ formData })
      return this.opts.save.form(formData)
    },
  }
}

// Singleton instance for backward compatibility
// Note: this singleton uses a placeholder events reference
// that will be replaced when the editor creates its own Actions instance
const actions = new Actions(null)

export default actions
