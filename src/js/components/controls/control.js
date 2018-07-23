import Promise from 'promise-polyfill'
import { insertScript, insertStyle } from '../../common/loaders'

const LOADER_MAP = {
  js: insertScript,
  css: insertStyle,
}

export default class Control {
  constructor(config = {}) {
    const { events = {}, dependencies = {}, ...restConfig } = config
    this.config = restConfig
    this.events = events

    Object.entries(restConfig).forEach(([key, val]) => {
      this[key] = val
    })

    this.fetchDependencies(dependencies)
  }

  onRender(fld) {
    this.config.onRender()
  }
  onRenderPreview() {}

  fetchDependencies(dependencies, cache = true) {
    const promises = Object.entries(dependencies).map(([type, src]) => {
      return LOADER_MAP[type](src)
    })
    // console.log(promises)
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
      prerender: element => {},

      // onRender event to execute code each time an instance of this control is injected into the DOM
      render: evt => {
        // check for a class render event - default to an empty function
        const onRender = () => {
          if (this.onRender) {
            this.onRender()
          }
        }

        // check for any css & javascript to include
        // if (this.css) {
        //   utils.getStyles(this.css)
        // }
        // if (this.js && !utils.isCached(this.js)) {
        //   utils.getScripts(this.js).done(onRender)
        // } else {
        //   onRender()
        // }
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
}
