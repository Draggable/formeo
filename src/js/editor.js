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
import sprite from '../demo/assets/img/formeo-sprite.svg'

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
    const _this = this
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
  set formData(data = {}) {
    return this.load({ ...this.userFormData, ...data }, this.opts)
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
    } else {
      promises.push(insertIcons(sprite))
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
    this.controls = Controls.init(_this.opts.controls, _this.opts.stickyControls)
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

  load(formData = this.userFormData, opts = this.opts) {
    return this.Components.load(formData, opts)
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    this.stages = Object.values(Components.get('stages'))
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
