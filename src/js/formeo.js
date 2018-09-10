'use strict'
import '../sass/formeo.scss'
import i18n from 'mi18n'
import h from './common/helpers'
import dom from './common/dom'
import Events from './common/events'
import Actions from './common/actions'
import Controls from './components/controls'
import Components from './components'
import { loadPolyfills, insertStyle, insertIcons, ajax } from './common/loaders'
import 'es6-promise/auto'
import FormeoRender from './formeo-render'
import { SESSION_LOCALE_KEY } from './constants'
import { sessionStorage, merge } from './common/utils'
import pkg from '../../package.json'

const fallbacks = {
  svgSprite: 'https://draggable.github.io/formeo/assets/img/formeo-sprite.svg',
}

const DEFAULT_OPTIONS = {
  allowEdit: true,
  dataType: 'json',
  debug: false,
  sessionStorage: false,
  container: `.${pkg.name}-wrap`,
  svgSprite: null, // change to null
  iconFont: null, // 'glyphicons' || 'font-awesome' || 'fontello'
  config: {}, // stages, rows, columns, fields
  events: {},
  actions: {},
  controls: {},
  polyfills: h.detectIE(), // loads csspreloadrel
  i18n: {
    location: 'https://draggable.github.io/formeo/assets/lang/',
    locale: 'en-US',
    langs: ['en-US'],
  },
}

// Simple object config for the main part of formeo
const formeo = {
  get formData() {
    return Components.formData
  },
  get json() {
    return Components.json
  },
  Components,
}

/**
 * Main class
 */
class Formeo {
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData [description]
   * @return {Object}          formeo references and actions
   */
  constructor(options, userFormData) {
    const formeoLocale = sessionStorage.get(SESSION_LOCALE_KEY)
    if (formeoLocale) {
      DEFAULT_OPTIONS.i18n.locale = formeoLocale
    }

    const _this = this

    _this.container = options.container || DEFAULT_OPTIONS.container
    if (typeof _this.container === 'string') {
      _this.container = document.querySelector(_this.container)
    }

    const { actions, events, debug, config, ...opts } = merge(DEFAULT_OPTIONS, options)
    this.opts = opts
    dom.setOptions = opts
    Components.config = config

    this.formData = userFormData

    Events.init({ debug, ...events })
    Actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions })

    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      if (opts.allowEdit) {
        formeo.edit = _this.init.bind(_this)
        _this.init()
      }
    })

    return formeo
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  loadResources() {
    const promises = []

    if (this.opts.polyfills) {
      loadPolyfills(this.opts.polysfills)
    }

    if (this.opts.style) {
      promises.push(insertStyle(this.opts.style))
    }

    // Ajax load svgSprite and inject into markup.
    if (this.opts.svgSprite) {
      promises.push(ajax(this.opts.svgSprite, insertIcons, () => ajax(fallbacks.svgSprite, insertIcons)))
    }

    return Promise.all(promises)
  }

  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    const _this = this
    i18n.init(_this.opts.i18n).then(() => {
      Components.load(this.formData, _this.opts)
      const formRender = new FormeoRender(this.formData)
      formeo.render = formRender.render

      formeo.load = (formData, opts = _this.opts) => {
        let data = formData
        if (typeof formData === 'string') {
          data = JSON.parse(formData)
        }
        Components.load(data, (opts = _this.opts))
      }
      formeo.controls = Controls.init(_this.opts.controls)
      _this.formId = Components.get('id')
      formeo.i18n = {
        setLang: formeoLocale => {
          sessionStorage.set(SESSION_LOCALE_KEY, formeoLocale)
          const loadLang = i18n.setCurrent(formeoLocale)
          loadLang.then(lang => {
            formeo.controls = Controls.init(_this.opts.controls)
            _this.render()
          }, console.error)
        },
      }

      _this.render()
    })

    return formeo
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    const _this = this
    const controls = formeo.controls.dom
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

    _this.container.innerHTML = ''
    _this.container.appendChild(formeoEditor)

    Events.formeoLoaded = new window.CustomEvent('formeoLoaded', {
      detail: {
        formeo: formeo,
      },
    })

    document.dispatchEvent(Events.formeoLoaded)
  }
}

if (window !== undefined) {
  window.Formeo = Formeo
}

export default Formeo
