import i18n from '@draggable/i18n'
import Sortable from 'sortablejs'
import actions from '../../common/actions.js'
import dom from '../../common/dom.js'
import events from '../../common/events.js'
import { indexOfNode, orderObjectsBy } from '../../common/helpers.mjs'
import { clone, match, merge, unique } from '../../common/utils/index.mjs'
import { get, set } from '../../common/utils/object.mjs'
import { CONTROL_GROUP_CLASSNAME, PANEL_CLASSNAME } from '../../constants.js'
import Panels from '../panels.js'
import Rows from '../rows/index.js'
import Stages from '../stages/index.js'
import Control from './control.js'
import defaultOptions from './options.js'

/**
 *
 */
export class Controls {
  constructor() {
    this.data = new Map()
    this.isDragging = false

    this.buttonActions = {
      // this is used for keyboard navigation. when tabbing through controls it
      // will auto navigated between the groups
      focus: ({ target }) => {
        // Prevent panel switching during drag operations
        if (this.isDragging) {
          return
        }
        const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`)
        return group && this.panels.nav.refresh(indexOfNode(group))
      },
      click: ({ target }) => {
        this.addElement(target.parentElement.id)
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
          if (Rows.size) {
            events.confirmClearAll = new window.CustomEvent('confirmClearAll', {
              detail: {
                confirmationMessage: i18n.get('confirmClearAll'),
                clearAllAction: () => {
                  Stages.clearAll().then(() => {
                    const evtData = {
                      src: evt.target,
                    }
                    events.formeoCleared(evtData)
                  })
                },
                btnCoords: dom.coords(evt.target),
              },
            })

            document.dispatchEvent(events.confirmClearAll)
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
        click: async ({ target }) => {
          // Dynamic import to avoid circular dependency
          const { default: Components } = await import('../index.js')
          const { formData } = Components
          const saveEvt = {
            action: () => {},
            coords: dom.coords(target),
            message: '',
            button: target,
          }
          actions.click.btn(saveEvt)

          return actions.save.form(formData)
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
          name: 'controls',
          pull: 'clone',
          put: false,
          revertClone: true,
        },
        onClone: ({ clone, item }) => {
          // Copy the item's id to the clone so we can identify what control it represents
          clone.id = item.id

          if (this.options.ghostPreview) {
            const { controlData } = this.get(item.id)
            // Dynamically import Field to avoid circular dependency
            import('../fields/field.js').then(({ default: Field }) => {
              clone.innerHTML = ''
              clone.appendChild(new Field(controlData).preview)
            })
          }
        },
        onStart: () => {
          this.isDragging = true
          // Prevent scrollbar flashing during drag by hiding overflow
          this.originalDocumentOverflow = document.documentElement.style.overflow
          document.documentElement.style.overflow = 'hidden'
        },
        onEnd: ({ from, item, clone }) => {
          if (from.contains(clone)) {
            from.replaceChild(item, clone)
          }
          // Restore overflow after drag completes
          document.documentElement.style.overflow = this.originalDocumentOverflow
          this.originalDocumentOverflow = null
          // Use setTimeout to ensure all events (focus, click, etc.) have already fired
          // before we reset the dragging state. Increased delay to handle all browser events.
          window.setTimeout(() => {
            this.isDragging = false
          }, 100)
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
    row: () => Stages.active.addChild(),
    column: () => this.layoutTypes.row().addChild(),
    field: controlData => this.layoutTypes.column().addChild(controlData),
  }

  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addElement = id => {
    const {
      meta: { group, id: metaId },
      ...elementData
    } = get(this.get(id), 'controlData')

    set(elementData, 'config.controlId', metaId)

    if (group === 'layout') {
      return this.layoutTypes[metaId.replace('layout-', '')]()
    }

    return this.layoutTypes.field(elementData)
  }

  applyOptions = async (controlOptions = {}) => {
    const { container, elements, groupOrder, ...options } = merge(defaultOptions, controlOptions)
    this.container = container
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

export default new Controls()
