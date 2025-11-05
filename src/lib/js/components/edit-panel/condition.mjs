import i18n from '@draggable/i18n'
import animate from '../../common/animation.js'
import dom from '../../common/dom.js'
import events from '../../common/events.js'
import { debounce } from '../../common/utils/index.mjs'
import { ANIMATION_SPEED_FAST, CONDITION_INPUT_ORDER } from '../../constants.js'
import Components from '../index.js'
import { segmentTypes, toggleFieldVisibility } from './condition-helpers.mjs'

function orderConditionValues(conditionValues, fieldOrder = CONDITION_INPUT_ORDER) {
  return fieldOrder.reduce((acc, fieldName) => {
    if (conditionValues[fieldName] !== undefined) {
      acc.push([fieldName, conditionValues[fieldName]])
    }
    return acc
  }, [])
}

export class Condition {
  constructor({ conditionValues, conditionType, conditionCount, index }, parent) {
    this.values = new Map(orderConditionValues(conditionValues))
    this.conditionType = conditionType
    this.parent = parent
    this.baseAddress = `${parent.address}.${conditionType}`
    this.fields = new Map()
    this.conditionCount = conditionCount
    this.index = index

    this.dom = this.generateDom()
  }

  setConditionIndex(index) {
    this.index = index
  }

  get address() {
    return `${this.baseAddress}[${this.index}]`
  }

  destroy() {
    const conditions = Components.getAddress(this.baseAddress)
    conditions.splice(this.index, 1)
    Components.setAddress(this.baseAddress, conditions)
    animate.slideUp(this.dom, ANIMATION_SPEED_FAST, () => {
      this.dom.remove()
    })
  }

  label() {
    if (this.index) {
      return null
    }

    return {
      tag: 'label',
      className: `condition-label ${this.conditionType}-condition-label`,
      content: i18n.get(`condition.type.${this.conditionType}`),
    }
  }

  generateDom() {
    const fieldsDom = []
    for (const [key, value] of this.values) {
      const onChange = evt => this.onChangeCondition({ key, target: evt.target })
      const fieldArgs = { key, value, conditionType: this.conditionType, onChange }
      const conditionField = segmentTypes[key](fieldArgs, this.values)
      const conditionFieldDom = conditionField.dom || dom.create(conditionField)
      this.fields.set(key, conditionField.dom ? conditionField : conditionFieldDom)
      fieldsDom.push(conditionFieldDom)
    }

    const conditionRowChildren = [this.label(), ...fieldsDom, ...this.generateConditionTypeActionButtons()]

    const conditionTypeRow = {
      children: conditionRowChildren,
      className: `f-condition-row ${this.conditionType}-condition-row display-none`,
      action: {
        onRender: _elem => {
          this.processUiState()
        },
      },
    }

    return dom.create(conditionTypeRow)
  }

  generateConditionTypeActionButtons() {
    const actionButtons = []

    const manageConditionClassname = 'manage-condition-type'
    const manageConditionActionClassname = action => `${action}-condition-type`

    const removeConditionType = dom.btnTemplate({
      title: i18n.get(`remove${this.conditionType}Condition`),
      className: [manageConditionClassname, manageConditionActionClassname('remove')],
      content: dom.icon('minus'),
      action: {
        click: () => this.destroy(),
        mouseover: _evt => {
          this.dom.classList.add('to-remove')
        },
        mouseout: _evt => {
          this.dom.classList.remove('to-remove')
        },
      },
    })
    actionButtons.push(removeConditionType)

    const addConditionType = dom.btnTemplate({
      title: i18n.get(`add${this.conditionType}Condition`),
      className: [manageConditionClassname, manageConditionActionClassname('add')],
      content: dom.icon('plus'),
      action: {
        click: () => {
          const condition = this.parent.addConditionType(this.conditionType)
          const evtData = {
            changedProperty: null,
            dataPath: condition.address,
            value: condition.value,
            src: condition.dom,
          }
          this.updateDataDebounced(evtData)
        },
      },
    })

    actionButtons.push(addConditionType)

    return actionButtons
  }

  get value() {
    return Array.from(this.fields).reduce((acc, [key, field]) => {
      acc[key] = field.value
      return acc
    }, {})
  }

  processUiState() {
    toggleFieldVisibility(this.fields)
    this.dom.classList.remove('display-none')
  }

  updateDataDebounced = debounce(evtData => {
    events.formeoUpdated(evtData)
    Components.setAddress(evtData.dataPath, evtData.value)
  })

  onChangeCondition = ({ key, target }) => {
    const evtData = {
      changedProperty: key,
      dataPath: this.address,
      value: this.value,
      src: target,
    }

    toggleFieldVisibility(this.fields)
    this.updateDataDebounced(evtData)
  }
}
