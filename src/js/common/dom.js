import h, { indexOfNode, forEach } from './helpers'
import i18n from 'mi18n'
import events from './events'
import animate from './animation'
import Components, { Stages, Columns } from '../components'
import { uuid, clone, numToPercent, componentType, merge } from './utils'
import {
  ROW_CLASSNAME,
  STAGE_CLASSNAME,
  COLUMN_CLASSNAME,
  FIELD_CLASSNAME,
  CONTROL_GROUP_CLASSNAME,
  CHILD_CLASSNAME_MAP,
  bsColRegExp,
} from '../constants'

/**
 * General purpose markup utilities and generator.
 */
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor() {
    this.options = Object.create(null)
    this.styleSheet = (() => {
      const style = document.createElement('style')
      style.setAttribute('media', 'screen')
      style.setAttribute('type', 'text/css')
      style.appendChild(document.createTextNode(''))
      document.head.appendChild(style)
      return style.sheet
    })()
  }

  set setOptions(options) {
    this.options = merge(Object.assign({}, this.options, options))
  }

  /**
   * Ensure elements have proper tagName
   * @param  {Object|String} elem
   * @return {Object} valid element object
   */
  processTagName(elem) {
    let tagName
    if (typeof elem === 'string') {
      tagName = elem
      elem = { tag: tagName }
    }
    if (elem.attrs) {
      const { tag, ...restAttrs } = elem.attrs
      if (tag) {
        if (typeof tag === 'string') {
          tagName = tag
        } else {
          const selectedTag = tag.find(t => t.selected === true) || tag[0]
          tagName = selectedTag.value
        }
      }
      elem.attrs = restAttrs
    }

    elem.tag = tagName || elem.tag || 'div'

    return elem
  }

  /**
   * Wraps dom.create to modify data
   * Used when rendering components in form- not editor
   */
  render = elem => {
    elem.id = `f-${elem.id || uuid()}`
    return this.create(elem)
  }

  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create = (elem, isPreview = false) => {
    if (!elem) {
      return
    }

    elem = this.processTagName(elem)
    const _this = this
    let childType
    const { tag } = elem
    const processed = ['children', 'content']
    let i
    const wrap = {
      attrs: {},
      className: [h.get(elem, 'config.inputWrap') || 'f-field-group'],
      children: [],
      config: {},
    }

    let element = document.createElement(tag)

    /**
     * Object for mapping contentType to its function
     * @type {Object}
     */
    const appendChildren = {
      string: children => {
        element.innerHTML += children
      },
      object: children => {
        return children && element.appendChild(_this.create(children, isPreview))
      },
      node: children => {
        return element.appendChild(children)
      },
      component: children => {
        return element.appendChild(children.dom)
      },
      array: children => {
        for (let i = 0; i < children.length; i++) {
          childType = _this.childType(children[i])
          appendChildren[childType](children[i])
        }
      },
      function: children => {
        children = children()
        childType = _this.childType(children)
        appendChildren[childType](children)
      },
      undefined: () => null,
      boolean: () => null,
    }

    processed.push('tag')

    // check for root className property
    if (elem.className) {
      const { className } = elem
      elem.attrs = Object.assign({}, elem.attrs, { className })
      delete elem.className
    }

    // Append Element Content
    if (elem.options) {
      let { options } = elem
      options = this.processOptions(options, elem, isPreview)
      if (this.holdsContent(element) && tag !== 'button') {
        // mainly used for <select> tag
        appendChildren.array.call(this, options)
        delete elem.content
      } else {
        h.forEach(options, option => {
          wrap.children.push(_this.create(option, isPreview))
        })
        if (elem.attrs.className) {
          wrap.className = elem.attrs.className
        }
        wrap.config = Object.assign({}, elem.config)
        return this.create(wrap, isPreview)
      }
      processed.push('options')
    }

    // Set element attributes
    if (elem.attrs) {
      _this.processAttrs(elem, element, isPreview)
      processed.push('attrs')
    }

    if (elem.config) {
      if (
        elem.config.label &&
        ((elem.config.label && tag !== 'button') || ['radio', 'checkbox'].includes(h.get(elem, 'attrs.type'))) &&
        !isPreview
      ) {
        const label = _this.label(elem)

        if (!elem.config.hideLabel) {
          const wrapContent = [...(_this.labelAfter(elem) ? [element, label] : [label, element])]
          wrap.children.push(wrapContent)
        }
      }

      processed.push('config')
    }

    // Append Element Content
    if (elem.content || elem.children) {
      const children = elem.content || elem.children
      childType = _this.childType(children)
      if (!appendChildren[childType]) {
        console.error(`childType: ${childType} is not supported`)
      }
      appendChildren[childType].call(this, children)
    }

    // Set the new element's dataset
    if (elem.dataset) {
      for (const data in elem.dataset) {
        if (elem.dataset.hasOwnProperty(data)) {
          element.dataset[data] = typeof elem.dataset[data] === 'function' ? elem.dataset[data]() : elem.dataset[data]
        }
      }
      processed.push('dataset')
    }

    // Add listeners for defined actions
    if (elem.action) {
      this.actionHandler(element, elem.action)
      processed.push('action')
    }

    // Subtract processed and ignored and attach the rest
    const remaining = h.subtract(processed, Object.keys(elem))
    for (i = remaining.length - 1; i >= 0; i--) {
      element[remaining[i]] = elem[remaining[i]]
    }

    if (wrap.children.length) {
      element = this.create(wrap)
    }

    return element
  }

  onRender = (node, cb) => {
    if (!node.parentElement) {
      window.requestAnimationFrame(() => this.onRender(node, cb))
    } else {
      cb(node)
    }
  }

  /**
   * Processes element config object actions (click, onRender etc)
   */
  actionHandler(node, actions) {
    const handlers = {
      onRender: dom.onRender,
    }
    const useCaptureEvts = ['focus', 'blur']
    const defaultHandler = event => (node, cb) => node.addEventListener(event, cb, useCaptureEvts.includes(event))

    return Object.entries(actions).map(([key, cb]) => {
      const action = handlers[key] || defaultHandler(key)
      return action(node, cb)
    })
  }

  /**
   * Create and SVG or font icon.
   * Simple string concatenation instead of DOM.create because:
   *  - we don't need the perks of having icons be DOM objects at this stage
   *  - it forces the icon to be appended using innerHTML which helps svg render
   * @param  {String} name - icon name
   * @return {String} icon markup
   * @todo remove document.getElementById
   */
  icon(name = null) {
    if (!name) {
      return
    }
    const iconPrefix = 'f-i-'
    const iconLink = document.getElementById(iconPrefix + name)
    let icon
    const iconFontTemplates = {
      glyphicons: icon => `<span class="glyphicon glyphicon-${icon}" aria-hidden="true"></span>`,
      'font-awesome': icon => {
        const [style, name] = icon.split(' ')
        return `<i class="${style} fa-${name}"></i>`
      },
      fontello: icon => `<i class="${iconPrefix}${icon}">${icon}</i>`,
    }

    if (iconLink) {
      icon = `<svg class="svg-icon ${iconPrefix}${name}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${iconPrefix}${name}"></use></svg>`
    } else if (dom.options.iconFont) {
      icon = iconFontTemplates[dom.options.iconFont](name)
    } else {
      icon = name
    }
    return icon
  }

  /**
   * JS Object to DOM attributes
   * @param  {Object} elem    element config object
   * @param  {Object} element DOM element we are building
   * @param  {Boolean} isPreview
   * @return {void}
   */
  processAttrs(elem, element, isPreview) {
    const { attrs = {} } = elem

    if (!isPreview) {
      if (!attrs.name && this.isInput(elem.tag)) {
        element.setAttribute('name', uuid(elem))
      }
    }

    // Set element attributes
    Object.keys(attrs).forEach(attr => {
      const name = h.safeAttrName(attr)
      let value = attrs[attr] || ''

      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          const selected = value.filter(t => t.selected === true)
          value = selected.length ? selected[0].value : value[0].value
        } else {
          value = value.join(' ')
        }
      }

      if (value) {
        element.setAttribute(name, value)
      }
    })
  }

  /**
   * Hide or show an Array or HTMLCollection of elements
   * @param  {Array} elems
   * @param  {String} term  match textContent to this term
   * @return {Array}        filtered elements
   */
  toggleElementsByStr = (elems, term) => {
    const filteredElems = []
    const containsTextCb = (elem, contains) => {
      if (contains) {
        elem.style.display = 'block'
        filteredElems.push(elem)
      } else {
        elem.style.display = 'none'
      }
    }

    dom.elementsContainText(elems, term, containsTextCb)

    return filteredElems
  }

  elementsContainText = (collection, term, cb) => {
    const elementsContainingText = []
    forEach(collection, elem => {
      const txt = elem.textContent.toLowerCase()
      const contains = txt.indexOf(term.toLowerCase()) !== -1
      cb && cb(elem, contains)
      contains && elementsContainingText.push(elem)
    })
    return elementsContainingText
  }

  generateOption = ({ type = 'option', label, value, i = 0, selected }) => {
    const isOption = type === 'option'
    return {
      tag: isOption ? 'option' : 'input',
      attrs: {
        type,
        value: value || `${type}-${i}`,
        [type === 'option' ? 'selected' : 'checked']: selected || !i,
      },
      config: {
        label:
          label ||
          i18n.get('labelCount', {
            label: i18n.get('option'),
            count: i,
          }),
      },
    }
  }

  makeOption = ([value, label], selected, i18nKey) => {
    const option = {
      value,
      label: i18n.get(`${i18nKey}.${label}`) || label,
    }
    if (value === selected) {
      option.selected = true
    }
    return option
  }

  /**
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @param  {Boolean} isPreview
   * @return {Array} option config objects
   */
  processOptions(options, elem, isPreview) {
    const { action, attrs } = elem
    const fieldType = attrs.type || elem.tag
    const id = attrs.id || elem.id

    const optionMap = (option, i) => {
      const { label, ...rest } = option
      const defaultInput = () => {
        const input = {
          tag: 'input',
          attrs: {
            name: id,
            type: fieldType,
            value: option.value || '',
            id: `${id}-${i}`,
            ...rest,
          },
          action,
        }
        const optionLabel = {
          tag: 'label',
          attrs: {
            for: `${id}-${i}`,
          },
          config: {
            inputWrap: 'form-check',
          },
          children: option.label,
        }
        const inputWrap = {
          children: [input, optionLabel],
          className: [`f-${fieldType}`],
        }

        if (elem.attrs.className) {
          elem.config.inputWrap = elem.attrs.className
        }

        if (elem.config.inline) {
          inputWrap.className.push(`f-${fieldType}-inline`)
        }

        if (option.selected) {
          input.attrs.checked = true
        }

        if (isPreview) {
          optionLabel.attrs.contenteditable = true
        }

        return inputWrap
      }

      const optionMarkup = {
        select: () => {
          return {
            tag: 'option',
            attrs: option,
            children: option.label,
          }
        },
        button: option => {
          const { type, label, className, id } = option
          return Object.assign({}, elem, {
            attrs: {
              type,
            },
            className,
            id: id || uuid(),
            options: undefined,
            children: label,
            action: elem.action,
          })
        },
        checkbox: defaultInput,
        radio: defaultInput,
      }

      return optionMarkup[fieldType] && optionMarkup[fieldType](option)
    }

    const mappedOptions = options.map(optionMap)

    return mappedOptions
  }

  /**
   * Checks if there is a closing tag, if so it can hold content
   * @param  {Object} element DOM element
   * @return {Boolean} holdsContent
   */
  holdsContent(element) {
    return element.outerHTML.indexOf('/') !== -1
  }

  /**
   * Is this a textarea, select or other block input
   * also isContentEditable
   * @param  {Object}  element
   * @return {Boolean}
   */
  isBlockInput(element) {
    return !this.isInput(element) && this.holdsContent(element)
  }

  /**
   * Determine if an element is an input field
   * @param  {String|Object} tag tagName or DOM element
   * @return {Boolean} isInput
   */
  isInput(tag) {
    if (typeof tag !== 'string') {
      tag = tag.tagName
    }
    return ['input', 'textarea', 'select'].indexOf(tag) !== -1
  }

  /**
   * Converts escaped HTML into usable HTML
   * @param  {String} html escaped HTML
   * @return {String}      parsed HTML
   */
  parsedHtml(html) {
    const escapeElement = document.createElement('textarea')
    escapeElement.innerHTML = html
    return escapeElement.textContent
  }

  /**
   * Test if label should be display before or after an element
   * @param  {Object} elem config
   * @return {Boolean} labelAfter
   */
  labelAfter(elem) {
    const type = h.get(elem, 'attrs.type')
    const labelAfter = h.get(elem, 'config.labelAfter')
    const isCB = type === 'checkbox' || type === 'radio'
    return labelAfter !== undefined ? labelAfter : isCB
  }

  requiredMark = () => ({
    tag: 'span',
    className: 'text-error',
    children: '*',
  })

  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    const required = h.get(elem, 'attrs.required')
    let {
      config: { label: labelText = '' },
    } = elem
    const { id: elemId, attrs } = elem
    if (typeof labelText === 'function') {
      labelText = labelText()
    }
    const fieldLabel = {
      tag: 'label',
      attrs: {
        for: elemId || (attrs && attrs.id),
      },
      className: [],
      children: [labelText, required && this.requiredMark()],
      action: {},
    }

    if (fMap) {
      // for attribute will prevent label focus
      delete fieldLabel.attrs.for
      fieldLabel.attrs.contenteditable = true
      fieldLabel.fMap = fMap
    }

    return fieldLabel
  }

  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}
   */
  childType(content) {
    if (content === undefined) {
      return content
    }

    return [
      ['array', content => Array.isArray(content)],
      ['node', content => content instanceof window.Node || content instanceof window.HTMLElement],
      ['component', () => content && content.dom],
      [typeof content, () => true],
    ].find(typeCondition => typeCondition[1](content))[0]
  }

  /**
   * Get the computed style for DOM element
   * @param  {Object}  elem     dom element
   * @param  {Boolean} property style eg. width, height, opacity
   * @return {String}           computed style
   */
  getStyle(elem, property = false) {
    let style
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null)
    } else if (elem.currentStyle) {
      style = elem.currentStyle
    }

    return property ? style[property] : style
  }

  /**
   * Retrieves an element by config object, string id,
   * or existing reference
   * @param  {Object|String|Node} elem
   * @return {Object}             DOM element
   */
  getElement(elem) {
    const getElement = {
      node: () => elem,
      object: () => document.getElementById(elem.id),
      string: () => document.getElementById(elem),
    }
    const type = this.childType(elem)
    const element = getElement[type]()

    return element
  }

  /**
   * Util to remove contents of DOM Object
   * @param  {Object} elem
   * @return {Object} element with its children removed
   */
  empty(elem) {
    while (elem.firstChild) {
      this.remove(elem.firstChild)
    }
    return elem
  }

  /**
   * Clones an element, it's data and
   * it's nested elements and data
   * @param {Object} elem element we are cloning
   * @param {Object} parent
   * @todo move to Component
   * @return {Object} cloned element
   */
  clone(elem, parent) {
    // remove
    const formData = {}
    const _this = this
    const { id, fType } = elem
    const dataClone = clone(formData[fType].get(id))
    const newIndex = indexOfNode(elem) + 1
    let noParent = false
    dataClone.id = uuid()
    formData[fType].set(dataClone.id, dataClone)
    if (!parent) {
      parent = elem.parentElement
      noParent = true
    }
    const cloneType = {
      rows: () => {
        dataClone.columns = []
        const stage = Stages.active
        const newRow = stage.addRow(null, dataClone.id)
        const columns = elem.getElementsByClassName(COLUMN_CLASSNAME)

        stage.insertBefore(newRow, stage.childNodes[newIndex])
        h.forEach(columns, column => _this.clone(column, newRow))
        // data.saveRowOrder()
        return newRow
      },
      columns: () => {
        dataClone.fields = []
        const newColumn = _this.addColumn(parent, dataClone.id)
        parent.insertBefore(newColumn, parent.childNodes[newIndex])
        const fields = elem.getElementsByClassName(FIELD_CLASSNAME)

        if (noParent) {
          dom.columnWidths(parent)
        }
        h.forEach(fields, field => _this.clone(field, newColumn))
        return newColumn
      },
      fields: () => {
        const newField = _this.addField(parent, dataClone.id)
        parent.insertBefore(newField, parent.childNodes[newIndex])
        return newField
      },
    }

    return cloneType[fType]()
  }

  /**
   * Remove elements without f children
   * @param  {Object} element DOM element
   * @return {Object} formData
   */
  removeEmpty = element => {
    const parent = element.parentElement
    const type = componentType(element)
    const children = parent.getElementsByClassName(`formeo-${type}`)
    this.remove(element)
    if (!children.length) {
      if (!this.isStage(parent)) {
        return this.removeEmpty(parent)
      } else {
        this.emptyClass(parent)
      }
    }
  }

  /**
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    const type = componentType(elem)
    if (type) {
      return Components.remove(`${type}s.${elem.id}`)
    }

    return elem.parentElement.removeChild(elem)
  }

  /**
   * Removes a class or classes from nodeList
   *
   * @param  {NodeList|Node} nodeList
   * @param  {String | Array} className
   */
  removeClasses(nodeList, className) {
    const removeClass = {
      string: elem => elem.classList.remove(className),
      array: elem => className.forEach(name => elem.classList.remove(name)),
    }
    removeClass.object = removeClass.string // handles regex map
    h.forEach(nodeList, removeClass[this.childType(className)])
  }

  /**
   * Adds a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  addClasses(nodeList, className) {
    const addClass = {
      string: elem => elem.classList.add(className),
      array: elem => className.forEach(name => elem.classList.add(name)),
    }
    h.forEach(nodeList, addClass[this.childType(className)])
  }

  /**
   * Read columns and generate bootstrap cols
   * @param  {Object}  row    DOM element
   */
  columnWidths(row) {
    const columns = row.getElementsByClassName(COLUMN_CLASSNAME)
    if (!columns.length) {
      return
    }
    const width = parseFloat((100 / columns.length).toFixed(1)) / 1

    this.removeClasses(columns, bsColRegExp)
    h.forEach(columns, column => {
      Columns.get(column.id).refreshFieldPanels()

      const newColWidth = numToPercent(width)

      column.style.width = newColWidth
      column.style.float = 'left'
      Columns.set(`${column.id}.config.width`, newColWidth)
      column.dataset.colWidth = newColWidth
      document.dispatchEvent(events.columnResized)
    })

    dom.updateColumnPreset(row)
  }

  /**
   * Wrap content in a formGroup
   * @param  {Object|Array|String} content
   * @param  {String} className
   * @return {Object} formGroup config
   */
  formGroup(content, className = '') {
    return {
      className: ['f-field-group', className],
      children: content,
    }
  }

  /**
   * Returns the {x, y} coordinates for the
   * center of a given element
   * @param  {DOM} element
   * @return {Object}      {x,y} coordinates
   */
  coords(element) {
    const elemPosition = element.getBoundingClientRect()
    const bodyRect = document.body.getBoundingClientRect()

    return {
      pageX: elemPosition.left + elemPosition.width / 2,
      pageY: elemPosition.top - bodyRect.top - elemPosition.height / 2,
    }
  }

  /**
   * Removes all fields and resets a stage
   * @param  {DOM} stage DOM element
   */
  clearStage(stage) {
    stage.classList.add('removing-all-fields')

    const resetStage = () => {
      // Empty the data register for stage
      // and everything below it.
      dom.empty(stage)
      stage.classList.remove('removing-all-fields')
      // data.save()
      dom.emptyClass(stage)
      animate.slideDown(stage, 300)
    }

    // var markEmptyArray = [];

    // if (opts.prepend) {
    //   markEmptyArray.push(true);
    // }

    // if (opts.append) {
    //   markEmptyArray.push(true);
    // }

    // if (!markEmptyArray.some(elem => elem === true)) {
    // stage.classList.add('empty-stages');
    // }

    animate.slideUp(stage, 600, resetStage)
    // animate.slideUp(stage, 2000);
  }

  /**
   * Toggles a sortables `disabled` option.
   * @param  {Object} elem DOM element
   * @param  {Boolean} state
   */
  toggleSortable(elem, state) {
    const fType = componentType(elem)
    if (!fType) {
      return
    }
    const pFtype = componentType(elem.parentElement)
    const sortable = dom[fType].get(elem.id).sortable
    if (!state) {
      state = !sortable.option('disabled')
    }
    sortable.option('disabled', state)
    if (pFtype && ['rows', 'columns', 'stages'].includes(pFtype)) {
      this.toggleSortable(elem.parentElement, state)
    }
  }

  /**
   * Apply empty class to element if does not have children
   * @param  {Object} elem
   */
  emptyClass(elem) {
    const children = elem.getElementsByClassName(CHILD_CLASSNAME_MAP.get(elem.classList.item(0)))
    elem.classList.toggle('empty', !children.length)
  }

  /**
   * Style Object
   * Usage:
   *
      const rules = [['.css-class-selector', ['width', '100%', true]]]
      dom.insertRule(rules)
   * @param  {Object} rules
   * @return {Number} index of added rule
   */
  insertRule(rules) {
    const styleSheet = this.styleSheet
    const rulesLength = styleSheet.cssRules.length
    for (let i = 0, rl = rules.length; i < rl; i++) {
      let j = 1
      let rule = rules[i]
      const selector = rules[i][0]
      let propStr = ''
      // If the second argument of a rule is an array
      // of arrays, correct our variables.
      if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
        rule = rule[1]
        j = 0
      }

      for (let pl = rule.length; j < pl; j++) {
        const prop = rule[j]
        const important = prop[2] ? ' !important' : ''
        propStr += `${prop[0]}:${prop[1]}${important};`
      }

      // Insert CSS Rule
      return styleSheet.insertRule(`${selector} { ${propStr} }`, rulesLength)
    }
  }
  btnTemplate = ({ title = '', ...rest }) => ({
    tag: 'button',
    attrs: {
      type: 'button',
      title,
    },
    ...rest,
  })

  isControls = node => componentType(node) === CONTROL_GROUP_CLASSNAME
  isStage = node => componentType(node) === STAGE_CLASSNAME
  isRow = node => componentType(node) === ROW_CLASSNAME
  isColumn = node => componentType(node) === COLUMN_CLASSNAME
  isField = node => componentType(node) === FIELD_CLASSNAME
  asComponent = elem => Components[`${componentType(elem)}s`].get(elem.id)
}

export const dom = new DOM()

export default dom
