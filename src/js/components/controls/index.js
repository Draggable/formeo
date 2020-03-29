import Sortable from 'sortablejs'
import i18n from 'mi18n'
import cloneDeep from 'lodash/cloneDeep'
import actions from '../../common/actions'
import { indexOfNode, orderObjectsBy, get } from '../../common/helpers'
import events from '../../common/events'
import dom from '../../common/dom'
import { match, unique, uuid, merge } from '../../common/utils'
import Panels from '../panels'
import Field from '../fields/field'
import Control from './control'
import { CONTROL_GROUP_CLASSNAME } from '../../constants'
import Components, { Stages, Rows } from '..'

// control configs
import layoutControls from './layout'
import formControls from './form'
import htmlControls from './html'
import defaultOptions from './options'

const defaultElements = [...formControls, ...htmlControls, ...layoutControls]

/**
 *
 */
export class Controls {
  constructor() {
    this.data = new Map()

    this.controlEvents = {
      focus: ({ target }) => {
        const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`)
        return group && this.panels.nav.refresh(indexOfNode(group))
      },
      click: ({ target }) => this.addElement(target.parentElement.id),
    }
  }

  /**
   * Methods to be called on initialization
   * @param {Object} controlOptions
   */
  init(controlOptions, sticky = false) {
    this.applyOptions(controlOptions)
    this.registerControls()
    this.buildDOM(sticky)
    return this
  }

  /**
   * Dragging from the control bar clears element
   * events lets add them back after drag.
   * @param  {Object} evt
   */
  applyControlEvents = ({ clone: control }) => {
    const button = control.querySelector('button')
    Object.keys(this.controlEvents).map(action => button.addEventListener(action, this.controlEvents[action]))
  }

  /**
   * Generate control config for UI and bind actions
   * @return {Array} elementControls
   */
  registerControls() {
    this.controls = this.elements.map(Element => {
      const isControl = typeof Element === 'function'
      const control = isControl ? new Element() : new Control(Element)
      const {
        controlData: { meta, config },
      } = control
      const controlLabel = isControl ? config.label : i18n.get(config.label) || config.label
      const { id: controlId } = this.add(control)
      const button = {
        tag: 'button',
        attrs: {
          type: 'button',
        },
        content: [{ tag: 'span', className: 'control-icon', children: dom.icon(meta.icon) }, controlLabel],
        action: this.controlEvents,
      }

      control.dom = dom.create({
        tag: 'li',
        id: controlId,
        className: ['field-control', `${meta.group}-control`, `${meta.id}-control`],
        content: button,
        meta: meta,
      })

      return control.dom
    })

    return this.controls
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
          className: CONTROL_GROUP_CLASSNAME,
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
        const fieldId = field.meta.id || ''
        const filters = [
          match(fieldId, this.options.disable.elements),
          field.meta.group === group.id,
          !usedElementIds.includes(field.meta.id),
        ]

        let shouldFilter = true
        shouldFilter = filters.every(val => val === true)
        if (shouldFilter) {
          usedElementIds.push(fieldId)
        }

        return shouldFilter
      })

      return groupConfig
    })

    return allGroups
  }

  add(control = Object.create(null)) {
    const { id, ...config } = control
    const controlId = id || uuid()
    const controlConfig = cloneDeep(config)
    this.data.set(controlId, controlConfig)
    return { id: controlId, ...controlConfig }
  }

  get(controlId) {
    return cloneDeep(this.data.get(controlId))
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
        click: ({ target }) => {
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

    let controlClass = 'formeo-controls'
    if (sticky) {
      controlClass += ' formeo-sticky'
    }

    const element = dom.create({
      className: controlClass,
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
        window.localStorage.removeItem(storeID)
      }
      Sortable.create(groups[i], {
        animation: 150,
        forceFallback: true,
        fallbackClass: 'control-moving',
        fallbackOnBody: true,
        group: {
          name: 'controls',
          pull: 'clone',
          put: false,
        },
        onRemove: this.applyControlEvents,
        onStart: ({ item }) => {
          const { controlData } = this.get(item.id)
          if (this.options.ghostPreview) {
            item.innerHTML = ''
            item.appendChild(new Field(controlData).preview)
          }
        },
        sort: this.options.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: () => {
            const order = window.localStorage.getItem(storeID)
            return order ? order.split('|') : []
          },

          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: sortable => {
            const order = sortable.toArray()
            window.localStorage.setItem(storeID, order.join('|'))
          },
        },
      })
    }

    return element
  }

  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addElement = id => {
    const controlData = get(this.get(id), 'controlData')
    const {
      meta: { group, id: metaId },
    } = controlData

    const layoutTypes = {
      row: () => Stages.active.addChild(),
      column: () => layoutTypes.row().addChild(),
      field: controlData => layoutTypes.column().addChild(controlData),
    }

    return group !== 'layout' ? layoutTypes.field(controlData) : layoutTypes[metaId.replace('layout-', '')]()
  }

  applyOptions = (controlOptions = {}) => {
    const { container, elements, groupOrder, ...options } = merge(defaultOptions, controlOptions)
    this.container = container
    this.groupOrder = unique(groupOrder.concat(['common', 'html', 'layout']))
    this.elements = elements.concat(defaultElements)
    this.options = options
  }
}

export default new Controls()
