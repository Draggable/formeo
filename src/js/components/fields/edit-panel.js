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
    const [props, editButtons] = this.content()
    const panelConfig = {
      config: {
        label: i18n.get(`panel.label.${panelName}`),
      },
      attrs: {
        className: `f-panel ${panelName}-panel`,
      },
      children: [props, editButtons],
    }

    this.props = props
    this.editButtons = editButtons

    return panelConfig
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  content = () => {
    const editGroup = {
      tag: 'ul',
      attrs: {
        className: ['field-edit-group', `field-edit-${this.name}`],
      },
      editGroup: this.name,
      isSortable: this.name === 'options',
      content: Array.from(this.data).map((data, index) => {
        const isArray = this.type === 'array'
        const itemKey = [this.name, isArray ? String(index) : data[0]].join('.')
        const itemData = isArray ? data : { [data[0]]: data[1] }
        const editPanelItem = new EditPanelItem(itemKey, itemData, this.field)

        return editPanelItem.dom
      }),
    }
    return [dom.create(editGroup), this.createEditButtons()]
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @return {Object} panel edit buttons config
   */
  createEditButtons() {
    const _this = this
    const type = this.name
    const btnTitle = i18n.get(`panelEditButtons.${type}`)
    const addBtn = {
      ...dom.btnTemplate({ content: btnTitle, title: btnTitle }),
      className: `add-${type}`,
      action: {
        click: evt => {
          const addEvt = {
            btnCoords: dom.coords(evt.target),
          }

          if (type === 'attrs') {
            addEvt.addAction = _this.addAttribute
            addEvt.message = {
              attr: i18n.get('action.add.attrs.attr'),
              value: i18n.get('action.add.attrs.value'),
            }
          } else if (type === 'options') {
            addEvt.addAction = _this.addOption.bind(_this)
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
   * Checks if attribute is allowed to be edited
   * @param  {String}  attr
   * @return {Boolean}      [description]
   */
  isDisabledAttr = attr => {
    // @todo fix meta id
    const disabledAttrs = this.field.get('config.disabledAttrs') || []
    return disabledAttrs.includes(attr)
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute = (attr, val) => {
    if (this.isDisabledAttr(attr)) {
      window.alert(`Attribute "${attr}": not permitted`)
    }

    const safeAttr = helpers.hyphenCase(attr)
    const itemKey = `attrs.${safeAttr}`

    if (!i18n.current[itemKey]) {
      i18n.put(itemKey, helpers.capitalize(attr))
    }

    if (typeof val === 'string' && ['true', 'false'].includes(val)) {
      val = JSON.parse(val)
    }

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
}
