import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { indexOfNode } from '../../common/helpers.mjs'
import {
  FIELD_WRAP_CLASSNAME,
  isLabelAfter,
  labelWrapClassNames,
  normalizeLabelConfig,
  resolveLabelPosition,
} from '../../common/label-position.mjs'
import { isTableField } from '../../common/table.mjs'
import { clone, debounce } from '../../common/utils/index.mjs'
import { FIELD_CLASSNAME } from '../../constants.js'
import Component from '../component.js'
import { controlAttrPanelConfig, getControlConfig } from './control-attr-config.mjs'
import { TablePanel } from './table-panel.js'

const checkableTypes = new Set(['checkbox', 'radio'])
const isSelectableType = new Set(['radio', 'checkbox', 'select-one', 'select-multiple'])

const TABLE_DISABLED_CONFIG_KEYS = ['hideLabel', 'labelPosition', 'helpText', 'tooltip', 'disableHtmlLabel']

/**
 * Element/Field class.
 */
export default class Field extends Component {
  /**
   * Set defaults and load fieldData
   * @param  {Object} fieldData existing field ID
   * @return {Object} field object
   */
  constructor(fieldData = Object.create(null), components) {
    super('field', fieldData, components)

    this.normalizeLabelConfig()
    this.controlId = this.get('config.controlId') || this.get('meta.id')
    this.applyControlAttrConfig()
    this.applyTableConfig()

    this.debouncedUpdateEditPanels = debounce(this.updateEditPanels)
    this.debouncedUpdatePreview = debounce(this.updatePreview)

    this.label = dom.create(this.labelConfig)

    this.preview = this.fieldPreview()

    this.labelWrap = dom.create({ className: FIELD_WRAP_CLASSNAME })
    this.syncLabelWrap()

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
        this.getComponentTag(),
        actionButtons,
        this.labelWrap, // label and preview, in label-position order (#243)
        hasEditButton && this.editWindow, // fieldEdit window,
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

  /**
   * Honour control-level `disabledAttrs` / `lockedAttrs` by merging them into this field's
   * panels.attrs config. Reads both the registered control definition and the field's own
   * saved config so forms saved before a control changed still pick up its rules.
   */
  applyControlAttrConfig() {
    const controlConfig = getControlConfig(this.components.controls?.get(this.controlId))
    const attrConfig = controlAttrPanelConfig(controlConfig, this.get('config'))
    if (attrConfig) {
      this.config = { [this.id]: attrConfig }
    }
  }

  /**
   * A table's caption is its visible name (#349), so the label-only Config keys don't apply to it. Keyed off the
   * field's table data, not its control id. The config setter deep-merges, so this adds to the attr config above.
   */
  applyTableConfig() {
    if (this.isTable) {
      this.config = { [this.id]: { panels: { config: { disabled: TABLE_DISABLED_CONFIG_KEYS } } } }
    }
  }

  get isTable() {
    return isTableField({ table: this.get('table') })
  }

  /**
   * A table field's Table panel (#349). Built once, so its grid and focus survive a rebuild of the edit panels.
   * @return {Object<String, {panelConfig: Object}>}
   */
  get customPanels() {
    if (!this.isTable) {
      return {}
    }
    this.tablePanel ??= new TablePanel(this)
    return { table: this.tablePanel }
  }

  /**
   * Converts legacy config.labelAfter, and an unknown config.labelPosition, to the labelPosition it resolves to (#243).
   * Replaces the config object instead of calling set(), so loading a form fires no update events and the data it was
   * given (a saved form, a control definition) is never mutated.
   */
  normalizeLabelConfig() {
    const config = normalizeLabelConfig(this.data)
    if (config !== this.data.config) {
      this.data.config = config
    }
  }

  get labelConfig() {
    // a table is named by its caption, never a label (#349)
    const hideLabel = this.isTable || !!this.get('config.hideLabel')

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
   * Puts the label and preview into the field wrapper in label-position order, with the matching classes (#243)
   */
  syncLabelWrap() {
    const position = resolveLabelPosition(this.data)
    const children = [this.label, this.preview].filter(Boolean)
    if (isLabelAfter(position)) {
      children.reverse()
    }
    this.labelWrap.className = labelWrapClassNames(position).join(' ')
    this.labelWrap.replaceChildren(...children)
  }

  /**
   * Rebuilds the label from the field's data
   */
  updateLabel() {
    this.label = dom.create(this.labelConfig)
    this.syncLabelWrap()
  }

  /**
   * Updates a field's preview
   */
  updatePreview = () => {
    this.preview = this.fieldPreview()
    this.updateLabel()
  }

  get defaultPreviewActions() {
    return {
      change: evt => {
        const { target } = evt
        const { type } = target
        // a table's preview is a picture of the form (#349): its inputs never edit options or attrs.value
        if (target.closest?.('.f-table')) {
          return
        }

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
            // an input without an option, such as an Other choice, is never a default
            if (!optionsDataMap[option.value]) {
              continue
            }
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
        if (target.closest?.('.f-table')) {
          return
        }
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
