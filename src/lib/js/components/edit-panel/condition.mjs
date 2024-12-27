import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { CONDITION_INPUT_ORDER, CONDITION_TEMPLATE } from '../../constants.js'
import events from '../../common/events.js'
import Components from '../index.js'
import { debounce } from '../../common/utils/index.mjs'
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
  constructor({ conditionValues, conditionType, index, conditionCount }, parent) {
    this.values = new Map(orderConditionValues(conditionValues))
    this.conditionType = conditionType
    this.index = index
    this.parent = parent
    this.address = `${parent.address}.${conditionType}[${index}]`
    this.fields = new Map()
    this.conditionCount = conditionCount

    this.conditionLabels = new Map([
      ['condition-if', [i18n.get('condition.type.if'), i18n.get('condition.type.and')]],
      ['condition-then', [i18n.get('condition.type.then'), i18n.get('condition.type.and')]],
    ])

    this.dom = this.generateDom()
  }

  destroy() {
    this.dom.remove()
    // this.fields.forEach(field => {
    //   field?.destroy()
    // })
  }

  label() {
    if (this.index) {
      return null
    }

    return {
      tag: 'label',
      className: `condition-label ${this.conditionType}-condition-label`,
      content: this.conditionLabels.get(`condition-${this.conditionType}`)?.[0],
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
      className: `f-condition-row ${this.conditionType}-condition-row`,
      action: {
        onRender: elem => {
          this.processUiState()
        },
      },
    }

    return dom.create(conditionTypeRow)
  }

  generateConditionTypeActionButtons() {
    const actionButtons = []
    const isLastItem = this.index === this.conditionCount - 1
    const isFirstItem = this.index === 0

    const manageConditionClassname = 'manage-condition-type'
    const manageConditionActionClassname = action => `${action}-condition-type`

    // if (!isFirstItem) {
    const removeConditionType = dom.btnTemplate({
      title: i18n.get(`remove${this.conditionType}Condition`),
      className: [manageConditionClassname, manageConditionActionClassname('remove')],
      content: dom.icon('minus'),
      action: {
        click: () => {
          console.dir(this)
          // this.parent.removeCondition(this.conditionType, this.index)
        },
      },
    })
    actionButtons.push(removeConditionType)
    // }

    // if (isLastItem) {
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
    // }

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
