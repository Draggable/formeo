import Sortable from 'sortablejs'
import dom from '../../common/dom.js'
import { destroySortables } from '../../common/sortable.js'
import { Dialog } from '../dialog.js'
import { pageText } from './page-text.mjs'

/** How long a tab stays highlighted after content moves to its page, in ms */
const FLASH_DURATION = 1000

/**
 * How long the live region stays empty before an announcement, in ms. Screen readers need to see it change, and a
 * message set in the same task it was cleared in (e.g. a second "Moved to Account") may not be read again.
 */
export const ANNOUNCE_DELAY = 100

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
    // stage id => timer ending its tab's flash
    this.flashTimers = new Map()
    this.announceTimer = null
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
    // a load() of the same ids brings new Stage objects: move their listeners over
    for (const [id, { stage }] of [...this.stageListeners]) {
      if (!ids.includes(id) || this.stages.get(id) !== stage) {
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
    addButton.addEventListener('click', () => this.requestAdd())

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
   * The + tab: onBeforeAdd decides whether and when a page is added (#281)
   * @return {Boolean|Promise<Boolean>} see Events#before
   */
  requestAdd() {
    return this.components.events.before('add', { componentType: 'stage', index: this.count }, () => this.add(), {
      src: this.tablist,
    })
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
    const { status } = this
    if (!status) {
      return
    }
    clearTimeout(this.announceTimer)
    status.textContent = ''
    this.announceTimer = setTimeout(() => {
      this.announceTimer = null
      status.textContent = text
    }, ANNOUNCE_DELAY)
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

  /**
   * Swaps a tab for a text input holding the page's title
   * @param {String} stageId
   */
  startRename(stageId) {
    this.commitRename()
    const tab = this.tabFor(stageId)
    if (!tab) {
      return
    }
    const stage = this.stages.get(stageId)
    const input = el('input', {
      className: 'formeo-page-title-input',
      type: 'text',
      'aria-label': pageText('pages.rename'),
      placeholder: this.titleOf(stageId),
    })
    input.value = stage.get('config.title') || ''
    input.addEventListener('keydown', evt => {
      if (evt.key === 'Enter' || evt.key === 'Escape') {
        evt.preventDefault()
        evt.stopPropagation()
        this.commitRename({ save: evt.key === 'Enter', focus: true })
      }
    })
    input.addEventListener('blur', () => this.commitRename())
    tab.hidden = true
    tab.after(input)
    // the Stage itself, not just its id: a load() of the same ids swaps in new Stage objects under an open rename
    this.renaming = { stageId, stage, input, tab }
    input.focus()
    input.select()
  }

  /**
   * Ends a rename in progress
   * @param {Object} [options]
   * @param {Boolean} [options.save] keep the typed title (false on Escape)
   * @param {Boolean} [options.focus] focus the tab afterwards
   */
  commitRename({ save = true, focus = false } = {}) {
    const renaming = this.renaming
    if (!renaming) {
      return
    }
    // cleared first: removing the input blurs it, which calls this again
    this.renaming = null
    const stage = this.stages.get(renaming.stageId)
    const title = renaming.input.value.trim()
    // text typed against a stage that has since been reloaded or removed is stale: discard it
    if (save && stage === renaming.stage && title !== (stage.get('config.title') || '')) {
      stage.set('config.title', title)
    }
    renaming.input.remove()
    renaming.tab.hidden = false
    this.refreshLabels()
    if (focus) {
      renaming.tab.focus()
    }
  }

  /**
   * Asks onBeforeRemove, then the editor's actions.remove.page, to remove a page (#281); the last page is never offered
   * @param {String} stageId
   */
  requestRemove(stageId) {
    const stage = this.stageAt(stageId)
    if (!stage || this.count <= 1) {
      return
    }
    this.commitRename()
    const index = this.ids.indexOf(stageId)
    const title = this.titleOf(stageId)
    const isEmpty = !stage.children.length
    const { events, actions } = this.components
    return events.before(
      'remove',
      { component: stage, componentType: stage.name, componentId: stageId, index, title, isEmpty },
      () => {
        // re-read: the page may have gained content, or been removed some other way, while the hook waited (#281)
        const currentStage = this.stageAt(stageId)
        if (!currentStage || this.count <= 1) {
          return
        }
        actions.remove.page({
          stage: currentStage,
          stageId,
          index: this.ids.indexOf(stageId),
          title: this.titleOf(stageId),
          isEmpty: !currentStage.children.length,
          removeAction: () => this.removePage(stageId),
        })
      },
      { src: stage.dom, guardKey: `remove:${stageId}` }
    )
  }

  /**
   * Removes a page with everything on it, then shows its neighbour
   * @param {String} stageId
   * @return {Boolean} whether it was removed
   */
  removePage(stageId) {
    const stage = this.stageAt(stageId)
    if (!stage || this.count <= 1) {
      return false
    }
    const index = this.ids.indexOf(stageId)
    const wasActive = this.activeId === stageId
    const previousPage = this.activeIndex
    this.unwatchStage(stageId)
    stage.remove()
    const remaining = this.ids
    this.rebuildTabs()
    if (wasActive) {
      // rebuildTabs() re-synced activeIndex against the remaining pages; onPageChange reports the removed page's index
      this.activeIndex = previousPage
      this.activate(remaining[Math.max(0, index - 1)], { focus: true })
    } else {
      this.tabFor(this.activeId)?.focus()
    }
    return true
  }

  /** Tabs can be dragged along the tablist to reorder pages */
  createTabSorter() {
    Sortable.create(this.tablist, {
      animation: 150,
      direction: 'horizontal',
      draggable: '.formeo-page-tab-wrap',
      handle: '.formeo-page-tab',
      filter: '.formeo-page-title-input',
      preventOnFilter: false,
      forceFallback: true,
      fallbackTolerance: 5,
      group: { name: `page-tabs-${this.components.instanceId}`, pull: false, put: false },
      onEnd: () => this.reorderFromDom(),
    })
  }

  /** Puts the pages in the order their tabs now have; a rename in progress on another tab is committed first */
  reorderFromDom() {
    this.commitRename()
    const ids = [...this.tablist.children].map(wrap => wrap.dataset.stageId)
    if (this.stages.reorder(ids)) {
      this.afterReorder()
    } else {
      this.orderTabs()
    }
  }

  /**
   * Moves a page to a new position (Alt+ArrowLeft/Right)
   * @param {String} stageId
   * @param {Number} toIndex
   */
  movePage(stageId, toIndex) {
    const ids = this.ids
    if (toIndex < 0 || toIndex >= ids.length || ids.indexOf(stageId) === toIndex) {
      return
    }
    const order = ids.filter(id => id !== stageId)
    order.splice(toIndex, 0, stageId)
    if (this.stages.reorder(order)) {
      this.afterReorder()
      this.tabFor(stageId)?.focus()
    }
  }

  /** Puts the tabs back in page order, e.g. when a reorder was refused */
  orderTabs() {
    for (const id of this.ids) {
      const wrap = this.wrapFor(id)
      if (wrap) {
        this.tablist.append(wrap)
      }
    }
  }

  afterReorder() {
    this.orderTabs()
    for (const id of this.ids) {
      this.wrapper?.append(this.stages.get(id).dom)
    }
    this.refreshLabels()
    this.sync()
  }

  /**
   * Makes a tab accept rows, columns, fields and controls from this editor; what lands on it goes to the end
   * of its page, and the page on screen stays the same
   * @param {HTMLElement} wrap .formeo-page-tab-wrap
   * @param {String} stageId
   */
  createDropTarget(wrap, stageId) {
    const group = name => `${name}-${this.components.instanceId}`
    Sortable.create(wrap, {
      group: { name: group('page-tab'), pull: false, put: ['stage', 'row', 'column', 'controls'].map(group) },
      sort: false,
      // nothing in a tab is draggable from here: tabs are dragged by the tablist's own Sortable
      draggable: '.formeo-page-drop-item',
      onAdd: evt => this.onTabDrop(evt, stageId),
    })
  }

  /**
   * Moves what was dropped on a tab to the end of that tab's page. The target stage's own onAdd sorts out
   * what it becomes: a row moves, a column gets a new row, a field a new row and column, a control its field.
   */
  onTabDrop({ item, from }, stageId) {
    const stage = this.stageAt(stageId)
    if (!stage) {
      return
    }
    const children = stage.dom.querySelector('.children')
    children.appendChild(item)
    stage.onAdd({ from, to: children, item, newIndex: children.children.length - 1 })
    this.afterMove(stageId)
  }

  /**
   * Moves a row to the end of another page ("Move to page")
   * @param {Row} row
   * @param {String} stageId
   * @return {Boolean} whether it moved
   */
  moveToPage(row, stageId) {
    const stage = this.stageAt(stageId)
    const source = row?.parent
    // only rows: a column or field moved on its own would be left without a parent
    if (row?.name !== 'row' || !stage || !source || source === stage) {
      return false
    }
    stage.dom.querySelector('.children').appendChild(row.dom)
    for (const changed of [stage, source]) {
      changed.saveChildOrder()
      changed.emptyClass()
    }
    this.afterMove(stageId)
    return true
  }

  /**
   * Asks which page a row should move to, then moves it there
   * @param {Row} row
   */
  openMoveDialog(row) {
    const currentId = row?.parent?.id
    const targets = this.ids.filter(id => id !== currentId)
    if (row?.name !== 'row' || !targets.length) {
      return
    }
    const label = pageText('pages.moveTo')
    const select = el(
      'select',
      { name: 'page', className: 'move-to-page-select', 'aria-label': label },
      targets.map(id => el('option', { value: id, text: this.titleOf(id) }))
    )
    new Dialog({
      title: label,
      className: 'move-to-page-dialog',
      content: select,
      confirmText: () => pageText('pages.move'),
      onConfirm: formData => this.moveToPage(row, String(formData.get('page'))),
    }).open()
  }

  /**
   * Highlights a page's tab for a moment and announces "Moved to {title}"
   * @param {String} stageId
   */
  afterMove(stageId) {
    const wrap = this.wrapFor(stageId)
    if (wrap) {
      clearTimeout(this.flashTimers.get(stageId))
      wrap.classList.add('formeo-page-tab-flash')
      this.flashTimers.set(
        stageId,
        setTimeout(() => {
          wrap.classList.remove('formeo-page-tab-flash')
          this.flashTimers.delete(stageId)
        }, FLASH_DURATION)
      )
    }
    this.announce(pageText('pages.moved', { title: this.titleOf(stageId) }))
  }

  /** Releases the bar's Sortables (the tab sorter and every tab's drop target) and timers; the stages keep their DOM */
  teardown() {
    this.commitRename()
    if (this.tablist) {
      destroySortables(this.tablist)
    }
    for (const timer of this.flashTimers.values()) {
      clearTimeout(timer)
    }
    this.flashTimers.clear()
    clearTimeout(this.announceTimer)
    this.announceTimer = null
  }

  /**
   * Releases everything this editor's page tabs hold. FormeoEditor#destroy calls it, after the editor's events are
   * gone, so an open rename is discarded rather than saved: nothing may change the form while it is torn down.
   */
  destroy() {
    this.commitRename({ save: false })
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
