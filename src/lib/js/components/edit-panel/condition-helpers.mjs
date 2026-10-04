import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { cellInput, hasInputs, normalizeTable, parseTableAddress } from '../../common/table.mjs'
import { isInternalAddress } from '../../common/utils/index.mjs'
import { objectFromStringArray } from '../../common/utils/object.mjs'
import { toTitleCase } from '../../common/utils/string.mjs'
import { CHECKABLE_OPTIONS, OPERATORS, PROPERTY_OPTIONS, VISIBLE_OPTIONS } from '../../constants.js'
import { ITEM_INPUT_TYPE_MAP } from './helpers.mjs'

const hiddenPropertyClassname = 'hidden-property'
const hiddenOptionClassname = 'hidden-option'
const optionsAddressRegex = /\.options\[\d+\]$/
const stageAddressRegex = /^stages\./
const VISIBILITY_VALUES = new Set(VISIBLE_OPTIONS)

/**
 * A page (stage) target can only be shown or skipped (#122), so every other property is hidden. The selected
 * value is left alone: loading a condition never rewrites it.
 * @param {HTMLSelectElement} propertyField
 */
const toggleStagePropertyOptions = propertyField => {
  for (const option of propertyField.querySelectorAll('option')) {
    option.classList.toggle(hiddenOptionClassname, !VISIBILITY_VALUES.has(option.value))
  }
}

/**
 * When the author picks a page as a then-target, a property a page can't take (e.g. the default "value") becomes
 * "isNotVisible", so the new condition skips that page (#122)
 * @param {Map<String, HTMLElement>} fields a condition row's inputs
 */
export const adoptStageTargetProperty = fields => {
  const target = fields.get('target')
  const targetProperty = fields.get('targetProperty')
  if (targetProperty && stageAddressRegex.test(target?.value ?? '') && !VISIBILITY_VALUES.has(targetProperty.value)) {
    targetProperty.value = 'isNotVisible'
  }
}

/**
 * The properties a matrix row or cell offers in a condition (#349 phase 2), first choice first
 * @param {String} address
 * @param {String} side 'source' (an if-clause) or 'target' (a then-action)
 * @param {Components} [components] to look up a cell's input type
 * @return {String[]|null} null for any other address
 */
export const tablePropertyOptions = (address, side, components) => {
  const parsed = parseTableAddress(address)
  if (!parsed) {
    return null
  }
  if (parsed.cell === null) {
    return side === 'source' ? ['value', 'isChecked', 'isNotChecked'] : ['isNotVisible', 'isVisible']
  }
  const table = normalizeTable(components?.getAddress?.(`fields.${parsed.fieldId}`)?.get?.('table'))
  const own = cellInput(table.columns[parsed.cell]) === 'text' ? ['value'] : ['isChecked', 'isNotChecked']
  return side === 'source' ? own : [...own, 'isNotVisible', 'isVisible']
}

/**
 * A whole matrix as a condition source supports visibility only (#349 phase 2)
 * @param {String} address
 * @param {Components} [components]
 * @return {Boolean}
 */
const isMatrixAddress = (address, components) => {
  if (!/^fields\.[^.]+$/.test(address)) {
    return false
  }
  const field = components?.getAddress?.(address)
  return !!field?.isTable && hasInputs(field.get('table'))
}

/**
 * Hides every property not in `allowed`. The selected value is left alone, as for a page target: loading a
 * condition never rewrites it; picking a new source or target adopts an allowed one (adoptPickedProperty).
 * @param {HTMLSelectElement} propertyField
 * @param {String[]} allowed
 */
const toggleAllowedPropertyOptions = (propertyField, allowed) => {
  for (const option of propertyField.querySelectorAll('option')) {
    option.classList.toggle(hiddenOptionClassname, !allowed.includes(option.value))
  }
}

/**
 * The properties a picked source or then-target offers, first choice first
 * @param {String} address the picked source or target
 * @param {String} side 'source' or 'target'
 * @param {HTMLSelectElement} propertyField its property select
 * @param {Components} [components]
 * @return {String[]}
 */
const offeredProperties = (address, side, propertyField, components) => {
  const tableOptions =
    side === 'source' && isMatrixAddress(address, components)
      ? [...VISIBLE_OPTIONS]
      : tablePropertyOptions(address, side, components)
  if (tableOptions) {
    return tableOptions
  }
  const isCheckable = optionsAddressRegex.test(address)
  return [...propertyField.options]
    .map(({ value }) => value)
    .filter(value => isCheckedOption({ value }) === isCheckable)
}

/**
 * When the author picks a new source or then-target, a property it can't take becomes the first one it offers
 * (e.g. a radio cell or option source reads isChecked, a matrix row target isNotVisible), so the saved condition
 * matches what the row shows. Other parts of the row are kept as they are, as for a page target.
 * @param {Map<String, HTMLElement>} fields a condition row's inputs
 * @param {String} key the changed input, 'source' or 'target'
 * @param {Components} [components]
 */
export const adoptPickedProperty = (fields, key, components) => {
  const side = key === 'source' ? 'source' : 'target'
  const address = fields.get(key)?.value ?? ''
  const propertyField = fields.get(`${side}Property`)
  if (!propertyField || !address) {
    return
  }
  if (side === 'target' && stageAddressRegex.test(address)) {
    adoptStageTargetProperty(fields)
    return
  }
  const offered = offeredProperties(address, side, propertyField, components)
  if (offered.length && !offered.includes(propertyField.value)) {
    propertyField.value = offered[0]
  }
}

const optionDataMap = {
  'if-sourceProperty': objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
  'if-targetProperty': objectFromStringArray(PROPERTY_OPTIONS),
  'then-targetProperty': objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
  ...Object.entries(OPERATORS).reduce((acc, [key, value]) => {
    acc[`if-${key}`] = value
    acc[`then-${key}`] = value
    return acc
  }, {}),
}

export const segmentTypes = {
  assignment: createConditionSelect,
  comparison: createConditionSelect,
  logical: createConditionSelect,
  source: ({ key: keyArg, value, onChange, conditionType, components }) => {
    const componentInput = ITEM_INPUT_TYPE_MAP.autocomplete({
      key: `${conditionType}.condition.${keyArg}`,
      value,
      onChange,
      className: `condition-${keyArg}`,
      components,
    })

    return componentInput
  },
  sourceProperty: createConditionSelect,
  targetProperty: createConditionSelect,
  target: args => segmentTypes.source(args),
  value: ({ key, value, onChange }, _conditionValues) => {
    const valueField = ITEM_INPUT_TYPE_MAP.string({ key: `condition.${key}`, value })

    valueField.action = {
      input: onChange,
    }

    return valueField
  },
}

export function addOptions(select, options) {
  dom.empty(select)
  for (const option of options) {
    select.add(option)
  }
}

export function getOptionConfigs({ key: fieldName, value: fieldValue, conditionType }) {
  const optionDataKey = `${conditionType}-${fieldName}`

  const data = optionDataMap[optionDataKey]
  return Object.entries(data || {}).map(([key, optionValue]) =>
    makeOptionDomConfig({ fieldName, fieldValue, key, optionValue })
  )
}

function makeOptionDomConfig({ fieldName, fieldValue, key, optionValue }) {
  return {
    label: i18n.get(`${fieldName}.${key}`) || toTitleCase(key).toLowerCase(),
    value: optionValue,
    selected: optionValue === fieldValue,
  }
}

function createConditionSelect({ key, value, onChange, conditionType }) {
  const optionConfigs = getOptionConfigs({ key, value, conditionType })
  const propertyFieldConfig = ITEM_INPUT_TYPE_MAP.array({ key: `condition.${key}`, value: optionConfigs })

  propertyFieldConfig.action = {
    change: onChange,
    // onRender: elem => onChangeCondition({ target: elem }),
  }

  return propertyFieldConfig
}

const isVisible = elem => {
  return !elem?.classList.contains(hiddenPropertyClassname)
}

const fieldVisibilityMap = {
  sourceProperty: (fields, components) => {
    const source = fields.get('source')
    const sourceProperty = fields.get('sourceProperty')
    const sourceHasValue = !!source.value
    const tableOptions = isMatrixAddress(source.value, components)
      ? ['isVisible', 'isNotVisible']
      : tablePropertyOptions(source.value, 'source', components)

    if (tableOptions) {
      toggleAllowedPropertyOptions(sourceProperty, tableOptions)
    } else {
      toggleCheckablePropertyOptions(!!source.value.match(optionsAddressRegex), sourceProperty)
    }

    return !sourceHasValue
  },
  comparison: fields => {
    const source = fields.get('source')
    const sourceProperty = fields.get('sourceProperty')
    const sourceHasValue = !!source.value
    const sourceValueIsCheckable = !!source.value.match(optionsAddressRegex)

    return !sourceHasValue || sourceValueIsCheckable || sourceProperty.value !== 'value'
  },
  assignment: fields => {
    const target = fields.get('target')
    const targetProperty = fields.get('targetProperty')
    const targetHasValue = !!target.value

    return !targetHasValue || targetProperty.value.startsWith('is')
  },
  targetProperty: (fields, components) => {
    const target = fields.get('target')
    const targetProperty = fields.get('targetProperty')
    // an if-clause's target is what the source is compared with; only a then-action acts on a row or cell
    const tableOptions = fields.has('source') ? null : tablePropertyOptions(target.value, 'target', components)

    if (stageAddressRegex.test(target.value)) {
      toggleStagePropertyOptions(targetProperty)
    } else if (tableOptions) {
      toggleAllowedPropertyOptions(targetProperty, tableOptions)
    } else {
      toggleCheckablePropertyOptions(!!target.value.match(optionsAddressRegex), targetProperty)
    }

    return !isInternalAddress(target.value)
  },
  target: fields => {
    const source = fields.get('source')
    const sourceProperty = fields.get('sourceProperty')
    const sourceHasValue = !!source?.value

    if (sourceProperty && !sourceHasValue) {
      return true
    }

    return sourceProperty && sourceProperty?.value !== 'value'
  },
  value: fields => {
    const target = fields.get('target')
    const targetProperty = fields.get('targetProperty')

    if (targetProperty === undefined) {
      return false
    }

    if (target && !target.value) {
      return true
    }

    if (!isVisible(fields.get('comparison'))) {
      return true
    }

    if (targetProperty.value === isCheckedValue) {
      return true
    }

    return targetProperty.value.startsWith('is')
  },
}

export const toggleFieldVisibility = (fields, components) => {
  for (const [fieldName, field] of fields) {
    const shouldHide = !!fieldVisibilityMap[fieldName]?.(fields, components) || false

    field.classList.toggle(hiddenPropertyClassname, shouldHide)
  }
}

const isCheckedValue = 'isChecked'
const isCheckedOption = option => option.value.endsWith('Checked')
/**
 * Offers only isChecked/isNotChecked for an option (`options[n]`), and every other property otherwise. The selected
 * value is left alone: loading never rewrites it, and picking adopts one (adoptPickedProperty).
 * @param {Boolean} isCheckable
 * @param {HTMLSelectElement} propertyField
 */
const toggleCheckablePropertyOptions = (isCheckable, propertyField) => {
  for (const option of propertyField.querySelectorAll('option')) {
    option.classList.toggle(hiddenOptionClassname, isCheckedOption(option) !== isCheckable)
  }
}

export const conditionFieldHandlers = {
  source: (field, fields) => {
    const isCheckable = !!field.value.match(optionsAddressRegex)

    toggleCheckablePropertyOptions(isCheckable, fields.get('sourceProperty'))
  },
  target: (field, fields) => {
    const targetProperty = fields.get('targetProperty')
    const isCheckable = !!field.value.match(optionsAddressRegex)

    toggleCheckablePropertyOptions(isCheckable, targetProperty)
  },
  targetProperty: field => {
    const isCheckable = !!field.value.match(optionsAddressRegex)

    toggleCheckablePropertyOptions(isCheckable, field)
  },
}
