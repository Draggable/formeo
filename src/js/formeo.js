'use strict'
import '../sass/formeo.scss'
import i18n from 'mi18n'
import h from './common/helpers'
import { data } from './common/data'
import events from './common/events'
import actions from './common/actions'
import dom from './common/dom'
import Controls from './components/controls'
import Stage from './components/stages/stage'
import formData, { stages as stagesData } from './data'
import { loadPolyfills, insertStyle, insertIcons, ajax } from './common/loaders'
import 'es6-promise/auto'

const fallbacks = {
  svgSprite: 'https://draggable.github.io/formeo/assets/img/formeo-sprite.svg',
}

// Simple object config for the main part of formeo
const formeo = {
  get formData() {
    return data.json
  },
}

/**
 * Main class
 */
class Formeo {
  /**
   * [constructor description]
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData [description]
   * @return {Object}          formeo references and actions
   */
  constructor(options, userFormData) {
    // Default options
    const defaults = {
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      container: '.formeo-wrap',
      prefix: 'formeo-',
      svgSprite: null, // change to null
      iconFont: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      events: {},
      actions: {},
      controls: {},
      config: {
        rows: {},
        columns: {},
        fields: {},
      },
      polyfills: h.detectIE(), // loads csspreloadrel
      i18n: {
        location: 'https://draggable.github.io/formeo/assets/lang/',
        locale: 'en-US',
        langs: ['en-US'],
      },
    }

    const formeoLocale = window.sessionStorage.getItem('formeo-locale')
    if (formeoLocale) {
      defaults.i18n.locale = formeoLocale
    }

    const _this = this

    _this.container = options.container || defaults.container
    if (typeof _this.container === 'string') {
      _this.container = document.querySelector(_this.container)
    }

    // Remove `container` property before extending because container
    // may be Element
    delete options.container

    const { iconFont, ...opts } = h.merge(defaults, options)
    this.opts = opts
    dom.setOptions = opts

    data.init(opts, userFormData)
    events.init(opts.events)
    actions.init(opts.actions)

    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      dom.setConfig = opts.config
      formeo.render = renderTarget => dom.renderForm(renderTarget)
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
      _this.formId = formData.get('id')
      formeo.controls = Controls.init(_this.opts.controls)
      _this.stages = _this.build()
      formeo.i18n = {
        setLang: formeoLocale => {
          window.sessionStorage.setItem('formeo-locale', formeoLocale)
          const loadLang = i18n.setCurrent(formeoLocale)
          loadLang.then(lang => {
            _this.stages = _this.build()
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
   * Generate the stages we will drag out elements to
   * @return {Object} stages map
   */
  build() {
    const stages = []
    const createStage = stageData => new Stage(stageData)
    if (stagesData.size) {
      stagesData.forEach(stageData => {
        stages.push(createStage(stageData))
      })
    } else {
      stages.push(createStage())
    }

    return stages
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    const _this = this
    const controls = formeo.controls.dom

    const elemConfig = {
      tag: 'div',
      attrs: {
        className: 'formeo formeo-editor',
        id: _this.formId,
      },
      content: [_this.stages, controls],
    }

    if (i18n.current.dir) {
      elemConfig.attrs.dir = i18n.current.dir
      dom.dir = i18n.current.dir
    }

    const formeoElem = dom.create(elemConfig)

    _this.container.innerHTML = ''
    _this.container.appendChild(formeoElem)

    _this.stages.forEach(stageWrap => {
      const stage = stageWrap.childNodes[0]
      stage.style.minHeight = dom.getStyle(controls, 'height')
    })

    events.formeoLoaded = new window.CustomEvent('formeoLoaded', {
      detail: {
        formeo: formeo,
      },
    })

    document.dispatchEvent(events.formeoLoaded)
  }
}

if (window !== undefined) {
  window.Formeo = Formeo
}

export default Formeo
