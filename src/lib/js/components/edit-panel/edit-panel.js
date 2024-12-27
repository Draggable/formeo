import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import actions from '../../common/actions.js'
import EditPanelItem, { toggleOptionMultiSelect } from './edit-panel-item.mjs'
import { capitalize, safeAttrName } from '../../common/helpers.mjs'
import { slugify, toTitleCase } from '../../common/utils/string.mjs'
import { PANEL_CLASSNAME } from '../../constants.js'

// @todo convert these hardcoded lists to use
// the updated event system from #381
const addAttributeActions = {
  multiple: (val, field) => {
    toggleOptionMultiSelect(!!val, field)
  },
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
    this.data = this.type === 'object' ? Object.entries(panelData) : panelData
    this.name = panelName
    this.component = component

    this.panelConfig = this.getPanelConfig(this.data)
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
    this.editPanelItems = Array.from(data).map((dataVal, index) => {
      const isArray = this.type === 'array'
      const key = isArray ? `[${index}]` : `.${dataVal[0]}`
      const val = isArray ? dataVal : { [dataVal[0]]: dataVal[1] }

      return new EditPanelItem({
        key: `${this.name}${key}`,
        data: val,
        field: this.component,
        index,
        panel: this,
      })
    })

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
    const btnTitle = i18n.get(`panelEditButtons.${type}`)
    const addActions = {
      attrs: this.addAttribute,
      options: this.addOption,
      conditions: this.addCondition,
    }
    const addBtn = {
      ...dom.btnTemplate({ content: btnTitle, title: btnTitle }),
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
          const customEvt = new window.CustomEvent(`onAdd${eventType}`, {
            detail: addEvt,
          })

          // Run Action Hook
          actions.add[type](addEvt)

          // Fire Event
          document.dispatchEvent(customEvt)
        },
      },
    }

    const panelEditButtons = {
      className: 'panel-action-buttons',
      content: [addBtn],
    }

    return panelEditButtons
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
    const itemKey = `options[${this.data.length}]`

    const lastOptionData = fieldOptionData[fieldOptionData.length - 1]
    const optionTemplate = fieldOptionData.length ? lastOptionData : {}
    const itemData = { ...optionTemplate, label: newOptionLabel }
    if (controlId !== 'button') {
      itemData.value = slugify(newOptionLabel)
    }
    const newOption = new EditPanelItem({
      key: String(this.data.length),
      data: itemData,
      field: this.component,
      index: this.props.children.length,
      panel: this,
    })

    this.editPanelItems.push(newOption)
    this.props.appendChild(newOption.dom)
    this.component.set(itemKey, itemData)
    this.component.debouncedUpdatePreview()
    this.component.resizePanelWrap()
  }

  addCondition = evt => {
    const currentConditions = this.component.get('conditions')
    const itemKey = `conditions[${currentConditions.length}]`
    console.log(itemKey, evt.template)
    // const existingCondition = this.props.querySelector(`.${this.component.name}-${itemKey.replace('.', '-')}`)
    const newCondition = new EditPanelItem({ key: itemKey, data: evt.template, field: this.component, panel: this })

    // if (existingCondition) {
    //   this.props.replaceChild(newCondition.dom, existingCondition)
    // } else {
    this.props.appendChild(newCondition.dom)
    // }

    this.component.set(itemKey, evt.template)
    this.component.resizePanelWrap()
  }

  setData(val) {
    this.data = val
    this.component.set(this.name, val)
    this.updateProps(val)
  }
}
