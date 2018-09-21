/* global MutationObserver */
import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'
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
    this.runConditions()
    this.observer = new MutationObserver(this.mutationHandler)
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
  empty() {
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
    let expandSize
    const actions = {
      tag: this.name === 'column' ? 'li' : 'div',
      className: `${this.name}-actions group-actions`,
      action: {
        mouseenter: ({ target }) => {
          this.dom.classList.add(hoverClassname)
          target.style[this.name === 'row' ? 'height' : 'width'] = expandSize
        },
        mouseleave: ({ target }) => {
          this.dom.classList.remove(hoverClassname)
          target.style.width = null
          target.style.height = null
        },
        onRender: elem => {
          const buttons = elem.getElementsByTagName('button')
          const btnSize = parseInt(dom.getStyle(buttons[0], 'width'))
          expandSize = `${buttons.length * btnSize + 1}px`
        },
      },
    }

    btnWrap.content = this.buttons
    actions.content = btnWrap

    return actions
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
    animate.slideToggle(editWindow, ANIMATION_BASE_SPEED, open)

    if (this.name === 'field') {
      animate.slideToggle(this.preview, ANIMATION_BASE_SPEED, !open)
      element.parentElement.classList.toggle('column-' + editClass, open)
    }

    element.classList.toggle(editClass, open)
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
              _this.toggleEdit()
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
  addChild(childData = {}, index = this.children.length) {
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
    // @todo add event for onAddChild
    const grandChildren = child.get('children')
    if (grandChildren && grandChildren.length) {
      child.loadChildren(grandChildren)
    }

    this.emptyClass()
    this.saveChildOrder()
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
  onAdd(evt) {
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
        const { controlData, ...control } = Controls.get(item.id)
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
        control.on.renderComponent(component)

        return component
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
    const propertyMap = {
      value: 'attrs.value',
    }

    if ([!component, !property, !propertyMap[property]].some(Boolean)) {
      return path
    }

    const action = val ? component.set : component.get
    return action(propertyMap[property], val)
  }

  // @todo finish the evaluator
  evaluateConditions = conditions => {
    const comparisonMap = {
      '==': isEqual,
    }
    return conditions.some(({ comparison, source, target }) => {
      const evaluator = comparisonMap[comparison] || false
      return evaluator && evaluator(this.value(source), this.value(target))
    })
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

  /**
   * Group conditions by 'OR' index, maintain order
   * @param {Array} conditions array of arrays of condition definitions
   * @return {Array} flattened array of conditions
   */
  processConditions = (conditions = this.get('conditions')) => {
    if (!conditions) {
      return null
    }
    const chunkIndexes = conditions.reduce((acc, val, idx) => {
      if (val === 'OR') {
        acc.push(idx)
      }
      return acc
    }, [])
    // group conditions by 'OR' indexes
    chunkIndexes.push(conditions.length)
    return chunkIndexes.reduce((acc, cur, idx) => {
      const startIndex = chunkIndexes[idx - 1] + 1 || 0
      acc.push(conditions.slice(startIndex, cur))
      return acc
    }, [])
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
}
