import identity from 'lodash/identity'
import i18n from 'mi18n'
import { SESSION_FORMDATA_KEY, CONDITION_TEMPLATE } from '../constants'
import { sessionStorage } from './utils'
import events from './events'

// Actions are the callbacks for things like adding
// new attributes, options, field removal confirmations etc.
// Every Action below can be overridden via module options

// Default options
const defaultActions = {
  add: {
    attr: evt => {
      const attr = window.prompt(evt.message.attr)
      if (attr && evt.isDisabled(attr)) {
        window.alert(i18n.get('attributeNotPermitted', attr || ''))
        return actions.add.attrs(evt)
      }
      let val
      if (attr) {
        val = String(window.prompt(evt.message.value, ''))
        evt.addAction(attr, val)
      }
    },
    option: evt => {
      evt.addAction()
    },
    condition: evt => {
      evt.addAction(evt)
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
  init: function(options) {
    const actionKeys = Object.keys(defaultActions)
    this.opts = actionKeys.reduce((acc, key) => {
      acc[key] = Object.assign({}, defaultActions[key], options[key])
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
      evt.template = CONDITION_TEMPLATE()
      // @todo add logging
      return actions.opts.add.condition(evt)
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
