import dom from './common/dom'
import { uuid, clone } from './common/utils'
import Components from './components'

export class FormeoRender {
  constructor(formData = Components.formData) {
    this.form = formData
  }

  render = (targetElement, formData = Components.formData) => {
    this.form = formData

    const renderCount = document.getElementsByClassName('formeo-render').length
    const config = {
      id: this.form.id,
      className: `formeo-render formeo formeo-rendered-${renderCount}`,
      children: this.processedData,
    }

    targetElement.appendChild(dom.create(config))
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
    if (columnData.className) {
      columnData.className.push('f-render-column')
    }
    const colWidth = columnData.config.width || '100%'
    columnData.style = `width: ${colWidth}`
    columnData.children = this.orderChildren('fields', columnData.children)
    return columnData
  }

  processColumns = rowId => {
    return this.orderChildren('columns', this.form.rows[rowId].children).map(this.processColumnConfig)
  }

  /**
   * Converts a row to an cloneable input group
   * @todo make all columns and fields input groups
   * @param {Object} componentData
   * @return {NodeElement} inputGroup-ified component
   */
  makeInputGroup = componentData => {
    const data = clone(componentData)
    const removeButton = {
      tag: 'button',
      className: 'remove-input-group',
      children: dom.icon('remove'),
      action: {
        mouseover: ({ target }) => target.parentElement.classList.add('will-remove'),
        mouseleave: ({ target }) => target.parentElement.classList.remove('will-remove'),
        click: ({ target }) => {
          const currentInputGroup = target.parentElement
          const iGWrap = currentInputGroup.parentElement
          const iG = iGWrap.getElementsByClassName('f-input-group')
          if (iG.length > 1) {
            dom.remove(currentInputGroup)
          } else {
            console.log('Need at least 1 group')
          }
        },
      },
    }
    data.children.unshift(removeButton)
    const inputGroupWrap = {
      id: uuid(),
      className: 'f-input-group-wrap',
    }
    if (data.attrs.className) {
      if (typeof data.attrs.className === 'string') {
        data.attrs.className += ' f-input-group'
      } else {
        data.attrs.className.push('f-input-group')
      }
    }
    const addButton = {
      tag: 'button',
      attrs: {
        className: 'add-input-group btn pull-right',
        type: 'button',
      },
      children: 'Add +',
      action: {
        click: e => {
          const fInputGroup = e.target.parentElement
          fInputGroup.insertBefore(dom.create(data), fInputGroup.lastChild)
        },
      },
    }

    // row.children.unshift(removeButton)
    inputGroupWrap.children = [data, addButton]
    return inputGroupWrap
  }

  processRows = stageId =>
    this.orderChildren('rows', this.form.stages[stageId].children).map(row => {
      row.children = this.processColumns(row.id)

      if (row.config.inputGroup) {
        return this.makeInputGroup()
      }
      return row
    })

  get processedData() {
    return Object.values(this.form.stages).map(stage => {
      stage.children = this.processRows(stage.id)
      stage.className = 'f-stage'
      return stage
    })
  }
}

export const renderForm = new FormeoRender(Components.formData)

export default renderForm
