import identity from 'lodash/identity'
import { uuid, componentType, closestFtype, clone, merge } from '../common/utils'
import { isInt, get, map, forEach, indexOfNode } from '../common/helpers'
import dom from '../common/dom'
import { CHILD_TYPE_MAP, TYPE_CHILD_CLASSNAME_MAP, PARENT_TYPE_MAP, ANIMATION_BASE_SPEED } from '../constants'
import Components from './index'
import Data from './data'
import animate from '../common/animation'
import Controls from './controls'

export default class Component extends Data {
  constructor(name, data = {}) {
    super(name, Object.assign({}, data, { id: data.id || uuid() }))
    this.id = this.data.id
    this.name = name

    this.config = Components[`${this.name}s`].config
    this.dataPath = `${this.name}s.${this.id}.`
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
    Components.get(`${parent.name}s.${parent.id}`).remove(`children.${this.id}`)

    if (!parent.children.length) {
      parent.emptyClass()
      // @todo make this optional
      // parent.remove()
    }

    return Components[`${this.name}s`].delete(this.id)
  }

  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty = () => {
    const removed = this.children.map(child => child.remove())
    this.data.children = this.data.children.filter(childId => removed.indexOf(childId) === -1)
    this.emptyClass()
    return removed
  }

  /**
   * Apply empty class to element if does not have children
   */
  emptyClass = () => {
    return this.dom.classList.toggle('empty', !this.children.length)
  }

  /**
   * Move, close, and edit buttons for row, column and field
   * @return {Object} element config object
   */
  getActionButtons() {
    const hoverClassname = `hovering-${this.name}`
    const btnWrap = {
      className: 'action-btn-wrap',
    }
    const actions = {
      tag: this.name === 'column' ? 'li' : 'div',
      className: `${this.name}-actions group-actions`,
      action: {
        mouseenter: () => this.dom.classList.add(hoverClassname),
        mouseleave: () => this.dom.classList.remove(hoverClassname),
        onRender: elem => {
          const buttons = elem.getElementsByTagName('button')
          const cssProp = this.name === 'row' ? 'height' : 'width'
          const btnSize = parseInt(dom.getStyle(buttons[0], cssProp))
          const expandedSize = `${buttons.length * btnSize + 1}px`
          const rules = [[`.hovering-${this.name} .${this.name}-actions`, [cssProp, expandedSize, true]]]

          dom.insertRule(rules)
        },
      },
    }
    // if (this.name === 'field') {
    //   console.log(this, this.config.all.actionButtons.buttons)
    // }
    btnWrap.content = this.buttons
    // btnWrap.content = dom.config[`${this.name}s`].actionButtons.buttons
    actions.content = btnWrap

    return actions
  }

  get buttons() {
    const _this = this
    const buttonConfig = {
      get handle() {
        return {
          ...dom.btnTemplate({ content: [dom.icon('move'), dom.icon('handle')] }),
          className: ['item-handle'],
          meta: {
            id: 'handle',
          },
        }
      },
      get edit() {
        return {
          ...dom.btnTemplate({ content: dom.icon('edit') }),
          className: ['item-edit-toggle'],
          meta: {
            id: 'edit',
          },
          action: {
            click: evt => {
              const element = closestFtype(evt.target)
              const editClass = `editing-${_this.name}`
              const editWindow = _this.dom.querySelector(`.${_this.name}-edit`)
              animate.slideToggle(editWindow, ANIMATION_BASE_SPEED)
              if (_this.name === 'field') {
                console.log(editWindow.nextSibling)
                animate.slideToggle(editWindow.nextSibling, ANIMATION_BASE_SPEED)
                element.parentElement.classList.toggle('column-' + editClass)
              }
              element.classList.toggle(editClass)
            },
          },
        }
      },
      get remove() {
        return {
          ...dom.btnTemplate({ content: dom.icon('remove') }),
          className: ['item-remove'],
          meta: {
            id: 'remove',
          },
          action: {
            click: (evt, id) => {
              animate.slideUp(_this.dom, ANIMATION_BASE_SPEED, () => {
                // _this.parent.emptyClass()
                _this.remove()
              })
              //  @todo add onRemove to Events and Actions
            },
          },
        }
      },
      get clone() {
        return {
          ...dom.btnTemplate({ content: dom.icon('copy') }),
          className: ['item-clone'],
          meta: {
            id: 'clone',
          },
          action: {
            click: evt => {
              clone(closestFtype(evt.target))
            },
          },
        }
      },
    }

    return this.config.actionButtons.buttons.map(btn => {
      return (typeof btn === 'string' && buttonConfig[btn]) || btn
    })
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

    return this.dom.parentElement && Components.get(`${parentType}s.${this.dom.parentElement.id}`)
  }
  get children() {
    if (!this.dom) {
      return []
    }
    const children = this.dom.getElementsByClassName(TYPE_CHILD_CLASSNAME_MAP.get(this.name))
    const childGroup = CHILD_TYPE_MAP.get(`${this.name}s`)
    return map(children, i => Components.get(`${childGroup}.${children[i].id}`))
  }

  loadChildren = (children = this.data.children) => children.map(rowId => this.addChild({ id: rowId }))

  /**
   * Adds a child to the component
   * @param {Object} childData
   * @param {Number} index
   * @return {Object} DOM element
   */
  addChild = (childData = {}, index = this.children.length) => {
    if (typeof childData !== 'object') {
      childData = { id: childData }
    }
    const { id: childId = uuid() } = childData
    const childGroup = CHILD_TYPE_MAP.get(`${this.name}s`)
    if (!childGroup) {
      return null
    }

    const child = Components.get(`${childGroup}.${childId}`) || Components[childGroup].add(childId, childData)

    this.dom.insertBefore(child.dom, this.dom.children[index])
    this.set(`children.${index}`, child.id)
    const grandChildren = child.get('children')
    if (grandChildren && grandChildren.length) {
      child.loadChildren(grandChildren)
    }

    this.emptyClass()
    return child
  }

  /**
   * Updates the children order for the current component
   */
  saveChildOrder = () => {
    const newChildOrder = this.children.map(({ id }) => id)
    this.set('children', newChildOrder)
    return newChildOrder
  }

  /**
   * Method for handling onAdd for all components
   * @param  {Object} evt
   * @return {Object} Component
   */
  onAdd = evt => {
    const _this = this
    const { from, item, to } = evt
    const newIndex = indexOfNode(item, to)
    const fromType = componentType(from)
    const toType = componentType(to)
    const itemType = componentType(item)
    const defaultOnAdd = () => {
      _this.saveChildOrder()
      _this.emptyClass()
    }

    const depthMap = new Map([
      [-2, () => _this.addChild().addChild().addChild],
      [-1, () => _this.addChild().addChild],
      [0, () => _this.addChild],
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
        const controlData = Controls.get(item.id).controlData
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
        return action(controlData, newIndex)
      },
      row: () => {
        const targets = {
          row: 1,
          field: -1,
        }
        targets[itemType] && depthMap.get(targets[itemType])()
        return dom.asComponent(item)
      },
      column: () => {
        const targets = {
          row: -1,
        }
        const action = (depthMap.get(targets[toType]) || identity)()
        return action && action(item.id)
      },
    }

    const condition = onAddConditions[fromType] && onAddConditions[fromType]()
    defaultOnAdd()
    return condition
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
  onRemove = () => {
    this.emptyClass()
    return this.saveChildOrder()
  }

  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd = ({ to, from }) => {
    to && to.classList.remove(`hovering-${componentType(to)}`)
    from && from.classList.remove(`hovering-${componentType(from)}`)
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
}
