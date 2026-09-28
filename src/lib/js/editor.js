import '../sass/formeo.scss'
import { enUS } from '@draggable/formeo-languages'
import i18n from '@draggable/i18n'
import { SmartTooltip } from '@draggable/tooltip'
import { Actions } from './common/actions.js'
import dom from './common/dom.js'
import { Events } from './common/events.js'
import { fetchFormeoStyle, fetchIcons } from './common/loaders.js'
import { destroySortables } from './common/sortable.js'
import { cleanFormData, clone, formDataStorageKey, merge, sessionStorage } from './common/utils/index.mjs'
import { Controls } from './components/controls/index.js'
import { Components } from './components/index.js'
import { EditorPages } from './components/stages/pages.js'
import { defaults } from './config.js'
import { DEFAULT_FORMDATA, SESSION_LOCALE_KEY } from './constants.js'

/**
 * Initialization states for the editor lifecycle
 */
const INIT_STATES = {
  CREATED: 'created',
  LOADING_RESOURCES: 'loading',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
  DESTROYED: 'destroyed',
}

// page-wide on purpose: two editors saving to one sessionStorage key overwrite each other's form.
// Maps each key to the editor created last with it.
const storageKeyHolders = new Map()

// SmartTooltip keeps one page-wide instance: each editor's `new SmartTooltip()` replaces the last one,
// so the latest is kept here for destroy() to remove once no editor is left on the page.
let pageTooltip = null

/**
 * Whether an editor is still on the page, or still on its way there. An editor whose container
 * left the page or no longer holds its DOM (a remount, a demo switch) no longer owns its key.
 * @param {FormeoEditor} editor
 * @return {Boolean}
 */
const isLiveEditor = editor => {
  if (editor.initState === INIT_STATES.ERROR || editor.initState === INIT_STATES.DESTROYED) {
    return false
  }
  if (!editor.editor) {
    // not rendered yet
    return !editor.editorContainer || editor.editorContainer.isConnected
  }
  return Boolean(editor.editorContainer?.isConnected && editor.editorContainer.contains(editor.editor))
}

/**
 * Main class
 */
export class FormeoEditor {
  #initState = INIT_STATES.CREATED
  #initPromise = null
  #lockedFormData = null
  #dataLoadedOnce = false
  // one bound handler, so loadResources() and destroy() remove the listener the constructor added
  #onDOMContentLoaded = () => this.loadResources()
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData loaded formData
   * @return {Object}          formeo references and actions
   */
  constructor({ formData, ...options } = {}, userFormData) {
    const mergedOptions = merge(defaults.editor, options)

    const { actions, events, debug, config, editorContainer, ...opts } = mergedOptions
    if (editorContainer) {
      this.editorContainer = dom.resolveContainer(editorContainer) || null
    }
    this.editorContainerOption = editorContainer
    this.opts = opts
    dom.setOptions = opts

    // Lock user data immediately - this prevents race conditions during async init
    const providedData = userFormData || formData
    this.#lockedFormData = providedData ? cleanFormData(providedData) : null
    this.userFormData = this.#lockedFormData // backward compat

    this.dom = dom
    this.events = new Events().init({ debug, ...events })
    this.actions = new Actions(this.events).init({ debug, sessionStorage: opts.sessionStorage, ...actions })
    this.Components = new Components({ events: this.events, actions: this.actions })
    this.Components.config = config
    // page tabs, one per stage (#122); null keeps the editor as it has always been
    this.pages = opts.pages ? new EditorPages(this.Components) : null
    this.Components.pages = this.pages

    if (opts.sessionStorage) {
      const key = formDataStorageKey(opts.sessionStorage)
      const holder = storageKeyHolders.get(key)
      if (holder && isLiveEditor(holder)) {
        console.warn(
          `formeo: another editor on this page already saves to sessionStorage key "${key}". ` +
            `Give each editor its own key, e.g. sessionStorage: 'orders-form'.`
        )
      }
      storageKeyHolders.set(key, this)
    }

    // Load remote resources such as css and svg sprite
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.#onDOMContentLoaded, { once: true })
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
    if (this.isDestroyed) {
      return
    }
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
    document.removeEventListener('DOMContentLoaded', this.#onDOMContentLoaded)
    if (this.isDestroyed) {
      return
    }
    this.#initState = INIT_STATES.LOADING_RESOURCES

    const storedLocale = globalThis.sessionStorage?.getItem(SESSION_LOCALE_KEY)
    const promises = [
      fetchIcons(this.opts.svgSprite),
      fetchFormeoStyle(this.opts.style),
      i18n.init({
        preloaded: { 'en-US': enUS },
        ...this.opts.i18n,
        // a locale picked with setLang() wins; otherwise keep the configured one (a null would reset it to en-US)
        ...(storedLocale && { locale: storedLocale }),
      }),
    ].filter(Boolean)

    try {
      await Promise.all(promises)

      if (this.isDestroyed) {
        return
      }

      if (this.opts.allowEdit) {
        this.init()
      }
    } catch (error) {
      if (this.isDestroyed) {
        return
      }
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
    if (this.isDestroyed) {
      return Promise.resolve(this)
    }

    // Prevent re-initialization while already initializing
    if (this.#initState === INIT_STATES.INITIALIZING) {
      return this.#initPromise
    }

    // If already ready, just refresh UI (for language changes)
    if (this.#initState === INIT_STATES.READY) {
      return this.#refreshUI()
    }

    this.#initState = INIT_STATES.INITIALIZING

    this.#initPromise = new Controls(this.Components)
      .init(this.opts.controls, this.opts.stickyControls)
      .then(controls => {
        if (this.isDestroyed) {
          // destroyed while the controls were being built: release them, they were never on the page
          controls.destroy()
          return this
        }
        this.controls = controls
        this.Components.controls = controls

        // Only load data on FIRST init - prevents race condition
        if (!this.#dataLoadedOnce) {
          this.#loadInitialData()
          this.#dataLoadedOnce = true
        }

        this.formId = this.Components.get('id')
        this.i18n = {
          setLang: this.#setLanguage.bind(this),
        }

        this.render()
        // a formeoLoaded callback run by render() can destroy the editor
        if (this.isDestroyed) {
          return this
        }
        // kept on the instance so destroy() (#166) can remove it
        this.onResize = this.events.onResizeWindow
        window.addEventListener('resize', this.onResize)
        this.#initState = INIT_STATES.READY
        this.opts.onLoad?.(this)
        if (this.isDestroyed) {
          return this
        }
        this.tooltipInstance = new SmartTooltip()
        pageTooltip = this.tooltipInstance

        return this
      })
      .catch(error => {
        if (this.isDestroyed) {
          return this
        }
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
    if (this.isDestroyed) {
      return this
    }
    const controls = await new Controls(this.Components).init(this.opts.controls, this.opts.stickyControls)
    if (this.isDestroyed) {
      controls.destroy()
      return this
    }
    this.controls = controls
    this.Components.controls = this.controls
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
      const sessionData = sessionStorage.get(formDataStorageKey(this.opts.sessionStorage))
      if (sessionData) {
        return sessionData
      }
    }

    // Priority 3: Default empty form
    return DEFAULT_FORMDATA()
  }

  load(formData = this.userFormData, opts = this.opts) {
    if (this.isDestroyed) {
      return
    }
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
   * Check if destroy() was called
   * @return {boolean}
   */
  get isDestroyed() {
    return this.#initState === INIT_STATES.DESTROYED
  }

  /**
   * Wait for the editor to be ready
   * @return {Promise} resolves when editor is ready
   */
  async whenReady() {
    if (this.#initState === INIT_STATES.READY) {
      return this
    }
    if (this.isDestroyed) {
      return Promise.reject(new Error('Editor was destroyed'))
    }
    if (this.#initState === INIT_STATES.ERROR) {
      return Promise.reject(new Error('Editor initialization failed'))
    }
    if (this.#initPromise) {
      return this.#initPromise.then(editor => {
        if (this.isDestroyed) {
          throw new Error('Editor was destroyed')
        }
        return editor
      })
    }
    // Fallback: poll for ready state
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (this.#initState === INIT_STATES.READY) {
          resolve(this)
        } else if (this.isDestroyed) {
          reject(new Error('Editor was destroyed'))
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
    if (this.isDestroyed) {
      return
    }
    if (!this.controls) {
      return globalThis.requestAnimationFrame(() => this.render())
    }

    this.stages = Object.values(this.Components.get('stages'))
    // with page tabs the stages live inside the pages wrapper, which takes their place (#122)
    const stageArea = this.pages ? [this.pages.render()] : this.stages.map(({ dom }) => dom)
    if (this.opts.controlOnLeft) {
      for (const element of stageArea) {
        element.style.order = 1
      }
    }
    const elemConfig = {
      attrs: {
        className: 'formeo formeo-editor',
        id: this.formId,
      },
      content: [stageArea],
    }

    if (i18n.current.dir) {
      elemConfig.attrs.dir = i18n.current.dir
      dom.dir = i18n.current.dir
    }

    this.editor = dom.create(elemConfig)

    const controlsContainer = this.controls.container || this.editor
    if (controlsContainer) {
      if (controlsContainer !== this.editor) {
        dom.empty(controlsContainer)
      }
      controlsContainer.appendChild(this.controls.dom)
    }

    if (!this.editorContainer && this.editorContainerOption) {
      this.editorContainer = dom.resolveContainer(this.editorContainerOption) || null
      if (!this.editorContainer) {
        console.warn(
          `Formeo: editorContainer ${String(this.editorContainerOption)} was not found, so the editor was not added to the page.`
        )
      }
    }

    if (this.editorContainer) {
      dom.empty(this.editorContainer)
      this.editorContainer.appendChild(this.editor)
    }

    this.events.formeoLoaded(this)
  }

  /**
   * Remove the editor from the page and release what it holds: its Sortable instances, resize
   * observers, window resize listener, pending callbacks and loaded components. Other editors on
   * the page keep working, and a new editor can mount in the same container.
   * Safe to call more than once, and before the editor is ready.
   * @return {void}
   */
  destroy() {
    if (this.isDestroyed) {
      return
    }
    this.#initState = INIT_STATES.DESTROYED
    document.removeEventListener('DOMContentLoaded', this.#onDOMContentLoaded)
    window.removeEventListener('resize', this.onResize)
    // first, so nothing torn down below can still reach the integrator's callbacks
    this.events.destroy()
    // before pages: Controls#destroy's active-drag guard needs Sortable.active to still be the controls'
    // own drag; releasing the tabs' Sortables first would otherwise end it early and orphan its ghost (#122)
    this.controls?.destroy()
    // discards an open rename rather than saving it, since the events are already gone
    this.pages?.destroy()

    if (this.opts.sessionStorage) {
      const key = formDataStorageKey(this.opts.sessionStorage)
      if (storageKeyHolders.get(key) === this) {
        storageKeyHolders.delete(key)
      }
    }

    destroySortables(this.editor)

    for (const type of ['stages', 'rows', 'columns', 'fields']) {
      for (const component of Object.values(this.Components[type]?.data || {})) {
        component.panels?.destroy()
      }
      this.Components[type]?.empty()
    }

    this.editor?.remove()
    this.Components.empty()

    // the page-wide tooltip serves every editor, so it goes only with the last one
    if (pageTooltip && !document.querySelector('.formeo-editor')) {
      pageTooltip.destroy()
      pageTooltip = null
    }
    this.tooltipInstance = null

    this.editor = null
    this.controls = null
    this.Components.controls = null
    this.stages = []
  }
}

export { INIT_STATES }
export default FormeoEditor
