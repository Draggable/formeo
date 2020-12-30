import i18n from 'mi18n'
import startCase from 'lodash/startCase'
import dom from '../../common/dom'
import actions from '../../common/actions'
import EditPanelItem from './edit-panel-item'
import { hyphenCase, capitalize } from '../../common/helpers'
import { cleanObj } from '../../common/utils'

/**
 * Element/Field class.
 */
export default class EditPanel {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelData existing field ID
   * @param  {String} panelName name of panel
   * @param  {String} field
   * @return {Object} field object
   */
  constructor(panelData, panelName, field) {
    this.type = dom.childType(panelData)
    this.data = this.type === 'object' ? Object.entries(panelData) : panelData
    this.name = panelName
    this.field = field

    this.panelConfig = this.getPanelConfig(this.data)
  }

  getPanelConfig(data) {
    this.props = this.createProps(data)
    this.editButtons = this.createEditButtons()
    return {
      id: `${this.field.id}-${this.name}-panel`,
      config: {
        label: i18n.get(`panel.label.${this.name}`),
      },
      attrs: {
        className: `f-panel ${this.name}-panel`,
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
  createProps(data) {
    this.editPanelItems = Array.from(data).map((dataVal, index) => {
      const isArray = this.type === 'array'
      const itemKey = [this.name, isArray ? String(index) : dataVal[0]].join('.')
      const itemData = isArray ? dataVal : { [dataVal[0]]: dataVal[1] }

      return new EditPanelItem({ key: itemKey, data: itemData, field: this.field })
    })
    const editGroupConfig = {
      tag: 'ul',
      attrs: {
        className: ['field-edit-group', `field-edit-${this.name}`],
      },
      editGroup: this.name,
      isSortable: this.name === 'options',
      content: this.editPanelItems,
    }

    return dom.create(editGroupConfig)
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @return {Object} panel edit buttons config
   */
  createEditButtons() {
    const _this = this
    const type = this.name
    const btnTitle = i18n.get(`panelEditButtons.${type}`)
    const addActions = {
      attrs: _this.addAttribute,
      options: _this.addOption,
      conditions: _this.addCondition,
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
            addEvt.isDisabled = _this.field.isDisabledProp
            addEvt.isLocked = _this.field.isLockedProp
            addEvt.message = {
              attr: i18n.get(`action.add.${type}.attr`),
              value: i18n.get(`action.add.${type}.value`),
            }
          }

          const eventType = startCase(type)
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
  addAttribute = (attr, val) => {
    const safeAttr = hyphenCase(attr)
    const itemKey = `attrs.${safeAttr}`

    if (!i18n.current[itemKey]) {
      i18n.put(itemKey, capitalize(attr))
    }

    if (typeof val === 'string' && ['true', 'false'].includes(val)) {
      val = JSON.parse(val)
    }

    // @todo may need to camelCase `attr` here
    this.field.set(`attrs.${attr}`, val)

    const existingAttr = this.props.querySelector(`.field-attrs-${safeAttr}`)
    const newAttr = new EditPanelItem({ key: itemKey, data: { [safeAttr]: val }, field: this.field })

    if (existingAttr) {
      this.props.replaceChild(newAttr.dom, existingAttr)
    } else {
      this.props.appendChild(newAttr.dom)
    }

    this.field.resizePanelWrap()
  }

  /**
   * Add option to options panel
   */
  addOption = () => {
    const metaId = this.field.data.meta.id
    const fieldOptionData = this.field.get('options')
    const type = metaId === 'select' ? 'option' : metaId
    const newOptionLabel = i18n.get(`newOptionLabel`, { type }) || 'New Option'
    const itemKey = `options.${this.data.length}`

    const optionTemplate = fieldOptionData.length ? cleanObj(fieldOptionData[fieldOptionData.length - 1]) : {}
    const itemData = Object.assign({}, optionTemplate, { label: newOptionLabel, value: hyphenCase(newOptionLabel) })
    const newOption = new EditPanelItem({
      key: itemKey,
      data: itemData,
      field: this.field,
      index: this.props.children.length,
    })

    this.editPanelItems.push(newOption)
    this.props.appendChild(newOption.dom)
    this.field.set(itemKey, itemData)
    this.field.resizePanelWrap()
  }

  addCondition = evt => {
    const currentConditions = this.field.get('conditions')
    const itemKey = `conditions.${currentConditions.length}`
    const existingCondition = this.props.querySelector(`.field-${itemKey.replace('.', '-')}`)
    const newCondition = new EditPanelItem({ key: itemKey, data: evt.template, field: this.field })

    if (existingCondition) {
      this.props.replaceChild(newCondition.dom, existingCondition)
    } else {
      this.props.appendChild(newCondition.dom)
    }

    this.field.set(itemKey, evt.template)

    this.field.resizePanelWrap()
  }
}
