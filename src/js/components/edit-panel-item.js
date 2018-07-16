import i18n from 'mi18n'
import h from '../common/helpers'
import dom from '../common/dom'
import fieldsData from '../data/fields'
import animate from '../common/animation'

const inputConfigBase = (key, type = 'text') => ({
  tag: 'input',
  attrs: {
    type,
    placeholder: labelHelper(`placeholder.${key}`),
  },
  config: {},
})

const labelHelper = key => {
  const labelText = i18n.get(key)
  if (labelText) {
    return labelText
  }
  const splitKey = key.split('.')
  return i18n.get(splitKey[splitKey.length - 1])
}

const ITEM_INPUT_TYPE_MAP = {
  string: key => inputConfigBase(key),
  boolean: key => {
    const type = key === 'checked' ? 'checkbox' : 'radio'
    return inputConfigBase(key, type)
  },
  number: key => inputConfigBase(key, 'number'),
  array: (key, vals) => ({
    tag: 'select',
    attrs: {
      placeholder: labelHelper(`placeholder.${key}`),
    },
    options: vals.map(val => ({
      label: val,
      value: val,
      selected: false,
    })),
  }),
}

const INPUT_ORDER = ['selected', 'checked']

/**
 * Edit Panel Item
 */
export default class EditPanelItem {
  /**
   * Set defaults and load panelData
   * @param  {String} itemKey attribute name or options index
   * @param  {Object} itemData existing field ID
   * @param  {String} fieldId
   * @return {Object} field object
   */
  constructor(itemKey, itemData, fieldId) {
    this.itemValues = h.orderObjectsBy(Object.entries(itemData), INPUT_ORDER, '0')
    this.fieldId = fieldId
    // this.data = fieldsData.get()
    this.itemKey = itemKey
    this.panelName = itemKey.substr(0, itemKey.indexOf('.'))
    this.dom = dom.create({
      tag: 'li',
      className: [`field-${itemKey.replace('.', '-')}`, 'prop-wrap'],
      content: [this.itemInputs, this.itemControls],
    })
    return this.dom
  }

  get itemInputs() {
    const inputs = {
      className: 'prop-inputs f-input-group',
      content: this.itemValues.map(([key, val]) => this.itemInput(key, val)),
    }
    return inputs
  }

  get itemControls() {
    const remove = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-remove prop-control',
      },
      action: {
        click: evt => {
          animate.slideUp(this.dom, 250, elem => {
            fieldsData.remove(`${this.fieldId}.${this.itemKey}`)
            console.log(fieldsData.js)
            dom.remove(elem)
            // console.log(delPath, delItem)
            // const fieldsData.get()
            // console.log(this.itemKey.substr(0, this.itemKey.lastIndexOf('.')))
            // const parent = elem.parentElement
            // const fieldData = formData.fields.get(_this.id)
            // const fieldPanelData = fieldData[panelType]
            // if (Array.isArray(fieldPanelData)) {
            //   fieldPanelData.splice(propKey, 1)
            // } else {
            //   fieldPanelData[propKey] = undefined
            // }
            // data.save(panelType, parent)
            // dom.empty(_this.preview)
            // const newPreview = dom.create(fieldData, true)
            // _this.preview.appendChild(newPreview)
            // _this.resizePanelWrap()
          })
        },
      },
      content: dom.icon('remove'),
    }
    const controls = {
      tag: 'div',
      className: 'prop-controls',
      content: [remove],
    }
    return controls
  }

  itemInput(key, val) {
    const inputTypeConfig = ITEM_INPUT_TYPE_MAP[typeof val](key, val)
    const labelKey = this.itemKey
      .split('.')
      .filter(isNaN)
      .concat([this.panelName === 'options' && key])
      .filter(Boolean)
      .join('.')
    inputTypeConfig.config = Object.assign({}, inputTypeConfig.config, {
      label: this.panelName !== 'options' && labelHelper(labelKey),
    })
    inputTypeConfig.attrs = Object.assign({}, inputTypeConfig.attrs, {
      name: `${this.fieldId}-${this.itemKey}-${key}`,
    })
    return inputTypeConfig
  }
  // get itemControls() {}
}
