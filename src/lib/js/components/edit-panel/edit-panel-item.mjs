import i18n from '@draggable/i18n'
import animate from '../../common/animation.js'
import dom, { DEFAULT_OTHER_LABEL } from '../../common/dom.js'
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
import { configOptionsOf } from './config-options.mjs'
import { scheduleDuplicateNameHints, watchFieldName } from './duplicate-name-hint.js'
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
  [
    'config-other',
    editPanelItem => ({
      // switching Other on names it in the editor's language, stored so the renderer (no i18n) shows the same
      change: ({ target }) => {
        const { field, panel } = editPanelItem
        if (target.checked && !field.get('config.otherLabel')) {
          field.set('config.otherLabel', i18n.get('other') || DEFAULT_OTHER_LABEL)
          panel.updateProps()
          field.updatePreview?.()
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

    // a new or rebuilt field name row needs its duplicate-name hint (#331)
    if (this.itemKey === 'attrs.name' && field.name === 'field') {
      watchFieldName(this.field)
      scheduleDuplicateNameHints(this.field.components)
    }
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

  /**
   * Remove this item's data from the component, rebuild the panel and refresh the field preview
   */
  removeItem = () => {
    this.field.remove(this.itemKey)
    this.dom.remove()
    this.panel.updateProps()
    this.field.debouncedUpdatePreview?.()
    // removing a path fires no component event, so tell the other fields their name may be unique now
    if (this.itemKey === 'attrs.name' && this.field.name === 'field') {
      scheduleDuplicateNameHints(this.field.components)
    }
  }

  /**
   * The remove button: the panel's actions.remove.attrs|options|conditions decides whether and when (#281).
   * Panels without one (config) remove at once. removeAction works once, and not after the panel was rebuilt,
   * since this item's key may then name another item.
   */
  requestRemove = () => {
    let called = false
    const removeAction = () => {
      if (called || !this.dom.isConnected) {
        return
      }
      called = true
      animate.slideUp(this.dom, ANIMATION_SPEED_BASE, this.removeItem)
    }
    const hook = this.field.components?.actions?.remove[this.panelName]
    if (!hook) {
      return removeAction()
    }
    return hook({ type: this.panelName, itemKey: this.itemKey, component: this.field, isClearAll: false, removeAction })
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
        click: this.requestRemove,
        mouseover: _evt => {
          this.dom.classList.add('to-remove')
        },
        mouseout: _evt => {
          this.dom.classList.remove('to-remove')
        },
      },
      content: dom.icon('remove'),
    }
    const orderHandle = this.panelName === 'options' && {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-order prop-control',
        title: i18n.get('reorderOption') || 'Drag to reorder',
        'aria-label': i18n.get('reorderOption') || 'Drag to reorder',
      },
      content: dom.icon('move-vertical'),
    }
    const controls = {
      className: `${this.panelName}-prop-controls prop-controls`,
      content: [remove, orderHandle].filter(Boolean),
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

  /**
   * A Config panel item uses its declared label (panels.config.options); other items use their translation
   * @param {String} labelKey
   * @return {String}
   */
  itemLabel(labelKey) {
    const declared =
      this.panelName === 'config' && configOptionsOf(this.field.config).get(labelKey.replace(/^config\./, ''))
    return declared?.label || labelHelper(labelKey)
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

    // a Config panel key declared with options is a dropdown (#243)
    if (this.panelName === 'config') {
      const choices = configOptionsOf(this.field.config).get(key.replace(/^config\./, ''))?.options
      if (choices) {
        effectiveValue = choices.map(choice => ({ ...choice, selected: choice.value === value }))
        valType = 'array'
      }
    }

    const dataKey = panelDataKeyMap.get(this.panelName)?.({ itemKey: this.itemKey, key }) || this.itemKey
    const labelKey = dataKey.split('.').filter(Number.isNaN).join('.') || key
    const baseConfig = ITEM_INPUT_TYPE_MAP[valType]({ key, value: effectiveValue })
    const name = `${this.field.shortId}-${slugifyAddress(dataKey).replaceAll(/-\d+-(selected)/g, '-$1')}`
    const config = {
      label: this.panelName !== 'options' && this.itemLabel(labelKey),
      labelAfter: false,
      inputWrap: ['f-input-wrap', this.isLocked && 'locked-prop', this.isDisabled && 'disabled-prop']
        .filter(Boolean)
        .join(' '),
    }

    const attrs = {
      name: baseConfig.attrs.type === 'checkbox' ? `${name}[]` : name,
    }

    // readonly does nothing on checkboxes, radios and selects, so a locked one is disabled instead
    if (this.isLocked) {
      const isTextControl =
        baseConfig.tag === 'textarea' ||
        (baseConfig.tag === 'input' && !['checkbox', 'radio'].includes(baseConfig.attrs?.type))
      attrs[isTextControl ? 'readonly' : 'disabled'] = true
    }

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
