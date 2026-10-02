/* global MutationObserver */

import Sortable from 'sortablejs'
import animate from '../common/animation.js'
import dom from '../common/dom.js'
import { forEach, indexOfNode, isInt, map } from '../common/helpers.mjs'
import { destroySortables } from '../common/sortable.js'
import { clone, componentType, identity, merge, remove, unique, uuid } from '../common/utils/index.mjs'
import { get, objectFromStringArray } from '../common/utils/object.mjs'
import { splitAddress, toTitleCase, trimKeyPrefix } from '../common/utils/string.mjs'
import {
  ANIMATION_SPEED_BASE,
  CHILD_TYPE_MAP,
  COLUMN_CLASSNAME,
  COMPONENT_TYPE_CLASSNAMES,
  COMPONENT_TYPE_MAP,
  CONTROL_GROUP_CLASSNAME,
  EVENT_FORMEO_REMOVED_COLUMN,
  EVENT_FORMEO_REMOVED_FIELD,
  EVENT_FORMEO_REMOVED_ROW,
  PARENT_TYPE_MAP,
  PROPERTY_OPTIONS,
} from '../constants.js'
import { CONTROL_SET, controlSetDropTarget, insertControlSet } from './controls/control-set.mjs'
import Data from './data.js'
import { configOptionsOf } from './edit-panel/config-options.mjs'
import EditPanel from './edit-panel/edit-panel.js'
import Panels from './panels.js'
import { pageText } from './stages/page-text.mjs'

const propertyOptions = objectFromStringArray(PROPERTY_OPTIONS)

export default class Component extends Data {
  /**
   * @param {String} name 'stage' | 'row' | 'column' | 'field'
   * @param {Object} dataArg component data
   * @param {Components} components the editor this component belongs to (required, there is no default)
   */
  constructor(name, dataArg = {}, components) {
    const data = { ...dataArg, id: dataArg.id || uuid() }
    super(name, data)
    this.components = components
    this.id = data.id
    this.shortId = this.id.slice(0, this.id.indexOf('-'))
    this.name = name
    this.indexName = `${name}s`
    this.config = { ...data.config, ...components[`${this.name}s`].config }
    this.address = `${this.name}s.${this.id}`
    this.dataPath = `${this.address}.`
    // this.observer = new window.MutationObserver(this.mutationHandler)
    this.editPanels = new Map()
    this.eventListeners = new Map()
    this.initEventHandlers()
  }

  get dom() {
    return this._dom
  }

  /**
   * Keeps a reference from the element back to this component, see dom.remove and dom.asComponent
   * @param {HTMLElement} element
   */
  set dom(element) {
    this._dom = element
    if (element) {
      element.formeoComponent = this
    }
  }

  /**
   * Sortable group names are page-wide, so scope them to this editor
   * @param {String} name 'stage' | 'row' | 'column' | 'controls'
   * @return {String}
   */
  sortableGroup(name) {
    return `${name}-${this.components.instanceId}`
  }

  /**
   * Initialize event handlers based on config
   */
  initEventHandlers() {
    if (!this.config.events) {
      return
    }

    // Process each configured event and store them for later dispatch
    Object.entries(this.config.events).forEach(([eventName, handler]) => {
      this.addEventListener(eventName, handler)
    })
  }

  /**
   * Add an event listener to this component
   * @param {string} eventName - Name of the event
   * @param {function} handler - Event handler function
   */
  addEventListener(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName).push(handler)
  }

  /**
   * Remove an event listener from this component
   * @param {string} eventName - Name of the event
   * @param {function} handler - Event handler function to remove
   */
  removeEventListener(eventName, handler) {
    if (!this.eventListeners?.has(eventName)) {
      return
    }
    const handlers = this.eventListeners.get(eventName)
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * Dispatch a component event to all registered listeners
   * @param {string} eventName - Name of the event to dispatch
   * @param {object} eventData - Data to pass to event handlers
   */
  dispatchComponentEvent(eventName, eventData = {}) {
    // Create event data with component context
    const fullEventData = {
      component: this,
      target: this,
      type: eventName,
      timestamp: Date.now(),
      ...eventData,
    }

    // Call configured event handlers
    if (this.eventListeners?.has(eventName)) {
      this.eventListeners.get(eventName).forEach(handler => {
        try {
          if (typeof handler === 'function') {
            handler(fullEventData)
          }
        } catch (error) {
          console.error(`Error in ${eventName} event handler for ${this.name} ${this.id}:`, error)
        }
      })
    }

    return fullEventData
  }

  /**
   * Override Data.set to dispatch component update events
   */
  set(path, newVal) {
    const oldVal = this.get(path)
    const result = super.set(path, newVal)

    // Dispatch update event if value actually changed and it's not during initialization
    if (oldVal !== newVal && this.dom) {
      this.dispatchComponentEvent('onUpdate', {
        path,
        oldValue: oldVal,
        newValue: newVal,
      })
    }

    return result
  }

  // mutationHandler = mutations =>
  //   mutations.map(mutation => {
  //     @todo pull handler form config see dom.create.onRender for implementation pattern
  //   })

  // observe(container) {
  //   this.observer.disconnect()
  //   this.observer.observe(container, { childList: true })
  // }

  get js() {
    return this.data
  }
  get json() {
    return this.data
  }
  remove = path => {
    if (path) {
      const delPath = splitAddress(path)
      const delItem = delPath.pop()
      const parent = this.get(delPath)
      const previousValue = parent?.[delItem]
      if (Array.isArray(parent)) {
        if (isInt(delItem)) {
          parent.splice(Number(delItem), 1)
          this.dispatchRemovedPath(path, previousValue)
        } else {
          this.set(
            delPath,
            parent.filter(item => item !== delItem)
          )
        }
      } else {
        delete parent[delItem]
        this.dispatchRemovedPath(path, previousValue)
      }
      return parent
    }

    if (this.name === 'stage') {
      return this.removeStage()
    }

    const parent = this.parent
    const children = this.children
    const siblingsPath = `${parent.name}s.${parent.id}.children`
    const previousSiblings = [...(this.components.getAddress(siblingsPath) || [])]

    // Dispatch onRemove event before removal
    this.dispatchComponentEvent('onRemove', {
      path,
      parent,
      children: [...children], // copy array since children will be modified
    })

    forEach(children, child => child.remove())

    this.dom.remove()
    this.panels?.destroy()
    this.releaseSortables()
    remove(this.components.getAddress(siblingsPath), this.id)

    if (!parent.children.length) {
      parent.emptyClass()
    }

    if (parent.name === 'row') {
      parent.autoColumnWidths()
    }

    // Dispatch remove events based on component type
    const componentEventMap = {
      row: EVENT_FORMEO_REMOVED_ROW,
      column: EVENT_FORMEO_REMOVED_COLUMN,
      field: EVENT_FORMEO_REMOVED_FIELD,
    }

    const removeEvent = componentEventMap[this.name]
    if (removeEvent) {
      this.components.events.formeoUpdated(
        {
          componentId: this.id,
          componentType: this.name,
          parent: parent,
        },
        removeEvent
      )
    }

    const removedId = this.components[`${this.name}s`].delete(this.id)

    // A removal is a data change: let formeoUpdated/onUpdate/onChange listeners know (#246)
    this.components.events.formeoUpdated({
      entity: this,
      componentId: this.id,
      componentType: this.name,
      dataPath: `${parent.name}s.${parent.id}`,
      changePath: siblingsPath,
      value: [...(this.components.getAddress(siblingsPath) || [])],
      previousValue: previousSiblings,
      changeType: 'removed',
    })

    return removedId
  }

  /**
   * Announce that a property (attribute, option, condition) was removed from this component
   * @param {String|Array} path removed path, e.g. 'attrs.required' or 'options[1]'
   * @param {*} previousValue value that was removed
   */
  dispatchRemovedPath = (path, previousValue) => {
    const localPath = Array.isArray(path) ? path.join('.') : path
    this.components.events.formeoUpdated({
      entity: this,
      dataPath: this.address,
      changePath: `${this.address}.${localPath}`,
      value: undefined,
      previousValue,
      changeType: 'removed',
      data: this.data,
    })
  }

  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty() {
    const removed = this.children.map(child => {
      child.remove()

      return child
    })
    this.dom.classList.add('empty')
    return removed
  }

  /**
   * Apply empty class to element if does not have children
   */
  emptyClass = () => this.dom.classList.toggle('empty', !this.children.length)

  /**
   * Whether this component is still in its editor's store, i.e. hasn't been removed
   * @return {Boolean}
   */
  get isRegistered() {
    return this.components?.[`${this.name}s`]?.data?.[this.id] === this
  }

  /**
   * A one-shot remover for actions.remove.component: slides this component out, then removes it.
   * Later calls, and calls after the component was removed some other way, do nothing.
   * @return {Function}
   */
  createRemoveAction() {
    let called = false
    return () => {
      if (called || !this.isRegistered) {
        return
      }
      called = true
      animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
        if (!this.isRegistered) {
          return
        }
        if (this.name === 'column') {
          this.parent.autoColumnWidths()
        }
        this.remove()
      })
    }
  }

  /**
   * The canvas remove button: onBeforeRemove, then actions.remove.component, decide whether and when to remove (#281)
   * @return {Boolean|Promise<Boolean>} see Events#before
   */
  requestRemove() {
    const { events, actions } = this.components
    const detail = { component: this, componentType: this.name, componentId: this.id }
    return events.before(
      'remove',
      detail,
      () => {
        // the component may have been removed some other way while the hook waited (#281)
        if (!this.isRegistered) {
          return
        }
        actions.remove.component({ ...detail, removeAction: this.createRemoveAction() })
      },
      { src: this.dom, guardKey: `remove:${this.id}` }
    )
  }

  /**
   * The canvas clone button: onBeforeClone decides whether and when to clone (#281)
   * @return {Boolean|Promise<Boolean>} see Events#before
   */
  requestClone() {
    const detail = { component: this, componentType: this.name, componentId: this.id, parent: this.parent }
    return this.components.events.before(
      'clone',
      detail,
      () => {
        if (!this.isRegistered) {
          return
        }
        this.clone(this.parent)
        if (this.name === 'column') {
          this.parent.autoColumnWidths()
        }
      },
      { src: this.dom }
    )
  }

  /**
   * Move, close, and edit buttons for row, column and field
   * @return {Object} element config object
   */
  getActionButtons() {
    const hoverClassnames = [`hovering-${this.name}`, 'hovering']
    return {
      className: [`${this.name}-actions`, 'group-actions'],
      action: {
        mouseenter: () => {
          this.components.stages.active.dom.classList.add(`active-hover-${this.name}`)
          this.dom.classList.add(...hoverClassnames)
        },
        mouseleave: ({ target }) => {
          this.dom.classList.remove(...hoverClassnames)
          this.components.stages.active.dom.classList.remove(`active-hover-${this.name}`)
          target.removeAttribute('style')
        },
      },
      children: [
        {
          ...dom.btnTemplate({ content: dom.icon(`handle-${this.name}`) }),
          className: ['component-handle', `${this.name}-handle`],
        },
        {
          className: ['action-btn-wrap', `${this.name}-action-btn-wrap`],
          children: this.buttons,
        },
      ],
    }
  }

  getComponentTag = () => {
    return dom.create({
      tag: 'span',
      className: ['component-tag', `${this.name}-tag`],
      children: [dom.icon(`handle-${this.name}`), toTitleCase(this.name)].filter(Boolean),
    })
  }

  /**
   * Toggles the edit window; reports an actual open or close through onEditOpen/onEditClose (#316)
   * @param {Boolean} open whether to open or close the edit window
   */
  toggleEdit(open = !this.isEditing) {
    const changed = Boolean(open) !== Boolean(this.isEditing)
    this.isEditing = open
    const element = this.dom
    const editingClassName = 'editing'
    const editingComponentClassname = `${editingClassName}-${this.name}`
    const editWindow = this.dom.querySelector(`.${this.name}-edit`)
    animate.slideToggle(editWindow, ANIMATION_SPEED_BASE, open)

    if (this.name === 'field') {
      animate.slideToggle(this.preview, ANIMATION_SPEED_BASE, !open)
      element.parentElement.classList.toggle(`column-${editingComponentClassname}`, open)
    }

    element.classList.toggle(editingClassName, open)
    element.classList.toggle(editingComponentClassname, open)

    if (changed) {
      this.components.events.editToggled(this, open)
    }
  }

  get buttons() {
    if (this.actionButtons) {
      return this.actionButtons
    }

    const buttonConfig = {
      handle: (icon = `handle-${this.name}`) => ({
        ...dom.btnTemplate({ content: dom.icon(icon) }),
        className: ['component-handle'],
      }),
      move: (icon = 'move') => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ['item-move'],
          meta: {
            id: 'move',
          },
        }
      },
      edit: (icon = 'edit') => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ['edit-toggle'],
          meta: {
            id: 'edit',
          },
          action: {
            click: () => {
              this.toggleEdit()
            },
          },
        }
      },
      remove: (icon = 'remove') => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ['item-remove'],
          meta: {
            id: 'remove',
          },
          action: {
            click: () => this.requestRemove(),
          },
        }
      },
      clone: (icon = 'copy') => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ['item-clone'],
          meta: {
            id: 'clone',
          },
          action: {
            click: () => this.requestClone(),
          },
        }
      },
      page: (icon = 'page-move') => ({
        ...dom.btnTemplate({ content: dom.icon(icon), title: pageText('pages.moveTo') }),
        className: ['item-page'],
        meta: {
          id: 'page',
        },
        action: {
          click: () => this.components.pages?.openMoveDialog(this),
        },
      }),
    }

    const { buttons, disabled } = this.config.actionButtons
    // with page tabs every row gets "Move to page" before its remove button (#122); hide it with disabled: ['page']
    const pagesOn = Boolean(this.components.opts?.pages)
    let rowButtons = buttons
    if (pagesOn && this.name === 'row' && !buttons.includes('page')) {
      const at = buttons.indexOf('remove')
      rowButtons = at === -1 ? [...buttons, 'page'] : [...buttons.slice(0, at), 'page', ...buttons.slice(at)]
    }
    // only rows move between pages: a column or field moved on its own would be left without a parent
    const activeButtons = rowButtons.filter(
      btn => !disabled.includes(btn) && (btn !== 'page' || (pagesOn && this.name === 'row'))
    )
    const actionButtonsConfigs = activeButtons.map(btn => buttonConfig[btn]?.() || btn)

    this.actionButtons = actionButtonsConfigs

    return this.actionButtons
  }

  /**
   * helper that returns the index of the node minus the offset.
   */
  get index() {
    return indexOfNode(this.dom)
  }

  /**
   * Removes a class or classes from nodeList
   * @param  {String | Array} className
   */
  removeClasses = className => {
    const removeClass = {
      string: () => this.dom.classList.remove(className),
      array: () => className.map(name => this.dom.classList.remove(name)),
    }
    removeClass.object = removeClass.string // handles regex map
    return removeClass[dom.childType(className)](this.dom)
  }
  get parentType() {
    return PARENT_TYPE_MAP.get(this.name)
  }
  get parent() {
    const parentType = this.parentType
    if (!this.dom || !parentType) {
      return null
    }
    const parentDom = this.dom.closest(`.${COMPONENT_TYPE_CLASSNAMES[parentType]}`)
    return parentDom && dom.asComponent(parentDom)
  }
  get children() {
    if (!this.dom) {
      return []
    }
    const domChildren = this.domChildren
    const childGroup = CHILD_TYPE_MAP.get(this.name)
    return map(domChildren, child => this.components.getAddress(`${childGroup}s.${child.id}`)).filter(Boolean)
  }

  loadChildren = (children = this.data.children) => children.map(rowId => this.addChild({ id: rowId }))

  get domChildren() {
    const childWrap = this.dom.querySelector('.children')
    return childWrap ? childWrap.children : []
  }

  /**
   * Adds a child to the component
   * @param {Object|String} childData
   * @param {Number} index
   * @return {Object} child DOM element
   */
  addChild(childData = {}, index = this.domChildren.length) {
    let data = childData
    if (typeof childData !== 'object') {
      data = { id: data }
    }

    const childWrap = this.dom.querySelector('.children')
    const { id: childId = uuid() } = data
    const childGroup = CHILD_TYPE_MAP.get(this.name)
    if (!childGroup) {
      return null
    }

    const childComponentType = `${childGroup}s`

    const child =
      this.components.getAddress(`${childComponentType}.${childId}`) ||
      this.components[childComponentType].add(childId, data)

    if (index >= childWrap.children.length) {
      childWrap.appendChild(child.dom)
    } else {
      childWrap.children[index].before(child.dom)
    }

    // Dispatch enhanced onAddChild event on the parent
    this.dispatchComponentEvent('onAddChild', {
      parent: this,
      target: child,
      child,
      index,
    })

    // Dispatch onAdd event on the child component itself
    // This ensures onAdd is called whether the component is added via drag-drop or addChild
    child.dispatchComponentEvent('onAdd', {
      parent: this,
      target: child,
      index,
      addedVia: 'addChild', // indicate how the component was added
    })

    // Keep backwards compatibility
    this.config.events?.onAddChild?.({ parent: this, child })

    const grandChildren = child.get('children')
    if (grandChildren?.length) {
      child.loadChildren(grandChildren)
    }

    this.removeClasses('empty')
    this.saveChildOrder()
    return child
  }

  /**
   * Updates the children order for the current component
   */
  saveChildOrder = () => {
    if (this.render) {
      return
    }
    const newChildOrder = this.children.map(({ id }) => id)
    this.set('children', newChildOrder)
    return newChildOrder
  }

  /**
   * Method for handling onAdd for all components
   * @todo improve readability of this method
   * @param  {Object} evt
   * @return {Object} Component
   */
  onAdd({ from, to, item, newIndex }) {
    if (!from.classList.contains(CONTROL_GROUP_CLASSNAME)) {
      from = from.parentElement
    }
    const fromType = componentType(from)
    const toType = componentType(to.parentElement)
    const defaultOnAdd = () => {
      this.saveChildOrder()
      this.removeClasses('empty')
    }

    const depthMap = new Map([
      [
        -2,
        () => {
          const newChild = this.addChild({}, newIndex).addChild()
          return newChild.addChild.bind(newChild)
        },
      ],
      [
        -1,
        () => {
          const newChild = this.addChild({}, newIndex)
          return newChild.addChild.bind(newChild)
        },
      ],
      [0, () => this.addChild.bind(this)],
      [
        1,
        controlData => {
          const currentIndex = indexOfNode(this.dom)
          return () => this.parent.addChild(controlData, currentIndex + 1)
        },
      ],
      [2, controlData => () => this.parent.parent.addChild(controlData)],
    ])

    const onAddConditions = {
      controls: ({ componentType: controlType, data: componentData }) => {
        const targets = {
          stage: {
            row: 0,
            column: -1,
            field: -2,
          },
          row: {
            row: 1,
            column: 0,
            field: -1,
          },
          column: {
            row: 2,
            column: 1,
            field: 0,
          },
          field: 1,
        }
        const depth = get(targets, `${this.name}.${controlType}`)
        const action = depthMap.get(depth)()
        return action(componentData, newIndex)
      },
      row: () => {
        const targets = {
          stage: -1,
          row: 0,
          column: 1,
        }
        const action = (depthMap.get(targets[toType]) || identity)()
        return action?.({ id: item.id }, newIndex)
      },
      column: () => {
        const targets = {
          stage: -2,
          row: -1,
        }
        const action = (depthMap.get(targets[toType]) || identity)()
        return action?.(item.id)
      },
    }

    const finish = component => {
      // Dispatch the onAdd event to any configured handlers
      this.dispatchComponentEvent('onAdd', {
        from,
        to,
        item,
        newIndex,
        fromType,
        toType,
        addedComponent: component,
        addedVia: 'dragDrop', // indicate how the component was added
      })
      defaultOnAdd()
      return component
    }

    if (fromType !== 'controls') {
      return finish(onAddConditions[fromType]?.(item, newIndex))
    }

    // a new component from a control: onBeforeAdd decides whether and when (#281). The dragged placeholder goes
    // either way; addChild appends when newIndex is past the end, so a smaller list by then is fine.
    const control = this.components.controls.describeControl(item.id)
    dom.remove(item)
    const isControlSet = control.componentType === CONTROL_SET
    if (isControlSet && !control.data.fields.length) {
      // an empty control set adds nothing and runs no hook (#227)
      this.emptyClass()
      return undefined
    }
    let added
    let proceed = () => {
      if (this.isRegistered) {
        added = finish(onAddConditions.controls(control))
      }
    }
    let detail = { ...control, parent: this, index: newIndex, addedVia: 'dragDrop' }
    if (isControlSet) {
      // a control set is always a new row of the stage: at the drop index, or right after the row it was dropped in
      // (#227); the component that received the drop keeps its own children, so its empty state is recomputed
      const target = controlSetDropTarget(this, newIndex)
      detail = { ...control, parent: target.stage, index: target.index, addedVia: 'dragDrop' }
      proceed = () => {
        if (this.isRegistered && target.stage.isRegistered) {
          added = finish(insertControlSet(target.stage, control.data, target.index))
          this.emptyClass()
        }
      }
    }
    const result = this.components.events.before('add', detail, proceed, { src: this.dom })
    const restoreIfCancelled = proceeded => proceeded || (this.isRegistered && this.emptyClass())
    if (result instanceof Promise) {
      result.then(restoreIfCancelled)
    } else {
      restoreIfCancelled(result)
    }
    return added
  }

  /**
   * Save updated child order
   * @return {Array} updated child order
   */
  onSort = () => {
    return this.saveChildOrder()
  }

  /**
   * Destroy the Sortables of this removed component and its descendants, so Sortable's page-wide
   * list stops holding them (and through them the editor). A column emptied by a drag is removed
   * from inside Sortable's drop handler; destroying that Sortable there would end the drop early,
   * so during a drag it is released once the drop has finished.
   */
  releaseSortables() {
    const { dom: removedDom } = this
    if (Sortable.active) {
      queueMicrotask(() => destroySortables(removedDom))
      return
    }
    destroySortables(removedDom)
  }

  /**
   * Handler for removing content from a sortable component
   * @param  {Object} evt
   * @return {Array} updated child order
   */
  onRemove({ from: { parentElement: from } }) {
    if (from.classList.contains(COLUMN_CLASSNAME)) {
      from.classList.remove('column-editing-field')
    }

    // make this configurable
    if (this.name !== 'stage' && !this.children.length) {
      return this.remove()
    }

    this.emptyClass()

    return this.saveChildOrder()
  }

  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd = ({ to: { parentElement: to }, from: { parentElement: from } }) => {
    to?.classList.remove(`hovering-${componentType(to)}`)
    from?.classList.remove(`hovering-${componentType(from)}`)
  }

  /**
   * Callback for onRender, executes any defined onRender for component
   */
  onRender() {
    // Dispatch onRender event to new event system
    this.dispatchComponentEvent('onRender', {
      dom: this.dom,
    })

    // Keep backwards compatibility
    const { events } = this.config
    if (!events) {
      return null
    }
    events.onRender && dom.onRender(this.dom, events.onRender)
  }

  /**
   * Sets the configuration for the component. See src/demo/js/options/config.js for example
   * @param {Object} config - Configuration object with possible structures:
   * @param {Object} [config.all] - Global configuration applied to all components
   * @param {Object} [config[controlId]] - Configuration specific to a control type
   * @param {Object} [config[id]] - Configuration specific to a component instance
   * @description Merges configurations in order of precedence:
   * 1. Existing config (this.configVal)
   * 2. Global config (all)
   * 3. The control's own config panel keys (its definition's `configOptions`)
   * 4. Control type specific config
   * 5. Instance specific config
   * The merged result is stored in this.configVal
   */
  set config(config) {
    const allConfig = get(config, 'all')
    const controlId = get(this.data, 'config.controlId')
    // what the control itself declares sits beneath the editor's config for that control
    const controlOptions = controlId && this.components?.controls?.declaredConfigOptions?.(controlId)
    const controlConfig = controlOptions && { panels: { config: { options: controlOptions } } }
    const typeConfig = controlId && get(config, controlId)
    const idConfig = get(config, this.id)
    const mergedConfig = [allConfig, controlConfig, typeConfig, idConfig].reduce(
      (acc, cur) => (cur ? merge(acc, cur) : acc),
      this.configVal
    )

    this.configVal = mergedConfig
  }

  get config() {
    return this.configVal
  }

  // @todo remove, but first verify no longer needed
  runConditions = () => {
    const conditionsList = this.get('conditions')
    if (!conditionsList?.length) {
      return null
    }

    const processedConditions = conditionsList.map(conditions => {
      const ifCondition = this.processConditions(conditions.if)
      const thenResult = this.processResults(conditions.then)
      // loops through conditions, when one returns true, it executes the result
      return ifCondition.map(conditions => {
        return this.evaluateConditions(conditions) && this.execResults(thenResult)
      })
    })

    return processedConditions
  }

  getComponent(path) {
    const [type, id] = path.split('.')
    const group = this.components[type]
    return id === this.id ? this : group?.get(id)
  }

  value = (path, val) => {
    const splitPath = path.split('.')

    const component = this.getComponent(path)
    const property = component && splitPath.slice(2, splitPath.length).join('.')

    if ([!component, !property, !propertyOptions[property]].some(Boolean)) {
      return path
    }

    return val ? component.set(propertyOptions[property], val) : component.get(propertyOptions[property])
  }

  /**
   * Maps operators to their respective handler
   * @param {String} operator
   * @return {Function} action
   */
  getResult = operator => {
    const operatorMap = {
      '=': (target, propertyPath, value) => target.set(propertyPath, value),
    }
    return operatorMap[operator]
  }

  processResults = results => {
    return results.map(({ operator, target, value }) => {
      const targetComponent = this.getComponent(target)
      const propertyPath = targetComponent && target.split('.').slice(2, target.length).join('.')
      const processedResult = {
        target: targetComponent,
        propertyPath,
        action: this.getResult(operator),
        value: this.value(value),
      }
      return processedResult
    })
  }

  execResults = results => {
    const promises = results.map(result => {
      return this.execResult(result)
    })
    return Promise.all(promises)
  }

  execResult = ({ target, action, value, _propertyPath }) => {
    return new Promise((resolve, reject) => {
      // we dont know what this will be so try but fail gracefully
      try {
        return resolve(action(target, value))
      } catch (err) {
        return reject(err)
      }
    })
  }

  cloneData = () => {
    const clonedData = { ...clone(this.data), id: uuid() }
    if (this.name !== 'field') {
      clonedData.children = []
    }

    return clonedData
  }

  clone = (parent = this.parent) => {
    const newClone = parent.addChild(this.cloneData(), this.index + 1)
    if (this.name !== 'field') {
      this.cloneChildren(newClone)
    }

    // Dispatch clone event
    this.dispatchComponentEvent('onClone', {
      original: this,
      clone: newClone,
      parent,
    })

    return newClone
  }

  cloneChildren(toParent) {
    for (const child of this.children) {
      child?.clone(toParent)
    }
  }

  createChildWrap = children =>
    dom.create({
      tag: 'ul',
      attrs: {
        className: 'children',
      },
      children,
    })

  get isRow() {
    return this.name === COMPONENT_TYPE_MAP.row
  }
  get isColumn() {
    return this.name === COMPONENT_TYPE_MAP.column
  }
  get isField() {
    return this.name === COMPONENT_TYPE_MAP.field
  }

  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  propName
   * @return {Boolean}
   */
  isDisabledProp = (propName, kind = 'attrs') => {
    // if developer is explicitly setting a value, do not disable
    if (get(this.config, propName)) {
      return false
    }

    const disabledConfigProps = this.config?.disabled || []
    const isDisabledConfigProp = disabledConfigProps.includes(propName)

    if (isDisabledConfigProp) {
      return true
    }

    const basePropName = trimKeyPrefix(propName)
    const disabledPanelProps = this.config?.panels[kind]?.disabled || []
    const isDisabledPanelProp = disabledPanelProps.includes(basePropName)

    return isDisabledPanelProp
  }

  /**
   * Checks if property can be removed
   * @param  {String}  propName
   * @return {Boolean}
   */
  isLockedProp = (propName, kind = 'attrs') => {
    const lockedConfigProps = this.config?.locked || []
    const isLockedConfigProp = lockedConfigProps.includes(propName)

    if (isLockedConfigProp) {
      return true
    }

    const basePropName = trimKeyPrefix(propName)
    const lockedPanelProps = this.config?.panels[kind]?.locked || []
    const isLockedPanelProp = lockedPanelProps.includes(basePropName)

    if (isLockedPanelProp) {
      return true
    }

    return false
  }

  /**
   * Whether a panel shows its add button: `panels.<panel>.add: false` hides it (#117)
   * @param {String} panelName e.g. 'attrs', 'options', 'conditions', 'config'
   * @return {Boolean}
   */
  isAddEnabled = panelName => this.config?.panels?.[panelName]?.add !== false

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get editWindow() {
    const editWindow = {
      className: ['component-edit', `${this.name}-edit`, 'slide-toggle', 'formeo-panels-wrap'],
    }

    const editPanelLength = this.editPanels.size

    if (editPanelLength) {
      editWindow.className.push(`panel-count-${editPanelLength}`)
      editWindow.content = [this.panels.panelNav, this.panels.panelsWrap]
      this.panelNav = this.panels.nav
      this.resizePanelWrap = this.panels.nav.refresh
    }

    editWindow.action = {
      onRender: () => {
        if (editPanelLength === 0) {
          // If this element has no edit panels, remove its own edit toggle (not a nested component's)
          const actions = this.dom.querySelector(`:scope > .${this.name}-actions`)
          const actionButtons = actions?.getElementsByTagName('button') ?? []
          if (actionButtons.length) {
            actions.style.maxWidth = `${actionButtons.length * actionButtons[0].clientWidth}px`
          }
          const editToggle = actions?.querySelector('.edit-toggle')
          if (editToggle) {
            dom.remove(editToggle)
          }
        } else {
          this.resizePanelWrap()
        }
      },
    }

    return dom.create(editWindow)
  }

  /**
   * Panels a component builds itself instead of from its data, keyed by the name `panels.order` uses for them,
   * e.g. a row's Settings (#112). Only names in `panels.order` are shown.
   * @return {Object<String, {panelConfig: Object}>}
   */
  get customPanels() {
    return {}
  }

  /**
   * What a panel is built from while its data key is unset, e.g. `{ attrs: {} }` so a row shows an empty Attributes
   * panel (#112). Fields and stages have none: a control without attrs gets no Attributes panel.
   * @return {Object}
   */
  get defaultPanelData() {
    return {}
  }

  /**
   * Data keys that are never generic edit panels, even though the data holds them.
   * @return {String[]}
   */
  get reservedPanels() {
    return []
  }

  updateEditPanels = () => {
    if (!this.config) {
      return null
    }
    const editable = new Set(['object', 'array'])
    const hasConfigOptions = configOptionsOf(this.config).size > 0
    const { customPanels, defaultPanelData } = this
    // declared config keys get a Config panel even before the component has any config (a new stage)
    const panelOrder = unique([
      ...this.config.panels.order,
      ...Object.keys(this.data),
      ...(hasConfigOptions ? ['config'] : []),
    ])
    // a row's or column's `className` is its internal class list, never a panel
    const noPanels = new Set([
      'children',
      'meta',
      'action',
      'events',
      'className',
      ...this.config.panels.disabled,
      ...this.reservedPanels,
    ])
    const allowedPanels = panelOrder.filter(panelName => !noPanels.has(panelName))

    for (const panelName of allowedPanels) {
      if (customPanels[panelName]) {
        this.editPanels.set(panelName, customPanels[panelName])
        continue
      }
      // a Config panel without declared keys would only offer keys that mean nothing for this component
      if (panelName === 'config' && !hasConfigOptions) {
        this.editPanels.delete(panelName)
        continue
      }
      const panelData =
        panelName === 'config' ? this.get(panelName) || {} : (this.get(panelName) ?? defaultPanelData[panelName])
      const propType = dom.childType(panelData)
      if (editable.has(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this)
        this.editPanels.set(editPanel.name, editPanel)
      }
    }

    this.panels?.destroy()
    if (!this.editPanels.size) {
      // nothing to edit: Panels needs at least one panel, and editWindow drops the edit button
      this.panels = null
      return
    }

    const panelsData = {
      panels: Array.from(this.editPanels.values()).map(({ panelConfig }) => panelConfig),
      id: this.id,
      displayType: 'auto',
    }

    this.panels = new Panels(panelsData)

    // only this component's own edit window: a nested component's nav is not ours to replace
    const editWindow = this.dom?.querySelector(`:scope > .${this.name}-edit`)
    const ownNav = editWindow?.querySelector(':scope > .panel-nav')
    if (ownNav) {
      ownNav.replaceWith(this.panels.panelNav)
      editWindow.querySelector(':scope > .panels').replaceWith(this.panels.panelsWrap)
    }
  }
}
