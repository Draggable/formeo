import i18n from 'mi18n'
import h from '../../common/helpers'
import dom from '../../common/dom'
import Panels from '../panels'
import { clone } from '../../common/utils'
import EditPanel from './edit-panel'
import Component from '../component'
import { FIELD_CLASSNAME } from '../../constants'

/**
 * Element/Field class.
 */
export default class Field extends Component {
  /**
   * Set defaults and load fieldData
   * @param  {Object} fieldData existing field ID
   * @return {Object} field object
   */
  constructor(fieldData = Object.create(null)) {
    super('field', fieldData)

    let field = {
      tag: 'li',
      attrs: {
        className: FIELD_CLASSNAME,
      },
      id: this.id,
      children: [
        this.label,
        this.actionButtons(), // fieldEdit window
        this.fieldEdit, // fieldEdit window
      ],
      panelNav: this.panelNav,
      dataset: {
        hoverTag: i18n.get('field'),
      },
      action: {
        mouseenter: () => this.dom.classList.add(`hovering-${this.name}`),
        mouseleave: () => this.dom.classList.remove(`hovering-${this.name}`),
      },
    }

    field = dom.create(field)

    this.preview = dom.create(this.fieldPreview())
    field.appendChild(this.preview)
    this.dom = field
  }

  get label() {
    return (
      this.data.config &&
      !this.data.config.hideLabel && {
        tag: 'label',
        attrs: {
          contenteditable: true,
          className: 'prev-label',
        },
        children: this.data.config.label,
        action: {
          input: ({ target: { innerHTML } }) => {
            this.set('config.label', innerHTML)
          },
        },
      }
    )
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    const _this = this
    const fieldData = h.copyObj(this.data)
    const newPreview = dom.create(fieldData, true)
    dom.empty(_this.preview)
    _this.preview.appendChild(newPreview)

    return newPreview
  }

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get fieldEdit() {
    const _this = this
    const panels = []
    const editable = ['object', 'array']
    const noPanels = ['config', 'meta', 'action', 'events']
    const fieldData = this.data
    const allowedPanels = Object.keys(this.data).filter(elem => {
      return !h.inArray(elem, noPanels)
    })

    const fieldEdit = {
      className: ['field-edit', 'slide-toggle', 'panels-wrap'],
    }

    h.forEach(allowedPanels, (panelName, i) => {
      const panelData = fieldData[panelName]
      const propType = dom.childType(panelData)
      if (editable.includes(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this)
        panels.push(editPanel)
      }
    })

    const panelsConfig = {
      panels,
      id: _this.id,
    }

    if (panels.length) {
      const editPanels = (_this.panels = new Panels(panelsConfig))
      fieldEdit.className.push('panel-count-' + panels.length)
      fieldEdit.content = editPanels.children
      _this.panelNav = editPanels.nav
      _this.resizePanelWrap = editPanels.action.resize
    } else {
      setTimeout(() => {
        const field = this.dom
        const editToggle = field.querySelector('.item-edit-toggle')
        const fieldActions = field.querySelector('.field-actions')
        const actionButtons = fieldActions.getElementsByTagName('button')
        fieldActions.style.maxWidth = `${actionButtons.length * 24}px`
        dom.remove(editToggle)
      }, 0)
    }

    return fieldEdit
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    const prevData = clone(this.data)
    prevData.id = `prev-${this.id}`
    // const field = this.dom
    // const togglePreviewEdit = evt => {
    //   console.log(field)
    //   const column = field.parentElement
    //   if (evt.target.contentEditable === 'true') {
    //     if (h.inArray(evt.type, ['focus', 'blur'])) {
    //       const isActive = document.activeElement === evt.target
    //       column.classList.toggle('editing-field-preview', isActive)
    //       dom.toggleSortable(field.parentElement, evt.type === 'focus')
    //     } else if (h.inArray(evt.type, ['mousedown', 'mouseup'])) {
    //       dom.toggleSortable(field.parentElement, evt.type === 'mousedown')
    //     }
    //   }
    // }

    const fieldPreview = {
      attrs: {
        className: 'field-preview',
      },
      content: dom.create(prevData, true),
      action: {
        // focus: togglePreviewEdit,
        // blur: togglePreviewEdit,
        // mousedown: togglePreviewEdit,
        // mouseup: togglePreviewEdit,
        change: evt => {
          const { target } = evt
          if (target.fMap) {
            const fieldData = this.data
            const { checked, type, fMap } = target
            if (h.inArray(type, ['checkbox', 'radio'])) {
              const options = fieldData.get('options')
              // uncheck options if radio
              if (type === 'radio') {
                options.forEach(({ selected }) => (selected = false))
              }
              // dom.fields.get(_this.id).field
              console.log(options)
              console.log(fMap)
              console.log(checked)
              console.dir(target)
              // console.log(target, h.indexOfNode(target))
            }
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault()
          }
        },
        input: evt => {
          const fieldData = this.data
          let prop = 'content'
          if (evt.target.fMap) {
            prop = evt.target.fMap
          }
          if (evt.target.contentEditable === 'true') {
            h.set(fieldData, prop, evt.target.innerHTML)
          } else {
            h.set(fieldData, prop, evt.target.value)
          }
        },
      },
    }

    return fieldPreview
  }
}
