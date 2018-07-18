import i18n from 'mi18n'
import h from '../../common/helpers'
import dom from '../../common/dom'
// import fieldsData from '../../data/fields'
import animate from '../../common/animation'

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
    const type = key === 'selected' ? 'radio' : 'checkbox'
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

const INPUT_TYPE_ACTION = {
  boolean: (dataKey, field) => ({
    click: ({ target: { checked } }) => field.set(dataKey, checked),
  }),
  string: (dataKey, field) => ({
    input: ({ target: { value } }) => field.set(dataKey, value),
  }),
}

/**
 * Edit Panel Item
 */
export default class EditPanelItem {
  /**
   * Set defaults and load panelData
   * @param  {String} itemKey attribute name or options index
   * @param  {Object} itemData existing field ID
   * @param  {String} field
   * @return {Object} field object
   */
  constructor(itemKey, itemData, field) {
    this.itemValues = h.orderObjectsBy(Object.entries(itemData), INPUT_ORDER, '0')
    this.field = field
    // this.data = fieldsData.get()
    this.itemKey = itemKey
    this.panelName = itemKey.substr(0, itemKey.indexOf('.'))
    this.dom = dom.create({
      tag: 'li',
      className: [`field-${itemKey.replace('.', '-')}`, 'prop-wrap'],
      content: { className: 'field-prop', children: [this.itemInputs, this.itemControls] },
    })
    this.isOptions = this.panelName === 'options'
    return this.dom
  }

  get itemInputs() {
    return {
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val]) => this.itemInput(key, val)),
    }
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
            console.log(this.field.data.options.length)
            console.log(this.field)
            this.field.remove(this.itemKey)
            console.log(this.field.data.options.length)
            // console.log(fieldsData.js)
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
      className: `${this.panelName}-prop-controls prop-controls`,
      content: [remove],
    }
    return controls
  }

  itemInput(key, val) {
    const valType = dom.childType(val)
    const inputTypeConfig = ITEM_INPUT_TYPE_MAP[valType](key, val)
    const { attrs: fieldAttrs = {} } = this.field.data
    const { multiple } = fieldAttrs
    if (multiple) {
      inputConfigBase.attrs.type = 'checkbox'
    }
    const dataKey = this.itemKey.replace(/.\d+$/, index => `${index}.${key}`)
    // const labelKey = this.itemKey
    //   .split('.')
    //   .filter(isNaN)
    //   .concat([key])
    //   .filter(Boolean)
    //   .join('.')

    // inputTypeConfig.config = Object.assign({}, inputTypeConfig.config, {
    //   label: this.panelName !== 'options' && labelHelper(labelKey),
    // })
    // const inputLabel = this.panelName !== 'options' && labelHelper(labelKey)
    const name = [
      this.field.id,
      !['selected', 'checked'].includes(key) && this.itemKey.replace('.', '-'),
      // key,
      inputTypeConfig.attrs.type === 'checkbox' && '[]',
    ]
      .filter(Boolean)
      .join('-')
    console.log(key)
    // console.log(name)
    // console.log(this.field.id + dataKey)

    inputTypeConfig.attrs = Object.assign({}, inputTypeConfig.attrs, {
      name,
    })
    inputTypeConfig.action = {
      ...INPUT_TYPE_ACTION[valType](dataKey, this.field),
    }
    // const inputRow = {
    //   tag: 'td',
    //   content: inputTypeConfig,
    // }
    // console.log(this.itemKey)

    return inputTypeConfig
  }
}
