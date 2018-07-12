// import i18n from 'mi18n'
// import h from '../common/helpers'
import dom from '../common/dom'

const ITEM_VALUE_MAP = {
  array: val => val,
  object: ([key, val]) => ({ [key]: val }),
}

const INPUT_CONFIG_BASE = (type = 'text') => ({
  tag: 'input',
  attrs: {
    type,
  },
})

const ITEM_INPUT_TYPE_MAP = {
  string: () => INPUT_CONFIG_BASE(),
  boolean: key => {
    const type = key === 'checked' ? 'checkbox' : 'radio'
    return INPUT_CONFIG_BASE(type)
  },
  number: () => INPUT_CONFIG_BASE('number'),
  array: (key, vals) => ({
    tag: 'select',
    options: vals.map(val => ({
      label: val,
      value: val,
      selected: false,
    })),
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
   * @param  {String} panelType type of data to build inputs for
   * @return {Object} field object
   */
  constructor(itemKey, itemData, panelType) {
    this.itemData = (itemData && ITEM_VALUE_MAP[panelType](itemData)) || itemData
    const itemConfig = {
      tag: 'li',
      className: [`${panelType}-${itemKey}`, 'prop-wrap'],
      // id: id,
      content: [this.itemInputs],
    }
    // console.log(itemData, this.itemInputs, panelType)
    this.dom = dom.create(itemConfig)
    console.log(this.dom)
  }

  get itemInputs() {
    const inputs = Object.entries(this.itemData).map(([key, val]) => {

      return this.itemInput(key, val)
    })
    return inputs
  }

  itemInput(key, val) {
    const inputTypeConfig = ITEM_INPUT_TYPE_MAP[typeof val]
    return inputTypeConfig(key, val)

    // @todo merge with config options for onclick and other events
    // const inputConfig = Object.entries(inputTypeConfig(key)).reduce((acc, [key, val]) => {
    //   console.log(key, val)
    //   val = typeof val === Object ?
    //   acc[key] = val
    //   // acc[key] = Object.assign({})
    //   return acc
    // }, {})
  }
  get itemControls() {}
}
