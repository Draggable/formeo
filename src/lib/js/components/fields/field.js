import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { indexOfNode } from '../../common/helpers.mjs'
import { clone, debounce } from '../../common/utils/index.mjs'
import { FIELD_CLASSNAME } from '../../constants.js'
import Component from '../component.js'

const checkableTypes = new Set(['checkbox', 'radio'])
const isSelectableType = new Set(['radio', 'checkbox', 'select-one', 'select-multiple'])

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

    this.debouncedUpdateEditPanels = debounce(this.updateEditPanels)
    this.debouncedUpdatePreview = debounce(this.updatePreview)

    this.label = dom.create(this.labelConfig)

    this.preview = this.fieldPreview()

    this.controlId = this.get('config.controlId') || this.get('meta.id')

    const actionButtons = this.getActionButtons()
    const hasEditButton = this.actionButtons.some(child => child.meta?.id === 'edit')

    this.updateEditPanels()

    const field = dom.create({
      tag: 'li',
      attrs: {
        className: FIELD_CLASSNAME,
      },
      id: this.id,
      children: [
        this.label,
        this.getComponentTag(),
        actionButtons,
        hasEditButton && this.editWindow, // fieldEdit window,
        this.preview,
      ].filter(Boolean),
      panelNav: this.panelNav,
      dataset: {
        hoverTag: i18n.get('field'),
      },
    })

    // this.observe(field)

    this.dom = field
    this.isEditing = false
  }

  get labelConfig() {
    const hideLabel = !!this.get('config.hideLabel')

    if (hideLabel) {
      return null
    }

    const { label, editorLabel, disableHtmlLabel, helpText, tooltip } = this.get('config')
    const { required: isRequired } = this.get('attrs') || {}
    const labelVal = editorLabel || label

    const labelBase = {
      tag: 'label',
      attrs: {},
    }

    if (disableHtmlLabel) {
      labelBase.tag = 'input'
      labelBase.attrs.value = labelVal
    } else {
      labelBase.attrs.contenteditable = true
      labelBase.children = labelVal
    }

    const labelObj = {
      ...labelBase,
      action: {
        input: ({ target: { innerHTML, value } }) => {
          const labelVal = disableHtmlLabel ? value : innerHTML
          super.set('config.label', labelVal)
          const configPanelLabelInput = this.dom.querySelector('.config-label')
          if (configPanelLabelInput) {
            configPanelLabelInput.value = labelVal
          }
        },
      },
    }

    const labelWrap = {
      className: 'prev-label',
      children: [
        labelObj,
        isRequired && dom.requiredMark(),
        tooltip && dom.tooltip(tooltip),
        helpText && dom.helpText(helpText),
      ],
    }

    return labelWrap
  }

  setData = (path, value) => {
    return super.set(path, value)
  }

  /**
   * wrapper for Data.set
   */
  set(path, value) {
    const data = this.setData(path, value)
    // this.debouncedUpdatePreview()

    return data
  }

  /**
   * Update the label dom when label data changes
   */
  updateLabel() {
    const newLabel = dom.create(this.labelConfig)

    if (this.label || !newLabel) {
      this.label.remove()
    }

    if (newLabel) {
      if (this.data.config?.labelAfter) {
        this.dom.append(newLabel)
      } else {
        this.dom.prepend(newLabel)
      }
    }

    this.label = newLabel
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview = () => {
    this.updateLabel()
    const newPreview = this.fieldPreview()
    this.preview.replaceWith(newPreview)
    this.preview = newPreview
  }

  get defaultPreviewActions() {
    return {
      change: evt => {
        const { target } = evt
        const { type } = target

        if (isSelectableType.has(type)) {
          const selectedOptions = this.preview.querySelectorAll(':checked')
          const optionsData = this.get('options')
          const checkedType = optionsData?.[0]?.selected === undefined ? 'checked' : 'selected'
          const optionsDataMap = optionsData.reduce((acc, option) => {
            acc[option.value] = option
            acc[option.value][checkedType] = false
            return acc
          }, {})

          for (const option of selectedOptions) {
            optionsDataMap[option.value][checkedType] = option.value === optionsDataMap[option.value].value
          }

          super.set('options', Object.values(optionsDataMap))
          return this.debouncedUpdateEditPanels()
        }
      },
      click: evt => {
        if (evt.target.contentEditable === 'true') {
          evt.preventDefault()
        }
      },
      input: ({ target }) => {
        if (['input', 'meter', 'progress', 'button'].includes(target.tagName.toLowerCase())) {
          super.set('attrs.value', target.value)
          return this.debouncedUpdateEditPanels()
        }

        if (target.contentEditable && !target.type?.startsWith('select-')) {
          const parentClassList = target.parentElement.classList
          const isOption = parentClassList.contains('f-checkbox') || parentClassList.contains('f-radio')

          if (isOption) {
            const option = target.parentElement
            const optionIndex = indexOfNode(option)
            this.setData(`options[${optionIndex}].label`, target.innerHTML)
            return this.debouncedUpdateEditPanels()
          }

          this.setData('content', target.innerHTML || target.value)
        }
      },
    }
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    const { action = {}, ...prevData } = clone(this.data)
    prevData.id = `prev-${this.id}`
    prevData.action = Object.entries(action).reduce((acc, [key, value]) => {
      acc[key] = value.bind(this)
      return acc
    }, {})

    if (this.data?.config.editableContent) {
      prevData.attrs = { ...prevData.attrs, contenteditable: true }
    }

    const fieldPreview = {
      attrs: {
        className: 'field-preview',
        style: this.isEditing && 'display: none;',
      },
      content: dom.create(prevData, true),
      action: this.defaultPreviewActions,
    }

    return dom.create(fieldPreview, true)
  }

  get isCheckable() {
    return checkableTypes.has(this.get('config.controlId'))
  }
}
