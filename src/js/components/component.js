import { uuid } from '../common/utils'
import helpers from '../common/helpers'
import dom from '../common/dom'

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

  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty() {
    const elem = this.dom
    this.data.children = Object.create(null)
    while (elem.firstChild) {
      elem.parentElement.removeChild(elem.firstChild)
    }
    return elem.parentElement
  }

  /**
   * Apply empty class to element if does not have children
   */
  emptyClass() {
    const elem = this.dom
    const childMap = new Map([['stage', 'stage-rows'], ['row', 'stage-columns'], ['column', 'stage-fields']])
    const children = elem.getElementsByClassName(childMap.get(this.name))
    elem.classList.toggle('empty', !children.length)
  }

  /**
   * Move, close, and edit buttons for row, column and field
   * @return {Object} element config object
   */
  actionButtons() {
    const _this = this
    const tag = this.name === 'column' ? 'li' : 'div'
    const btnWrap = {
      tag: 'div',
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
}
