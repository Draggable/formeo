import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component'
import h from '../../common/helpers'
import events from '../../common/events'
import dom from '../../common/dom'
import { numToPercent } from '../../common/utils'
import { Fields } from '..'
import { COLUMN_CLASSNAME } from '../../constants'
import Controls from '../controls'

// @todo remove formData
const formData = {}

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {},
    children: [],
  })

/**
 * Setup Column elements
 */
export default class Column extends Component {
  /**
   * Set defaults and/or load existing columns
   * @param  {String} dataID columnId
   * @return {Object} Column config object
   */
  constructor(columnData) {
    super('column', Object.assign({}, DEFAULT_DATA(), columnData))

    const _this = this

    const resizeHandle = {
      tag: 'li',
      className: 'resize-x-handle',
      action: {
        mousedown: _this.resize,
        touchstart: _this.resize,
      },
      content: [dom.icon('triangle-down'), dom.icon('triangle-up')],
    }
    const editWindow = {
      tag: 'li',
      className: `${this.name}-edit group-config`,
    }

    const columnConfig = {
      tag: 'ul',
      className: [COLUMN_CLASSNAME, 'empty'],
      dataset: {
        hoverTag: i18n.get('column'),
      },
      action: {
        mouseup: evt => {
          const column = evt.target.parentElement
          if (column.resizing) {
            column.resizing = false
            column.parentElement.classList.remove('resizing-columns')
          }
        },
      },
      id: this.id,
      content: [this.actionButtons(), editWindow, resizeHandle],
      fType: 'columns',
    }

    const column = dom.create(columnConfig)
    this.processConfig(column)

    events.columnResized = new window.CustomEvent('columnResized', {
      detail: {
        column,
        instance: _this,
      },
    })

    this.sortable = Sortable.create(column, {
      animation: 150,
      fallbackClass: 'field-moving',
      forceFallback: true,
      // group: 'column',
      group: {
        name: 'column',
        pull: true,
        put: ['column', 'controls'],
      },
      sort: true,
      disabled: false,
      // onEnd: this.onEnd,
      // onAdd: this.onAdd,
      // onSort: this.onSort,
      // onRemove: this.onRemove,
      // Attempt to drag a filtered element
      // onMove: evt => {
      //   if (evt.from !== evt.to) {
      //     evt.from.classList.remove('hovering-column')
      //   }
      //   if (evt.related.parentElement.fType === 'columns') {
      //     evt.related.parentElement.classList.add('hovering-column')
      //   }
      // },
      draggable: '.stage-fields',
      handle: '.item-handle',
    })

    this.dom = column
  }

  /**
   * Column sorted event
   * @param  {Object} evt sort event data
   * @return {Object} Column order, array of column ids
   */
  onSort = evt => {
    console.log(evt)
    // return this.saveFieldOrder(id)
    // data.save('column', evt.target.id);
    // document.dispatchEvent(events.formeoUpdated);
  }

  /**
   * Process column configuration data
   * @param  {Object} column
   */
  processConfig(column) {
    const columnWidth = h.get(this.data, 'config.width')
    if (columnWidth) {
      column.dataset.colWidth = columnWidth
      column.style.width = columnWidth
      column.style.float = 'left'
    }
  }

  /**
   * Event when column is added
   * @param  {Object} evt
   */
  onAdd = evt => {
    const { from, to, item, newIndex } = evt
    const fromType = dom.componentType(from)

    const typeActions = {
      // from Controls
      controls: () => {
        const { meta } = Controls.get(item.id).controlData
        if (meta.group !== 'layout') {
          this.addField(item.id, newIndex)
        }
        dom.remove(item)
      },
      // from Column
      column: () => this.addField(item.id, newIndex),
    }

    typeActions[fromType] && typeActions[fromType]()
    to.classList.remove('hovering-column')
  }

  /**
   * Sets classes for legacy browsers to identify first and last fields in a block
   * consider removing
   * @param  {DOM} column
   */
  fieldOrderClasses = () => {
    const fields = this.children.map(({ dom }) => dom)

    if (fields.length) {
      this.removeClasses(['first-field', 'last-field'])
      fields[0].classList.add('first-field')
      fields[fields.length - 1].classList.add('last-field')
    }
  }

  /**
   * Updates the field order data for the column
   */
  saveFieldOrder = () => {
    const newFieldOrder = this.children.map(({ id }) => id)
    this.set('children', newFieldOrder)
    this.fieldOrderClasses()
    return newFieldOrder
  }

  /**
   * Event when field is removed from column
   * @param  {Object} evt
   */
  onRemove = ({ from, item }) => {
    this.remove(`children.${item.id}`)

    if (!this.children.length) {
      this.remove()
    }
  }

  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd = ({ to, from }) => {
    to && to.classList.remove('hovering-column')
    from && from.classList.remove('hovering-column')
  }

  /**
   * Handle column resizing
   * @param  {Object} evt resize event
   */
  resize = evt => {
    const resize = {}
    const column = evt.target.parentElement
    const sibling = column.nextSibling || column.previousSibling
    const row = column.parentElement
    const rowStyle = dom.getStyle(row)
    const rowPadding = parseFloat(rowStyle.paddingLeft) + parseFloat(rowStyle.paddingRight)
    let colWidthPercent
    let sibWidthPercent

    /**
     * Set the width before resizing so the column
     * does not resize near window edges
     * @param  {Object} evt
     */
    function setWidths(evt) {
      let clientX
      if (evt.type === 'touchmove') {
        clientX = evt.touches[0].clientX
      } else {
        clientX = evt.clientX
      }
      const newColWidth = resize.colStartWidth + clientX - resize.startX
      const newSibWidth = resize.sibStartWidth - clientX + resize.startX

      const percent = width => (width / resize.rowWidth) * 100
      colWidthPercent = parseFloat(percent(newColWidth))
      sibWidthPercent = parseFloat(percent(newSibWidth))

      column.dataset.colWidth = numToPercent(colWidthPercent.toFixed(1))
      sibling.dataset.colWidth = numToPercent(sibWidthPercent.toFixed(1))

      column.style.width = numToPercent(colWidthPercent)
      sibling.style.width = numToPercent(sibWidthPercent)
    }

    resize.move = evt => {
      setWidths(evt)
      resize.resized = true
    }

    resize.stop = function() {
      window.removeEventListener('mousemove', resize.move)
      window.removeEventListener('mouseup', resize.stop)
      window.removeEventListener('touchmove', resize.move)
      window.removeEventListener('touchend', resize.stop)
      if (!resize.resized) {
        return
      }
      const columnData = this.data
      // @todo
      const sibColumnData = h.getIn(formData, ['columns', sibling.id])
      const row = column.parentElement
      row.querySelector('.column-preset').value = 'custom'
      row.classList.remove('resizing-columns')
      columnData.config.width = column.dataset.colWidth
      sibColumnData.config.width = sibling.dataset.colWidth
      resize.resized = false
      // data.save()
    }

    resize.start = (function(evt) {
      if (evt.type === 'touchstart') {
        resize.startX = evt.touches[0].clientX
      } else {
        resize.startX = evt.clientX
      }
      row.classList.add('resizing-columns')

      // remove bootstrap column classes since we are custom sizing
      const reg = /\bcol-\w+-\d+/g
      column.className.replace(reg, '')
      sibling.className.replace(reg, '')

      // eslint-disable-next-line
      resize.colStartWidth = column.offsetWidth || dom.getStyle(column, 'width')
      // eslint-disable-next-line
      resize.sibStartWidth = sibling.offsetWidth || dom.getStyle(sibling, 'width')
      resize.rowWidth = row.offsetWidth - rowPadding // compensate for padding

      window.addEventListener('mouseup', resize.stop, false)
      window.addEventListener('mousemove', resize.move, false)
      window.addEventListener('touchend', resize.stop, false)
      window.addEventListener('touchmove', resize.move, false)
    })(evt)
  }

  // @todo loop through children and refresh panels
  refreshFieldPanels = () => {
    // console.log(this)
  }

  addField = (fieldId, index = this.children.length) => {
    const field = Fields.get(fieldId)
    this.dom.insertBefore(field.dom, this.dom.children[index])
    this.set(`children.${index}`, field.id)
    this.emptyClass()
    return field
  }

  /**
   * Sets a columns width
   * @param {String} width percent or pixel
   */
  setWidth = width => {
    this.dom.dataset.colWidth = width
    this.dom.style.width = width
    return this.set('config.width', width)
  }
}
