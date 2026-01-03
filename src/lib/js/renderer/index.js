import dom, { getName } from '../common/dom.js'
import { fetchDependencies } from '../common/loaders.js'
import { cleanFormData, isAddress, merge, uuid } from '../common/utils/index.mjs'
import { splitAddress } from '../common/utils/string.mjs'
import { STAGE_CLASSNAME } from '../constants.js'
import {
  baseId,
  comparisonMap,
  createRemoveButton,
  processOptions,
  propertyMap,
  RENDER_PREFIX,
  targetPropertyMap,
} from './helpers.js'

export default class FormeoRenderer {
  constructor(opts, formDataArg) {
    const { renderContainer: container, elements, formData, config } = processOptions(opts)
    this.container = container
    this.form = cleanFormData(formDataArg || formData)
    this.elements = elements
    this.config = config
    this.components = Object.create(null)
    this.dom = dom
  }

  get formData() {
    return this.form
  }

  set formData(data) {
    this.form = cleanFormData(data)
  }

  /**
   * Gets the user data from the rendered form as a plain object.
   * Converts FormData to an object, handling multiple values for the same key
   * by converting them into arrays.
   *
   * @returns {Object.<string, string|string[]>} An object containing form field names as keys
   * and their values. Fields with multiple values are stored as arrays.
   *
   * @example
   * // Form with single values
   * { username: 'john', email: 'john@example.com' }
   *
   * @example
   * // Form with multiple values for same key
   * { username: 'john', hobbies: ['reading', 'gaming'] }
   */
  get userData() {
    const form = this.container.querySelector('.formeo-render') || this.renderedForm
    if (!form) {
      return {}
    }
    const formEntries = new FormData(form)

    const formDataObj = {}
    for (const [key, value] of formEntries.entries()) {
      if (formDataObj[key]) {
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value)
        } else {
          formDataObj[key] = [formDataObj[key], value]
        }
      } else {
        formDataObj[key] = value
      }
    }

    return formDataObj
  }

  /**
   * Gets the user form data as an array of field objects.
   * Combines user input values with component metadata to create structured field data.
   *
   * @returns {Array<{key: string, value: any, label: string}>} An array of field data objects, where each object contains:
   *   - key: The field identifier
   *   - value: The user's input value for the field
   *   - label: The field's label from component configuration (empty string if not found)
   */
  get userFormData() {
    const userFormData = []
    for (const [key, value] of Object.entries(this.userData)) {
      const fieldData = {
        key,
        value,
        label: this.components[baseId(key)]?.config?.label || '',
      }
      userFormData.push(fieldData)
    }

    return userFormData
  }

  set userData(data = {}) {
    const form = this.container.querySelector('form')
    for (const key of Object.keys(data)) {
      const fields = form.elements[key]

      // Handle checkbox groups
      if (fields.length && fields[0].type === 'checkbox') {
        // Convert to array if not already
        const values = Array.isArray(data[key]) ? data[key] : [data[key]]

        for (const field of fields) {
          field.checked = values.includes(field.value)
        }
      }
      // Handle radio groups
      else if (fields.length && fields[0].type === 'radio') {
        for (const field of fields) {
          field.checked = field.value === data[key]
        }
      }
      // Handle single inputs
      else if (fields.type) {
        fields.value = data[key]
      }
    }
  }

  /**
   * Renders the formData to a target Element
   * @param {Object} formData
   */
  render(formData = this.form) {
    this.form = cleanFormData(formData)
    const renderedForm = this.getRenderedForm(formData)
    const existingRenderedForm = this.container.querySelector('.formeo-render')

    if (existingRenderedForm) {
      existingRenderedForm.replaceWith(renderedForm)
    } else {
      this.container.appendChild(renderedForm)
    }
  }

  getRenderedForm(formData = this.form) {
    this.form = cleanFormData(formData)

    const renderCount = document.getElementsByClassName('formeo-render').length
    const config = {
      ...this.config,
      tag: 'form',
      id: this.form.id,
      className: `formeo-render formeo formeo-rendered-${renderCount}`,
      children: this.processedData,
    }

    this.renderedForm = dom.render(config)

    this.applyConditions()

    return this.renderedForm
  }

  get html() {
    const renderedForm = this.renderedForm || this.getRenderedForm()
    return renderedForm.outerHTML
  }

  orderChildren = (type, order) =>
    order.reduce((acc, cur) => {
      acc.push(this.form[type][cur])
      return acc
    }, [])

  prefixId = id => RENDER_PREFIX + id

  /**
   * Convert sizes, apply styles for render
   * @param  {Object} columnData
   * @return {Object} processed column data
   */
  processColumn = ({ id, ...columnData }) => ({
    ...columnData,
    id: this.prefixId(id),
    children: this.processFields(columnData.children),
    style: `width: ${columnData.config.width || '100%'}`,
  })

  processRows = stageId =>
    this.orderChildren('rows', this.form.stages[stageId].children).reduce((acc, row) => {
      if (row) {
        acc.push(this.processRow(row))
      }
      return acc
    }, [])

  cacheComponent = data => {
    this.components[baseId(data.id)] = data
    return data
  }

  /**
   * Applies a row's config
   * @param {Object} row data
   * @return {Object} row config object
   */
  processRow = (data, type = 'row') => {
    const { config, id } = data
    const className = [`formeo-${type}-wrap`]
    const rowData = { ...data, children: this.processColumns(data.id), id: this.prefixId(id) }
    this.cacheComponent(rowData)

    const configConditions = [
      { condition: config.legend, result: () => ({ tag: config.fieldset ? 'legend' : 'h3', children: config.legend }) },
      { condition: true, result: () => rowData },
      { condition: config.inputGroup, result: () => this.addButton(id) },
    ]

    const children = configConditions.reduce((acc, { condition, result }) => {
      if (condition) {
        acc.push(result())
      }
      return acc
    }, [])

    if (config.inputGroup) {
      className.push(`${RENDER_PREFIX}input-group-wrap`)
    }

    return {
      tag: config.fieldset ? 'fieldset' : 'div',
      className,
      children,
    }
  }

  cloneComponentData = componentId => {
    const { children = [], id, attrs = {}, ...rest } = this.components[componentId]
    const updatedAttrs = { ...attrs, 'data-clone-of': id }

    if (rest.tag === 'input') {
      updatedAttrs.name = getName(this.components[componentId])
    }

    return {
      ...rest,
      id: RENDER_PREFIX + uuid(id),
      children: children?.length && children.map(({ id }) => this.cloneComponentData(baseId(id))),
      attrs: updatedAttrs,
    }
  }

  addButton = id => ({
    tag: 'button',
    attrs: {
      className: 'add-input-group btn pull-right',
      type: 'button',
    },
    children: 'Add +',
    action: {
      click: e => {
        const fInputGroup = e.target.parentElement
        const elem = dom.create(this.cloneComponentData(id))
        fInputGroup.insertBefore(elem, fInputGroup.lastChild)
        const removeButton = dom.create(createRemoveButton())

        elem.appendChild(removeButton)
      },
    },
  })

  processColumns = rowId => {
    return this.orderChildren('columns', this.form.rows[rowId].children).map(column =>
      this.cacheComponent(this.processColumn(column))
    )
  }

  processFields = fieldIds =>
    this.orderChildren('fields', fieldIds).map(({ id, ...field }) => {
      const controlId = field.config?.controlId || field.meta?.id
      const { action = {}, dependencies = {} } = this.elements[controlId] || {}

      if (dependencies) {
        fetchDependencies(dependencies)
      }

      const mergedFieldData = merge({ action }, field)

      return this.cacheComponent({ ...mergedFieldData, id: this.prefixId(id) })
    })

  get processedData() {
    return Object.values(this.form.stages).map(stage => {
      stage.children = this.processRows(stage.id)
      stage.className = STAGE_CLASSNAME

      this.components[baseId(stage.id)] = stage
      return stage
    })
  }

  /**
   * Evaulate and execute conditions for fields by creating listeners for input and changes
   * @return {Array} flattened array of conditions
   */
  handleComponentCondition = (component, ifRest, thenConditions) => {
    if (component.length) {
      for (const elem of component) {
        this.handleComponentCondition(elem, ifRest, thenConditions)
      }
      return
    }

    const listenerEvent = LISTEN_TYPE_MAP(component)

    if (listenerEvent) {
      component.addEventListener(
        listenerEvent,
        evt => {
          if (this.evaluateCondition(ifRest, evt)) {
            for (const thenCondition of thenConditions) {
              this.execResult(thenCondition, evt)
            }
          }
        },
        false
      )
    }

    // Evaluate conditions on load.
    const fakeEvt = { target: component }
    if (this.evaluateCondition(ifRest, fakeEvt)) {
      for (const thenCondition of thenConditions) {
        this.execResult(thenCondition, fakeEvt)
      }
    }
  }

  applyConditions = () => {
    for (const { conditions } of Object.values(this.components)) {
      if (conditions) {
        for (const condition of conditions) {
          const { if: ifConditions, then: thenConditions } = condition

          for (const ifCondition of ifConditions) {
            const { source, target } = ifCondition

            if (isAddress(source)) {
              const { component, options } = this.getComponent(source)
              const sourceComponent = options || component
              this.handleComponentCondition(sourceComponent, ifCondition, thenConditions)
            }

            if (isAddress(target)) {
              const { component, options } = this.getComponent(target)
              const targetComponent = options || component
              this.handleComponentCondition(targetComponent, ifCondition, thenConditions)
            }
          }
        }
      }
    }
  }

  /**
   * Evaulate conditions
   */
  evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }) => {
    // Compare as string, this allows values like "true" to be checked for properties like "checked".
    const sourceValue = this.getComponentProperty(source, sourceProperty)

    if (typeof sourceValue === 'boolean') {
      return sourceValue
    }

    const targetValue = String(isAddress(target) ? this.getComponentProperty(target, targetProperty) : target)

    return comparisonMap[comparison]?.(sourceValue, targetValue)
  }

  execResult = ({ target, targetProperty, assignment, value }) => {
    if (isAddress(target)) {
      const { component, option } = this.getComponent(target)

      const elem = option || component

      targetPropertyMap[targetProperty]?.(elem, { targetProperty, assignment, value })
    }
  }

  getComponentProperty = (address, propertyName) => {
    const { component, option } = this.getComponent(address)

    const elem = option || component

    return propertyMap[propertyName]?.(elem) || elem[propertyName]
  }

  getComponent = address => {
    const result = {
      component: null,
    }
    if (!isAddress(address)) {
      return null
    }
    const [, componentId, optionsKey, optionIndex] = splitAddress(address)

    const component = this.renderedForm.querySelector(`#${RENDER_PREFIX}${componentId}`)

    if (!component) {
      return result
    }

    result.component = component

    if (optionsKey) {
      const options = component.querySelectorAll('input')
      const option = options[optionIndex]
      result.options = options
      result.option = option

      return result
    }

    return result
  }

  getComponents = address => {
    const components = []
    const componentId = address.slice(address.indexOf('.') + 1)

    components.push(...this.renderedForm.querySelectorAll(`[name=f-${componentId}]`))

    return components
  }
}

const listenTypeMap = [
  ['input', c => ['textarea', 'text'].includes(c.type)],
  ['change', c => ['select'].includes(c.tagName.toLowerCase()) || ['checkbox', 'radio'].includes(c.type)],
]

const LISTEN_TYPE_MAP = component => {
  const [listenerEvent] = listenTypeMap.find(typeMap => typeMap[1](component)) || [false]

  return listenerEvent
}
