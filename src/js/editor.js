'use strict'
import '../sass/formeo.scss'
import i18n from 'mi18n'
import dom from './common/dom'
import Events from './common/events'
import Actions from './common/actions'
import Controls from './components/controls'
import Components from './components'
import { loadPolyfills, insertStyle, insertIcons, ajax } from './common/loaders'
import { SESSION_LOCALE_KEY, FALLBACK_SVG_SPRITE } from './constants'
import { sessionStorage, merge } from './common/utils'
import { defaults } from './config'

/**
 * Main class
 */
export class FormeoEditor {
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData loaded formData
   * @return {Object}          formeo references and actions
   */
  constructor(options, userFormData) {
    const _this = this
    const mergedOptions = merge(defaults.editor, options)

    const { actions, events, debug, config, editorContainer, ...opts } = mergedOptions
    this.editorContainer =
      typeof editorContainer === 'string' ? document.querySelector(editorContainer) : editorContainer
    this.opts = opts
    dom.setOptions = opts
    Components.config = config

    this.userFormData = userFormData

    this.Components = Components
    Events.init({ debug, ...events })
    Actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions })

    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      if (opts.allowEdit) {
        _this.edit = _this.init.bind(_this)
        _this.init()
      }
    })
  }

  get formData() {
    return this.Components.formData
  }
  get json() {
    return this.Components.json
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  loadResources() {
    const promises = []

    if (this.opts.polyfills) {
      loadPolyfills(this.opts.polyfills)
    }

    if (this.opts.style) {
      promises.push(insertStyle(this.opts.style))
    }

    // Ajax load svgSprite and inject into markup.
    if (this.opts.svgSprite) {
      promises.push(ajax(this.opts.svgSprite, insertIcons, () => ajax(FALLBACK_SVG_SPRITE, insertIcons)))
    }

    promises.push(i18n.init(Object.assign({}, this.opts.i18n, { locale: sessionStorage.get(SESSION_LOCALE_KEY) })))

    return Promise.all(promises)
  }

  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    const _this = this
    this.load(this.userFormData, _this.opts)
    this.controls = Controls.init(_this.opts.controls)
    _this.formId = Components.get('id')
    this.i18n = {
      setLang: formeoLocale => {
        sessionStorage.set(SESSION_LOCALE_KEY, formeoLocale)
        const loadLang = i18n.setCurrent(formeoLocale)
        loadLang.then(() => {
          this.controls = Controls.init(_this.opts.controls)
          _this.render()
        }, console.error)
      },
    }

    _this.render()
  }

  load(formData, opts = this.opts) {
    return this.Components.load(formData, opts)
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    const _this = this
    const controls = this.controls.dom
    const elemConfig = {
      attrs: {
        className: 'formeo formeo-editor',
        id: _this.formId,
      },
      content: [Object.values(Components.get('stages')).map(({ dom }) => dom), controls],
    }

    if (i18n.current.dir) {
      elemConfig.attrs.dir = i18n.current.dir
      dom.dir = i18n.current.dir
    }

    const formeoEditor = dom.create(elemConfig)

    dom.empty(_this.editorContainer)
    _this.editorContainer.appendChild(formeoEditor)

    Events.formeoLoaded = new window.CustomEvent('formeoLoaded', {
      detail: {
        formeo: _this,
      },
    })

    document.dispatchEvent(Events.formeoLoaded)
  }
}

export default FormeoEditor
