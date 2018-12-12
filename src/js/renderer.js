import isEqual from 'lodash/isEqual'
import dom from './common/dom'
import { uuid, isAddress, isExternalAddress } from './common/utils'

const processOptions = ({ container, ...opts }) => {
  const processedOptions = {
    container: typeof container === 'string' ? document.querySelector(container) : container,
  }

  return Object.assign({}, opts, processedOptions)
}

const baseId = id => id.replace(/^f-/, '')

const recursiveNewIds = elem => {
  const elems = elem.querySelectorAll('*')
  const elemsLength = elems.length
  for (let i = 0; i < elemsLength; i++) {
    const element = elems[i]
    if (element.id) {
      element.setAttribute('id', uuid())
    }
  }
}

const addButton = () =>
  dom.render({
    tag: 'button',
    attrs: {
      className: 'add-input-group btn pull-right',
      type: 'button',
    },
    children: 'Add +',
    action: {
      click: e => {
        const fInputGroup = e.target.parentElement
        const elem = e.target.previousSibling.cloneNode(true)
        elem.id = uuid()
        dom.remove(elem.querySelector('.remove-input-group'))
        recursiveNewIds(elem)

        fInputGroup.insertBefore(elem, fInputGroup.lastChild)
        elem.appendChild(removeButton())
      },
    },
  })

const removeButton = () =>
  dom.render({
    tag: 'button',
    className: 'remove-input-group',
    children: dom.icon('remove'),
    action: {
      mouseover: ({ target }) => target.parentElement.classList.add('will-remove'),
      mouseleave: ({ target }) => target.parentElement.classList.remove('will-remove'),
      click: ({ target }) => {
        const currentInputGroup = target.parentElement
        dom.remove(currentInputGroup)
      },
    },
  })

export default class FormeoRenderer {
  constructor(opts, formData) {
    const { renderContainer, external } = processOptions(opts)
    this.container = renderContainer
    this.form = formData
    this.external = external
    this.components = Object.create(null)
  }

  /**
   * Renders the formData to a target Element
   * @param {Object} formData
   */
  render = (formData = this.form) => {
    this.form = formData

    const renderCount = document.getElementsByClassName('formeo-render').length
    const config = {
      id: this.form.id,
      className: `formeo-render formeo formeo-rendered-${renderCount}`,
      children: this.processedData,
    }

    this.renderedForm = dom.render(config)
    dom.empty(this.container)

    this.container.appendChild(this.renderedForm)
  }

  orderChildren = (type, order) =>
    order.reduce((acc, cur) => {
      acc.push(this.form[type][cur])
      return acc
    }, [])

  /**
   * Convert sizes, apply styles for render
   * @param  {Object} columnData
   * @return {Object} processed column data
   */
  processColumnConfig = columnData => {
    if (!columnData) {
      return
    }
    const colWidth = columnData.config.width || '100%'
    columnData.style = `width: ${colWidth}`
    columnData.children = this.processFields(columnData.children)
    return dom.render(columnData)
  }

  processRows = stageId =>
    this.orderChildren('rows', this.form.stages[stageId].children).map(row => {
      if (!row) {
        return
      }

      row.children = this.processColumns(row.id)

      if (row.config.inputGroup) {
        return this.makeInputGroup(row)
      }

      return dom.render(row)
    })

  processColumns = rowId => {
    return this.orderChildren('columns', this.form.rows[rowId].children).map(columnConfig => {
      if (columnConfig) {
        const column = this.processColumnConfig(columnConfig)
        this.components[baseId(columnConfig.id)] = column

        return column
      }
    })
  }

  processFields = fieldIds => {
    return this.orderChildren('fields', fieldIds).map(child => {
      if (child) {
        const { conditions } = child
        const field = dom.render(child)
        this.components[baseId(child.id)] = field
        this.processConditions(conditions)
        return field
      }
    })
  }

  /**
   * Converts a row to an cloneable input group
   * @todo make all columns and fields input groups
   * @param {Object} componentData
   * @return {NodeElement} inputGroup-ified component
   */
  makeInputGroup = data => {
    data.children.push(removeButton())
    const inputGroupWrap = {
      id: uuid(),
      className: 'f-input-group-wrap',
      children: [data, addButton()],
    }

    return dom.render(inputGroupWrap)
  }

  get processedData() {
    return Object.values(this.form.stages).map(stage => {
      stage.children = this.processRows(stage.id)
      stage.className = 'f-stage'
      return dom.render(stage)
    })
  }

  /**
   * Evaulate and execute conditions for fields by creating listeners for input and changes
   * @param {Array} conditions array of arrays of condition definitions
   * @return {Array} flattened array of conditions
   */
  processConditions = conditions => {
    if (!conditions) {
      return null
    }

    conditions.forEach((condition, i) => {
      const { if: ifConditions, then: thenConditions } = condition

      ifConditions.forEach(ifCondition => {
        const { source, ...ifRest } = ifCondition
        if (isAddress(source)) {
          const component = this.getComponent(source)
          const listenerEvent = LISTEN_TYPE_MAP(component)
          if (listenerEvent) {
            component.addEventListener(
              listenerEvent,
              evt =>
                this.evaluateCondition(ifRest, evt) &&
                thenConditions.forEach(thenCondition => this.execResult(thenCondition, evt)),
              false
            )
          }
        }
      })
    })
  }

  /**
   * Evaulate conditions
   */
  evaluateCondition = ({ sourceProperty, targetProperty, comparison, target }, evt) => {
    const comparisonMap = {
      equals: isEqual,
      notEquals: (source, target) => !isEqual(source, target),
      contains: (source, target) => source.includes(target),
      notContains: (source, target) => !source.includes(target),
    }

    const sourceValue = evt.target[sourceProperty]
    const targetValue = isAddress(target) ? this.getComponent(target)[targetProperty] : target

    return comparisonMap[comparison] && comparisonMap[comparison](sourceValue, targetValue)
  }

  execResult = ({ assignment, target, targetProperty, value }) => {
    const assignMap = {
      equals: elem => {
        const propMap = {
          value: () => (elem[targetProperty] = value),
          isNotVisible: () => elem.parentElement.setAttribute('hidden', true),
          isVisible: () => elem.parentElement.removeAttribute('hidden'),
        }
        propMap[targetProperty] && propMap[targetProperty]()
      },
    }
    if (isAddress(target)) {
      const elem = this.getComponent(target)
      assignMap[assignment] && assignMap[assignment](elem)
    }
  }

  getComponent = address => {
    const componentId = address.slice(address.indexOf('.') + 1)
    const component = isExternalAddress(address)
      ? this.external[componentId]
      : this.components[componentId].querySelector(`#f-${componentId}`)
    return component
  }
}

const LISTEN_TYPE_MAP = component => {
  const typesMap = [
    ['input', c => ['textarea', 'text'].includes(c.type)],
    ['change', c => ['select'].includes(c.tagName) || ['checkbox', 'radio'].includes(c.type)],
  ]

  const [listenerEvent] = typesMap.find(typeMap => typeMap[1](component)) || [false]

  return listenerEvent
}
