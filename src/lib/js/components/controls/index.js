import i18n from '@draggable/i18n'
import Sortable from 'sortablejs'
import dom from '../../common/dom.js'
import { indexOfNode, orderObjectsBy } from '../../common/helpers.mjs'
import { destroySortables } from '../../common/sortable.js'
import { clone, match, merge, unique } from '../../common/utils/index.mjs'
import { get, set } from '../../common/utils/object.mjs'
import { CONTROL_GROUP_CLASSNAME, PANEL_CLASSNAME } from '../../constants.js'
import Panels from '../panels.js'
import Control from './control.js'
import { CONTROL_SET, expandControlSet, insertControlSet, isControlSet } from './control-set.mjs'
import defaultOptions from './options.js'

/**
 * One editor's control panel. `components` is the editor's Components; it is set by the
 * constructor or by assigning this instance to `components.controls`.
 */
export class Controls {
  constructor(components = null) {
    this.components = components
    this.data = new Map()

    this.buttonActions = {
      // this is used for keyboard navigation. when tabbing through controls it
      // will auto navigated between the groups
      focus: ({ target }) => {
        const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`)
        return group && this.panels.nav.refresh(indexOfNode(group))
      },
      click: ({ target }) => {
        this.requestAddElement(target.parentElement.id)
      },
    }
  }

  /**
   * Methods to be called on initialization
   * @param {Object} controlOptions
   */
  async init(controlOptions, sticky = false) {
    // this.isReady = false
    await this.applyOptions(controlOptions)
    this.buildDOM(sticky)

    return this
  }

  /**
   * Generate control config for UI and bind actions
   * @return {Array} elementControls
   */
  registerControls(elements) {
    this.controls = []
    return elements.map(Element => {
      const isControlClass = typeof Element === 'function'

      const control = isControlClass ? new Element() : new Control(Element)

      this.add(control)
      // set after add(), which deep-clones the control
      control.controls = this
      this.controls.push(control.dom)

      // the control may have dependencies so we need to resolve them asynchronously
      return control.promise()
    })
  }

  groupLabel = key => i18n.get(key) || key || ''

  /**
   * Group elements into their respective control group
   * @return {Array} allGroups
   */
  groupElements() {
    let groups = this.options.groups.slice()
    let elements = this.controls.slice()

    let allGroups = []
    const usedElementIds = []

    // Apply order to Groups
    groups = orderObjectsBy(groups, this.groupOrder, 'id')

    // remove disabled groups
    groups = groups.filter(group => match(group.id, this.options.disable.groups))

    // create group config
    allGroups = groups.map(group => {
      const groupConfig = {
        tag: 'ul',
        attrs: {
          className: [CONTROL_GROUP_CLASSNAME, PANEL_CLASSNAME],
          id: `${group.id}-${CONTROL_GROUP_CLASSNAME}`,
        },
        config: {
          label: this.groupLabel(group.label),
        },
      }

      // Apply order to elements/fields
      if (this.options.elementOrder[group.id]) {
        const userOrder = this.options.elementOrder[group.id]
        const newOrder = unique(userOrder.concat(group.elementOrder))
        group.elementOrder = newOrder
      }
      elements = orderObjectsBy(elements, group.elementOrder, 'meta.id')

      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      groupConfig.content = elements.filter(control => {
        const { controlData: field } = this.get(control.id)
        const controlId = field.meta.id || ''
        const filters = [
          match(controlId, this.options.disable.elements),
          field.meta.group === group.id,
          !usedElementIds.includes(controlId),
        ]

        let shouldFilter = true
        shouldFilter = filters.every(val => val === true)
        if (shouldFilter) {
          usedElementIds.push(controlId)
        }

        return shouldFilter
      })

      return groupConfig
    })

    return allGroups
  }

  add(control = Object.create(null)) {
    const controlConfig = clone(control)
    this.data.set(controlConfig.id, controlConfig)
    if (controlConfig.controlData.meta.id) {
      this.data.set(controlConfig.controlData.meta.id, controlConfig.controlData)
    }
    return controlConfig
  }

  get(controlId) {
    return clone(this.data.get(controlId))
  }

  /**
   * Generate the DOM config for form actions like settings, save and clear
   * @return {Object} form action buttons config
   */
  formActions() {
    if (this.options.disable.formActions === true) {
      return null
    }
    const clearBtn = {
      ...dom.btnTemplate({ content: [dom.icon('bin'), i18n.get('clear')], title: i18n.get('clearAll') }),
      className: ['clear-form'],
      action: {
        click: evt => {
          if (this.components.rows.size) {
            this.components.events.confirmClearAll({
              confirmationMessage: i18n.get('confirmClearAll'),
              clearAllAction: () => {
                this.components.stages.clearAll().then(() => {
                  const evtData = {
                    src: evt.target,
                  }
                  this.components.events.formeoCleared(evtData)
                })
              },
              btnCoords: dom.coords(evt.target),
            })
          } else {
            window.alert(i18n.get('cannotClearFields'))
          }
        },
      },
    }

    const saveBtn = {
      ...dom.btnTemplate({ content: [dom.icon('floppy-disk'), i18n.get('save')], title: i18n.get('save') }),
      className: ['save-form'],
      action: {
        click: ({ target }) => {
          const { formData } = this.components
          const save = () => {
            const saveEvt = {
              action: () => {},
              coords: dom.coords(target),
              message: '',
              button: target,
            }
            this.components.actions.click.btn(saveEvt)
            this.components.actions.save.form(formData)
          }
          // onBeforeSave decides whether and when to save (#281)
          return this.components.events.before('save', { formData }, save, { src: target, guardKey: 'save' })
        },
      },
    }

    const formActions = {
      className: 'form-actions f-btn-group',
      content: Object.entries({ clearBtn, saveBtn }).reduce((acc, [key, value]) => {
        if (!this.options.disable.formActions.includes(key)) {
          acc.push(value)
        }
        return acc
      }, []),
    }

    return formActions
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  buildDOM(sticky) {
    const groupedFields = this.groupElements()
    const formActions = this.formActions()
    const { displayType } = this.options.panels
    this.panels = new Panels({ panels: groupedFields, type: 'controls', displayType })
    const groupsWrapClasses = ['control-groups', 'formeo-panels-wrap', `panel-count-${groupedFields.length}`]
    const groupsWrap = dom.create({
      className: groupsWrapClasses,
      content: [this.panels.panelNav, this.panels.panelsWrap],
    })

    const controlClasses = ['formeo-controls']
    if (sticky) {
      controlClasses.push('formeo-sticky')
    }

    const element = dom.create({
      className: controlClasses,
      content: [groupsWrap, formActions],
    })
    const groups = element.getElementsByClassName('control-group')

    this.dom = element
    this.groups = groups
    const [firstGroup] = groups
    this.currentGroup = firstGroup

    this.actions = {
      filter: term => {
        const filtering = term !== ''
        const fields = this.controls
        let filteredTerm = groupsWrap.querySelector('.filtered-term')

        dom.toggleElementsByStr(fields, term)

        if (filtering) {
          const filteredStr = i18n.get('controls.filteringTerm', term)

          element.classList.add('filtered')

          if (filteredTerm) {
            filteredTerm.textContent = filteredStr
          } else {
            filteredTerm = dom.create({
              tag: 'h5',
              className: 'filtered-term',
              content: filteredStr,
            })
            groupsWrap.insertBefore(filteredTerm, groupsWrap.firstChild)
          }
        } else if (filteredTerm) {
          element.classList.remove('filtered')
          filteredTerm.remove()
        }
      },
      addElement: this.addElement,
      // @todo finish the addGroup method
      addGroup: group => console.log(group),
    }

    // Make controls sortable
    for (let i = groups.length - 1; i >= 0; i--) {
      const storeID = `formeo-controls-${groups[i]}`
      if (!this.options.sortable) {
        globalThis.localStorage.removeItem(storeID)
      }
      Sortable.create(groups[i], {
        animation: 150,
        fallbackClass: 'control-moving',
        fallbackOnBody: true,
        forceFallback: true,
        fallbackTolerance: 5,
        group: {
          name: `controls-${this.components.instanceId}`,
          pull: 'clone',
          put: false,
          revertClone: true,
        },
        onClone: ({ clone, item }) => {
          // Copy the item's id to the clone so we can identify what control it represents
          clone.id = item.id

          const { controlData } = this.get(item.id)
          // a control set's drag keeps its own button: a single field's preview would mislead (#227)
          if (this.options.ghostPreview && !isControlSet(controlData)) {
            // Dynamically import Field to avoid circular dependency
            import('../fields/field.js').then(({ default: Field }) => {
              clone.innerHTML = ''
              clone.appendChild(new Field(controlData, this.components).preview)
            })
          }
        },
        onStart: () => {
          // Prevent scrollbar flashing during drag by hiding overflow
          this.originalDocumentOverflow = document.documentElement.style.overflow
          document.documentElement.style.overflow = 'hidden'
        },
        onEnd: () => {
          // Restore overflow after drag completes
          document.documentElement.style.overflow = this.originalDocumentOverflow
          this.originalDocumentOverflow = null
        },
        sort: this.options.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: () => {
            const order = globalThis.localStorage.getItem(storeID)
            return order ? order.split('|') : []
          },

          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: sortable => {
            const order = sortable.toArray()
            globalThis.localStorage.setItem(storeID, order.join('|'))
          },
        },
      })
    }

    return element
  }

  layoutTypes = {
    row: (stage = this.components.stages.active) => stage.addChild(),
    column: stage => this.layoutTypes.row(stage).addChild(),
    field: (controlData, stage) => this.layoutTypes.column(stage).addChild(controlData),
  }

  /**
   * A field control's data for a control set member, or undefined when controlId is unknown, a layout control or
   * another set (#227)
   * @param {String} controlId a control's meta.id
   * @return {Object|undefined} a copy without meta
   */
  lookupMemberControl = controlId => {
    const controlData = this.data.get(controlId)
    if (!controlData?.meta || controlId.startsWith('layout-') || isControlSet(controlData)) {
      return undefined
    }
    const { meta: _meta, ...fieldData } = clone(controlData)
    return fieldData
  }

  /**
   * What a control creates
   * @param {String} id control id (its element's id)
   * @return {{componentType: String, controlId: String, data: Object}} componentType is 'controlSet' for a control
   * set (data: its layout, row and fields), 'row' or 'column' for a layout control ({} data: rows and columns start
   * from their own defaults), else 'field' (data: what the new field starts from)
   */
  describeControl = id => {
    const controlData = get(this.get(id), 'controlData')
    const {
      meta: { id: controlId },
      ...elementData
    } = controlData
    if (isControlSet(controlData)) {
      return { componentType: CONTROL_SET, controlId, data: expandControlSet(controlData, this.lookupMemberControl) }
    }
    set(elementData, 'config.controlId', controlId)
    const layoutType = controlId.replace(/^layout-/, '')
    const isLayout =
      controlId.startsWith('layout-') && Object.hasOwn(this.layoutTypes, layoutType) && layoutType !== 'field'
    return { componentType: isLayout ? layoutType : 'field', controlId, data: isLayout ? {} : elementData }
  }

  /**
   * Adds what describeControl described to a stage
   * @param {{componentType: String, data: Object}} described
   * @param {Stage} stage
   * @return {Component|undefined} the new row, column or field; undefined for a control set with no fields
   */
  addDescribed = ({ componentType, data }, stage) => {
    if (componentType === CONTROL_SET) {
      return data.fields.length ? insertControlSet(stage, data) : undefined
    }
    if (componentType === 'field') {
      return this.layoutTypes.field(data, stage)
    }
    return this.layoutTypes[componentType](stage)
  }

  /**
   * Append an element to a stage
   * @param {String} id control id
   * @param {Stage} [stage] the active stage by default
   * @return {Component|undefined} the new row, column or field
   */
  addElement = (id, stage = this.components.stages.active) => this.addDescribed(this.describeControl(id), stage)

  /**
   * A control's click: onBeforeAdd decides whether and when it is added to the active stage (#281). A control set
   * with no fields adds nothing and runs no hook (#227).
   * @param {String} id control id
   * @return {Boolean|Promise<Boolean>} see Events#before
   */
  requestAddElement = id => {
    const stage = this.components.stages.active
    const described = this.describeControl(id)
    if (described.componentType === CONTROL_SET && !described.data.fields.length) {
      return false
    }
    const detail = { ...described, parent: stage, index: stage.children.length, addedVia: 'click' }
    return this.components.events.before(
      'add',
      detail,
      () => stage.isRegistered && this.addDescribed(described, stage),
      {
        src: this.dom,
      }
    )
  }

  /**
   * Remove the controls from the page and release their Sortables and Panels. A control drag in
   * progress in these controls is ended: its ghost is removed and the page overflow it hid is
   * restored. Safe to call more than once, and before init().
   */
  destroy() {
    const element = this.dom
    if (element && Sortable.active?.el && element.contains(Sortable.active.el)) {
      Sortable.ghost?.remove()
    }
    if (this.originalDocumentOverflow != null) {
      document.documentElement.style.overflow = this.originalDocumentOverflow
      this.originalDocumentOverflow = null
    }
    destroySortables(element)
    this.panels?.destroy()
    element?.remove()
  }

  applyOptions = async (controlOptions = {}) => {
    const { container, elements, groupOrder, ...options } = merge(defaultOptions, controlOptions)
    this.container = dom.resolveContainer(container)
    this.groupOrder = unique(groupOrder.concat(['common', 'html', 'layout']))
    this.options = options

    const [layoutControls, formControls, htmlControls] = await Promise.all([
      import('./layout/index.js'),
      import('./form/index.js'),
      import('./html/index.js'),
    ])

    const allControls = [layoutControls.default, formControls.default, htmlControls.default].flat()

    return Promise.all(this.registerControls([...allControls, ...elements]))
  }
}

// standalone instance for existing tests; components/index.js wires it into the legacy default Components
export default new Controls()
