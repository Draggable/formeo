import startCase from 'lodash/startCase'
import lowerCase from 'lodash/lowerCase'
import i18n from 'mi18n'
import { orderObjectsBy, indexOfNode } from '../../common/helpers'
import dom from '../../common/dom'
import animate from '../../common/animation'
import { CONDITION_INPUT_ORDER, FIELD_PROPERTY_MAP, OPERATORS, ANIMATION_SPEED_BASE } from '../../constants'
import events from '../../common/events'
import Components from '../index'
import Autocomplete from '../autocomplete'
import { isExternalAddress, isAddress, isBoolKey } from '../../common/utils'

const getOptionData = key => {
  const isExternal = isExternalAddress(key)
  const optionDataMap = {
    'field.property': FIELD_PROPERTY_MAP,
    ...OPERATORS,
  }

  const externalOptionData = address => Components.getAddress(address).getData()

  const data = isExternal ? externalOptionData(key) : optionDataMap[key]
  return Object.keys(data).reduce((acc, cur) => {
    acc[cur] = cur
    return acc
  }, {})
}

const createOptions = (fieldVal, selected) => {
  const data = getOptionData(fieldVal)

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (key !== 'id') {
      const option = {
        tag: 'option',
        content: i18n.get(`${fieldVal}.${key}`) || lowerCase(key),
        attrs: {
          value,
        },
      }

      if (selected === value) {
        option.attrs.selected = true
      }

      acc.push(dom.create(option))
    }
    return acc
  }, [])
}

const addOptions = (select, options) => {
  dom.empty(select)
  options.forEach(option => select.add(option))
}

const inputConfigBase = ({ key, value, type = 'text', checked }) => {
  const config = {
    tag: 'input',
    attrs: {
      type,
      value,
      placeholder: i18n.get(`${key}.placeholder`) || startCase(key),
    },
    className: key.replace(/\./g, '-'),
    config: {},
  }

  if (checked) {
    config.attrs.checked = true
  }

  return config
}

const labelHelper = key => {
  const labelText = i18n.get(key)
  if (labelText) {
    return labelText
  }
  const splitKey = key.split('.')
  return i18n.get(splitKey[splitKey.length - 1])
}

const ITEM_INPUT_TYPE_MAP = {
  autocomplete: (key, val, type) => new Autocomplete(key, val, type),
  string: (key, val) => inputConfigBase({ key, value: val }),
  boolean: (key, val) => {
    const type = key === 'selected' ? 'radio' : 'checkbox'
    return inputConfigBase({ key, value: val, type, checked: val })
  },
  number: (key, val) => inputConfigBase({ key, value: val, type: 'number' }),
  array: (key, vals = []) => {
    return {
      tag: 'select',
      attrs: {
        placeholder: labelHelper(`placeholder.${key}`),
      },
      className: key.replace(/\./g, '-'),
      options: vals,
    }
  },
  object: val => {
    return Object.entries(val).map(([key, val]) => {
      return ITEM_INPUT_TYPE_MAP[dom.childType(val)](key, val)
    })
  },
}

const INPUT_ORDER = ['selected', 'checked']

const INPUT_TYPE_ACTION = {
  boolean: (dataKey, field) => ({
    click: ({ target: { checked } }) => {
      if (field.data?.attrs?.type === 'radio') {
        field.set('options', field.data.options.map(option => ({ ...option, selected: false })))
      }
      field.set(dataKey, checked)
      field.updatePreview()
    },
  }),
  string: (dataKey, field) => ({
    input: ({ target: { value } }) => {
      field.set(dataKey, value)
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
  object: () => ({}),
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
  constructor({ key, data, index, field }) {
    this.itemValues = orderObjectsBy(Object.entries(data), INPUT_ORDER, '0')
    const [panelName, item] = key.split('.')
    this.field = field
    this.itemKey = key
    this.itemIndex = index
    this.panelName = panelName
    this.isDisabled = field.isDisabledProp(item, panelName)
    this.isHidden = this.isDisabled && field.config.panels[panelName].hideDisabled
    this.isLocked = field.isLockedProp(item, panelName)
    this.dom = dom.create({
      tag: 'li',
      className: [`field-${key.replace(/\./g, '-')}`, 'prop-wrap', this.isHidden && 'hidden-property'],
      children: { className: 'field-prop', children: [this.itemInputs, this.itemControls] },
    })
  }

  get itemInputs() {
    this.itemFieldGroups = []

    const inputs = {
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val]) => {
        let inputConfig =
          this.panelName === 'conditions' ? this.generateConditionFields(key, val) : this.itemInput(key, val)
        if (['selected', 'checked'].includes(key)) {
          inputConfig = {
            className: 'f-addon',
            children: inputConfig,
          }
        }
        return inputConfig
      }),
    }

    return inputs
  }

  generateConditionFields = (type, vals) => {
    const label = {
      tag: 'label',
      className: `condition-label ${type}-condition-label`,
      content: i18n.get(type) || type,
    }

    return vals.map((condition, i) => {
      const conditionState = []
      const fields = Object.entries(condition)
        .map(([key, val]) => {
          const field = this.conditionInput(key, val, type, i)
          field && conditionState.push([field.className, val.trim()].filter(Boolean).join('-'))
          return field
        })
        .filter(Boolean)

      const orderedFields = orderObjectsBy(
        fields,
        CONDITION_INPUT_ORDER.map(fieldName => `condition-${fieldName}`),
        'className||dom.className'
      )

      this.processConditionUIState(orderedFields)

      if (!i) {
        orderedFields.unshift(label)
      }

      this.itemFieldGroups.push(orderedFields)

      return {
        children: orderedFields,
        className: `f-condition-row ${type}-condition-row ${conditionState.join(' ')}`,
      }
    })
  }

  processConditionUIState = fields => {
    const findFields = classNames => {
      classNames = classNames.split('|')
      return fields.filter(field => classNames.includes(field.className))
    }
    const hideFields = fields => {
      fields = Array.isArray(fields) ? fields : [fields]
      const hideFieldsTimeout = setTimeout(() => {
        fields.forEach(field => {
          if (field.dom) {
            field = field.dom
          }
          field.style.display = 'none'
        })
        clearTimeout(hideFieldsTimeout)
      }, ANIMATION_SPEED_BASE)
    }
    const showFields = fields => {
      fields = Array.isArray(fields) ? fields : [fields]
      const showFieldsTimeout = setTimeout(() => {
        fields.forEach(field => {
          if (field.dom) {
            field = field.dom
          }
          field.removeAttribute('style')
        })
        clearTimeout(showFieldsTimeout)
      }, ANIMATION_SPEED_BASE)
    }
    const actions = new Map([
      [
        'condition-source',
        field => {
          const foundFields = findFields('condition-sourceProperty')
          const sourceProperty = foundFields[0]
          const key = isExternalAddress(field.value) ? field.value : 'field.property'
          const externalProperties = createOptions(key, sourceProperty.value)
          addOptions(sourceProperty, externalProperties)

          if (field.value) {
            return showFields(foundFields)
          }
          return hideFields(foundFields)
        },
      ],
      [
        'condition-target',
        field => {
          const foundFields = findFields('condition-targetProperty')
          if (isAddress(field.value) && field.value) {
            return showFields(foundFields)
          }
          return hideFields(foundFields)
        },
      ],
      [
        'condition-sourceProperty',
        field => {
          const foundFields = findFields('condition-comparison|condition-targetProperty|condition-target')
          const val = field.value
          const key = val.substring(val.lastIndexOf('.') + 1, val.length)

          if (!isBoolKey(key)) {
            return showFields(foundFields)
          }

          return hideFields(foundFields)
        },
      ],
    ])

    fields.forEach(field => {
      const action = actions.get(field.className)
      if (action) {
        action(field)
      }
    })
  }

  conditionInput = (key, val, conditionType, i) => {
    const field = this.field
    const conditionPath = `${this.itemKey}.${conditionType}.${i}`
    const conditionAddress = `${this.field.id}.${conditionPath}`
    const dataPath = `${field.name}s.${conditionAddress}.${key}`

    const createConditionSelect = (key, propertyValue, i18nKey) => {
      const options = createOptions(i18nKey || key, propertyValue)
      const propertyFieldConfig = ITEM_INPUT_TYPE_MAP['array'](`condition.${key}`)

      propertyFieldConfig.action = {
        change: conditionChangeAction,
        onRender: elem => conditionChangeAction({ target: elem }),
      }

      const field = dom.create(propertyFieldConfig)
      addOptions(field, options)

      return field
    }

    const conditionChangeAction = ({ target }) => {
      const row = target.closest('.f-condition-row')
      const regex = new RegExp(`${target.className}(?:\\S?)+`, 'gm')
      row.className = row.className.replace(regex, '')
      row.classList.add([target.className, target.value].filter(Boolean).join('-'))
      const evtData = {
        dataPath,
        value: target.value,
        src: target,
      }

      events.formeoUpdated(evtData)
      Components.setAddress(dataPath, target.value)

      const conditionRow = target.closest('.f-condition-row')
      const rowIndex = indexOfNode(conditionRow)
      this.processConditionUIState(this.itemFieldGroups[rowIndex])
    }

    const segmentTypes = {
      comparison: value => createConditionSelect('comparison', value),
      logical: value => createConditionSelect('logical', value),
      source: (value, type = 'source') => {
        const componentInput = ITEM_INPUT_TYPE_MAP['autocomplete'](`condition.${type}`, value, conditionType)
        // add to condition map for the type so we can perform reverse lookup when editing a field connected to this condition
        Components.setConditionMap(value, field)

        componentInput.addEvent('onChange', evt => {
          Components.removeConditionMap(Components.getAddress(dataPath))
          conditionChangeAction(evt)
          Components.setConditionMap(evt.target.value, field)
        })

        return componentInput
      },
      sourceProperty: value => createConditionSelect('sourceProperty', value, 'field.property'),
      targetProperty: value => createConditionSelect('targetProperty', value, 'field.property'),
      target: value => segmentTypes.source(value, 'target'),
      value: value => {
        const valueField = ITEM_INPUT_TYPE_MAP['string']('condition.value', value)
        valueField.action = {
          input: conditionChangeAction,
        }
        return dom.create(valueField)
      },
      assignment: value => createConditionSelect('assignment', value),
    }

    const conditionField = segmentTypes[key]
    if (conditionField) {
      return segmentTypes[key](val)
    }

    console.error(`${key}: invalid condition attribute`)
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
          animate.slideUp(this.dom, 250, elem => {
            this.field.remove(this.itemKey)
            dom.remove(elem)
            this.field.resizePanelWrap()
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

    const inputTypeConfig = Object.assign({}, { config: {}, attrs: {} }, ITEM_INPUT_TYPE_MAP[valType](key, val))
    const dataKey = this.itemKey.replace(/.\d+$/, index => `${index}.${key}`)
    const labelKey = dataKey
      .split('.')
      .filter(isNaN)
      .join('.')

    const [id, name] = [[...this.itemKey.split('.'), key], [key]].map(attrVars =>
      [this.field.id, ...attrVars].filter(Boolean).join('-')
    )

    inputTypeConfig.config = Object.assign({}, inputTypeConfig.config, {
      label: this.panelName !== 'options' && labelHelper(labelKey),
      labelAfter: false,
    })

    inputTypeConfig.attrs = Object.assign({}, inputTypeConfig.attrs, {
      name: inputTypeConfig.attrs.type === 'checkbox' ? `${name}[]` : name,
      id,
      disabled: this.isDisabled,
      locked: this.isLocked,
    })

    inputTypeConfig.action = {
      ...INPUT_TYPE_ACTION[valType](dataKey, this.field),
    }

    return inputTypeConfig
  }
}
