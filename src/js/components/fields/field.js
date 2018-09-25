import i18n from 'mi18n'
import startCase from 'lodash/startCase'
import h, { indexOfNode } from '../../common/helpers'
import dom from '../../common/dom'
import Panels from '../panels'
import { clone, unique } from '../../common/utils'
import EditPanel from './edit-panel'
import Component from '../component'
import { FIELD_CLASSNAME } from '../../constants'
import Components from '..'

const DEFAULT_DATA = {
  conditions: [
    {
      if: [
        {
          source: '',
          comparison: '',
          target: '',
        },
      ],
      then: [
        {
          target: '',
          assignment: '',
          value: '',
        },
      ],
    },
  ],
}

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
    super('field', Object.assign({}, DEFAULT_DATA, fieldData))

    this.label = dom.create(this.labelConfig)
    this.preview = dom.create(this.fieldPreview())
    this.editPanels = []

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
            const reverseConditionField = Components['fields'].conditionMap.get(this.id)
            if (reverseConditionField) {
              return reverseConditionField.updateConditionsPanel()
            }

            const conditions = this.get('conditions')
            if (conditions && conditions.length) {
              this.updateConditionsPanel()
            }

            // if (reverseConditionField) {
            //   debounce(reverseConditionField.updateConditionsPanel, ANIMATION_BASE_SPEED)()
            // }
            // console.log(reverseConditionField)
          },
        },
      }
    )
  }

  /**
   * wrapper for Data.set
   */
  set(...args) {
    const [path, propData] = args
    const [property] = path.match(/(\w*)$/)
    const value = propData[property] ? propData[property] : propData

    const data = super.set(path, value)
    this.updateLabel()
    this.updatePreview()

    return data
  }

  /**
   * Update the label dom when label data changes
   */
  updateLabel() {
    if (!this.label.parentElement) {
      return null
    }
    const newLabel = dom.create(this.labelConfig)
    this.label.parentElement.replaceChild(newLabel, this.label)
    this.label = newLabel
  }

  /**
   * Updates the conditions panel when linked field data changes
   */
  updateConditionsPanel = () => {
    const newConditionsPanel = this.editPanels.find(({ name }) => name === 'conditions')
    if (!newConditionsPanel) {
      return null
    }
    const newProps = newConditionsPanel.createProps()
    const currentConditionsProps = this.dom.querySelector('.field-edit-conditions')
    currentConditionsProps.parentElement.replaceChild(newProps, currentConditionsProps)
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview(fieldData = this.fieldPreview()) {
    if (!this.preview.parentElement) {
      return null
    }
    const newPreview = dom.create(fieldData, true)
    this.preview.parentElement.replaceChild(newPreview, this.preview)
    this.preview = newPreview
    return this.preview
  }

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get fieldEdit() {
    const _this = this
    this.editPanels = []
    const editable = ['object', 'array']
    const noPanels = ['config', 'meta', 'action', 'events', ...this.config.panels.disabled]
    const panelOrder = unique([...this.config.panels.order, ...Object.keys(this.data)])
    const allowedPanels = panelOrder.filter(elem => !h.inArray(elem, noPanels))

    const fieldEdit = {
      className: ['field-edit', 'slide-toggle', 'panels-wrap'],
    }

    h.forEach(allowedPanels, (panelName, i) => {
      const panelData = this.get(panelName)
      const propType = dom.childType(panelData)
      if (editable.includes(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this)
        this.editPanels.push(editPanel)
      }
    })

    const panelsData = {
      panels: this.editPanels.map(({ panelConfig }) => panelConfig),
      id: _this.id,
    }

    const editPanelLength = this.editPanels.length

    if (editPanelLength) {
      const editPanels = (_this.panels = new Panels(panelsData))
      fieldEdit.className.push(`panel-count-${editPanelLength}`)
      fieldEdit.content = editPanels.children
      _this.panelNav = editPanels.nav
      _this.resizePanelWrap = editPanels.action.resize
      fieldEdit.action = {
        onRender: _this.resizePanelWrap,
      }
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
          const { checked, type } = target
          if (h.inArray(type, ['checkbox', 'radio'])) {
            const optionIndex = indexOfNode(target)
            const options = this.get('options')
            // uncheck options if radio
            if (type === 'radio') {
              options.forEach(({ selected }) => (selected = false))
            }
            const checkType = type === 'checkbox' ? 'checked' : 'selected'
            this.set(`options.${optionIndex}.${checkType}`, checked)
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault()
          }
        },
        input: evt => {
          if (evt.target.contentEditable === 'true') {
            super.set('attrs.value', evt.target.innerHTML)
          } else {
            super.set('attrs.value', evt.target.value)
          }
          this.processConditions()
        },
      },
    }

    return fieldPreview
  }

  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  propName
   * @return {Boolean}
   */
  isDisabledProp = (propName, kind = 'attrs') => {
    const propKind = this.config.panels[kind]
    if (!propKind) {
      return false
    }
    const disabledAttrs = propKind.disabled.concat(this.get(`config.disabled${startCase(kind)}`))
    return disabledAttrs.includes(propName)
  }
}
