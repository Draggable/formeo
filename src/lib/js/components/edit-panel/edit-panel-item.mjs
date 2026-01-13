import animate from '../../common/animation.js'
import dom from '../../common/dom.js'
import { orderObjectsBy } from '../../common/helpers.mjs'
import { merge } from '../../common/utils/index.mjs'
import { mergeActions } from '../../common/utils/object.mjs'
import { slugifyAddress } from '../../common/utils/string.mjs'
import {
  ANIMATION_SPEED_BASE,
  CHECKED_TYPES,
  CONDITION_TEMPLATE,
  conditionTypeIf,
  REVERSED_CHECKED_TYPES,
} from '../../constants.js'
import { Condition } from './condition.mjs'
import { INPUT_TYPE_ACTION, ITEM_INPUT_TYPE_MAP, labelHelper } from './helpers.mjs'

const panelDataKeyMap = new Map([
  ['attrs', ({ itemKey }) => itemKey],
  ['options', ({ itemKey, key }) => `${itemKey}.${key}`],
])

export const toggleOptionMultiSelect = (isMultiple, field) => {
  if (field.controlId === 'select') {
    const optionsPanel = field.editPanels.get('options')
    const [fromCheckedType, toCheckedType] = isMultiple ? CHECKED_TYPES : REVERSED_CHECKED_TYPES
    const updatedOptionsData = optionsPanel.data.map(({ [fromCheckedType]: val, ...option }) => ({
      [toCheckedType]: val,
      ...option,
    }))
    optionsPanel.setData(updatedOptionsData)
  }
}

const itemInputActions = new Map([
  [
    'attrs-multiple',
    editPanelItem => ({
      change: ({ target }) => {
        if (editPanelItem.field.controlId === 'select') {
          toggleOptionMultiSelect(target.checked, editPanelItem.field)
        }
      },
    }),
  ],
])

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
  constructor({ key, index, field, panel, data }) {
    this.field = field
    this.itemKey = key
    this.itemIndex = index
    this.panel = panel
    this.panelName = panel.name
    this.isDisabled = field.isDisabledProp(key, this.panelName)
    this.isHidden = this.isDisabled && field.config.panels[this.panelName].hideDisabled
    this.isLocked = field.isLockedProp(key, this.panelName)
    this.address = `${field.indexName}.${field.id}.${key}`
    this.itemSlug = slugifyAddress(key)
    this.conditionTypeWrap = new Map()

    if (data !== undefined && this.field.get(this.itemKey) === undefined) {
      this.field.set(this.itemKey, data)
    }

    const liClassList = [`field-${this.itemSlug}`, 'prop-wrap']
    if (this.isHidden) {
      liClassList.push('hidden-property')
    }

    this.dom = dom.create({
      tag: 'li',
      className: liClassList,
      children: { className: 'component-prop', children: [this.itemInputs(), this.itemControls] },
    })
  }

  get itemValues() {
    const val = this.field.get(this.itemKey)

    if (val?.constructor === Object) {
      return orderObjectsBy(Object.entries(val), CHECKED_TYPES, '0')
    }

    return [[this.itemKey, val]]
  }

  findOrCreateConditionTypeWrap(conditionType) {
    let conditionTypeWrap = this.conditionTypeWrap.get(conditionType)
    if (conditionTypeWrap) {
      return conditionTypeWrap
    }

    conditionTypeWrap = dom.create({
      className: `type-conditions-wrap ${conditionType}-conditions-wrap`,
    })

    this.conditionTypeWrap.set(conditionType, conditionTypeWrap)

    return conditionTypeWrap
  }

  itemInputs() {
    const inputs = dom.create({
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val]) => {
        if (this.panelName === 'conditions') {
          return this.generateConditionFields(key, val)
        }
        return this.itemInput(key, val)
      }),
    })

    if (this.inputs) {
      this.inputs.replaceWith(inputs)
    }

    this.inputs = inputs

    return inputs
  }

  addConditionType = (conditionType, conditionArg) => {
    const conditionTypeWrap = this.findOrCreateConditionTypeWrap(conditionType)
    let condition = conditionArg
    if (!condition) {
      const [newConditionData] = CONDITION_TEMPLATE()[conditionType]
      const conditionCount = conditionTypeWrap.children.length

      if (conditionType === conditionTypeIf) {
        newConditionData.logical = '||'
      }

      condition = { conditionValues: newConditionData, conditionCount, index: conditionCount }
    }

    const conditionField = new Condition({ conditionType, ...condition }, this)

    conditionTypeWrap.appendChild(conditionField.dom)

    return conditionField
  }

  removeConditionType = (conditionType, index) => {
    const conditionTypeWrap = this.conditionTypeWrap.get(conditionType)
    const conditionField = conditionTypeWrap.children[index]
    conditionField.destroy()
    conditionField.dom.remove()
  }

  generateConditionFields = (conditionType, conditionVals) => {
    this.conditions = new Map()

    conditionVals.forEach((condition, index) => {
      const conditionField = this.addConditionType(conditionType, {
        index,
        conditionCount: conditionVals.length,
        conditionValues: condition,
      })
      this.conditions.set(index, conditionField)
    })

    return this.findOrCreateConditionTypeWrap(conditionType)
  }

  get itemControls() {
    if (this.isLocked) {
      const controls = {
        className: `${this.panelName}-prop-controls prop-controls`,
        content: [],
      }
      return controls
    }

    const remove = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-remove prop-control',
      },
      action: {
        click: () => {
          animate.slideUp(this.dom, ANIMATION_SPEED_BASE, elem => {
            this.field.remove(this.itemKey)
            elem.remove()
            this.panel.updateProps()
          })
        },
        mouseover: _evt => {
          this.dom.classList.add('to-remove')
        },
        mouseout: _evt => {
          this.dom.classList.remove('to-remove')
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

  /**
   * Get config-provided options for an attribute
   * @param {String} attrKey - The attribute key (e.g., 'attrs.type')
   * @returns {Array|null} Array of options if config provides them, null otherwise
   */
  getConfigAttrOptions(attrKey) {
    // Extract the attribute name from the key (e.g., 'attrs.type' -> 'type')
    const attrName = attrKey.split('.').pop()
    // Config is already merged by Component.config setter, so type-specific
    // config (e.g., config.fields['text-input'].attrs) is merged into this.field.config.attrs
    const configValue = this.field.config?.attrs?.[attrName]

    // Only return if it's an array of options
    if (Array.isArray(configValue)) {
      return configValue
    }

    return null
  }

  itemInput(key, value) {
    if (this.isDisabled) {
      return null
    }
    let valType = dom.childType(value) || 'string'
    let effectiveValue = value

    // Check if config provides options for this attr (for attrs panel only)
    if (this.panelName === 'attrs') {
      const configAttrOptions = this.getConfigAttrOptions(key)
      if (configAttrOptions) {
        // Config provides dropdown options - mark current value as selected
        effectiveValue = configAttrOptions.map(opt => ({
          ...opt,
          selected: opt.value === value,
        }))
        valType = 'array'
      }
    }

    const dataKey = panelDataKeyMap.get(this.panelName)?.({ itemKey: this.itemKey, key }) || this.itemKey
    const labelKey = dataKey.split('.').filter(Number.isNaN).join('.') || key
    const baseConfig = ITEM_INPUT_TYPE_MAP[valType]({ key, value: effectiveValue })
    const name = `${this.field.shortId}-${slugifyAddress(dataKey).replaceAll(/-\d+-(selected)/g, '-$1')}`
    const config = {
      label: this.panelName !== 'options' && labelHelper(labelKey),
      labelAfter: false,
      inputWrap: ['f-input-wrap', this.isLocked && 'locked-prop', this.isDisabled && 'disabled-prop']
        .filter(Boolean)
        .join(' '),
    }

    const attrs = {
      name: baseConfig.attrs.type === 'checkbox' ? `${name}[]` : name,
    }

    attrs.disabled = this.isDisabled
    attrs.readonly = this.isLocked

    const itemInputAction = itemInputActions.get(this.itemSlug)?.(this)

    const action = mergeActions(INPUT_TYPE_ACTION[valType](dataKey, this.field), itemInputAction || {})

    const inputConfig = merge(ITEM_INPUT_TYPE_MAP[valType]({ key, value: effectiveValue }), { action, attrs, config })
    if (CHECKED_TYPES.includes(key)) {
      return {
        className: 'f-addon',
        children: inputConfig,
      }
    }

    return inputConfig
  }
}

// Exporting EditPanelItem for unit tests
export { EditPanelItem }
