import i18n from '@draggable/i18n'
import Dialog from '../components/dialog.js'
import { CONDITION_TEMPLATE } from '../constants.js'
import events from './events.js'
import { formDataStorageKey, identity, sessionStorage } from './utils/index.mjs'

// Actions are the callbacks for things like adding
// new attributes, options, field removal confirmations etc.
// Every Action below can be overridden via module options

// no `.`: addAttribute writes `attrs.<name>`, and addresses split on dots
const ATTRIBUTE_NAME = /^[A-Za-z_:][-A-Za-z0-9_:]*$/

/**
 * Why an attribute name can't be added, or '' when it can
 * @param {String} rawValue untrimmed attribute name, straight from the input
 * @param {Object} evt add-attribute event from the edit panel
 * @return {String}
 */
const attributeProblem = (rawValue, evt) => {
  const attr = rawValue.trim()
  if (!attr) {
    // A non-empty value that trims to nothing (e.g. "   ") satisfies the native
    // `required` check, so it needs its own message; a truly empty value keeps
    // relying on `required`.
    return rawValue ? i18n.get('attributeNameRequired') || 'Enter an attribute name' : ''
  }
  if (!ATTRIBUTE_NAME.test(attr) || evt.isDisabled(`attrs.${attr}`)) {
    return i18n.get('attributeNotPermitted', { attribute: attr }) || `Attribute "${attr}" is not permitted`
  }
  return ''
}

/**
 * Default add-attribute UI: an in-app dialog in place of window.prompt (#233)
 * @param {Object} evt add-attribute event from the edit panel
 * @return {Dialog}
 */
const openAddAttributeDialog = evt =>
  new Dialog({
    className: 'add-attribute-dialog',
    content: [
      {
        tag: 'input',
        attrs: { type: 'text', name: 'attrName', className: 'attr-name-input', required: true, autocomplete: 'off' },
        config: { label: evt.message.attr },
        action: {
          input: ({ target }) => target.setCustomValidity(attributeProblem(target.value, evt)),
        },
      },
      {
        tag: 'input',
        attrs: { type: 'text', name: 'attrValue', className: 'attr-value-input', autocomplete: 'off' },
        config: { label: evt.message.value },
      },
    ],
    onConfirm: formData => {
      const attr = String(formData.get('attrName') ?? '').trim()
      if (attr && !attributeProblem(attr, evt)) {
        evt.addAction(attr, String(formData.get('attrValue') ?? ''))
      }
    },
  }).open()

// Default options
const defaultActions = {
  add: {
    attr: evt => openAddAttributeDialog(evt),
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
        sessionStorage.set(formDataStorageKey(this.opts.sessionStorage), formData)
      }
      this.events?.formeoSaved({ formData })
      return this.opts.save.form(formData)
    },
  }
}

// standalone instance for existing tests; editor code must use its own (see singletons.test.mjs)
const actions = new Actions(events)

export default actions
