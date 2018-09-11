import { uuid } from '../common/utils'
import helpers from '../common/helpers'
import dom from '../common/dom'
import { CHILD_TYPE_MAP, TYPE_CHILD_CLASSNAME_MAP } from '../constants'
import Components from './index'

export default class Component {
  constructor(name, data = {}, defaultData = {}) {
    this.data = Object.assign({}, defaultData, data, { id: data.id || uuid() })
    this.id = this.data.id
    this.name = name
  }
  // get size() {
  //   return Object.keys(this.data).length
  // }
  get js() {
    return this.data
  }
  get json() {
    return this.data
  }
  toJSON = (data, format) => JSON.stringify(data, null, format)
  get = path => helpers.get(this.data, path)
  set = (path, val) => helpers.set(this.data, path, val)
  // add = (data = Object.create(null)) => {
  //   const { id } = data
  //   const elemId = id || uuid()
  //   const mergedData = Object.assign({}, this.defaultData, data)
  //   this.data[elemId] = mergedData
  //   return elemId
  // }
  remove = path => {
    if (path) {
      const delPath = path.split('.')
      const delItem = delPath.pop()
      const parent = helpers.get(this.data, delPath)
      if (Array.isArray(parent)) {
        parent.splice(Number(delItem), 1)
      } else {
        delete parent[delItem]
      }
      return parent
    }

    const children = this.children

    helpers.forEach(children, child => child.remove())

    this.dom.parentElement.removeChild(this.dom)

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
    const _this = this
    const tag = this.name === 'column' ? 'li' : 'div'
    const btnWrap = {
      className: 'action-btn-wrap',
    }
    const actions = {
      tag,
      className: this.name + '-actions group-actions',
      action: {
        mouseenter: ({ target }) => {
          const element = document.getElementById(_this.id)
          element.classList.add('hovering-' + this.name)
          target.parentReference = element
        },
        mouseleave: ({ target }) => target.parentReference.classList.remove('hovering-' + this.name),
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
      string: elem => elem.classList.remove(className),
      array: elem => className.forEach(name => elem.classList.remove(name)),
    }
    removeClass.object = removeClass.string // handles regex map
    return removeClass[dom.childType(className)](this.dom)
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
