import '../sass/formeo.scss'
import { enUS } from '@draggable/formeo-languages'
import i18n from '@draggable/i18n'
import { SmartTooltip } from '@draggable/tooltip'
import Actions from './common/actions.js'
import dom from './common/dom.js'
import Events from './common/events.js'
import { fetchFormeoStyle, fetchIcons } from './common/loaders.js'
import { cleanFormData, clone, merge, sessionStorage } from './common/utils/index.mjs'
import Controls from './components/controls/index.js'
import Components from './components/index.js'
import { defaults } from './config.js'
import { DEFAULT_FORMDATA, SESSION_FORMDATA_KEY, SESSION_LOCALE_KEY } from './constants.js'

/**
 * Initialization states for the editor lifecycle
 */
const INIT_STATES = {
  CREATED: 'created',
  LOADING_RESOURCES: 'loading',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
}

/**
 * Main class
 */
export class FormeoEditor {
  #initState = INIT_STATES.CREATED
  #initPromise = null
  #lockedFormData = null
  #dataLoadedOnce = false
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

    // Lock user data immediately - this prevents race conditions during async init
    const providedData = userFormData || formData
    this.#lockedFormData = providedData ? cleanFormData(providedData) : null
    this.userFormData = this.#lockedFormData // backward compat

    this.Components = Components
    this.dom = dom
    Events.init({ debug, ...events })
    Actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions })

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
    const cleaned = cleanFormData(data)
    this.#lockedFormData = cleaned
    this.userFormData = cleaned
    this.load(this.userFormData, this.opts)
  }

  loadData(data = {}) {
    this.formData = data
  }

  get json() {
    return this.Components.json
  }

  /**
   * Clear the editor and reset to initial state
   * @return {void}
   */
  clear() {
    // Reset form data to default structure with empty stage
    const defaultData = DEFAULT_FORMDATA()
    this.#lockedFormData = defaultData
    this.userFormData = defaultData

    // Clear components and reload with default data
    this.Components.load(this.userFormData, this.opts)

    // Re-render the editor
    this.render()
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  async loadResources() {
    document.removeEventListener('DOMContentLoaded', this.loadResources)
    this.#initState = INIT_STATES.LOADING_RESOURCES

    const promises = [
      fetchIcons(this.opts.svgSprite),
      fetchFormeoStyle(this.opts.style),
      i18n.init({
        preloaded: { 'en-US': enUS },
        ...this.opts.i18n,
        locale: globalThis.sessionStorage?.getItem(SESSION_LOCALE_KEY),
      }),
    ].filter(Boolean)

    try {
      await Promise.all(promises)

      if (this.opts.allowEdit) {
        this.init()
      }
    } catch (error) {
      this.#initState = INIT_STATES.ERROR
      console.error('Failed to load resources:', error)
      throw error
    }
  }

  /**
   * Formeo initializer
   * @return {Promise} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    // Prevent re-initialization while already initializing
    if (this.#initState === INIT_STATES.INITIALIZING) {
      return this.#initPromise
    }

    // If already ready, just refresh UI (for language changes)
    if (this.#initState === INIT_STATES.READY) {
      return this.#refreshUI()
    }

    this.#initState = INIT_STATES.INITIALIZING

    this.#initPromise = Controls.init(this.opts.controls, this.opts.stickyControls)
      .then(controls => {
        this.controls = controls

        // Only load data on FIRST init - prevents race condition
        if (!this.#dataLoadedOnce) {
          this.#loadInitialData()
          this.#dataLoadedOnce = true
        }

        this.formId = Components.get('id')
        this.i18n = {
          setLang: this.#setLanguage.bind(this),
        }

        this.render()
        this.#initState = INIT_STATES.READY
        this.opts.onLoad?.(this)
        this.tooltipInstance = new SmartTooltip()

        return this
      })
      .catch(error => {
        this.#initState = INIT_STATES.ERROR
        console.error('Failed to initialize editor:', error)
        throw error
      })

    return this.#initPromise
  }

  /**
   * Set language without reloading form data (fixes race condition)
   * @param {string} formeoLocale - locale code
   * @return {Promise}
   */
  async #setLanguage(formeoLocale) {
    globalThis.sessionStorage?.setItem(SESSION_LOCALE_KEY, formeoLocale)
    await i18n.setCurrent(formeoLocale)
    // Only refresh UI, DON'T reload data
    await this.#refreshUI()
  }

  /**
   * Refresh UI without reloading data (used for language changes)
   * @return {Promise}
   */
  async #refreshUI() {
    this.controls = await Controls.init(this.opts.controls, this.opts.stickyControls)
    this.render()
    return this
  }

  /**
   * Load initial data with proper priority
   */
  #loadInitialData() {
    const dataToLoad = this.#getDataWithPriority()
    this.Components.load(dataToLoad, this.opts)
  }

  /**
   * Get form data with proper priority:
   * 1. User-provided data (locked at construction)
   * 2. SessionStorage (if enabled)
   * 3. Default empty form
   * @return {Object} form data to load
   */
  #getDataWithPriority() {
    // Priority 1: User-provided data (locked at construction)
    if (this.#lockedFormData) {
      return clone(this.#lockedFormData)
    }

    // Priority 2: SessionStorage (if enabled)
    if (this.opts.sessionStorage) {
      const sessionData = sessionStorage.get(SESSION_FORMDATA_KEY)
      if (sessionData) {
        return sessionData
      }
    }

    // Priority 3: Default empty form
    return DEFAULT_FORMDATA()
  }

  load(formData = this.userFormData, opts = this.opts) {
    this.Components.load(formData, opts)
    this.render()
  }

  /**
   * Get current initialization state
   * @return {string} current state
   */
  get initState() {
    return this.#initState
  }

  /**
   * Check if the editor is ready
   * @return {boolean}
   */
  get isReady() {
    return this.#initState === INIT_STATES.READY
  }

  /**
   * Wait for the editor to be ready
   * @return {Promise} resolves when editor is ready
   */
  async whenReady() {
    if (this.#initState === INIT_STATES.READY) {
      return this
    }
    if (this.#initState === INIT_STATES.ERROR) {
      return Promise.reject(new Error('Editor initialization failed'))
    }
    if (this.#initPromise) {
      return this.#initPromise
    }
    // Fallback: poll for ready state
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (this.#initState === INIT_STATES.READY) {
          resolve(this)
        } else if (this.#initState === INIT_STATES.ERROR) {
          reject(new Error('Editor initialization failed'))
        } else {
          globalThis.requestAnimationFrame(checkReady)
        }
      }
      checkReady()
    })
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    if (!this.controls) {
      return globalThis.requestAnimationFrame(() => this.render())
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

    Events.formeoLoaded = new globalThis.CustomEvent('formeoLoaded', {
      detail: {
        formeo: this,
      },
    })

    document.dispatchEvent(Events.formeoLoaded)
  }
}

export { INIT_STATES }
export default FormeoEditor
