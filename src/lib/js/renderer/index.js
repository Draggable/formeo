import dom from '../common/dom.js'
import { fetchDependencies } from '../common/loaders'
import { cleanFormData, isAddress, merge, uuid } from '../common/utils/index.mjs'
import { splitAddress } from '../common/utils/string.mjs'
import { STAGE_CLASSNAME } from '../constants'
import {
  baseId,
  comparisonMap,
  createRemoveButton,
  processOptions,
  propertyMap,
  RENDER_PREFIX,
  targetPropertyMap,
} from './helpers'

export default class FormeoRenderer {
  constructor(opts, formDataArg) {
    const { renderContainer, elements, formData } = processOptions(opts)
    this.container = renderContainer
    this.form = cleanFormData(formDataArg || formData)
    this.dom = dom
    this.components = Object.create(null)
    this.elements = elements
  }

  get formData() {
    return this.form
  }
  set formData(data) {
    this.form = cleanFormData(data)
  }
  get userData() {
    const userData = new FormData(this.renderedForm)

    const formDataObj = {}
    for (const [key, value] of userData.entries()) {
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
    ...{
      id: this.prefixId(id),
      children: this.processFields(columnData.children),
      style: `width: ${columnData.config.width || '100%'}`,
    },
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
    const { children = [], id, ...rest } = this.components[componentId]
    return {
      ...rest,
      id: uuid(id),
      children: children?.length && children.map(({ id }) => this.cloneComponentData(baseId(id))),
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

      console.log(`[Formeo] processFields: field ${id} before merge:`, {
        hasConditions: !!field.conditions,
        fieldConditions: field.conditions,
      })

      const mergedFieldData = merge({ action }, field)

      console.log(`[Formeo] processFields: field ${id} after merge:`, {
        hasConditions: !!mergedFieldData.conditions,
        mergedConditions: mergedFieldData.conditions,
      })

      const cached = this.cacheComponent({ ...mergedFieldData, id: this.prefixId(id) })

      console.log(`[Formeo] processFields: cached component ${baseId(cached.id)}:`, {
        hasConditions: !!cached.conditions,
        cachedConditions: cached.conditions,
      })

      return cached
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
      console.log(`[Formeo] handleComponentCondition: processing ${component.length} components`)
      for (const elem of component) {
        this.handleComponentCondition(elem, ifRest, thenConditions)
      }
      return
    }

    const listenerEvent = LISTEN_TYPE_MAP(component)
    console.log(`[Formeo] handleComponentCondition: component type=${component.type}, event=${listenerEvent}`)

    if (listenerEvent) {
      component.addEventListener(
        listenerEvent,
        evt => {
          console.log(`[Formeo] Condition event triggered: ${listenerEvent}`)
          if (this.evaluateCondition(ifRest, evt)) {
            console.log('[Formeo] Condition TRUE, executing actions')
            for (const thenCondition of thenConditions) {
              this.execResult(thenCondition, evt)
            }
          } else {
            console.log('[Formeo] Condition FALSE, executing opposite actions')
            for (const thenCondition of thenConditions) {
              this.execResult(thenCondition, evt, true) // Pass true to execute opposite action
            }
          }
        },
        false
      )
    }

    // Evaluate conditions on load.
    console.log('[Formeo] Evaluating condition on initial load...')
    const fakeEvt = { target: component }
    const result = this.evaluateCondition(ifRest, fakeEvt)
    console.log(`[Formeo] Initial evaluation result: ${result}`)
    if (result) {
      console.log(`[Formeo] Executing ${thenConditions.length} action(s)`)
      for (const thenCondition of thenConditions) {
        this.execResult(thenCondition, fakeEvt)
      }
    } else {
      console.log('[Formeo] Condition FALSE on load, executing opposite actions')
      for (const thenCondition of thenConditions) {
        this.execResult(thenCondition, fakeEvt, true) // Pass true to execute opposite action
      }
    }
  }

  applyConditions = () => {
    console.log('[Formeo] applyConditions called, components:', Object.keys(this.components))
    console.log('[Formeo] Full components data:', JSON.stringify(this.components, null, 2))
    for (const [componentId, componentData] of Object.entries(this.components)) {
      const { conditions } = componentData
      console.log(`[Formeo] Checking component ${componentId}:`, { hasConditions: !!conditions, componentData })
      if (conditions) {
        console.log(`[Formeo] Component ${componentId} has ${conditions.length} condition(s)`)
        for (const condition of conditions) {
          const { if: ifConditions, then: thenConditions } = condition

          for (const ifCondition of ifConditions) {
            const { source, target } = ifCondition
            console.log(`[Formeo] Processing condition: source=${source}, target=${target}`)

            if (isAddress(source)) {
              const { component, options } = this.getComponent(source)
              const sourceComponent = options || component
              if (sourceComponent) {
                console.log(`[Formeo] Setting up condition listener on source: ${source}`)
                this.handleComponentCondition(sourceComponent, ifCondition, thenConditions)
              } else {
                console.warn(`[Formeo] Source component not found: ${source}`)
              }
            }

            if (isAddress(target)) {
              const { component, options } = this.getComponent(target)
              const targetComponent = options || component
              if (targetComponent) {
                console.log(`[Formeo] Setting up condition listener on target: ${target}`)
                this.handleComponentCondition(targetComponent, ifCondition, thenConditions)
              } else {
                console.warn(`[Formeo] Target component not found: ${target}`)
              }
            }
          }
        }
      }
    }
    console.log('[Formeo] applyConditions completed')
  }

  /**
   * Evaulate conditions
   */
  evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }) => {
    // Compare as string, this allows values like "true" to be checked for properties like "checked".
    const sourceValue = this.getComponentProperty(source, sourceProperty)
    console.log(
      `[Formeo] evaluateCondition: source=${source}, sourceProperty=${sourceProperty}, sourceValue=${sourceValue} (type: ${typeof sourceValue})`
    )

    if (typeof sourceValue === 'boolean') {
      console.log(`[Formeo] Boolean property, returning: ${sourceValue}`)
      return sourceValue
    }

    const targetValue = String(isAddress(target) ? this.getComponentProperty(target, targetProperty) : target)
    console.log(`[Formeo] Comparing: "${sourceValue}" ${comparison} "${targetValue}"`)

    const result = comparisonMap[comparison]?.(sourceValue, targetValue)
    console.log(`[Formeo] Comparison result: ${result}`)
    return result
  }

  execResult = ({ target, targetProperty, assignment, value }, _evt, executeOpposite = false) => {
    console.log(
      `[Formeo] execResult: target=${target}, targetProperty=${targetProperty}, executeOpposite=${executeOpposite}`
    )
    if (isAddress(target)) {
      const { component, option } = this.getComponent(target)

      const elem = option || component
      console.log(`[Formeo] Found target element:`, elem)

      // Map opposite actions for visibility toggles
      const oppositePropertyMap = {
        isVisible: 'isNotVisible',
        isNotVisible: 'isVisible',
        isChecked: 'isNotChecked',
        isNotChecked: 'isChecked',
      }

      const effectiveProperty =
        executeOpposite && oppositePropertyMap[targetProperty] ? oppositePropertyMap[targetProperty] : targetProperty

      console.log(`[Formeo] Using property: ${effectiveProperty} (original: ${targetProperty})`)

      if (elem && targetPropertyMap[effectiveProperty]) {
        targetPropertyMap[effectiveProperty](elem, { targetProperty: effectiveProperty, assignment, value })
        console.log(`[Formeo] Action executed: ${effectiveProperty}`)
      } else {
        console.warn(`[Formeo] Could not execute action: element or property handler not found`)
      }
    }
  }

  getComponentProperty = (address, propertyName) => {
    const { component, option, options } = this.getComponent(address)

    const elem = option || component

    // For radio/checkbox groups, get the value of the checked item
    if (propertyName === 'value' && options && options.length > 0 && !option) {
      const checkedOption = Array.from(options).find(opt => opt.checked)
      return checkedOption?.value || ''
    }

    // If we have a specific option (from address like fields.x.options[1]) and no property name,
    // return the value of that option
    if (option && (!propertyName || propertyName === '')) {
      return option.value
    }

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

    // For radio/checkbox groups, we need to return the actual inputs, not the container
    // Check if this is a container with input elements (radio/checkbox group)
    const inputs = component.querySelectorAll('input[type="radio"], input[type="checkbox"]')
    if (inputs.length > 0) {
      result.options = inputs
      result.component = inputs[0] // Return first input for type detection
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

const LISTEN_TYPE_MAP = component => {
  const typesMap = [
    ['input', c => ['textarea', 'text'].includes(c.type)],
    ['change', c => ['select'].includes(c.tagName.toLowerCase()) || ['checkbox', 'radio'].includes(c.type)],
  ]

  const [listenerEvent] = typesMap.find(typeMap => typeMap[1](component)) || [false]

  return listenerEvent
}
