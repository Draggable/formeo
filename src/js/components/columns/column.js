import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component'
import h from '../../common/helpers'
import events from '../../common/events'
import dom from '../../common/dom'
import { COLUMN_CLASSNAME, FIELD_CLASSNAME } from '../../constants'
import { resize } from './events'

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {
      width: '100%',
    },
    children: [],
    className: COLUMN_CLASSNAME,
  })

const DOM_CONFIGS = {
  resizeHandle: () => ({
    className: 'resize-x-handle',
    action: {
      pointerdown: resize,
    },
    content: [dom.icon('triangle-down'), dom.icon('triangle-up')],
  }),
  editWindow: () => ({
    className: 'column-edit group-config',
  }),
}

/**
 * Setup Column elements
 */
export default class Column extends Component {
  /**
   * Set defaults and/or load existing columns
   * @param  {Object} columnData
   * @return {Object} Column config object
   */
  constructor(columnData) {
    super('column', Object.assign({}, DEFAULT_DATA(), columnData))

    const _this = this

    const children = this.createChildWrap()

    this.dom = dom.create({
      tag: 'li',
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
      content: [this.getActionButtons(), DOM_CONFIGS.editWindow(), DOM_CONFIGS.resizeHandle(), children],
    })

    this.processConfig(this.dom)

    events.columnResized = new window.CustomEvent('columnResized', {
      detail: {
        column: this.dom,
        instance: _this,
      },
    })

    this.sortable = Sortable.create(children, {
      animation: 150,
      fallbackClass: 'field-moving',
      forceFallback: true,
      group: {
        name: 'column',
        pull: true,
        put: ['column', 'controls'],
      },
      sort: true,
      disabled: false,
      onEnd: this.onEnd.bind(this),
      onAdd: this.onAdd.bind(this),
      onSort: this.onSort.bind(this),
      onRemove: this.onRemove.bind(this),
      // Attempt to drag a filtered element
      onMove: evt => {
        if (evt.from !== evt.to) {
          evt.from.classList.remove('hovering-column')
        }
        // if (evt.related.parentElement.fType === 'columns') {
        //   evt.related.parentElement.classList.add('hovering-column')
        // }
      },
      draggable: `.${FIELD_CLASSNAME}`,
      handle: '.item-handle',
    })
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

  // loops through children and refresh their edit panels
  refreshFieldPanels = () => {
    this.children.forEach(field => field.panels.nav.refresh())
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
