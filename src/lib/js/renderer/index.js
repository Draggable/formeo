import dom, { getName, REQUIRED_GROUP_ATTR } from '../common/dom.js'
import { fetchDependencies } from '../common/loaders.js'
import { cleanFormData, isAddress, merge, uuid } from '../common/utils/index.mjs'
import { splitAddress } from '../common/utils/string.mjs'
import { STAGE_CLASSNAME } from '../constants.js'
import {
  baseId,
  comparisonMap,
  createRemoveButton,
  groupIfConditions,
  isCheckableGroup,
  processOptions,
  propertyMap,
  RENDER_PREFIX,
  targetPropertyMap,
} from './helpers.js'

export default class FormeoRenderer {
  constructor(opts = {}, formDataArg) {
    const { renderContainer: container, elements, formData, config, events } = processOptions(opts)
    this.container = container
    this.form = cleanFormData(formDataArg || formData)
    this.elements = elements
    this.config = config
    this.events = { ...events }
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
        label: this.componentByName(key)?.config?.label || '',
      }
      userFormData.push(fieldData)
    }

    return userFormData
  }

  /**
   * Finds the component data behind a submitted field name
   * @param {String} name
   * @return {Object|undefined}
   */
  componentByName(name) {
    return (
      this.components[baseId(name)] || Object.values(this.components).find(component => component.attrs?.name === name)
    )
  }

  set userData(data = {}) {
    const form = this.container.querySelector('form')
    for (const key of Object.keys(data)) {
      const fields = form.elements[key]
      // a group with a single option resolves to the input itself rather than a RadioNodeList
      const checkables = checkableInputs(fields)

      // Handle checkbox groups
      if (checkables?.[0].type === 'checkbox') {
        // Convert to array if not already
        const values = Array.isArray(data[key]) ? data[key] : [data[key]]

        for (const field of checkables) {
          field.checked = values.includes(field.value)
        }

        const group = checkables[0].closest(`[data-${REQUIRED_GROUP_ATTR}]`)
        if (group) {
          dom.syncCheckboxGroupRequired(group)
        }
      }
      // Handle radio groups
      else if (checkables?.[0].type === 'radio') {
        for (const field of checkables) {
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
    if (!this.container) {
      throw new Error(
        'FormeoRenderer: renderContainer is required for render(); use getRenderedForm() or html without one'
      )
    }
    this.form = cleanFormData(formData)
    const renderedForm = this.getRenderedForm(formData)
    const existingRenderedForm = this.container.querySelector('.formeo-render')

    if (existingRenderedForm) {
      existingRenderedForm.replaceWith(renderedForm)
    } else {
      this.container.appendChild(renderedForm)
    }

    this.events.onRender?.({ form: renderedForm, renderer: this, formData: this.form })
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
    this.renderedForm.addEventListener('reset', this.syncRequiredGroupsAfterReset)
    this.bindFormEvents(this.renderedForm)

    this.applyConditions()

    return this.renderedForm
  }

  /**
   * A reset changes checkedness without firing `change`, so required checkbox groups are re-synced.
   * The `reset` event fires before the controls revert, hence the deferral.
   * @param {Event} evt the form's reset event
   */
  syncRequiredGroupsAfterReset = ({ currentTarget: form }) => {
    setTimeout(() => {
      for (const group of form.querySelectorAll(`[data-${REQUIRED_GROUP_ATTR}]`)) {
        dom.syncCheckboxGroupRequired(group)
      }
    }, 0)
  }

  /**
   * Wire the renderer's onChange/onSubmit callbacks to a freshly rendered <form>
   * @param {HTMLFormElement} form
   */
  bindFormEvents(form) {
    const { onChange, onSubmit } = this.events
    if (onChange) {
      form.addEventListener('input', event => onChange({ event, target: event.target, form, userData: this.userData }))
    }
    if (onSubmit) {
      form.addEventListener('submit', event => onSubmit({ event, form, userData: this.userData }))
    }
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

    if (rest.options && ['checkbox', 'radio'].includes(attrs.type)) {
      // option groups: drop the name so the clone falls back to its own id; a shared radio name would link the groups
      delete updatedAttrs.name
    } else if (rest.tag === 'input') {
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
   * Wires every condition of every rendered component: evaluates it once on render and again
   * whenever a component one of its if-clauses reads from changes.
   */
  applyConditions = () => {
    for (const { conditions } of Object.values(this.components)) {
      if (!conditions) {
        continue
      }

      for (const condition of conditions) {
        // a single unusable condition must never abort the render of the whole form
        try {
          this.applyCondition(condition)
        } catch (err) {
          console.error('formeo: condition skipped', condition, err)
        }
      }
    }
  }

  applyCondition = ({ if: ifConditions = [], then: thenConditions = [] }) => {
    const clauseGroups = groupIfConditions(ifConditions)
    // a `value` action fires `input` on its target; when the condition watches that target,
    // the event would re-enter run and set the value again, forever
    let running = false
    const run = evt => {
      if (running) {
        return
      }
      running = true
      try {
        if (this.evaluateClauseGroups(clauseGroups)) {
          for (const thenCondition of thenConditions) {
            this.execResult(thenCondition, evt)
          }
        }
      } finally {
        running = false
      }
    }

    const watchedAddresses = new Set(ifConditions.flatMap(({ source, target }) => [source, target]).filter(isAddress))
    for (const address of watchedAddresses) {
      const { component, options } = this.getComponent(address)
      this.listenForChanges(options || component, run)
    }

    run({ target: null })
  }

  /**
   * @param {Array<Array<Object>>} clauseGroups output of groupIfConditions
   * @return {Boolean} true when every clause of at least one group matches
   */
  evaluateClauseGroups = clauseGroups =>
    clauseGroups.some(group => group.length && group.every(clause => this.evaluateCondition(clause)))

  listenForChanges = (component, handler) => {
    if (!component) {
      return
    }

    // a <select> has a native `length` (its option count), so only real collections may be spread
    if (isNodeCollection(component)) {
      for (const elem of component) {
        this.listenForChanges(elem, handler)
      }
      return
    }

    const listenerEvent = LISTEN_TYPE_MAP(component)
    if (listenerEvent) {
      component.addEventListener(listenerEvent, handler, false)
    }
  }

  /**
   * Evaulate conditions
   */
  evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }) => {
    // a clause without a source address (e.g. half-filled in the editor), or reading from a field
    // that is no longer in the form, never matches
    if (!isAddress(source) || !this.getComponent(source)?.component) {
      return false
    }

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
    const { component, option } = this.getComponent(address) || {}

    const elem = option || component

    if (!elem) {
      return undefined
    }

    // a mapped property must win even when it legitimately resolves to false or an empty value
    return propertyMap[propertyName] ? propertyMap[propertyName](elem) : elem[propertyName]
  }

  getComponent = address => {
    const result = {
      component: null,
    }
    if (!isAddress(address)) {
      return null
    }
    const [, componentId, optionsKey, optionIndex] = splitAddress(address)

    let component = null
    try {
      component = this.renderedForm.querySelector(`#${RENDER_PREFIX}${componentId}`)
    } catch {
      // an id that is not a valid selector can't match anything
    }

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

const isCheckable = elem => ['checkbox', 'radio'].includes(elem?.type)

const checkableInputs = fields => {
  if (isCheckable(fields)) {
    return [fields]
  }
  return fields?.length && isCheckable(fields[0]) ? Array.from(fields) : null
}

const isDomNode = value => Boolean(value) && typeof value.nodeType === 'number'

const isNodeCollection = value => Boolean(value) && !isDomNode(value) && typeof value.length === 'number'

const tagName = component => component.tagName?.toLowerCase()

const listenTypeMap = [
  // option inputs sit inside the group wrapper the address resolves to; change events bubble up to it
  ['change', component => isCheckableGroup(component)],
  ['change', component => tagName(component) === 'select' || ['checkbox', 'radio'].includes(component.type)],
  ['input', component => ['input', 'textarea'].includes(tagName(component))],
]

const LISTEN_TYPE_MAP = component => {
  const [listenerEvent] = listenTypeMap.find(typeMap => typeMap[1](component)) || [false]

  return listenerEvent
}
