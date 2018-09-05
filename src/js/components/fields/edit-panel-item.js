import i18n from 'mi18n'
import h from '../../common/helpers'
import dom from '../../common/dom'
import animate from '../../common/animation'

const inputConfigBase = ({ key, value, type = 'text' }) => ({
  tag: 'input',
  attrs: {
    type,
    value,
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
  string: (key, val) => inputConfigBase({ key, value: val }),
  boolean: (key, val) => {
    const type = key === 'selected' ? 'radio' : 'checkbox'
    return inputConfigBase({ key, value: val, type })
  },
  number: (key, val) => inputConfigBase({ key, value: val, type: 'number' }),
  array: (key, vals) => ({
    tag: 'select',
    attrs: {
      placeholder: labelHelper(`placeholder.${key}`),
    },
    options: vals.map(({ label, value, selected }) => ({
      label,
      value,
      selected,
    })),
  }),
}

const INPUT_ORDER = ['selected', 'checked']

const INPUT_TYPE_ACTION = {
  boolean: (dataKey, field) => ({
    click: ({ target: { checked } }) => {
      field.set(dataKey, checked)
      field.updatePreview()
    },
  }),
  string: (dataKey, field) => ({
    input: ({ target: { value } }) => {
      field.set(dataKey, value)
      field.updatePreview()
    },
  }),
  number: (dataKey, field) => ({
    input: ({ target: { value } }) => {
      field.set(dataKey, Number(value))
      field.updatePreview()
    },
  }),
  array: (dataKey, field) => ({
    change: ({ target: { value } }) => {
      field.set(dataKey, value)
      field.updatePreview()
    },
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
    this.itemKey = itemKey
    this.panelName = itemKey.substr(0, itemKey.indexOf('.'))
    this.dom = dom.create({
      tag: 'li',
      className: [`field-${itemKey.replace('.', '-')}`, 'prop-wrap'],
      children: { className: 'field-prop', children: [this.itemInputs, this.itemControls] },
    })
  }

  get itemInputs() {
    return {
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val], index) => {
        let inputConfig = this.itemInput(key, val)
        if (['selected', 'checked'].includes(key)) {
          inputConfig = {
            className: 'f-addon',
            children: inputConfig,
          }
        }
        return inputConfig
      }),
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
            this.field.remove(this.itemKey)
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
    const valType = dom.childType(val) || 'string'

    const inputTypeConfig = ITEM_INPUT_TYPE_MAP[valType](key, val)
    const { attrs: fieldAttrs = {} } = this.field.data
    const { multiple } = fieldAttrs
    if (multiple) {
      inputConfigBase.attrs.type = 'checkbox'
    }
    const dataKey = this.itemKey.replace(/.\d+$/, index => `${index}.${key}`)
    const labelKey = dataKey
      .split('.')
      .filter(isNaN)
      .join('.')

    const id = [this.field.id, !['selected', 'checked'].includes(key) && this.itemKey.replace('.', '-')]
      .filter(Boolean)
      .join('-')

    inputTypeConfig.config = Object.assign({}, inputTypeConfig.config, {
      label: this.panelName !== 'options' && labelHelper(labelKey),
      labelAfter: false,
    })

    inputTypeConfig.attrs = Object.assign({}, inputTypeConfig.attrs, {
      name: inputTypeConfig.attrs.type === 'checkbox' ? `${id}[]` : id,
      id,
    })

    inputTypeConfig.action = {
      ...INPUT_TYPE_ACTION[valType](dataKey, this.field),
    }

    return inputTypeConfig
  }
}
