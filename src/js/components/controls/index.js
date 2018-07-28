import Sortable from 'sortablejs'
import i18n from 'mi18n'
import { data } from '../../common/data'
import helpers from '../../common/helpers'
import events from '../../common/events'
import { match, unique, uuid, closestFtype } from '../../common/utils'
import dom from '../../common/dom'
import Panels from '../panels'
import rowsData from '../../data/rows'
import layoutControls from './layout'
import formControls from './form'
import htmlControls from './html'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import Field from '../fields/field'
import Control from './control'

const defaultElements = [
  ...formControls,
  ...htmlControls,
  ...layoutControls,

  {
    tag: 'textarea',
    config: {
      label: i18n.get('textarea'),
    },
    // This is the beginning of actions being supported for render
    // editor field actions should be in config.action
    // action: {
    //   mousedown: function(evt) {
    //     let {target} = evt;
    //     let startHeight = target.style.height;
    //     const onMouseup = evt => {
    //       let {target} = evt;
    //       let endHeight = target.style.height;
    //       if (startHeight !== endHeight) {
    //         //eslint-disable-next-line
    //         let fieldId = closest(target, '.stage-fields').id;
    //         const field = d.fields.get(fieldId).instance;
    //         field.addAttribute('style', `height: ${endHeight}`);
    //       }
    //       target.removeEventListener('mouseup', onMouseup);
    //     };
    //     target.addEventListener('mouseup', onMouseup);
    //   }
    // },
    meta: {
      group: 'common',
      icon: 'textarea',
      id: 'textarea',
    },
    attrs: {
      required: false,
    },
  },
  {
    tag: 'p',
    attrs: {
      className: '',
    },
    config: {
      label: i18n.get('paragraph'),
      hideLabel: true,
      // editable: true,
    },
    meta: {
      group: 'html',
      icon: 'paragraph',
      id: 'paragraph',
    },
    // eslint-disable-next-line
    content:
      'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.',
  },
  {
    tag: 'hr',
    config: {
      label: i18n.get('separator'),
      hideLabel: true,
    },
    meta: {
      group: 'html',
      icon: 'divider',
      id: 'divider',
    },
  },
  {
    tag: 'input',
    attrs: {
      type: 'file',
      required: false,
    },
    config: {
      disabledAttrs: ['type'],
      label: i18n.get('fileUpload'),
    },
    meta: {
      group: 'common',
      icon: 'upload',
      id: 'upload',
    },
    fMap: 'attrs.value',
  },
  {
    tag: 'input',
    attrs: {
      type: 'number',
      required: false,
      className: '',
    },
    config: {
      label: i18n.get('number'),
      disabledAttrs: ['type'],
    },
    meta: {
      group: 'common',
      icon: 'hash',
      id: 'number',
    },
    fMap: 'attrs.value',
  },
  {
    tag: 'input',
    attrs: {
      type: 'hidden',
      value: '',
    },
    config: {
      label: i18n.get('hidden'),
      hideLabel: true,
    },
    meta: {
      group: 'common',
      icon: 'hidden',
      id: 'hidden',
    },
    fMap: 'attrs.value',
  },
]

/**
 *
 */
export class Controls {
  constructor() {
    const _this = this
    this.data = new Map()
    this.defaults = {
      sortable: true,
      elementOrder: {},
      groups: [
        {
          id: 'layout',
          label: 'controls.groups.layout',
          elementOrder: ['row', 'column'],
        },
        {
          id: 'common',
          label: 'controls.groups.common',
          elementOrder: ['button', 'checkbox'],
        },
        {
          id: 'html',
          label: 'controls.groups.html',
          elementOrder: ['header', 'block-text'],
        },
      ],
      disable: {
        groups: [],
        elements: [],
      },
      elements: [],
    }

    this.controlEvents = {
      focus: evt => {
        const currentGroup = closestFtype(evt.target)
        _this.panels.nav.refresh(helpers.indexOfNode(currentGroup))
      },
      click: evt => _this.addElement(evt.target.parentElement.id),
      // mousedown: evt => {
      //   let position = _this.cPosition;
      //   position.x = evt.clientX;
      //   position.y = evt.clientY;
      // },
      // mouseup: evt => {
      //   let position = _this.cPosition;
      //   if (clicked(evt.clientX, evt.clientY, position, evt.button)) {
      //     _this.addElement(evt.target.parentElement.id);
      //   }
      // }
    }
  }

  init(controlOptions) {
    this.applyOptions(controlOptions)
    this.registerControls()
    this.buildDOM()
    return this
  }

  /**
   * Dragging from the control bar clears element
   * events lets add them back after drag.
   * @param  {Object} evt
   */
  applyControlEvents = ({ item }) => {
    const control = this.dom.getElementById(item.id)
    const button = control.querySelector('button')
    Object.keys(this.controlEvents).forEach(action => button.addEventListener(action, this.controlEvents[action]))
  }

  /**
   * Generate control config for UI and bind actions
   * @return {Array} elementControls
   */
  registerControls() {
    this.controls = this.options.elements.map(Element => {
      const control = typeof Element === 'function' ? new Element() : new Control(Element)
      const {
        controlData: { meta, config },
      } = control
      const { id: controlId } = this.add(control)
      const button = {
        tag: 'button',
        attrs: {
          type: 'button',
        },
        content: [dom.icon(meta.icon), config.label],
        action: this.controlEvents,
      }
      return {
        tag: 'li',
        id: controlId,
        className: ['field-control', `${meta.group}-control`, `${meta.id}-control`],
        content: button,
        meta: meta,
      }
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
    groups = helpers.orderObjectsBy(groups, this.groupOrder, 'id')

    // remove disabled groups
    groups = groups.filter(group => match(group.id, this.options.disable.groups))

    // create group config
    allGroups = helpers.map(groups, i => {
      const group = {
        tag: 'ul',
        attrs: {
          className: 'control-group',
          id: `${groups[i].id}-control-group`,
        },
        fType: 'controlGroup',
        config: {
          label: this.groupLabel(groups[i].label),
        },
      }

      console.log(this.groupLabel(groups[i].label))

      // Apply order to elements
      if (this.options.elementOrder[groups[i].id]) {
        const userOrder = this.options.elementOrder[groups[i].id]
        const newOrder = unique(userOrder.concat(groups[i].elementOrder))
        groups[i].elementOrder = newOrder
      }
      elements = helpers.orderObjectsBy(elements, groups[i].elementOrder, 'meta.id')

      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      group.content = elements.filter(control => {
        const { controlData: field } = this.get(control.id)
        const fieldId = field.meta.id || ''
        const filters = [
          match(fieldId, this.options.disable.elements),
          field.meta.group === groups[i].id,
          !helpers.inArray(field.meta.id, usedElementIds),
        ]

        let shouldFilter = true
        shouldFilter = filters.every(val => val === true)
        if (shouldFilter) {
          usedElementIds.push(fieldId)
        }

        return shouldFilter
      })

      return group
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
    const btnTemplate = ({ content, title }) => ({
      tag: 'button',
      attrs: {
        type: 'button',
        title,
      },
      content,
    })

    console.log(i18n.get('clear'))

    const clearBtn = {
      ...btnTemplate({ content: [dom.icon('bin'), i18n.get('clear')], title: i18n.get('clearAll') }),
      className: ['clear-form'],
      action: {
        click: evt => {
          if (rowsData.size) {
            events.confirmClearAll = new window.CustomEvent('confirmClearAll', {
              detail: {
                confirmationMessage: i18n.get('confirmClearAll'),
                clearAllAction: dom.clearForm.bind(dom),
                btnCoords: dom.coords(evt.target),
                rows: dom.rows,
                rowCount: dom.rows.size,
              },
            })

            document.dispatchEvent(events.confirmClearAll)
            rowsData.empty()
          } else {
            window.alert('There are no fields to clear')
          }
        },
      },
    }
    // let settingsBtn = h.merge(btnTemplate, {
    //   content: [dom.icon('settings'), i18n.get('settings')],
    //   attrs: {
    //     title: i18n.get('settings')
    //   },
    //   className: ['btn', 'btn-secondary', 'edit-settings'],
    //   action: {
    //     click: () => {
    //       console.log('clicked');
    //       let stage = document.getElementById(_this.formId + '-stage');
    //       stage.parentElement.classList.toggle('editing-stage');
    //     }
    //   }
    // });
    const saveBtn = {
      ...btnTemplate({ content: [dom.icon('floppy-disk'), i18n.get('save')], title: i18n.get('save') }),
      className: ['save-form'],
      action: {
        click: evt => {
          // @todo: complete actions connection
          // let saveEvt = {
          //   action: () => {},
          //   coords: dom.coords(evt.target),
          //   message: ''
          // };
          // actions.click.btn(saveEvt);
          // data.save()
        },
      },
    }
    const formActions = {
      tag: 'div',
      className: 'form-actions f-btn-group',
      // content: [clearBtn, settingsBtn, saveBtn]
      content: [clearBtn, saveBtn],
    }

    return formActions
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  buildDOM() {
    // if (this.dom) {
    //   return this.dom
    // }
    const _this = this
    const groupedFields = this.groupElements()
    const formActions = this.formActions()
    _this.panels = new Panels({ panels: groupedFields, type: 'controls' })
    const groupsWrapClasses = ['control-groups', 'panels-wrap', `panel-count-${groupedFields.length}`]
    const groupsWrap = dom.create({
      tag: 'div',
      className: groupsWrapClasses,
      content: _this.panels.children,
    })

    const element = dom.create({
      tag: 'div',
      className: 'formeo-controls',
      content: [groupsWrap, formActions],
    })
    const groups = element.getElementsByClassName('control-group')

    this.dom = element
    this.groups = groups
    this.currentGroup = groups[0]

    this.actions = {
      filter: term => {
        const cpContent = _this.panels.children[1]
        const filtering = term !== ''
        // @todo, use references instead of DOM queries
        const fields = cpContent.querySelectorAll('.field-control')
        let filteredTerm = groupsWrap.querySelector('.filtered-term')

        this.toggleElementsByStr(fields, term)

        if (filtering) {
          // @todo change to use language file
          const filteredStr = `Filtering '${term}'`

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
      addElement: _this.addElement,
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
        onRemove: _this.applyControlEvents,
        // onEnd: evt => {console.log(evt)},
        onStart: evt => {
          if (this.options.ghostPreview) {
            evt.item.innerHTML = ''
            evt.item.appendChild(new Field(this.get(evt.item.id)).preview)
          }
        },
        sort: this.options.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: sortable => {
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
  addElement(id) {
    const row = dom.addRow()
    const meta = helpers.get(this.get(id), 'controlData.meta')
    if (meta.group !== 'layout') {
      const column = dom.addColumn(row)
      dom.addField(column, id)
    } else if (meta.id === 'layout-column') {
      dom.addColumn(row)
    }

    data.saveColumnOrder(row)
    dom.columnWidths(row)
    data.save()
  }

  applyOptions(controlOptions = {}) {
    this.options = {}
    const { groupOrder = [], elements = [] } = controlOptions
    this.groupOrder = unique(groupOrder.concat(['common', 'html', 'layout']))
    this.options = merge(this.defaults, controlOptions)
    this.options.elements = elements.concat(defaultElements)
  }

  /**
   * Hide or show an Array or HTMLCollection of elements
   * @param  {Array} elems
   * @param  {String} term  match textContent to this term
   * @return {Array}        filtered elements
   */
  toggleElementsByStr = (elems, term) => {
    const filteredElems = []
    helpers.forEach(elems, elem => {
      const txt = elem.textContent.toLowerCase()
      if (txt.indexOf(term.toLowerCase()) !== -1) {
        elem.style.display = 'block'
        filteredElems.push(elem)
      } else {
        elem.style.display = 'none'
      }
    })

    return filteredElems
  }
}

// export const controls = new Controls()
export default new Controls()
