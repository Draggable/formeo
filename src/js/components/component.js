import { uuid } from '../common/utils'
import helpers, { isInt } from '../common/helpers'
import dom from '../common/dom'
import { CHILD_TYPE_MAP, TYPE_CHILD_CLASSNAME_MAP, PARENT_TYPE_MAP } from '../constants'
import Components from './index'
import Data from './data'

export default class Component extends Data {
  constructor(name, data = {}, defaultData = {}) {
    super(name, Object.assign({}, defaultData, data, { id: data.id || uuid() }))
    this.id = this.data.id
    this.name = name
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

    const parent = this.parent
    const children = this.children

    helpers.forEach(children, child => child.remove())

    this.dom.parentElement.removeChild(this.dom)

    // removes empty rows and columns
    // @todo make this optional
    if (!parent.name === 'stage' && !parent.children.length) {
      parent.remove()
    }

    return Components.data[`${this.name}s`].delete(this.id)
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
  actionButtons() {
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

    btnWrap.content = dom.config[`${this.name}s`].actionButtons.buttons
    actions.content = btnWrap

    return actions
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
    const parentType = PARENT_TYPE_MAP.get(this.name)
    if (!this.dom || !parentType) {
      return null
    }

    return Components.get(`${parentType}s`).get(this.dom.parentElement.id)
  }
  get children() {
    if (!this.dom) {
      return []
    }
    const children = this.dom.getElementsByClassName(TYPE_CHILD_CLASSNAME_MAP.get(this.name))
    const childGroup = CHILD_TYPE_MAP.get(`${this.name}s`)
    return helpers.map(children, i => Components.get(childGroup).get(children[i].id))
  }
}
