import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { isInternalAddress } from '../../common/utils/index.mjs'
import { objectFromStringArray } from '../../common/utils/object.mjs'
import { toTitleCase } from '../../common/utils/string.mjs'
import { CHECKABLE_OPTIONS, OPERATORS, PROPERTY_OPTIONS, VISIBLE_OPTIONS } from '../../constants.js'
import { ITEM_INPUT_TYPE_MAP } from './helpers.mjs'

const hiddenPropertyClassname = 'hidden-property'
const hiddenOptionClassname = 'hidden-option'
const optionsAddressRegex = /\.options\[\d+\]$/

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
  source: ({ key: keyArg, value, onChange, conditionType }) => {
    const componentInput = ITEM_INPUT_TYPE_MAP.autocomplete({
      key: `${conditionType}.condition.${keyArg}`,
      value,
      onChange,
      className: `condition-${keyArg}`,
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
  sourceProperty: fields => {
    const source = fields.get('source')
    const sourceProperty = fields.get('sourceProperty')
    const sourceHasValue = !!source.value
    const sourceIsCheckable = !!source.value.match(optionsAddressRegex)

    toggleCheckablePropertyOptions(sourceIsCheckable, sourceProperty)

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
  targetProperty: fields => {
    const target = fields.get('target')
    const targetProperty = fields.get('targetProperty')
    const targetIsCheckable = !!target.value.match(optionsAddressRegex)

    toggleCheckablePropertyOptions(targetIsCheckable, targetProperty)

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

export const toggleFieldVisibility = fields => {
  for (const [fieldName, field] of fields) {
    const shouldHide = !!fieldVisibilityMap[fieldName]?.(fields) || false

    field.classList.toggle(hiddenPropertyClassname, shouldHide)
  }
}

const isCheckedValue = 'isChecked'
const isCheckedOption = option => option.value.endsWith('Checked')
const toggleCheckablePropertyOptions = (isCheckable, propertyField) => {
  // don't change if already a checked option
  if (isCheckable && isCheckedOption(propertyField)) {
    return null
  }

  const options = Array.from(propertyField.querySelectorAll('option'))

  const hiddenOptionValues = []

  for (const option of options) {
    const optionIsChecked = isCheckedOption(option)
    const shouldHide = isCheckable ? !optionIsChecked : optionIsChecked

    if (shouldHide) {
      hiddenOptionValues.push(option.value)
    }

    option.classList.toggle(hiddenOptionClassname, shouldHide)
  }

  if (hiddenOptionValues.includes(propertyField.value)) {
    propertyField.value = isCheckable
      ? isCheckedValue
      : options.find(opt => !isCheckedOption(opt))?.value || propertyField.value
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
