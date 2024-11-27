import '../sass/formeo.scss'
import i18n from '@draggable/i18n'
import { SmartTooltip } from '@draggable/tooltip'
import dom from './common/dom.js'
import Events from './common/events.js'
import Actions from './common/actions.js'
import Controls from './components/controls/index.js'
import Components from './components/index.js'
import { loadPolyfills, fetchIcons, fetchFormeoStyle } from './common/loaders.js'
import { SESSION_LOCALE_KEY } from './constants.js'
import { cleanFormData, merge } from './common/utils/index.mjs'
import { defaults } from './config.js'

/**
 * Main class
 */
export class FormeoEditor {
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData loaded formData
   * @return {Object}          formeo references and actions
   */
  constructor({ formData, ...options }, userFormData) {
    const mergedOptions = merge(defaults.editor, options)

    const { actions, events, debug, config, editorContainer, ...opts } = mergedOptions
    if (editorContainer) {
      this.editorContainer =
        typeof editorContainer === 'string' ? document.querySelector(editorContainer) : editorContainer
    }
    this.opts = opts
    dom.setOptions = opts
    Components.config = config

    this.userFormData = userFormData || formData

    this.Components = Components
    this.dom = dom
    Events.init({ debug, ...events })
    Actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions })
    this.tooltip = new SmartTooltip()

    // Load remote resources such as css and svg sprite
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.loadResources.bind(this))
    } else {
      this.loadResources()
    }
  }

  get formData() {
    return this.Components.formData
  }
  set formData(data = {}) {
    this.userFormData = cleanFormData(data)
    this.load(this.userFormData, this.opts)
  }
  get json() {
    return this.Components.json
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  async loadResources() {
    document.removeEventListener('DOMContentLoaded', this.loadResources)

    const promises = []

    if (this.opts.polyfills) {
      loadPolyfills(this.opts.polyfills)
    }

    // Ajax load svgSprite and inject into markup.
    await fetchIcons(this.opts.svgSprite)
    promises.push(fetchFormeoStyle(this.opts.style))

    promises.push(i18n.init({ ...this.opts.i18n, locale: window.sessionStorage?.getItem(SESSION_LOCALE_KEY) }))

    const resolvedPromises = await Promise.all(promises)

    if (this.opts.allowEdit) {
      this.init()
    }

    return resolvedPromises
  }

  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    return Controls.init(this.opts.controls, this.opts.stickyControls).then(controls => {
      this.controls = controls
      this.load(this.userFormData, this.opts)
      this.formId = Components.get('id')
      this.i18n = {
        setLang: formeoLocale => {
          window.sessionStorage?.setItem(SESSION_LOCALE_KEY, formeoLocale)
          const loadLang = i18n.setCurrent(formeoLocale)
          loadLang.then(() => {
            this.init()
          }, console.error)
        },
      }

      this.opts.onLoad?.(this)
    })
  }

  load(formData = this.userFormData, opts = this.opts) {
    this.Components.load(formData, opts)
    this.render()
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    if (!this.controls) {
      return window.requestAnimationFrame(() => this.render())
    }

    this.stages = Object.values(Components.get('stages'))
    if (this.opts.controlOnLeft) {
      for (const stage of this.stages) {
        stage.dom.style.order = 1
      }
    }
    const elemConfig = {
      attrs: {
        className: 'formeo formeo-editor',
        id: this.formId,
      },
      content: [this.stages.map(({ dom }) => dom)],
    }

    if (i18n.current.dir) {
      elemConfig.attrs.dir = i18n.current.dir
      dom.dir = i18n.current.dir
    }

    this.editor = dom.create(elemConfig)

    const controlsContainer = this.controls.container || this.editor
    controlsContainer.appendChild(this.controls.dom)

    if (this.editorContainer) {
      dom.empty(this.editorContainer)
      this.editorContainer.appendChild(this.editor)
    }

    Events.formeoLoaded = new window.CustomEvent('formeoLoaded', {
      detail: {
        formeo: this,
      },
    })

    document.dispatchEvent(Events.formeoLoaded)
  }
}

export default FormeoEditor
