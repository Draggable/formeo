import dom from '../../common/dom.js'
import { destroySortables } from '../../common/sortable.js'
import { pageText } from './page-text.mjs'

/**
 * Creates an element with attributes, text and children. Titles are user data, so text is never parsed as HTML.
 * @param {String} tag
 * @param {Object} [props] className, text, and attributes to set
 * @param {Array<Node>} [children]
 * @return {HTMLElement}
 */
const el = (tag, { className, text, ...attrs } = {}, children = []) => {
  const node = document.createElement(tag)
  if (className) {
    node.className = className
  }
  if (text !== undefined) {
    node.textContent = text
  }
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value)
  }
  node.append(...children)
  return node
}

/**
 * Page tabs for one editor (#122): each stage is a page. Created by FormeoEditor when its `pages` option is on.
 * Holds no page-wide state, so every editor on a page has its own tabs.
 */
export class EditorPages {
  /**
   * @param {Components} components the editor's Components
   */
  constructor(components) {
    this.components = components
    this.activeId = null
    this.activeIndex = -1
    this.wrapper = null
    this.tablist = null
    this.status = null
    this.renaming = null
    this.flashTimers = new Set()
    this.stageListeners = new Map()
  }

  get stages() {
    return this.components.stages
  }

  /** @return {String[]} stage ids in page order */
  get ids() {
    return Object.keys(this.stages.data)
  }

  get count() {
    return this.ids.length
  }

  /** @return {Number} 0-based index of the active page */
  get index() {
    return Math.max(0, this.ids.indexOf(this.activeId))
  }

  tabId(stageId) {
    return `${this.components.instanceId}-page-tab-${stageId}`
  }

  wrapFor(stageId) {
    return [...(this.tablist?.children || [])].find(wrap => wrap.dataset.stageId === stageId)
  }

  tabFor(stageId) {
    return this.wrapFor(stageId)?.querySelector('.formeo-page-tab')
  }

  titleOf(stageId) {
    return this.stages.pageTitle(this.stages.get(stageId), this.ids.indexOf(stageId))
  }

  stageAt(stageIdOrIndex) {
    const id = typeof stageIdOrIndex === 'number' ? this.ids[stageIdOrIndex] : stageIdOrIndex
    return id && Object.hasOwn(this.stages.data, id) ? this.stages.get(id) : undefined
  }

  isRtl() {
    return this.tablist?.closest('[dir]')?.getAttribute('dir') === 'rtl'
  }

  /**
   * Builds the tab bar and a wrapper holding it and every stage. Called by FormeoEditor#render; keeps the active
   * page when it still exists, otherwise starts on the first page. Never fires onPageChange.
   * @return {HTMLElement} .formeo-pages-editor
   */
  render() {
    this.teardown()
    const ids = this.ids
    if (!ids.includes(this.activeId)) {
      this.activeId = ids[0] ?? null
    }
    for (const id of [...this.stageListeners.keys()]) {
      if (!ids.includes(id)) {
        this.unwatchStage(id)
      }
    }
    for (const id of ids) {
      this.watchStage(this.stages.get(id))
    }

    this.tablist = el('div', { className: 'formeo-page-tabs', role: 'tablist', 'aria-label': pageText('pages.label') })
    this.tablist.addEventListener('click', this.onClick)
    this.tablist.addEventListener('dblclick', this.onDblClick)
    this.tablist.addEventListener('keydown', this.onKeydown)

    const addLabel = pageText('pages.add')
    const addButton = el('button', {
      className: 'formeo-page-add',
      type: 'button',
      'aria-label': addLabel,
      title: addLabel,
    })
    addButton.innerHTML = dom.icon('plus')
    addButton.addEventListener('click', () => this.add())

    this.status = el('span', { className: 'formeo-pages-status', 'aria-live': 'polite' })
    const bar = el('div', { className: 'formeo-pages-bar' }, [this.tablist, addButton, this.status])
    this.wrapper = el('div', { className: 'formeo-pages-editor' }, [bar, ...ids.map(id => this.stages.get(id).dom)])

    this.createTabSorter()
    this.rebuildTabs()
    if (this.activeId) {
      this.stages.active = this.stages.get(this.activeId)
    }
    return this.wrapper
  }

  renderTab(stageId, index) {
    const title = this.stages.pageTitle(this.stages.get(stageId), index)
    const tab = el('button', {
      className: 'formeo-page-tab',
      type: 'button',
      role: 'tab',
      id: this.tabId(stageId),
      'aria-controls': stageId,
      text: title,
    })
    const wrap = el('div', { className: 'formeo-page-tab-wrap', role: 'presentation', 'data-stage-id': stageId }, [tab])
    if (this.count > 1) {
      const label = pageText('pages.remove', { title })
      const remove = el('button', {
        className: 'formeo-page-remove',
        type: 'button',
        tabindex: '-1',
        'aria-label': label,
        title: label,
      })
      remove.innerHTML = dom.icon('remove')
      wrap.append(remove)
    }
    return wrap
  }

  /** Re-creates every tab (after an add or a removal) */
  rebuildTabs() {
    this.commitRename()
    for (const wrap of this.tablist.children) {
      destroySortables(wrap)
    }
    this.tablist.replaceChildren(...this.ids.map((id, index) => this.renderTab(id, index)))
    for (const wrap of this.tablist.children) {
      this.createDropTarget(wrap, wrap.dataset.stageId)
    }
    this.sync()
  }

  /** Shows the active stage, hides the rest, and updates the tabs' selection state */
  sync() {
    const ids = this.ids
    this.activeIndex = ids.indexOf(this.activeId)
    for (const id of ids) {
      const selected = id === this.activeId
      const { dom: stageDom } = this.stages.get(id)
      stageDom.hidden = !selected
      stageDom.setAttribute('role', 'tabpanel')
      stageDom.setAttribute('aria-labelledby', this.tabId(id))
      const tab = this.tabFor(id)
      if (tab) {
        tab.setAttribute('aria-selected', String(selected))
        tab.tabIndex = selected ? 0 : -1
      }
    }
    this.wrapper?.setAttribute('data-page-count', String(ids.length))
  }

  /** Re-titles every tab, e.g. after a rename, or renumbers untitled pages after a move */
  refreshLabels() {
    this.ids.forEach((id, index) => {
      const title = this.stages.pageTitle(this.stages.get(id), index)
      const tab = this.tabFor(id)
      if (tab) {
        tab.textContent = title
      }
      const remove = this.wrapFor(id)?.querySelector('.formeo-page-remove')
      if (remove) {
        const label = pageText('pages.remove', { title })
        remove.setAttribute('aria-label', label)
        remove.title = label
      }
    })
  }

  /**
   * Shows a page
   * @param {String|Number} stageIdOrIndex
   * @param {Object} [options]
   * @param {Boolean} [options.focus] move focus to its tab
   */
  activate(stageIdOrIndex, { focus = false } = {}) {
    const stage = this.stageAt(stageIdOrIndex)
    if (!stage) {
      return
    }
    this.commitRename()
    const previousStageId = this.activeId
    const previousPage = this.activeIndex
    this.activeId = stage.id
    this.stages.active = stage
    this.sync()
    if (focus) {
      this.tabFor(stage.id)?.focus()
    }
    if (previousStageId && previousStageId !== stage.id) {
      this.components.events.formeoPageChanged({
        src: this.tablist?.isConnected ? this.tablist : undefined,
        page: this.activeIndex,
        previousPage,
        stageId: stage.id,
        previousStageId,
      })
    }
  }

  /**
   * Appends a page and switches to it
   * @param {Object} [options]
   * @param {String} [options.title] its config.title; empty shows "Page {n}"
   * @return {Stage}
   */
  add({ title = '' } = {}) {
    const previousValue = this.ids
    const stage = this.stages.add(null, { config: { title } })
    this.components.events.formeoUpdated({
      entity: stage,
      componentId: stage.id,
      componentType: stage.name,
      dataPath: 'stages',
      changePath: 'stages',
      value: this.ids,
      previousValue,
      changeType: 'added',
    })
    this.watchStage(stage)
    this.wrapper?.append(stage.dom)
    if (this.tablist) {
      this.rebuildTabs()
    }
    this.activate(stage.id, { focus: true })
    return stage
  }

  /** Relabels a tab when its stage's config.title changes, from its tab or from the edit panel */
  watchStage(stage) {
    if (!stage || this.stageListeners.has(stage.id)) {
      return
    }
    const listener = ({ path }) => {
      const changed = Array.isArray(path) ? path.join('.') : String(path)
      if (changed === 'config' || changed === 'config.title') {
        this.refreshLabels()
      }
    }
    stage.addEventListener('onUpdate', listener)
    this.stageListeners.set(stage.id, { stage, listener })
  }

  unwatchStage(stageId) {
    const watched = this.stageListeners.get(stageId)
    if (watched) {
      watched.stage.removeEventListener('onUpdate', watched.listener)
      this.stageListeners.delete(stageId)
    }
  }

  /**
   * Says something to screen readers through the bar's live region
   * @param {String} text
   */
  announce(text) {
    if (this.status) {
      this.status.textContent = ''
      this.status.textContent = text
    }
  }

  onClick = ({ target }) => {
    const remove = target.closest('.formeo-page-remove')
    if (remove) {
      return this.requestRemove(remove.closest('.formeo-page-tab-wrap').dataset.stageId)
    }
    const tab = target.closest('.formeo-page-tab')
    if (tab) {
      this.activate(tab.closest('.formeo-page-tab-wrap').dataset.stageId, { focus: true })
    }
  }

  onDblClick = ({ target }) => {
    const tab = target.closest('.formeo-page-tab')
    if (tab) {
      this.startRename(tab.closest('.formeo-page-tab-wrap').dataset.stageId)
    }
  }

  onKeydown = evt => {
    const tab = evt.target.closest?.('.formeo-page-tab')
    if (!tab) {
      // e.g. the rename input: its keys edit text
      return
    }
    const stageId = tab.closest('.formeo-page-tab-wrap').dataset.stageId
    const ids = this.ids
    const index = ids.indexOf(stageId)
    const rtl = this.isRtl()
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[evt.key]
    const handled = () => {
      evt.preventDefault()
      evt.stopPropagation()
    }

    if (step && evt.altKey) {
      handled()
      return this.movePage(stageId, index + step)
    }
    const target = {
      ArrowRight: () => ids[(index + step + ids.length) % ids.length],
      ArrowLeft: () => ids[(index + step + ids.length) % ids.length],
      Home: () => ids[0],
      End: () => ids.at(-1),
    }[evt.key]?.()
    if (target) {
      handled()
      return this.activate(target, { focus: true })
    }
    if (evt.key === 'F2') {
      handled()
      return this.startRename(stageId)
    }
    if (evt.key === 'Delete') {
      handled()
      return this.requestRemove(stageId)
    }
  }

  // Task 7 replaces these two
  startRename(_stageId) {}
  commitRename() {}

  // Task 8 replaces this
  requestRemove(_stageId) {}

  // Task 9 replaces these two
  movePage(_stageId, _toIndex) {}
  createTabSorter() {}

  // Task 10 replaces this
  createDropTarget(_wrap, _stageId) {}

  /** Releases the bar's Sortables and timers; the stages keep their DOM */
  teardown() {
    this.commitRename()
    if (this.tablist) {
      destroySortables(this.tablist)
    }
    for (const timer of this.flashTimers) {
      clearTimeout(timer)
    }
    this.flashTimers.clear()
  }

  /** Releases everything this editor's page tabs hold. FormeoEditor#destroy calls it. */
  destroy() {
    this.teardown()
    for (const id of [...this.stageListeners.keys()]) {
      this.unwatchStage(id)
    }
    // undo what sync() set on each stage, so its DOM is back to a plain stage
    for (const id of this.ids) {
      const stageDom = this.stages.get(id)?.dom
      if (stageDom?.getAttribute('aria-labelledby') === this.tabId(id)) {
        stageDom.hidden = false
        stageDom.removeAttribute('role')
        stageDom.removeAttribute('aria-labelledby')
      }
    }
    this.wrapper = null
    this.tablist = null
    this.status = null
  }
}

export default EditorPages
