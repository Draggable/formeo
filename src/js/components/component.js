/* global MutationObserver */
import identity from 'lodash/identity'
import { uuid, componentType, merge, clone, remove } from '../common/utils'
import { isInt, get, map, forEach, indexOfNode } from '../common/helpers'
import dom from '../common/dom'
import {
  CHILD_TYPE_MAP,
  PARENT_TYPE_MAP,
  ANIMATION_SPEED_BASE,
  FIELD_PROPERTY_MAP,
  COMPONENT_TYPE_CLASSNAMES,
  COLUMN_CLASSNAME,
  CONTROL_GROUP_CLASSNAME,
} from '../constants'
import Components from './index'
import Data from './data'
import animate from '../common/animation'
import Controls from './controls'

export default class Component extends Data {
  constructor(name, data = {}, render) {
    super(name, Object.assign({}, data, { id: data.id || uuid() }))
    this.id = this.data.id
    this.name = name
    this.config = Components[`${this.name}s`].config
    merge(this.config, data.config)
    this.dataPath = `${this.name}s.${this.id}.`
    this.observer = new MutationObserver(this.mutationHandler)
    this.render = render
  }

  mutationHandler = mutations =>
    mutations.map(mutation => {
      // @todo pull handler form config
      // see dom.create.onRender for implementation pattern
    })

  observe(container) {
    this.observer.disconnect()
    this.observer.observe(container, { childList: true })
  }
  get js() {
    return this.data
  }
  get json() {
    return this.data
  }
  remove = path => {
    if (path) {
      const delPath = path.split('.')
      const delItem = delPath.pop()
      const parent = this.get(delPath)
      if (Array.isArray(parent)) {
        if (isInt(delItem)) {
          parent.splice(Number(delItem), 1)
        } else {
          this.set(delPath, parent.filter(item => item !== delItem))
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

    forEach(children, child => child.remove())

    this.dom.parentElement.removeChild(this.dom)
    remove(Components.getAddress(`${parent.name}s.${parent.id}.children`), this.id)

    if (!parent.children.length) {
      parent.emptyClass()
    }

    if (parent.name === 'row') {
      parent.autoColumnWidths()
    }

    return Components[`${this.name}s`].delete(this.id)
  }

  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty() {
    const removed = this.children.map(child => child.remove())
    this.data.children = this.data.children.filter(childId => removed.indexOf(childId) === -1)
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
    let expandSize = '97px'
    const hoverClassname = `hovering-${this.name}`
    return {
      className: `${this.name}-actions group-actions`,
      action: {
        onRender: elem => (expandSize = `${elem.getElementsByTagName('button').length * 24 + 1}px`),
        mouseenter: ({ target }) => {
          this.dom.classList.add(hoverClassname)
          target.style[this.name === 'row' ? 'height' : 'width'] = expandSize
        },
        mouseleave: ({ target }) => {
          this.dom.classList.remove(hoverClassname)
          target.removeAttribute('style')
        },
      },
      children: {
        className: 'action-btn-wrap',
        children: this.buttons,
      },
    }
  }

  /**
   * Toggles the edit window
   * @param {Boolean} open whether to open or close the edit window
   */
  toggleEdit(open = !this.isEditing) {
    this.isEditing = open
    const element = this.dom
    const editClass = `editing-${this.name}`
    const editWindow = this.dom.querySelector(`.${this.name}-edit`)
    animate.slideToggle(editWindow, ANIMATION_SPEED_BASE, open)

    if (this.name === 'field') {
      animate.slideToggle(this.preview, ANIMATION_SPEED_BASE, !open)
      element.parentElement.classList.toggle(`column-${editClass}`, open)
    }

    element.classList.toggle(editClass, open)
  }

  get buttons() {
    const _this = this
    const parseIcons = icons => icons.map(icon => dom.icon(icon))
    const buttonConfig = {
      handle: (icons = ['move', 'handle']) => {
        return {
          ...dom.btnTemplate({ content: parseIcons(icons) }),
          className: ['item-handle'],
          meta: {
            id: 'handle',
          },
        }
      },
      edit: (icons = ['edit']) => {
        return {
          ...dom.btnTemplate({ content: parseIcons(icons) }),
          className: ['item-edit-toggle'],
          meta: {
            id: 'edit',
          },
          action: {
            click: evt => {
              _this.toggleEdit()
            },
          },
        }
      },
      remove: (icons = ['remove']) => {
        return {
          ...dom.btnTemplate({ content: parseIcons(icons) }),
          className: ['item-remove'],
          meta: {
            id: 'remove',
          },
          action: {
            click: (evt, id) => {
              animate.slideUp(_this.dom, ANIMATION_SPEED_BASE, () => {
                if (_this.name === 'column') {
                  const row = _this.parent
                  row.autoColumnWidths()
                  _this.remove()
                } else {
                  _this.remove()
                }
              })
              //  @todo add onRemove to Events and Actions
            },
          },
        }
      },
      clone: (icons = ['copy']) => {
        return {
          ...dom.btnTemplate({ content: parseIcons(icons) }),
          className: ['item-clone'],
          meta: {
            id: 'clone',
          },
          action: {
            click: () => this.clone(),
          },
        }
      },
    }

    return this.config.actionButtons.buttons.map(btn => {
      const [key, ...rest] = btn.split('|')
      const icons = rest.length ? rest : undefined
      return (buttonConfig[key] && buttonConfig[key](icons)) || btn
    })
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
   * @param {Object} childData
   * @param {Number} index
   * @return {Object} child DOM element
   */
  addChild(childData = {}, index = this.domChildren.length) {
    if (typeof childData !== 'object') {
      childData = { id: childData }
    }

    const childWrap = this.dom.querySelector('.children')
    const { id: childId = uuid() } = childData
    const childGroup = CHILD_TYPE_MAP.get(this.name)
    if (!childGroup) {
      return null
    }

    const childComponentType = `${childGroup}s`

    const child =
      Components.getAddress(`${childComponentType}.${childId}`) ||
      Components[childComponentType].add(childId, childData)

    childWrap.insertBefore(child.dom, childWrap.children[index])

    // @todo add event for onAddChild
    const grandChildren = child.get('children')
    if (grandChildren && grandChildren.length) {
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
   * @param  {Object} evt
   * @return {Object} Component
   */
  onAdd({ from, to, item, newIndex }) {
    const _this = this
    if (!from.classList.contains(CONTROL_GROUP_CLASSNAME)) {
      from = from.parentElement
    }
    const fromType = componentType(from)
    const toType = componentType(to.parentElement)
    const defaultOnAdd = () => {
      _this.saveChildOrder()
      _this.removeClasses('empty')
    }

    const depthMap = new Map([
      [
        -2,
        () => {
          const newChild = _this.addChild({}, newIndex).addChild()
          return newChild.addChild.bind(newChild)
        },
      ],
      [
        -1,
        () => {
          const newChild = _this.addChild({}, newIndex)
          return newChild.addChild.bind(newChild)
        },
      ],
      [0, () => _this.addChild.bind(_this)],
      [
        1,
        controlData => {
          const currentIndex = indexOfNode(_this.dom)
          return () => _this.parent.addChild(controlData, currentIndex + 1)
        },
      ],
      [2, controlData => () => _this.parent.parent.addChild(controlData)],
    ])

    const onAddConditions = {
      controls: () => {
        const { controlData } = Controls.get(item.id)
        const {
          meta: { id: metaId },
        } = controlData

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
        const depth = get(targets, `${_this.name}.${controlType}`)
        const action = depthMap.get(depth)()
        dom.remove(item)
        const component = action(controlData, newIndex)

        return component
      },
      row: () => {
        const targets = {
          stage: -1,
          row: 0,
          column: 1,
        }
        const action = (depthMap.get(targets[toType]) || identity)()
        return action && action({ id: item.id }, newIndex)
      },
      column: () => {
        const targets = {
          stage: -2,
          row: -1,
        }
        const action = (depthMap.get(targets[toType]) || identity)()
        return action && action(item.id)
      },
    }

    const component = onAddConditions[fromType] && onAddConditions[fromType](item, newIndex)

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
    to && to.classList.remove(`hovering-${componentType(to)}`)
    from && from.classList.remove(`hovering-${componentType(from)}`)
  }

  /**
   * Callback for onRender, executes any defined onRender for component
   */
  onRender() {
    const { events } = this.config
    if (!events) {
      return null
    }
    events.onRender && dom.onRender(this.dom, events.onRender)
  }

  set config(config) {
    const metaId = get(this.data, 'meta.id')
    const allConfig = get(config, 'all')
    const typeConfig = metaId && get(config, metaId)
    const idConfig = get(config, this.id)
    const mergedConfig = [allConfig, typeConfig, idConfig].reduce(
      (acc, cur) => (cur ? merge(acc, cur) : acc),
      this.configVal
    )

    this.configVal = mergedConfig
    return this.configVal
  }

  get config() {
    return this.configVal
  }

  runConditions = () => {
    const conditionsList = this.get('conditions')
    if (!conditionsList || !conditionsList.length) {
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
    return id === this.id ? this : group && group.get(id)
  }

  value = (path, val) => {
    const splitPath = path.split('.')

    const component = this.getComponent(path)
    const property = component && splitPath.slice(2, splitPath.length).join('.')

    if ([!component, !property, !FIELD_PROPERTY_MAP[property]].some(Boolean)) {
      return path
    }

    return val ? component.set(FIELD_PROPERTY_MAP[property], val) : component.get(FIELD_PROPERTY_MAP[property])
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
      const propertyPath =
        targetComponent &&
        target
          .split('.')
          .slice(2, target.length)
          .join('.')
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

  execResult = ({ target, action, value, propertyPath }) => {
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
    if (this.name === 'column') {
      parent.autoColumnWidths()
    }
    return newClone
  }

  cloneChildren = toParent => {
    this.children.forEach(child => child && child.clone(toParent))
  }

  createChildWrap = children =>
    dom.create({
      tag: 'ul',
      attrs: {
        className: 'children',
      },
      children,
    })
}
