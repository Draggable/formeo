import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component'
import h, { get } from '../../common/helpers'
import events from '../../common/events'
import dom from '../../common/dom'
import { numToPercent } from '../../common/utils'
import { COLUMN_CLASSNAME } from '../../constants'

// @todo remove formData
const formData = {}

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {},
    children: [],
    className: 'f-column',
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
      content: [this.getActionButtons(), editWindow, resizeHandle],
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
      onAdd: this.onAdd,
      onSort: this.onSort,
      onRemove: this.onRemove,
      // Attempt to drag a filtered element
      onMove: evt => {
        if (evt.from !== evt.to) {
          evt.from.classList.remove('hovering-column')
        }
        // if (evt.related.parentElement.fType === 'columns') {
        //   evt.related.parentElement.classList.add('hovering-column')
        // }
      },
      draggable: '.stage-fields',
      handle: '.item-handle',
    })

    this.dom = column
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

  addChild(...args) {
    super.addChild(...args)
    this.fieldOrderClasses()
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
      const sibColumnData = get(formData, `columns.${sibling.id}`)
      const row = column.parentElement
      row.querySelector('.column-preset').value = 'custom'
      row.classList.remove('resizing-columns')
      columnData.config.width = column.dataset.colWidth
      sibColumnData.config.width = sibling.dataset.colWidth
      resize.resized = false
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
  refreshFieldPanels = () => {}

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
