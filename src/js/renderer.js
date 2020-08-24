import isEqual from 'lodash/isEqual'
import dom from './common/dom'
import { uuid, isAddress, isExternalAddress } from './common/utils'
import { STAGE_CLASSNAME, UUID_REGEXP } from './constants'

const RENDER_PREFIX = 'f-'

const processOptions = ({ editorContainer, renderContainer, ...opts }) => {
  const containerLookup = container => (typeof container === 'string' ? document.querySelector(container) : container)
  const processedOptions = {
    renderContainer: containerLookup(renderContainer),
    editorContainer: containerLookup(editorContainer),
  }

  return Object.assign({}, opts, processedOptions)
}

const baseId = id => {
  const match = id.match(UUID_REGEXP)
  return (match && match[0]) || id
}

const newUUID = id => id.replace(UUID_REGEXP, uuid())

const createRemoveButton = () =>
  dom.render(
    dom.btnTemplate({
      className: 'remove-input-group',
      children: dom.icon('remove'),
      action: {
        mouseover: ({ target }) => target.parentElement.classList.add('will-remove'),
        mouseleave: ({ target }) => target.parentElement.classList.remove('will-remove'),
        click: ({ target }) => target.parentElement.remove(),
      },
    })
  )

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
  /* 23-07-2020 code modify start  */
  addEmptyElement = temp2 => {
    document.getElementsByClassName('html.header-control')[0].getAttribute('id')
    for (var k in temp2.rows) {
      if (temp2.rows[k].hasOwnProperty('tblgen')) {
        // console.log(k)
        // console.log(temp2.rows[k].children)
        // for (var c in temp2.rows[k].children) {
        //   console.log(temp2.columns[temp2.rows[k].children[c]].children)
        // }
      }
    }
  }

  render = (formData = this.form) => {
    this.form = formData
    const a = document.getElementsByClassName('formeo-row')
    for (var i = 0; i < a.length; i++) {
      if (a[i].getAttribute('tablegenerated') === 'true') {
        a[i].style = a[i].style + 'min-height:100px'
      }
    }
    const renderCount = document.getElementsByClassName('formeo-render').length
    const config = {
      id: this.form.id,
      className: `formeo-render formeo formeo-rendered-${renderCount}`,
      children: this.processedData,
    }

    this.renderedForm = dom.render(config)
    dom.empty(this.container)

    this.applyConditions()

    this.container.appendChild(this.renderedForm)
  }

  orderChildren = (type, order) => order.reduce((acc, cur) => [...acc, this.form[type][cur]], [])

  prefixId = id => RENDER_PREFIX + id

  /**
   * Convert sizes, apply styles for render
   * @param  {Object} columnData
   * @return {Object} processed column data
   */
  processColumn = ({ id, ...columnData }) => {
    if (columnData.hasOwnProperty('tblgen')) {
      columnData.className = columnData.className + 'tblgen tblgen-col'
    }

    return Object.assign({}, columnData, {
      id: this.prefixId(id),
      children: this.processFields(columnData.children),
      style: `width: ${columnData.config.width || '100%'}`,
    })
  }

  processRows = stageId =>
    this.orderChildren('rows', this.form.stages[stageId].children).reduce(
      (acc, row) => (row ? [...acc, this.processRow(row)] : acc),
      []
    )

  cacheComponent = data => {
    this.components[baseId(data.id)] = data
    return data
  }

  /**
   * Applies a row's config
   * @param {Object} row data
   * @return {Object} row config object
   */
  processRow = (data, type = 'row') => {
    const { config, id } = data
    const className = [`formeo-${type}-wrap`]
    if (data.hasOwnProperty('tblgen')) {
      className.push('tblgen')
      className.push('tblgen-row')
    }
    const rowData = Object.assign({}, data, { children: this.processColumns(data.id), id: this.prefixId(id) })
    this.cacheComponent(rowData)

    const configConditions = [
      { condition: config.legend, result: () => ({ tag: config.fieldset ? 'legend' : 'h3', children: config.legend }) },
      { condition: true, result: () => rowData },
      { condition: config.inputGroup, result: () => this.addButton(id) },
    ]

    const children = configConditions.reduce((acc, { condition, result }) => (condition ? [...acc, result()] : acc), [])

    if (config.inputGroup) {
      className.push(RENDER_PREFIX + 'input-group-wrap')
    }

    return {
      tag: config.fieldset ? 'fieldset' : 'div',
      id: uuid(),
      className,
      children,
    }
  }
  /* 23-07-2020 code modify end  */
  cloneComponentData = componentId => {
    const { children = [], id, ...rest } = this.components[componentId]
    return Object.assign({}, rest, {
      id: newUUID(id),
      children: children.length && children.map(({ id }) => this.cloneComponentData(baseId(id))),
    })
  }

  addButton = id =>
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
          const elem = dom.render(this.cloneComponentData(id))
          fInputGroup.insertBefore(elem, fInputGroup.lastChild)
          elem.appendChild(createRemoveButton())
        },
      },
    })

  processColumns = rowId => {
    return this.orderChildren('columns', this.form.rows[rowId].children).map(column =>
      this.cacheComponent(this.processColumn(column))
    )
  }

  processFields = fieldIds => {
    return this.orderChildren('fields', fieldIds).map(({ id, ...field }) => {
      if (field.config.label === 'Table') {
        field.config.label = ''
      }
      if (field.config.label === '' && field.tag.label === 'input'){
        field.config.label = ' ';
      }
      return this.cacheComponent(Object.assign({}, field, { id: this.prefixId(id) }))
    })
  }

  get processedData() {
    return Object.values(this.form.stages).map(stage => {
      stage.children = this.processRows(stage.id)
      stage.className = STAGE_CLASSNAME
      return dom.render(stage)
    })
  }

  /**
   * Evaulate and execute conditions for fields by creating listeners for input and changes
   * @return {Array} flattened array of conditions
   */
  applyConditions = () => {
    Object.values(this.components).forEach(({ conditions }) => {
      if (conditions) {
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
      : this.renderedForm.querySelector(`#f-${componentId}`)
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
