import i18n from '@draggable/i18n'
import { CONDITION_TEMPLATE, SESSION_FORMDATA_KEY } from '../constants.js'
import events from './events.js'
import { identity, sessionStorage } from './utils/index.mjs'

// Actions are the callbacks for things like adding
// new attributes, options, field removal confirmations etc.
// Every Action below can be overridden via module options

// Default options
const defaultActions = {
  add: {
    attr: evt => {
      const attr = globalThis.prompt(evt.message.attr)
      if (attr && evt.isDisabled(attr)) {
        globalThis.alert(i18n.get('attributeNotPermitted', attr))
        return actions.add.attrs(evt)
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
 * @todo refactor to handle multiple instances of formeo
 */
const actions = {
  init: function (options) {
    const actionKeys = Object.keys(defaultActions)
    this.opts = actionKeys.reduce((acc, key) => {
      acc[key] = { ...defaultActions[key], ...options[key] }
      return acc
    }, options)
    return this
  },
  add: {
    attrs: evt => {
      return actions.opts.add.attr(evt)
    },
    options: evt => {
      return actions.opts.add.option(evt)
    },
    conditions: evt => {
      evt.template = evt.template || CONDITION_TEMPLATE()
      return actions.opts.add.condition(evt)
    },
    config: evt => {
      return actions.opts.add.config(evt)
    },
  },
  remove: {
    attrs: evt => {
      return actions.opts.remove.attrs(evt)
    },
    options: evt => {
      return actions.opts.remove.options(evt)
    },
    conditions: evt => {
      return actions.opts.remove.conditions(evt)
    },
  },
  click: {
    btn: evt => {
      return actions.opts.click.btn(evt)
    },
  },
  save: {
    form: formData => {
      if (actions.opts.sessionStorage) {
        sessionStorage.set(SESSION_FORMDATA_KEY, formData)
      }

      events.formeoSaved({ formData })
      return actions.opts.save.form(formData)
    },
  },
}

export default actions
