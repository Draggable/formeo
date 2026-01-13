import i18n from '@draggable/i18n'
import actions from '../../common/actions.js'
import dom from '../../common/dom.js'
import { capitalize, safeAttrName } from '../../common/helpers.mjs'
import { slugify, toTitleCase } from '../../common/utils/string.mjs'
import { FILTERED_PANEL_DATA_KEYS, PANEL_CLASSNAME } from '../../constants.js'
import Dialog from '../dialog.js'
import EditPanelItem, { toggleOptionMultiSelect } from './edit-panel-item.mjs'
import { labelHelper } from './helpers.mjs'

// @todo convert these hardcoded lists to use
// the updated event system from #381
const addAttributeActions = {
  multiple: (val, field) => {
    toggleOptionMultiSelect(!!val, field)
  },
}

const defaultConfigOptions = [
  { label: labelHelper('config.label'), value: 'label' },
  { label: labelHelper('config.hideLabel'), value: 'hideLabel' },
  { label: labelHelper('config.helpText'), value: 'helpText' },
  { label: labelHelper('config.labelAfter'), value: 'labelAfter' },
  { label: labelHelper('config.disableHtmlLabel'), value: 'disableHtmlLabel' },
  { label: labelHelper('config.tooltip'), value: 'tooltip' },
]

const defaultConfigValues = {
  label: 'New Field',
  hideLabel: false,
  helpText: '',
  labelAfter: false,
  disableHtmlLabel: false,
  tooltip: '',
}

/**
 * Element/Field class.
 */
export default class EditPanel {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelData existing field ID
   * @param  {String} panelName name of panel
   * @param  {String} component
   * @return {Object} field object
   */
  constructor(panelData, panelName, component) {
    this.type = dom.childType(panelData)
    this.name = panelName
    this.component = component

    this.panelConfig = this.getPanelConfig(this.data)
  }

  get data() {
    const data = this.component.get(this.name)
    return this.type === 'object' ? Object.entries(data) : data
  }

  getPanelConfig(data) {
    this.props = this.createProps(data)
    this.editButtons = this.createEditButtons()

    return {
      config: {
        label: i18n.get(`panel.label.${this.name}`),
      },
      attrs: {
        className: `${PANEL_CLASSNAME} ${this.name}-panel`,
      },
      children: [this.props, this.editButtons],
    }
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  createProps(data = this.data) {
    this.editPanelItems = Array.from(data)
      .map((dataVal, index) => {
        const isArray = this.type === 'array'
        const keyBase = dataVal[0]
        const key = isArray ? `[${index}]` : `.${dataVal[0]}`
        const val = isArray ? dataVal : { [dataVal[0]]: dataVal[1] }
        const itemKey = `${this.name}${key}`

        const isDisabledProp = this.component.isDisabledProp(itemKey, this.name)
        const isEditableProp = FILTERED_PANEL_DATA_KEYS.get(this.name)?.has(keyBase) ?? true

        if (isDisabledProp || !isEditableProp) {
          return null
        }

        return new EditPanelItem({
          key: itemKey,
          data: val,
          field: this.component,
          index,
          panel: this,
        })
      })
      .filter(Boolean)

    const editGroupConfig = {
      tag: 'ul',
      attrs: {
        className: ['edit-group', `${this.component.name}-edit-group`, `${this.component.name}-edit-${this.name}`],
      },
      editGroup: this.name,
      isSortable: this.name === 'options',
      content: this.editPanelItems,
    }

    return dom.create(editGroupConfig)
  }

  updateProps() {
    const newProps = this.createProps()
    this.props.replaceWith(newProps)
    this.props = newProps
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @return {Object} panel edit buttons config
   */
  createEditButtons() {
    const type = this.name
    const addActions = {
      attrs: this.addAttribute,
      options: this.addOption,
      conditions: this.addCondition,
      config: this.addConfiguration,
    }
    const editPanelButtons = []

    if (type === 'conditions') {
      // Ensure i18n key exists for clearAll
      if (i18n.current && !i18n.current.clearAll) {
        i18n.put('clearAll', 'Clear All')
      }

      const clearAllBtn = {
        ...dom.btnTemplate({
          content: [dom.icon('bin'), i18n.get('clearAll')],
          title: i18n.get('clearAll'),
        }),
        className: `clear-all-${type}`,
        action: {
          click: () => {
            this.clearAllItems()
          },
        },
      }
      editPanelButtons.push(clearAllBtn)
    }

    const addBtnTitle = i18n.get(`panelEditButtons.${type}`) || `+ Add ${toTitleCase(type)}`
    const addBtn = {
      ...dom.btnTemplate({ content: addBtnTitle, title: addBtnTitle }),
      className: `add-${type}`,
      action: {
        click: evt => {
          const addEvt = {
            btnCoords: dom.coords(evt.target),
            addAction: addActions[type],
          }

          if (type === 'attrs') {
            addEvt.isDisabled = this.component.isDisabledProp
            addEvt.isLocked = this.component.isLockedProp
            addEvt.message = {
              attr: i18n.get(`action.add.${type}.attr`),
              value: i18n.get(`action.add.${type}.value`),
            }
          }

          const eventType = toTitleCase(type)
          const customEvt = new globalThis.CustomEvent(`onAdd${eventType}`, {
            detail: addEvt,
          })

          // Run Action Hook
          actions.add[type](addEvt)

          // Fire Event
          document.dispatchEvent(customEvt)
        },
      },
    }

    editPanelButtons.push(addBtn)

    const panelEditButtonsWrap = {
      className: 'panel-action-buttons',
      content: editPanelButtons,
    }

    return panelEditButtonsWrap
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute = (attr, valArg) => {
    let val = valArg
    const safeAttr = safeAttrName(attr)
    const itemKey = `attrs.${safeAttr}`

    if (!i18n.current[itemKey]) {
      i18n.put(itemKey, capitalize(attr))
    }

    if (typeof val === 'string' && ['true', 'false'].includes(val)) {
      val = JSON.parse(val)
    }

    this.component.set(`attrs.${attr}`, val)
    addAttributeActions[safeAttr]?.(val, this.component)

    const existingAttr = this.props.querySelector(`.${this.component.name}-attrs-${safeAttr}`)
    const newAttr = new EditPanelItem({
      key: itemKey,
      data: { [safeAttr]: val },
      field: this.component,
      panel: this,
    })

    if (existingAttr) {
      existingAttr.replaceWith(newAttr.dom)
    } else {
      this.props.appendChild(newAttr.dom)
    }

    this.component.resizePanelWrap()
  }

  /**
   * Add option to options panel
   */
  addOption = () => {
    const controlId = this.component.data.config.controlId
    const fieldOptionData = this.component.get('options')
    const type = controlId === 'select' ? 'option' : controlId
    const newOptionLabel = i18n.get('newOptionLabel', { type }) || 'New Option'
    const itemKey = `${this.name}[${this.data.length}]`

    const lastOptionData = fieldOptionData[fieldOptionData.length - 1]
    const optionTemplate = fieldOptionData.length ? lastOptionData : {}
    const itemData = { ...optionTemplate, label: newOptionLabel }
    if (controlId !== 'button') {
      itemData.value = slugify(newOptionLabel)
    }

    const newOption = new EditPanelItem({
      key: itemKey,
      data: itemData,
      field: this.component,
      index: this.props.children.length,
      panel: this,
    })
    this.editPanelItems.push(newOption)
    this.props.appendChild(newOption.dom)
    this.component.debouncedUpdatePreview()
    this.component.resizePanelWrap()
  }

  addCondition = evt => {
    const currentConditions = this.component.get('conditions')
    const itemKey = `conditions[${currentConditions.length}]`
    const newCondition = new EditPanelItem({ key: itemKey, data: evt.template, field: this.component, panel: this })

    this.props.appendChild(newCondition.dom)

    this.component.set(itemKey, evt.template)
    this.component.resizePanelWrap()
  }

  addConfiguration = () => {
    const configData = this.component.get('config')

    const dialog = new Dialog({
      className: 'config-item-dialog',
      content: [
        {
          tag: 'select',
          config: { label: i18n.get('selectConfigKey') || 'Select Configuration Key' },
          attrs: { name: 'selectConfigKey', required: true, className: 'config-key-select' },
          options: defaultConfigOptions.filter(opt => !(opt.value in configData)),
        },
      ],
      onConfirm: formData => {
        const configKey = formData.get('selectConfigKey').trim()
        const itemKey = `config.${configKey}`

        if (configKey) {
          const newConfig = new EditPanelItem({
            key: itemKey,
            data: defaultConfigValues[configKey],
            field: this.component,
            panel: this,
          })
          this.editPanelItems.push(newConfig)
          this.props.appendChild(newConfig.dom)

          this.component.debouncedUpdatePreview()
          this.component.resizePanelWrap()
        }
      },
    })

    dialog.open()
  }

  /**
   * Clears all items from the component property based on its type.
   * Sets the property to an empty array for 'array' type or empty object for other types.
   * Executes removal action hooks and dispatches a custom removal event.
   *
   * @method clearAllItems
   * @fires CustomEvent#onRemove{PropertyName} - Dispatched when items are cleared
   * @returns {void}
   */
  clearAllItems = () => {
    // Use appropriate empty value based on type (array for conditions/options, object for attrs)
    const emptyValue = this.type === 'array' ? [] : {}

    const removeEvt = {
      type: this.name,
      removeAction: () => {
        this.component.set(this.name, emptyValue)
        this.updateProps()
      },
    }

    // Run Action Hook
    actions.remove[this.name](removeEvt)

    // Fire Event
    const eventType = toTitleCase(this.name)
    const customEvt = new globalThis.CustomEvent(`onRemove${eventType}`, {
      detail: removeEvt,
    })
    document.dispatchEvent(customEvt)
  }

  setData(val) {
    this.data = val
    this.component.set(this.name, val)
    this.updateProps()
  }
}
