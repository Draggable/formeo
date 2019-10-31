import { insertScript, insertStyle } from '../../common/loaders'
import identity from 'lodash/identity'

const LOADER_MAP = {
  js: insertScript,
  css: insertStyle,
}

export default class Control {
  constructor({ events = {}, dependencies = {}, ...restConfig } = {}) {
    this.events = events
    this.controlData = restConfig
    this.depsLoaded = this.fetchDependencies(dependencies)
  }

  onRenderPreview() {}

  fetchDependencies(dependencies, cache = true) {
    const promises = Object.entries(dependencies).map(([type, src]) => {
      return LOADER_MAP[type](src)
    })
    return Promise.all(promises)
  }

  /**
   * code to execute for supported events
   * to implement an onRender event in a child class, simply define an onRender method
   * @param {String} eventType - optional type of event to retrieve an event function for. If not specified all events returned
   * @return {Function/Object} - function to execute for specified event, or all events of no eventType is specified
   */
  on(eventType) {
    const events = {
      // executed just prior to the row being returned by the layout class. Receives the DOMelement about to be passed back
      prerender: identity,

      renderComponent: identity,

      // onRender event to execute code each time an instance of this control is injected into the DOM
      render: evt => {
        // check for a class render event - default to an empty function
        const onRender = () => {
          if (this.onRender) {
            this.onRender(evt)
          }
        }

        this.depsLoaded.then(() => {
          onRender(evt)
        })
      },
    }

    return eventType ? events[eventType] : events
  }

  /**
   * Converts escaped HTML into usable HTML
   * @param  {String} html escaped HTML
   * @return {String}      parsed HTML
   */
  parsedHtml = html => {
    const escapeElement = document.createElement('textarea')
    escapeElement.innerHTML = html
    return escapeElement.textContent
  }

  /**
   * Retrieve a translated string
   * By default looks for translations defined against the class (for plugin controls)
   * Expects {locale1: {type: label}, locale2: {type: label}}, or {default: label}, or {local1: label, local2: label2}
   * @param {String} lookup string to retrieve the label / translated string for
   * @param {Object|Number|String} args - string or key/val pairs for string lookups with variables
   * @return {String} the translated label
   */
  static i18n(lookup, args) {
    const def = this.definition
    let i18n = def.i18n || {}
    const locale = i18n.locale
    i18n = i18n[locale] || i18n.default || i18n

    // if translation is defined in the control, return it
    const value = typeof i18n === 'object' ? i18n[lookup] : i18n
    if (value) {
      return value
    }

    // otherwise check the i18n object - allow for mapping a lookup to a custom mi18n lookup
    let mapped = def.i18n
    if (typeof mapped === 'object') {
      mapped = mapped[lookup]
    }
    return i18n.get(mapped, args)
  }
}
