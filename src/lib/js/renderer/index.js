import dom, {
  DEFAULT_OTHER_LABEL,
  getName,
  OTHER_GROUP_ATTR,
  OTHER_NAME_SUFFIX,
  REQUIRED_GROUP_ATTR,
} from '../common/dom.js'
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
  normalizePagination,
  processOptions,
  propertyMap,
  RENDER_PREFIX,
  targetPropertyMap,
} from './helpers.js'
import { focusFirst, paginate, SKIPPED_ATTR } from './pagination.js'

// marks the controls a page skip disabled, so bringing the page back re-enables only those (#122)
const SKIP_DISABLED_ATTR = 'data-formeo-skip-disabled'
const SKIPPABLE_CONTROLS = 'input, select, textarea, button'
// a page condition can only skip (true) or bring back (false) a stage
const STAGE_SKIP_PROPERTIES = { isNotVisible: true, isVisible: false }
// while its page is skipped, a field reads as unanswered, so answers the user can't see don't drive conditions
const SKIPPED_PAGE_READS = {
  value: '',
  checked: '',
  isChecked: false,
  isNotChecked: true,
  isVisible: false,
  isNotVisible: true,
}

/**
 * A row's or column's own attributes, ready to render (#112). `id` and `tag` are Formeo's: the element is found by
 * `#f-<id>` (conditions use it) and is always a div. `class` joins `className`, which the internal class merges into,
 * instead of being overwritten by it.
 * @param {Object|null} [attrs]
 * @return {Object}
 */
const layoutAttrs = attrs => {
  const { id: _id, tag: _tag, class: classAttr, ...rest } = attrs ?? {}
  if (classAttr) {
    rest.className = [rest.className, classAttr].flat().filter(Boolean)
  }
  return rest
}

export default class FormeoRenderer {
  constructor(opts = {}, formDataArg) {
    const { renderContainer: container, elements, formData, config, events, pagination } = processOptions(opts)
    this.container = container
    this.form = cleanFormData(formDataArg || formData)
    this.elements = elements
    this.config = config
    this.events = { ...events }
    this.pagination = normalizePagination(pagination)
    this.components = Object.create(null)
    this.dom = dom
  }

  // every applied condition's runner and the components it watches, so a page's skip can re-run those reading it
  conditionRunners = []

  /**
   * Index of the page on show when the `pagination` option splits the form's stages into pages
   * @return {Number} 0 without pagination
   */
  get page() {
    return this.pager?.index ?? 0
  }

  /**
   * Shows a page without validating the one being left. Out-of-range indexes are clamped.
   * @param {Number} index
   */
  set page(index) {
    this.pager?.show(index)
  }

  /**
   * @return {Number} number of pages, 1 when the form is not paginated
   */
  get pageCount() {
    return this.pager?.count ?? 1
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
    const form = this.container?.querySelector('.formeo-render') || this.renderedForm
    return userDataOf(form)
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
      const otherGroup = this.otherGroupByName(key)
      const fieldData = {
        key,
        value,
        // an Other choice's text reads as "{group label} ({Other label})"
        label: otherGroup
          ? `${otherGroup.config?.label || ''} (${otherGroup.config.otherLabel || DEFAULT_OTHER_LABEL})`
          : this.componentByName(key)?.config?.label || '',
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
      this.components[baseId(name)] ||
      Object.values(this.components).find(
        component => component.attrs?.name === name || component.attrs?.name === `${name}[]`
      ) ||
      this.otherGroupByName(name)
    )
  }

  /**
   * The checkbox or radio group whose Other choice's text box posts under `name` (`{group key}-other`)
   * @param {String} name
   * @return {Object|undefined}
   */
  otherGroupByName(name) {
    if (!name.endsWith(OTHER_NAME_SUFFIX)) {
      return undefined
    }
    const group = this.componentByName(name.slice(0, -OTHER_NAME_SUFFIX.length))
    return group?.config?.other ? group : undefined
  }

  set userData(data) {
    const form = this.container?.querySelector('.formeo-render') || this.renderedForm
    const keys = Object.keys(data ?? {})
    if (!form) {
      // no rendered form to blame missing fields on; the answers just have nowhere to go yet
      if (keys.length) {
        console.warn('formeo: renderer.userData was set before render(); nothing to fill')
      }
      return
    }
    const unmatched = []
    for (const key of keys) {
      const fields = form.elements.namedItem(key) ?? form.elements.namedItem(`${key}[]`)
      if (!fields) {
        unmatched.push(key)
        continue
      }
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
      // A multiple select takes every value in an array
      else if (fields.type === 'select-multiple') {
        const values = [data[key]].flat().map(String)
        for (const option of fields.options) {
          option.selected = values.includes(option.value)
        }
      }
      // Handle single inputs
      else if (fields.type) {
        fields.value = data[key]
      }
    }
    // setting `checked` fires no change, so every Other text box follows its choice here, whatever the key order
    for (const group of form.querySelectorAll(`[data-${OTHER_GROUP_ATTR}]`)) {
      dom.syncOtherInput(group)
    }
    // saved answers can outlive the form they came from, so a missing field is a warning, never an error
    if (unmatched.length) {
      console.warn(`formeo: renderer.userData has no field named: ${unmatched.join(', ')}`)
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

  /**
   * Remove the rendered form from the page and stop its pagination. render() can be called again afterwards.
   * @return {void}
   */
  destroy() {
    this.pager?.destroy()
    this.pager = null
    this.renderedForm?.remove()
    this.renderedForm = null
    this.components = Object.create(null)
    this.conditionRunners = []
  }

  getRenderedForm(formData = this.form) {
    // the page on show, found again by its stage id once the form is rebuilt
    const startStageId = this.pager?.stageId
    this.form = cleanFormData(formData)
    this.pager?.destroy()
    this.pager = null

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
    // a condition finds a page by its stage id in every mode; tabs replace the page's own id (#122)
    for (const stage of this.stageElements()) {
      stage.dataset.stageId = stage.id
    }

    this.applyConditions()
    // bound after the first condition pass so a `value` action applied while rendering doesn't fire onChange
    this.bindFormEvents(this.renderedForm)
    this.pager = this.paginateForm(this.renderedForm, startStageId)

    return this.renderedForm
  }

  /**
   * Splits a freshly rendered <form> into pages when the `pagination` option is set
   * @param {HTMLFormElement} form
   * @param {String} [startStageId] the stage id of the page to start on; the first page when it isn't in the form
   * @return {Object|null} the pager, or null when the form is shown as one page
   */
  paginateForm(form, startStageId) {
    if (!this.pagination) {
      return null
    }
    const stages = Object.values(this.form.stages)
    const onChange = (page, previousPage) =>
      this.events.onPageChange?.({
        page,
        previousPage,
        stageId: stages[page]?.id ?? null,
        previousStageId: stages[previousPage]?.id ?? null,
        form,
        renderer: this,
      })
    return paginate(form, this.pagination, stages, onChange, startStageId)
  }

  /**
   * @return {HTMLElement[]} the rendered form's stages, in order
   */
  stageElements = () =>
    Array.from(this.renderedForm?.children ?? []).filter(elem => elem.classList.contains(STAGE_CLASSNAME))

  /**
   * Skips a page (a stage) or brings it back (#122). A skipped stage is hidden and its controls disabled, so they
   * neither validate nor submit; their values stay for when the page comes back. One stage always stays in play.
   * @param {HTMLElement} stage
   * @param {Boolean} skipped
   */
  setStageSkipped = (stage, skipped) => {
    if (stage.hasAttribute(SKIPPED_ATTR) === skipped) {
      return
    }
    if (!skipped) {
      stage.removeAttribute(SKIPPED_ATTR)
      stage.hidden = false
      for (const control of stage.querySelectorAll(`[${SKIP_DISABLED_ATTR}]`)) {
        control.disabled = false
        control.removeAttribute(SKIP_DISABLED_ATTR)
      }
      // a text box re-enabled above may belong to an Other choice unchecked while the page was skipped
      for (const group of stage.querySelectorAll(`[data-${OTHER_GROUP_ATTR}]`)) {
        dom.syncOtherInput(group)
      }
      this.rerunConditionsReading(stage)
      this.pager?.refresh()
      return
    }
    const inPlay = this.stageElements().filter(elem => !elem.hasAttribute(SKIPPED_ATTR))
    if (inPlay.length < 2) {
      console.warn('formeo: a condition tried to skip the only page left in play', stage.dataset.stageId)
      return
    }
    // read before the controls are disabled and hidden, which can move focus to the body
    const hadFocus = stage.contains(stage.ownerDocument.activeElement)
    stage.setAttribute(SKIPPED_ATTR, '')
    stage.hidden = true
    for (const control of stage.querySelectorAll(SKIPPABLE_CONTROLS)) {
      if (!control.disabled) {
        control.disabled = true
        control.setAttribute(SKIP_DISABLED_ATTR, '')
      }
    }
    this.rerunConditionsReading(stage)
    this.pager?.refresh({ focus: hadFocus })
    if (!this.pager && hadFocus) {
      // no pager to refocus the next page for us: find it ourselves among the stages still in the form
      const stages = this.stageElements()
      const index = stages.indexOf(stage)
      const target =
        stages.slice(index + 1).find(elem => !elem.hasAttribute(SKIPPED_ATTR)) ??
        stages.slice(0, index).findLast(elem => !elem.hasAttribute(SKIPPED_ATTR))
      if (target) {
        focusFirst(target)
      }
    }
  }

  /**
   * A reset changes checkedness without firing `change`, so required checkbox groups and Other text boxes are
   * re-synced. The `reset` event fires before the controls revert, hence the deferral.
   * @param {Event} evt the form's reset event
   */
  syncRequiredGroupsAfterReset = ({ currentTarget: form }) => {
    setTimeout(() => {
      for (const group of form.querySelectorAll(`[data-${REQUIRED_GROUP_ATTR}]`)) {
        dom.syncCheckboxGroupRequired(group)
      }
      for (const group of form.querySelectorAll(`[data-${OTHER_GROUP_ATTR}]`)) {
        dom.syncOtherInput(group)
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
      form.addEventListener('input', event =>
        onChange({ event, target: event.target, form, userData: userDataOf(form) })
      )
    }
    if (onSubmit) {
      form.addEventListener('submit', event => onSubmit({ event, form, userData: userDataOf(form) }))
    }
  }

  get html() {
    const renderedForm = this.renderedForm || this.getRenderedForm()
    return renderedForm.outerHTML
  }

  orderChildren = (type, order = []) =>
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
  processColumn = ({ id, config = {}, attrs, ...columnData }) => {
    const { style, ...columnAttrs } = layoutAttrs(attrs)
    const width = `width: ${config.width || '100%'}`
    return {
      ...columnData,
      attrs: columnAttrs,
      config,
      id: this.prefixId(id),
      children: this.processFields(columnData.children),
      // the column's own style first, so its width always wins (#112)
      style: style ? `${String(style).trim().replace(/;$/, '')}; ${width}` : width,
    }
  }

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
    const { config = {}, id } = data
    const className = [`formeo-${type}-wrap`]
    const rowData = {
      ...data,
      attrs: layoutAttrs(data.attrs),
      children: this.processColumns(data.id),
      id: this.prefixId(id),
    }
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
    this.conditionRunners = []
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
    // an action that skips or brings back a page reads that page's own fields as they are, or skipping a page by its
    // own answer would make them read as unanswered and bring the page straight back. Every other action, even one in
    // the same condition, reads a skipped page's fields as unanswered.
    const actions = thenConditions.map(action => ({ action, page: this.stageTargetOf(action) }))
    // a `value` action fires `input` on its target; when the condition watches that target,
    // the event would re-enter run and set the value again, forever
    let running = false
    /**
     * @param {Event|{target: null}} evt
     * @param {(runnerAction: {action: Object, page: HTMLElement|null}) => boolean} [skipAction]
     */
    const run = (evt, skipAction = () => false) => {
      if (running) {
        return
      }
      running = true
      try {
        // every clause is read before any action runs, so one action can't change what the next one sees
        const matches = new Map()
        for (const { page } of actions) {
          if (!matches.has(page)) {
            matches.set(page, this.evaluateClauseGroups(clauseGroups, page ? [page] : []))
          }
        }
        for (const runnerAction of actions) {
          const { action, page } = runnerAction
          if (!skipAction(runnerAction) && matches.get(page)) {
            this.execResult(action, evt)
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
    const watched = [...watchedAddresses].map(address => this.getComponent(address)?.component).filter(Boolean)
    this.conditionRunners.push({ watched, run })

    run({ target: null })
  }

  /**
   * @param {Object} action a then-action
   * @return {HTMLElement|null} the stage it skips or brings back, null for any other action
   */
  stageTargetOf = ({ target }) =>
    isAddress(target) && splitAddress(target)[0] === 'stages' ? (this.getComponent(target)?.component ?? null) : null

  /**
   * A page's skip state changes what its fields read as, so re-runs the conditions watching anything on it. Only
   * those: re-running every condition would re-apply unrelated `value` actions over the user's later input. The
   * actions that skip or bring back that same page read it as it is, so they're left alone rather than undoing the
   * skip that caused the re-run.
   * @param {HTMLElement} stage
   */
  rerunConditionsReading = stage => {
    for (const { watched, run } of this.conditionRunners) {
      if (watched.some(component => stage.contains(component))) {
        run({ target: null }, ({ action, page }) => {
          const stageSkip = action && Object.hasOwn(STAGE_SKIP_PROPERTIES, action.targetProperty)
          return page === stage && stageSkip && !STAGE_SKIP_PROPERTIES[action.targetProperty]
        })
      }
    }
  }

  /**
   * @param {Array<Array<Object>>} clauseGroups output of groupIfConditions
   * @param {HTMLElement[]} [ownStages] see evaluateCondition
   * @return {Boolean} true when every clause of at least one group matches
   */
  evaluateClauseGroups = (clauseGroups, ownStages) =>
    clauseGroups.some(group => group.length && group.every(clause => this.evaluateCondition(clause, ownStages)))

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
   * @param {Object} clause one if-clause
   * @param {HTMLElement[]} [ownStages] stages the action being decided skips or brings back; see getComponentProperty
   * @return {Boolean}
   */
  evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }, ownStages = []) => {
    // a clause without a source address (e.g. half-filled in the editor), or reading from a field
    // that is no longer in the form, never matches
    if (!isAddress(source) || !this.getComponent(source)?.component) {
      return false
    }

    // Compare as string, this allows values like "true" to be checked for properties like "checked".
    const sourceValue = this.getComponentProperty(source, sourceProperty, ownStages)

    if (typeof sourceValue === 'boolean') {
      return sourceValue
    }

    const targetValue = String(
      isAddress(target) ? this.getComponentProperty(target, targetProperty, ownStages) : target
    )

    return comparisonMap[comparison]?.(sourceValue, targetValue)
  }

  execResult = ({ target, targetProperty, assignment, value }) => {
    if (!isAddress(target)) {
      return
    }
    const { component, option } = this.getComponent(target)

    // a stage can only be skipped or brought back; the generic show/hide would hide its parent, the <form>
    if (splitAddress(target)[0] === 'stages') {
      if (component && Object.hasOwn(STAGE_SKIP_PROPERTIES, targetProperty)) {
        this.setStageSkipped(component, STAGE_SKIP_PROPERTIES[targetProperty])
      }
      return
    }

    const elem = option || component

    targetPropertyMap[targetProperty]?.(elem, { targetProperty, assignment, value })
  }

  /**
   * Reads a property of a rendered component. While its page is skipped, a field reads as unanswered (#122), except
   * to an action that skips or brings back that same page, so a page can skip itself by its own answer.
   * @param {String} address e.g. `fields.abc`
   * @param {String} propertyName e.g. `value`, `isChecked`
   * @param {HTMLElement[]} [ownStages] stages whose fields are read as they are even while skipped
   * @return {*}
   */
  getComponentProperty = (address, propertyName, ownStages = []) => {
    const { component, option } = this.getComponent(address) || {}

    const elem = option || component

    if (!elem) {
      return undefined
    }

    const skippedPage = elem.closest?.(`[${SKIPPED_ATTR}]`)
    if (skippedPage && !ownStages.includes(skippedPage) && Object.hasOwn(SKIPPED_PAGE_READS, propertyName)) {
      return SKIPPED_PAGE_READS[propertyName]
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
    const [type, componentId, optionsKey, optionIndex] = splitAddress(address)

    if (type === 'stages') {
      // matched by attribute, not a selector: tabs rename a page's id, and any stage id works this way
      result.component = this.stageElements().find(stage => stage.dataset.stageId === componentId) ?? null
      return result
    }

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
    const name = `f-${componentId}`

    // an unnamed multi-option checkbox group falls back to this name but renders it as `name[]` (#128)
    components.push(...this.renderedForm.querySelectorAll(`[name="${name}"], [name="${name}[]"]`))

    return components
  }
}

// a checkbox group's inputs share a name ending in [] (#128) so every checked value posts; userData
// itself is keyed by the plain name
const fieldKey = key => (key.endsWith('[]') ? key.slice(0, -2) : key)

/**
 * Converts a rendered form's fields to a plain object, the same shape the `userData`
 * getter exposes. Handles multiple values for the same key by converting them to arrays.
 * @param {HTMLFormElement} [form]
 * @return {Object.<string, string|string[]>}
 */
const userDataOf = form => {
  if (!form) {
    return {}
  }
  const formEntries = new FormData(form)

  const formDataObj = {}
  for (const [rawKey, value] of formEntries.entries()) {
    const key = fieldKey(rawKey)
    if (Object.hasOwn(formDataObj, key)) {
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
