import h from './helpers'
import i18n from 'mi18n'
import events from './events'
import Row from '../components/rows/row'
import Column from '../components/columns/column'
import Field from '../components/fields/field'
import animate from './animation'
import { data, formData, registeredFields } from './data'
import { uuid, clone, numToPercent, remove, closestFtype, mapToObj } from './utils'
// import { rows as rowsData } from '../data'
import columnsData from '../data/columns'
import rowsData from '../data/rows'
import FormeoData from '../data'
import Fields from '../components/fields'

/**
 * General purpose markup utilities and generator.
 */
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor() {
    // Maintain references to DOM nodes
    // so we don't have to keep doing getElementById
    this.stages = new Map()
    this.rows = new Map()
    this.columns = new Map()
    // this.fields = new Map()
    this.styleSheet = (() => {
      const style = document.createElement('style')
      style.setAttribute('media', 'screen')
      style.setAttribute('type', 'text/css')
      style.appendChild(document.createTextNode(''))
      document.head.appendChild(style)
      return style.sheet
    })()
  }

  /**
   * Merges a user's configuration with default
   * @param  {Object} userConfig
   * @return {Object} config
   */
  set setConfig(userConfig) {
    const _this = this
    const icon = _this.icon
    const btnTemplate = {
      tag: 'button',
      children: [],
      attrs: {
        className: ['btn'],
        type: 'button',
      },
    }

    const handle = h.merge(Object.assign({}, btnTemplate), {
      children: [icon('move'), icon('handle')],
      attrs: {
        className: ['item-handle'],
      },
      meta: {
        id: 'handle',
      },
    })

    const edit = h.merge(Object.assign({}, btnTemplate), {
      children: icon('edit'),
      attrs: {
        className: ['item-edit-toggle'],
      },
      meta: {
        id: 'edit',
      },
      action: {
        click: evt => {
          const element = closestFtype(evt.target)
          let { fType } = element
          fType = fType.replace(/s$/, '')
          const editClass = 'editing-' + fType
          const editWindow = element.querySelector(`.${fType}-edit`)
          animate.slideToggle(editWindow, 333)
          if (fType === 'field') {
            animate.slideToggle(editWindow.nextSibling, 333)
            element.parentElement.classList.toggle('column-' + editClass)
          }
          element.classList.toggle(editClass)
        },
      },
    })

    const remove = h.merge(Object.assign({}, btnTemplate), {
      children: icon('remove'),
      attrs: {
        className: ['item-remove'],
      },
      meta: {
        id: 'remove',
      },
      action: {
        click: (evt, id) => {
          const element = closestFtype(evt.target)
          animate.slideUp(element, 250, elem => {
            _this.removeEmpty(elem)
          })
        },
      },
    })

    const cloneItem = h.merge(Object.assign({}, btnTemplate), {
      children: icon('copy'),
      attrs: {
        className: ['item-clone'],
      },
      meta: {
        id: 'clone',
      },
      action: {
        click: evt => {
          _this.clone(closestFtype(evt.target))
          data.save()
        },
      },
    })

    const defaultConfig = {
      rows: {
        actionButtons: {
          buttons: [clone(handle), edit, cloneItem, remove],
          order: [],
          disabled: [],
        },
      },
      columns: {
        actionButtons: {
          buttons: [clone(cloneItem), clone(handle), remove],
          order: [],
          disabled: [],
        },
      },
      fields: {
        actionButtons: {
          buttons: [handle, edit, cloneItem, remove],
          order: [],
          disabled: [],
        },
      },
    }

    defaultConfig.rows.actionButtons.buttons[0].content = [icon('move-vertical'), icon('handle')]
    defaultConfig.columns.actionButtons.buttons[0].content = [icon('copy'), icon('handle')]

    const mergedConfig = h.merge(defaultConfig, userConfig)

    Object.keys(mergedConfig).forEach(key => {
      if (mergedConfig[key].actionButtons) {
        const aButtons = mergedConfig[key].actionButtons
        const disabled = aButtons.disabled
        const buttons = aButtons.buttons

        // Order buttons
        aButtons.buttons = h.orderObjectsBy(buttons, aButtons.order, 'meta.id')
        // filter disabled buttons
        aButtons.buttons = aButtons.buttons.filter(button => {
          const metaId = h.get(button, 'meta.id')
          return !h.inArray(metaId, disabled)
        })
      }
    })

    // overrides language set dir
    if (mergedConfig.dir) {
      this.dir = mergedConfig.dir
    }

    this.config = mergedConfig

    return this.config
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
      const tag = elem.attrs.tag
      if (tag) {
        const selectedTag = tag.find(t => t.selected === true)
        if (selectedTag) {
          tagName = selectedTag.value
        }
      }
    }

    elem.tag = tagName || elem.tag || 'div'

    return elem
  }

  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create = (elem, isPreview = false) => {
    if (elem instanceof Map) {
      elem = mapToObj(elem)
    }
    elem = this.processTagName(elem)
    const _this = this
    let childType
    const { tag } = elem
    const processed = ['children', 'content']
    let i
    const wrap = {
      tag: 'div',
      attrs: {},
      className: [h.get(elem, 'config.inputWrap') || 'f-field-group'],
      children: [],
      config: {},
    }
    const requiredMark = {
      tag: 'span',
      className: 'text-error',
      children: '*',
    }
    let element = document.createElement(tag)
    const required = h.get(elem, 'attrs.required')

    /**
     * Object for mapping contentType to its function
     * @type {Object}
     */
    const appendChildren = {
      string: children => {
        element.innerHTML += children
      },
      object: children => {
        return element.appendChild(_this.create(children, isPreview))
      },
      node: children => {
        return element.appendChild(children)
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
        wrap.className.push = h.get(elem, 'attrs.className')
        if (required) {
          wrap.attrs.required = required
        }
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
      // const editablePreview = elem.config.editable && isPreview
      if (((elem.config.label && tag !== 'button') || ['radio', 'checkbox'].includes(h.get(elem, 'attrs.type'))) && !isPreview) {
        const label = _this.label(elem)

        if (!elem.config.hideLabel) {
          if (_this.labelAfter(elem)) {
            // add check for inline checkbox
            wrap.className = `f-${elem.attrs.type}`

            label.insertBefore(element, label.firstChild)
            wrap.children.push(label)
            if (required) {
              wrap.children.push(requiredMark)
            }
          } else {
            wrap.children.push(label)
            if (required) {
              wrap.children.push(requiredMark)
            }
            wrap.children.push(element)
          }
        }
      }

      processed.push('config')
    }

    // Append Element Content
    if (elem.content || elem.children) {
      const children = elem.content || elem.children
      childType = _this.childType(children)
      appendChildren[childType].call(this, children)
    }

    // Set the new element's dataset
    if (elem.dataset) {
      for (const data in elem.dataset) {
        if (elem.dataset.hasOwnProperty(data)) {
          element.dataset[data] = elem.dataset[data]
        }
      }
      processed.push('dataset')
    }

    // Add listeners for defined actions
    if (elem.action) {
      const actions = Object.keys(elem.action)
      for (i = actions.length - 1; i >= 0; i--) {
        const event = actions[i]
        let action = elem.action[event]
        if (typeof action === 'string') {
          // eslint-disable-next-line
          action = window.eval(`(${elem.action[event]})`)
        }
        const useCaptureEvts = ['focus', 'blur']

        // dirty hack to handle onRender callback
        if (event === 'onRender') {
          setTimeout(() => {
            action(element)
          }, 10)
        } else {
          const useCapture = h.inArray(event, useCaptureEvts)
          element.addEventListener(event, action, useCapture)
        }
      }
      processed.push('action')
    }

    const fieldDataBindings = ['stage', 'row', 'column', 'field']

    if (h.inArray(elem.fType, fieldDataBindings)) {
      const dataType = elem.fType + 'Data'
      element[dataType] = elem
      if (dataType === 'fieldData') {
        element.panelNav = elem.panelNav
      }
      processed.push(dataType)
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

  /**
   * Create and SVG or font icon.
   * Simple string concatenation instead of DOM.create because:
   *  - we don't need the perks of having icons be DOM objects at this stage
   *  - it forces the icon to be appended using innerHTML which helps svg render
   * @param  {String} name - icon name
   * @return {String} icon markup
   */
  icon(name) {
    const iconLink = document.getElementById('icon-' + name)
    let icon

    if (iconLink) {
      icon = `<svg class="svg-icon icon-${name}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-${name}"></use></svg>`
    } else {
      // eslint-disable-next-line
      icon = `<span class="glyphicon glyphicon-${name}" aria-hidden="true"></span>`
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
   * Generate a fancy checkbox or radio
   * @param  {Object}  elem
   * @param  {Boolean} isPreview
   * @return {Object} checkable
   */
  checkbox(elem, isPreview) {
    const label = h.get(elem, 'elem.config.label') || ''
    const checkable = {
      tag: 'span',
      className: 'checkable',
      children: label,
    }

    return {
      tag: 'label',
      children: [elem, checkable],
    }
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
      const {label, ...rest} = option
      const defaultInput = () => {
        let input = {
          tag: 'input',
          attrs: {
            id,
            name: `${id}[${i}]`,
            type: fieldType,
            value: option.value || '',
            ...rest
          },
          action,
        }
        let optionLabel = {
          tag: 'label',
          attrs: {},
          config: {
            inputWrap: 'form-check',
          },
          children: [option.label],
        }
        const checkable = {
          tag: 'span',
          className: 'checkable',
          // children: option.label || '',
        }
        const inputWrap = {
          children: [optionLabel],
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
          input.attrs.name = `prev-${input.attrs.name}`
          // input.fMap = `options[${i}].selected`
          optionLabel.attrs.contenteditable = true
          // optionLabel.fMap = `options[${i}].label`
          checkable.content = undefined
          const checkableLabel = {
            tag: 'label',
            children: [input, checkable],
          }
          inputWrap.children.unshift(checkableLabel)
        } else {
          optionLabel.content = checkable
          optionLabel = dom.create(optionLabel)
          input = dom.create(input)
          optionLabel.insertBefore(input, optionLabel.firstChild)
          inputWrap.content = optionLabel
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

      return optionMarkup[fieldType](option)
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
    const isCB = type === 'checkbox' || type === 'radio'
    return isCB || h.get(elem, 'config.labelAfter')
  }

  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    let {
      config: { label: labelText = '' },
    } = elem
    if (typeof labelText === 'function') {
      labelText = labelText()
    }
    const fieldLabel = {
      tag: 'label',
      attrs: {},
      className: [],
      children: labelText,
      action: {},
    }

    if (this.labelAfter(elem)) {
      const checkable = {
        tag: 'span',
        className: 'checkable',
        children: labelText,
      }
      fieldLabel.content = checkable
    }

    if (elem.id) {
      fieldLabel.attrs.for = elem.id
    }

    if (fMap) {
      // for attribute will prevent label focus
      delete fieldLabel.attrs.for
      fieldLabel.attrs.contenteditable = true
      fieldLabel.fMap = fMap
    }

    return dom.create(fieldLabel)
  }

  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}
   */
  childType(content) {
    let type = typeof content
    if (content instanceof window.Node || content instanceof window.HTMLElement) {
      type = 'node'
    } else if (Array.isArray(content)) {
      type = 'array'
    }

    return type
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
   * Move, close, and edit buttons for row, column and field
   * @param  {String} id   element id
   * @param  {String} layout type of element eg. row, column, field
   * @return {Object}      element config object
   */
  actionButtons(id, layout = 'column') {
    const _this = this
    const tag = layout === 'column' ? 'li' : 'div'
    const btnWrap = {
      tag: 'div',
      className: 'action-btn-wrap',
    }
    const actions = {
      tag,
      className: layout + '-actions group-actions',
      action: {
        mouseenter: ({ target }) => {
          const element = document.getElementById(id)
          element.classList.add('hovering-' + layout)
          target.parentReference = element
        },
        mouseleave: ({ target }) => target.parentReference.classList.remove('hovering-' + layout),
        onRender: elem => {
          const buttons = elem.getElementsByTagName('button')
          const cssProp = layout === 'row' ? 'height' : 'width'
          const btnSize = parseInt(_this.getStyle(buttons[0], cssProp))
          const expandedSize = `${buttons.length * btnSize + 1}px`
          const rules = [[`.hovering-${layout} .${layout}-actions`, [cssProp, expandedSize, true]]]

          _this.insertRule(rules)
        },
      },
    }

    btnWrap.content = this.config[`${layout}s`].actionButtons.buttons
    actions.content = btnWrap

    return actions
  }

  /**
   * Clones an element, it's data and
   * it's nested elements and data
   * @param {Object} elem element we are cloning
   * @param {Object} parent
   * @return {Object} cloned element
   */
  clone(elem, parent) {
    const _this = this
    const { id, fType } = elem
    const dataClone = clone(formData[fType].get(id))
    const newIndex = h.indexOfNode(elem) + 1
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
        const stage = _this.activeStage
        const newRow = _this.addRow(null, dataClone.id)
        const columns = elem.getElementsByClassName('stage-columns')

        stage.insertBefore(newRow, stage.childNodes[newIndex])
        h.forEach(columns, column => _this.clone(column, newRow))
        data.saveRowOrder()
        return newRow
      },
      columns: () => {
        dataClone.fields = []
        const newColumn = _this.addColumn(parent.id, dataClone.id)
        parent.insertBefore(newColumn, parent.childNodes[newIndex])
        const fields = elem.getElementsByClassName('stage-fields')

        if (noParent) {
          dom.columnWidths(parent)
        }
        h.forEach(fields, field => _this.clone(field, newColumn))
        return newColumn
      },
      fields: () => {
        const newField = _this.addField(parent.id, dataClone.id)
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
  removeEmpty(element) {
    const _this = this
    const parent = element.parentElement
    const type = element.fType
    const children = parent.getElementsByClassName('stage-' + type)
    _this.remove(element)
    if (!children.length) {
      if (parent.fType !== 'stages') {
        return _this.removeEmpty(parent)
      } else {
        this.emptyClass(parent)
      }
    }
    if (type === 'columns') {
      _this.columnWidths(parent)
    }
    return data.save()
  }

  /**
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    const { fType, id } = elem

    if (fType) {
      const parent = elem.parentElement

      const pData = formData[parent.fType].get(parent.id)
      data.empty(fType, id)
      this[fType].delete(id)
      formData[fType].delete(id)
      remove(pData[fType], id)
    }
    FormeoData.remove()
    return elem.parentElement.removeChild(elem)
  }

  /**
   * Removes a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
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
   * Sets classes for legacy browsers to identify first and last fields in a block
   * consider removing
   * @param  {DOM} column
   */
  fieldOrderClass(column) {
    const fields = column.querySelectorAll('.stage-fields')

    if (fields.length) {
      this.removeClasses(fields, ['first-field', 'last-field'])
      fields[0].classList.add('first-field')
      fields[fields.length - 1].classList.add('last-field')
    }
  }

  /**
   * Read columns and generate bootstrap cols
   * @param  {Object}  row    DOM element
   */
  columnWidths(row) {
    const fields = []
    const columns = row.getElementsByClassName('stage-columns')
    if (!columns.length) {
      return
    }
    const width = parseFloat((100 / columns.length).toFixed(1)) / 1
    const bsGridRegEx = /\bcol-\w+-\d+/g

    this.removeClasses(columns, bsGridRegEx)
    h.forEach(columns, column => {
      const columnData = columnsData.get(column.id)
      fields.push(...columnData.fields)

      const newColWidth = numToPercent(width)

      column.style.width = newColWidth
      column.style.float = 'left'
      columnsData.set(`${column.id}.config.width`, newColWidth)
      column.dataset.colWidth = newColWidth
      document.dispatchEvent(events.columnResized)
    })

    setTimeout(() => fields.forEach(fieldId => Fields.get(fieldId).panelNav.refresh()), 250)

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
      tag: 'div',
      className: ['f-field-group', className],
      children: content,
    }
  }

  /**
   * Generates the element config for column layout in row
   * @return {Object} columnPresetControlConfig
   */
  columnPresetControl(rowId) {
    const _this = this
    const rowData = rowsData.get(rowId)
    const layoutPreset = {
      tag: 'select',
      attrs: {
        ariaLabel: 'Define a column layout', // @todo i18n
        className: 'column-preset',
      },
      action: {
        change: ({ target: { value } }) => {
          const dRow = this.rows.get(this.rowId)
          _this.setColumnWidths(dRow.row, value)
          data.save()
        },
      },
    }
    const pMap = new Map()
    const custom = { value: 'custom', label: 'Custom' }

    pMap.set(1, [{ value: '100.0', label: '100%' }])
    pMap.set(2, [
      { value: '50.0,50.0', label: '50 | 50' },
      { value: '33.3,66.6', label: '33 | 66' },
      { value: '66.6,33.3', label: '66 | 33' },
      custom,
    ])
    pMap.set(3, [
      { value: '33.3,33.3,33.3', label: '33 | 33 | 33' },
      { value: '25.0,25.0,50.0', label: '25 | 25 | 50' },
      { value: '50.0,25.0,25.0', label: '50 | 25 | 25' },
      { value: '25.0,50.0,25.0', label: '25 | 50 | 25' },
      custom,
    ])
    pMap.set(4, [{ value: '25.0,25.0,25.0,25.0', label: '25 | 25 | 25 | 25' }, custom])
    pMap.set('custom', [custom])

    if (rowData && rowData.children.length) {
      const columns = rowData.columns
      const pMapVal = pMap.get(columns.length)
      layoutPreset.options = pMapVal || pMap.get('custom')
      const curVal = columns
        .map((columnId, i) => {
          // const colData = formData.getIn(['columns', columnId])
          // return colData.config.width.replace('%', '')
        })
        .join(',')
      if (pMapVal) {
        pMapVal.forEach((val, i) => {
          const options = layoutPreset.options
          if (val.value === curVal) {
            options[i].selected = true
          } else {
            delete options[i].selected
            options[options.length - 1].selected = true
          }
        })
      }
    } else {
      layoutPreset.options = pMap.get(1)
    }

    return layoutPreset
  }

  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths(row, widths) {
    if (widths === 'custom') {
      return
    }
    widths = widths.split(',')
    const columns = row.getElementsByClassName('stage-columns')
    h.forEach(columns, (column, i) => {
      const percentWidth = widths[i] + '%'
      column.dataset.colWidth = percentWidth
      column.style.width = percentWidth
      formData.getIn(['columns', column.id]).config.width = percentWidth
    })
  }

  /**
   * Updates the column preset <select>
   * @param  {String} row
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset(row) {
    const oldColumnPreset = row.querySelector('.column-preset')
    const rowEdit = oldColumnPreset.parentElement
    const columnPresetConfig = this.columnPresetControl(row.id)
    const newColumnPreset = this.create(columnPresetConfig)

    rowEdit.replaceChild(newColumnPreset, oldColumnPreset)
    return columnPresetConfig
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
   * Loop through the formData and append it to the stage
   * @param  {Object} stage DOM element
   * @return {Array}  loaded rows
   */
  loadRows(stage) {
    if (!stage) {
      stage = this.activeStage
    }

    // console.log()

    // const stageData = formData.getIn(['stages', stage.id])
    const rows = formData.getIn(['stages', stage.id, 'rows'])
    rows.forEach(rowId => {
      const row = this.addRow(stage.id, rowId)
      this.loadColumns(row)
      dom.updateColumnPreset(row)
      stage.appendChild(row)
    })
  }

  /**
   * Load columns to row
   * @param  {Object} row
   */
  loadColumns(row) {
    const columns = formData.getIn(['rows', row.id]).columns
    return columns.map(columnId => {
      const column = this.addColumn(row.id, columnId)
      this.loadFields(column)
      return column
    })
  }

  /**
   * Load a columns fields
   * @param  {Object} column column config object
   */
  loadFields(column) {
    const fields = formData.getIn(['columns', column.id]).fields
    fields.forEach(fieldId => this.addField(column.id, fieldId))
    this.fieldOrderClass(column)
  }

  /**
   * Create or add a field and column then return it.
   * @param  {Object} evt Drag event data
   * @return {Object}     column
   */
  createColumn(evt) {
    const fType = evt.from.fType
    const field = fType === 'columns' ? evt.item : new Field(evt.item.id)
    const column = new Column()

    field.classList.add('first-field')
    column.appendChild(field)
    formData.getIn(['columns', column.id]).fields.push(field.id)
    return column
  }

  /**
   * Convert sizes, apply styles for render
   * @param  {Object} columnData
   * @return {Object} processed column data
   */
  processColumnConfig(columnData) {
    if (columnData.className) {
      columnData.className.push('f-render-column')
    }
    const colWidth = columnData.config.width || '100%'
    columnData.style = `width: ${colWidth}`
    return columnData
  }

  /**
   * Renders currently loaded formData to the renderTarget
   * @param {Object} renderTarget
   */
  renderForm(renderTarget) {
    this.empty(renderTarget)
    const renderData = data.prepData
    const renderCount = document.getElementsByClassName('formeo-render').length
    const content = Object.values(renderData.stages).map(stageData => {
      const { rows: rowsData, ...stage } = stageData
      const rows = rowsData.map(rowId => {
        const { columns, ...row } = renderData.rows[rowId]
        row.content = columns.map(columnId => {
          const processedCol = this.processColumnConfig(renderData.columns[columnId])
          return Object.assign({}, processedCol, {
            children: processedCol.fields.map(fieldId => renderData.fields[fieldId]),
          })
        })

        if (row.config.inputGroup) {
          const rowData = clone(row)
          const removeButton = {
            tag: 'button',
            className: 'remove-input-group',
            children: dom.icon('remove'),
            action: {
              mouseover: ({ target }) => target.parentElement.classList.add('will-remove'),
              mouseleave: ({ target }) => target.parentElement.classList.remove('will-remove'),
              click: ({ target }) => {
                const currentInputGroup = target.parentElement
                const iGWrap = currentInputGroup.parentElement
                const iG = iGWrap.getElementsByClassName('f-input-group')
                if (iG.length > 1) {
                  dom.remove(currentInputGroup)
                } else {
                  console.log('Need at least 1 group')
                }
              },
            },
          }
          rowData.children.unshift(removeButton)
          const inputGroupWrap = {
            tag: 'div',
            id: uuid(),
            className: 'f-input-group-wrap',
          }
          if (rowData.attrs.className) {
            if (typeof rowData.attrs.className === 'string') {
              rowData.attrs.className += ' f-input-group'
            } else {
              rowData.attrs.className.push('f-input-group')
            }
          }
          const addButton = {
            tag: 'button',
            attrs: {
              className: 'add-input-group btn pull-right',
              type: 'button',
            },
            children: 'Add +',
            action: {
              click: e => {
                const fInputGroup = e.target.parentElement
                fInputGroup.insertBefore(dom.create(rowData), fInputGroup.lastChild)
              },
            },
          }

          // row.children.unshift(removeButton)
          inputGroupWrap.content = [rowData, addButton]
          return inputGroupWrap
        }
        return row
      })
      stage.tag = 'div'
      stage.content = rows
      stage.className = 'f-stage'
      return stage
    })

    const config = {
      tag: 'div',
      id: `formeo-rendered-${renderCount}`,
      className: 'formeo-render formeo',
      content,
    }

    renderTarget.appendChild(this.create(config))
  }

  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearForm(evt) {
    this.stages.forEach(dStage => this.clearStage(dStage.stage))
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
      data.save()
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
   * Adds a row to the stage
   * @param {String} stageId
   * @param {String} rowId
   * @return {Object} DOM element
   */
  addRow(stageId, rowId) {
    const row = new Row({ id: rowId })
    const stage = stageId ? this.stages.get(stageId).stage : this.activeStage
    stage.appendChild(row.dom)
    data.saveRowOrder(stage)
    this.emptyClass(stage)
    events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'row',
        oldValue: undefined,
        newValue: row.rowData,
      },
    })
    document.dispatchEvent(events.formeoUpdated)
    return row.dom
  }

  /**
   * Adds a Column to a row
   * @param {String} rowId
   * @param {String} columnId
   * @return {Object} DOM element
   */
  addColumn(rowId, columnId) {
    const column = new Column(columnId)
    const row = this.rows.get(rowId).row
    row.appendChild(column.dom)
    data.saveColumnOrder(row)
    this.emptyClass(row)
    events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'column',
        oldValue: undefined,
        newValue: column.columnData,
      },
    })
    document.dispatchEvent(events.formeoUpdated)
    return column
  }

  /**
   * Toggles a sortables `disabled` option.
   * @param  {Object} elem DOM element
   * @param  {Boolean} state
   */
  toggleSortable(elem, state) {
    const { fType } = elem
    if (!fType) {
      return
    }
    const pFtype = elem.parentElement.fType
    const sortable = dom[fType].get(elem.id).sortable
    if (!state) {
      state = !sortable.option('disabled')
    }
    sortable.option('disabled', state)
    if (pFtype && h.inArray(pFtype, ['rows', 'columns', 'stages'])) {
      this.toggleSortable(elem.parentElement, state)
    }
  }

  /**
   * Adds a field to a column
   * @param {String} columnId
   * @param {String} fieldId
   * @return {Object} field
   */
  addField(columnId, fieldId) {
    const field = new Field(registeredFields[fieldId])
    if (columnId) {
      const column = this.columns.get(columnId).column
      column.appendChild(field.dom)
      data.saveFieldOrder(column)
      this.emptyClass(column)
    }
    events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
      data: {
        updateType: 'add',
        changed: 'field',
        oldValue: undefined,
        newValue: field.data,
      },
    })
    document.dispatchEvent(events.formeoUpdated)
    return field
  }

  /**
   * Apply empty class to element if does not have children
   * @param  {Object} elem
   */
  emptyClass(elem) {
    const type = elem.fType
    if (type) {
      const childMap = new Map([['rows', 'columns'], ['columns', 'fields'], ['stages', 'rows']])
      const children = elem.getElementsByClassName(`stage-${childMap.get(type)}`)
      elem.classList.toggle(`empty-${type}`, !children.length)
    }
  }

  /**
   * Shorthand expander for dom.create
   * @param  {String} tag
   * @param  {Object} attrs
   * @param  {Object|Array|String} content
   * @return {Object} DOM node
   */
  h(tag, attrs, content) {
    return this.create({ tag, attrs, content })
  }

  /**
   * Style Object
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
}

const dom = new DOM()

export default dom
