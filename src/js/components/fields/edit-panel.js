import i18n from 'mi18n'
import startCase from 'lodash/startCase'
import dom from '../../common/dom'
import actions from '../../common/actions'
import EditPanelItem from './edit-panel-item'
import { helpers } from '../../common/helpers'

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
    // const domConfig = {
    // ,
    // content: [this.editPanelContent],
    // action: {
    //   // change: evt => {
    // let fieldData = formData.fields.get(_this.id);
    //   if (evt.target.fMap) {
    //     let value = evt.target.value;
    //     let targetType = evt.target.type;
    //     if (targetType === 'checkbox' || targetType === 'radio') {
    //       let options = fieldData.options;
    //       value = evt.target.checked;
    //       // uncheck options if radio
    //       if (evt.target.type === 'radio') {
    //         options.forEach(option => option.selected = false);
    //       }
    //     }
    //     h.set(fieldData, evt.target.fMap, value);
    //     data.save(panelType, _this.id);
    //     // throttle this for sure
    //     _this.updatePreview();
    //   }
    // }
    //   },
    // }
    // console.log(panelData, panelName, field)

    this.props = this.createProps()
    this.editButtons = this.createEditButtons()
    this.panelConfig = {
      config: {
        label: i18n.get(`panel.label.${panelName}`),
      },
      attrs: {
        className: `f-panel ${panelName}-panel`,
      },
      children: [this.props, this.editButtons],
    }
  }

  // content = () => {
  //   const editGroup = {
  //     tag: 'ul',
  //     attrs: {
  //       className: ['field-edit-group', `field-edit-${this.name}`],
  //     },
  //     editGroup: this.name,
  //     isSortable: this.name === 'options',
  //     content: Array.from(this.data).map((data, index) => {
  //       const isArray = this.type === 'array'
  //       const itemKey = [this.name, isArray ? String(index) : data[0]].join('.')
  //       const itemData = isArray ? data : { [data[0]]: data[1] }
  //       const editPanelItem = new EditPanelItem(itemKey, itemData, this.field)

  //       return editPanelItem.dom
  //     }),
  //   }
  //   console.log(editGroup)
  //   // return [dom.create(editGroup), this.createEditButtons()]
  // }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  createProps() {
    const editPanelItems = Array.from(this.data).map((data, index) => {
      const isArray = this.type === 'array'
      const itemKey = [this.name, isArray ? String(index) : data[0]].join('.')
      const itemData = isArray ? data : { [data[0]]: data[1] }

      return new EditPanelItem(itemKey, itemData, this.field)
    })
    const editGroupConfig = {
      tag: 'ul',
      attrs: {
        className: ['field-edit-group', `field-edit-${this.name}`],
      },
      editGroup: this.name,
      isSortable: this.name === 'options',
      content: editPanelItems,
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
            isDisabled: _this.isDisabledAttr,
            message: {
              attr: i18n.get(`action.add.${type}.attr`),
              value: i18n.get(`action.add.${type}.value`),
            },
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
    const safeAttr = helpers.hyphenCase(attr)
    const itemKey = `attrs.${safeAttr}`

    if (!i18n.current[itemKey]) {
      i18n.put(itemKey, helpers.capitalize(attr))
    }

    if (typeof val === 'string' && ['true', 'false'].includes(val)) {
      val = JSON.parse(val)
    }

    this.field.set(`attrs.${attr}`, val)

    const existingAttr = this.props.querySelector(`.field-attrs-${safeAttr}`)
    const newAttr = new EditPanelItem(itemKey, { [safeAttr]: val }, this.field)

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
    // const _this = this
    // const field = this.dom
    // const fieldData = this.data
    // const optionData = fieldData.options
    // const editGroup = field.querySelector('.field-edit-options')
    // const propData = cleanObj(optionData[optionData.length - 1])
    // fieldData.options.push(propData)
    // const args = {
    //   i: editGroup.childNodes.length,
    //   dataProp: propData,
    //   dataObj: fieldData,
    //   panelType: 'options',
    //   propType: 'array',
    // }
    // editGroup.appendChild(dom.create(_this.panelContent(args)))
    // _this.resizePanelWrap()
    // // Save Fields Attrs
    // // data.save()
    // dom.empty(_this.preview)
    // const newPreview = dom.create(this.data, true)
    // _this.preview.appendChild(newPreview)
  }
  addCondition = evt => {
    const currentConditions = this.field.get('conditions')
    const itemKey = `conditions.${currentConditions.length}`
    const existingCondition = this.props.querySelector(`.field-${itemKey.replace('.', '-')}`)
    const newCondition = new EditPanelItem(itemKey, evt.template, this.field)

    if (existingCondition) {
      this.props.replaceChild(newCondition.dom, existingCondition)
    } else {
      this.props.appendChild(newCondition.dom)
    }

    this.field.set(itemKey, evt.template)

    this.field.resizePanelWrap()
  }
}
