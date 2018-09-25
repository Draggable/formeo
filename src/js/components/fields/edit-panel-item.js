import i18n from 'mi18n'
import h, { orderObjectsBy } from '../../common/helpers'
import dom from '../../common/dom'
import animate from '../../common/animation'
import { CONDITION_INPUT_ORDER, FIELD_PROPERTY_MAP, OPERATORS, ANIMATION_BASE_SPEED } from '../../constants'
import events from '../../common/events'
import Components from '../index'
import Autocomplete from '../autocomplete'

const inputConfigBase = ({ key, value, type = 'text' }) => ({
  tag: 'input',
  attrs: {
    type,
    value,
    placeholder: labelHelper(`${key}.placeholder`),
  },
  className: key.replace(/\./g, '-'),
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
  autocomplete: (key, vals) => {
    // const baseConfig =
    return new Autocomplete(key)
  },
  string: (key, val) => inputConfigBase({ key, value: val }),
  boolean: (key, val) => {
    const type = key === 'selected' ? 'radio' : 'checkbox'
    return inputConfigBase({ key, value: val, type })
  },
  number: (key, val) => inputConfigBase({ key, value: val, type: 'number' }),
  array: (key, vals) => {
    return {
      tag: 'select',
      attrs: {
        placeholder: labelHelper(`placeholder.${key}`),
      },
      className: key.replace(/\./g, '-'),
      options: vals.map(({ label, value, selected }) => ({
        label,
        value,
        selected,
      })),
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
  constructor(itemKey, itemData, field) {
    this.itemValues = h.orderObjectsBy(Object.entries(itemData), INPUT_ORDER, '0')
    this.field = field
    this.itemKey = itemKey
    const [panelName, item] = itemKey.split('.')
    this.panelName = panelName
    this.isDisabled = field.isDisabledProp(item, panelName)
    this.isHidden = this.isDisabled && field.config.panels[panelName].hideDisabled

    this.dom = dom.create({
      tag: 'li',
      className: [`field-${itemKey.replace(/\./g, '-')}`, 'prop-wrap', this.isHidden && 'hidden-property'],
      children: { className: 'field-prop', children: [this.itemInputs, this.itemControls] },
    })
  }

  get itemInputs() {
    return {
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
  }

  generateConditionFields = (type, vals) => {
    const conditions = []
    const label = {
      tag: 'label',
      className: `condition-label ${type}-condition-label`,
      content: i18n.get(type) || type,
    }
    vals.forEach((condition, i) => {
      const conditionState = []
      const fields = Object.entries(condition).map(([key, val], i) => {
        const fieldConfigs = this.conditionInput(key, val, type, i)
        fieldConfigs.forEach(field => {
          if (field) {
            conditionState.push([field.className, val].join('-'))
          }
        })
        return fieldConfigs.filter(Boolean)
      })
      const orderedFields = orderObjectsBy(
        fields,
        CONDITION_INPUT_ORDER.map(fieldName => `condition-${fieldName}`),
        'className'
      )
      if (!i) {
        orderedFields.unshift(label)
      }

      const row = {
        children: orderedFields,
        className: `condition-row ${type}-condition-row ${conditionState.join(' ')}`,
      }

      conditions.push(row)
    })
    return conditions
  }

  conditionInput = (key, val, type, i) => {
    const field = this.field
    const conditionPath = `${this.itemKey}.${type}.${i}`
    const conditionAddress = `${this.field.id}.${conditionPath}`

    const getPath = path => {
      // const splitPath = path.split('.')
      const component = field.getComponent(path)
      const property = component && path.property
      const label = (component && component.get(FIELD_PROPERTY_MAP['label'])) || ''
      const value = field.value(path)
      return { label, value, property, component }
    }

    const getOperatorField = operator => {
      const operatorOptions = Object.entries(OPERATORS[operator]).map(entry =>
        dom.makeOption(entry, operator, 'operator')
      )
      const operatorField = ITEM_INPUT_TYPE_MAP['array'](`condition.${operator}`, operatorOptions)
      operatorField.action = {
        change: conditionChangeAction,
      }
      return operatorField
    }

    const getPropertyField = property => {
      const options = Object.keys(FIELD_PROPERTY_MAP).map(value => {
        return dom.makeOption([value, value], property, 'field.property')
      })
      const propertyFieldConfig = ITEM_INPUT_TYPE_MAP['array']('condition.property', options)

      propertyFieldConfig.action = {
        change: evt => {
          const { target } = evt
          conditionChangeAction(evt)
          if (target.value === 'isVisible') {
            // this is getting ridiculous, rethink this whole pattern.
            // maybe time for state management
            setTimeout(() => {
              const source = field.get(`${conditionPath}.source`).split('.')
              source.splice(-1, 1, target.value)
              field.set(`${this.itemKey}.${type}.${i}.source`, source.join('.'))
              field.set(`${this.itemKey}.${type}.${i}.target`, true)
              field.updateConditionsPanel()
            }, ANIMATION_BASE_SPEED)
          }
        },
      }

      return propertyFieldConfig
    }

    const conditionChangeAction = ({ target }) => {
      target.parentElement.className = target.parentElement.className.replace(
        new RegExp(`${target.className}-([^\\s]+)`),
        ''
      )
      target.parentElement.classList.add(`${target.className}-${target.value}`)
      const dataPath = `${field.name}s.${conditionAddress}.${key}`
      // console.log(dataPath)
      // const [componentType, componentId, ...path] = dataPath.split('.')
      const evtData = {
        dataPath,
        value: target.value,
        src: target,
      }

      events.formeoUpdated(evtData)

      // console.log(target.value, target.className)
      // @todo implement autocomplete so we can safely set value to source
      // Components[componentType].get(componentId).set(path.join('.'))

      setTimeout(() => {
        const source = field.get(`${conditionPath}.source`).split('.')
        source.splice(-1, 1, target.value)
        // field.set(`${this.itemKey}.${type}.${i}.source`, source.join('.'))
        // field.set(`${this.itemKey}.${type}.${i}.target`, true)
        field.updateConditionsPanel()
      }, ANIMATION_BASE_SPEED)
    }

    const segmentTypes = {
      comparison: () => {
        const comparisonField = getOperatorField('comparison')
        return [comparisonField]
      },
      logical: () => {
        const logicalField = getOperatorField('logical')
        logicalField.action = {
          change: conditionChangeAction,
        }
        return [logicalField]
      },
      source: value => {
        const { property, component } = typeof value === 'string' ? getPath(value) : {}
        // ([value, label], i18nKey, selected) => {
        const somethingInteresting = Components.flatList()

        console.log(somethingInteresting)
        // console.log(value)
        // new Autocomplete(testArr)
        // ([value, label], i18nKey, selected = val) => {
        const componentInput = ITEM_INPUT_TYPE_MAP['autocomplete']('condition.source', component)
        // const componentInput = ITEM_INPUT_TYPE_MAP['string']('condition.source', label)
        const propertyInput = property && getPropertyField(property)
        // componentInput.action = {
        //   input: conditionChangeAction,
        // }

        // @todo move this to an action since it needs to be evaluated when the field changes
        component && Components[`${field.name}s`].conditionMap.set(component.id, field)

        return [componentInput, propertyInput]
      },
      target: path => {
        const { label, value, property } = typeof path === 'string' ? getPath(path) : {}
        const componentInput = ITEM_INPUT_TYPE_MAP['string']('condition.target', label)
        const propertyInput = property && getPropertyField(property)
        componentInput.action = {
          input: conditionChangeAction,
        }
        const valueInput = type !== 'if' && value && segmentTypes.value(value)

        return [componentInput, propertyInput, valueInput]
      },
      value: val => {
        return [val && ITEM_INPUT_TYPE_MAP['string']('condition.value', val)]
      },
      assignment: () => [getOperatorField('assignment')],
    }
    return segmentTypes[key] && segmentTypes[key](val)
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

    const id = [this.field.id, !['selected', 'checked'].includes(key) && this.itemKey.replace(/\./g, '-')]
      .filter(Boolean)
      .join('-')

    inputTypeConfig.config = Object.assign({}, inputTypeConfig.config, {
      label: this.panelName !== 'options' && labelHelper(labelKey),
      labelAfter: false,
    })

    inputTypeConfig.attrs = Object.assign({}, inputTypeConfig.attrs, {
      name: inputTypeConfig.attrs.type === 'checkbox' ? `${id}[]` : id,
      id,
      disabled: this.isDisabled,
    })

    inputTypeConfig.action = {
      ...INPUT_TYPE_ACTION[valType](dataKey, this.field),
    }

    return inputTypeConfig
  }
}
