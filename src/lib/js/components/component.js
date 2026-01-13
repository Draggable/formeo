/* global MutationObserver */

import animate from '../common/animation.js'
import dom from '../common/dom.js'
import events from '../common/events.js'
import { forEach, indexOfNode, isInt, map } from '../common/helpers.mjs'
import { clone, componentType, identity, merge, remove, unique, uuid } from '../common/utils/index.mjs'
import { get, objectFromStringArray, set } from '../common/utils/object.mjs'
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
import Data from './data.js'
import EditPanel from './edit-panel/edit-panel.js'
// Components is imported at the end of the file after circular dependencies are resolved
import Components from './index.js'
import Panels from './panels.js'

// import Controls from './controls/index.js'

let Controls = null

const propertyOptions = objectFromStringArray(PROPERTY_OPTIONS)

export default class Component extends Data {
  constructor(name, dataArg = {}) {
    const data = { ...dataArg, id: dataArg.id || uuid() }
    super(name, data)
    this.id = data.id
    this.shortId = this.id.slice(0, this.id.indexOf('-'))
    this.name = name
    this.indexName = `${name}s`
    this.config = { ...data.config, ...Components[`${this.name}s`].config }
    this.address = `${this.name}s.${this.id}`
    this.dataPath = `${this.address}.`
    // this.observer = new window.MutationObserver(this.mutationHandler)
    this.editPanels = new Map()
    this.eventListeners = new Map()
    this.initEventHandlers()
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
      if (Array.isArray(parent)) {
        if (isInt(delItem)) {
          parent.splice(Number(delItem), 1)
        } else {
          this.set(
            delPath,
            parent.filter(item => item !== delItem)
          )
        }
      } else {
        delete parent[delItem]
      }
      return parent
    }

    if (this.name === 'stage') {
      return null
    }

    const parent = this.parent
    const children = this.children

    // Dispatch onRemove event before removal
    this.dispatchComponentEvent('onRemove', {
      path,
      parent,
      children: [...children], // copy array since children will be modified
    })

    forEach(children, child => child.remove())

    this.dom.remove()
    remove(Components.getAddress(`${parent.name}s.${parent.id}.children`), this.id)

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
      events.formeoUpdated(
        {
          componentId: this.id,
          componentType: this.name,
          parent: parent,
        },
        removeEvent
      )
    }

    return Components[`${this.name}s`].delete(this.id)
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
   * Move, close, and edit buttons for row, column and field
   * @return {Object} element config object
   */
  getActionButtons() {
    const hoverClassnames = [`hovering-${this.name}`, 'hovering']
    return {
      className: [`${this.name}-actions`, 'group-actions'],
      action: {
        mouseenter: () => {
          Components.stages.active.dom.classList.add(`active-hover-${this.name}`)
          this.dom.classList.add(...hoverClassnames)
        },
        mouseleave: ({ target }) => {
          this.dom.classList.remove(...hoverClassnames)
          Components.stages.active.dom.classList.remove(`active-hover-${this.name}`)
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
   * Toggles the edit window
   * @param {Boolean} open whether to open or close the edit window
   */
  toggleEdit(open = !this.isEditing) {
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
            click: () => {
              animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
                if (this.name === 'column') {
                  const row = this.parent
                  row.autoColumnWidths()
                  this.remove()
                } else {
                  this.remove()
                }
              })
              //  @todo add onRemove to Events and Actions
            },
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
            click: () => {
              this.clone(this.parent)
              if (this.name === 'column') {
                this.parent.autoColumnWidths()
              }
            },
          },
        }
      },
    }

    const { buttons, disabled } = this.config.actionButtons
    const activeButtons = buttons.filter(btn => !disabled.includes(btn))
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
    return map(domChildren, child => Components.getAddress(`${childGroup}s.${child.id}`)).filter(Boolean)
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
      Components.getAddress(`${childComponentType}.${childId}`) || Components[childComponentType].add(childId, data)

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
      controls: async () => {
        if (!Controls) {
          // Lazy import to avoid circular dependency
          const { default: ControlsData } = await import('./controls/index.js')
          Controls = ControlsData
        }

        const {
          controlData: {
            meta: { id: metaId },
            ...elementData
          },
        } = Controls.get(item.id)

        set(elementData, 'config.controlId', metaId)

        const controlType = metaId.startsWith('layout-') ? metaId.replace(/^layout-/, '') : 'field'
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
        dom.remove(item)
        const component = action(elementData, newIndex)

        return component
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

    const component = onAddConditions[fromType]?.(item, newIndex)

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

  /**
   * Save updated child order
   * @return {Array} updated child order
   */
  onSort = () => {
    return this.saveChildOrder()
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
   * 3. Control type specific config
   * 4. Instance specific config
   * The merged result is stored in this.configVal
   */
  set config(config) {
    const allConfig = get(config, 'all')
    const controlId = get(this.data, 'config.controlId')
    const typeConfig = controlId && get(config, controlId)
    const idConfig = get(config, this.id)
    const mergedConfig = [allConfig, typeConfig, idConfig].reduce(
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
    const group = Components[type]
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
          // If this element has no edit panels, remove the edit toggle
          const editToggle = this.dom.querySelector('.edit-toggle')
          const fieldActions = this.dom.querySelector(`.${this.name}-actions`)
          const actionButtons = fieldActions.getElementsByTagName('button')
          fieldActions.style.maxWidth = `${actionButtons.length * actionButtons[0].clientWidth}px`
          dom.remove(editToggle)
        } else {
          this.resizePanelWrap()
        }
      },
    }

    return dom.create(editWindow)
  }

  updateEditPanels = () => {
    if (!this.config) {
      return null
    }
    const editable = new Set(['object', 'array'])
    const panelOrder = unique([...this.config.panels.order, ...Object.keys(this.data)])
    const noPanels = new Set(['children', 'meta', 'action', 'events', ...this.config.panels.disabled])
    const allowedPanels = panelOrder.filter(panelName => !noPanels.has(panelName))

    for (const panelName of allowedPanels) {
      const panelData = this.get(panelName)
      const propType = dom.childType(panelData)
      if (editable.has(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this)
        this.editPanels.set(editPanel.name, editPanel)
      }
    }

    const panelsData = {
      panels: Array.from(this.editPanels.values()).map(({ panelConfig }) => panelConfig),
      id: this.id,
      displayType: 'auto',
    }

    this.panels = new Panels(panelsData)

    if (this.dom) {
      this.dom.querySelector('.panel-nav').replaceWith(this.panels.panelNav)
      this.dom.querySelector('.panels').replaceWith(this.panels.panelsWrap)
    }
  }
}
