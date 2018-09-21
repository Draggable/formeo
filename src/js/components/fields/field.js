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

    this.label = dom.create(this.labelConfig)
    this.preview = dom.create(this.fieldPreview())

    let field = {
      tag: 'li',
      attrs: {
        className: FIELD_CLASSNAME,
      },
      id: this.id,
      children: [
        this.label,
        this.getActionButtons(), // fieldEdit window
        this.fieldEdit, // fieldEdit window,
        this.preview, // preview
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
    this.observe(field)

    this.dom = field
    this.isEditing = false
    this.onRender()
  }

  get labelConfig() {
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
            super.set('config.label', innerHTML)
          },
        },
      }
    )
  }

  set(...args) {
    const data = super.set(...args)
    this.updateLabel()
    this.updatePreview()

    return data
  }

  updateLabel() {
    const newLabel = dom.create(this.labelConfig)
    this.label.parentElement.replaceChild(newLabel, this.label)
    this.label = newLabel
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview(fieldData = this.fieldPreview()) {
    const newPreview = dom.create(fieldData, true)
    this.preview.parentElement.replaceChild(newPreview, this.preview)
    this.preview = newPreview

    // dom.empty(this.preview)
    // this.preview.appendChild(newPreview)
    // console.log(newPreview)

    return this.preview
  }

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get fieldEdit() {
    const _this = this
    const panels = []
    const editable = ['object', 'array']
    const noPanels = ['config', 'meta', 'action', 'events', ...this.config.panels.disabled]
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

    const panelsData = {
      panels,
      id: _this.id,
    }

    if (panels.length) {
      const editPanels = (_this.panels = new Panels(panelsData))
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

    const fieldPreview = {
      attrs: {
        className: 'field-preview',
        style: this.isEditing && 'display: none;',
      },
      content: dom.create(prevData, true),
      action: {
        change: evt => {
          const { target } = evt
          if (target.fMap) {
            const { checked, type, fMap } = target
            if (h.inArray(type, ['checkbox', 'radio'])) {
              const options = super.get('options')
              // uncheck options if radio
              if (type === 'radio') {
                options.forEach(({ selected }) => (selected = false))
              }
            }
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault()
          }
        },
        input: evt => {
          let prop = 'content'
          if (evt.target.fMap) {
            prop = evt.target.fMap
          }
          if (evt.target.contentEditable === 'true') {
            super.set(prop, evt.target.innerHTML)
          } else {
            super.set(prop, evt.target.value)
          }
          this.processConditions()
        },
      },
    }

    return fieldPreview
  }
}
