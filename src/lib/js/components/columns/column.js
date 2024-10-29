import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component.js'
import h from '../../common/helpers.mjs'
import events from '../../common/events.js'
import dom from '../../common/dom.js'
import { COLUMN_CLASSNAME, FIELD_CLASSNAME } from '../../constants.js'
import { ResizeColumn } from './event-handlers.js'

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {
      width: '100%',
    },
    children: [],
    className: [COLUMN_CLASSNAME],
  })

const DOM_CONFIGS = {
  resizeHandle: columnRisizer => ({
    className: 'resize-x-handle',
    action: {
      pointerdown: columnRisizer.onStart.bind(columnRisizer),
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
    super('column', { ...DEFAULT_DATA(), ...columnData })

    const _this = this

    const children = this.createChildWrap()

    this.dom = dom.create({
      tag: 'li',
      className: [COLUMN_CLASSNAME, 'empty'],
      dataset: {
        hoverTag: i18n.get('column'),
      },
      id: this.id,
      content: [
        this.getComponentTag(),
        this.getActionButtons(),
        DOM_CONFIGS.editWindow(),
        DOM_CONFIGS.resizeHandle(new ResizeColumn()),
        children,
      ],
    })

    this.processConfig(this.dom)

    events.columnResized = new window.CustomEvent('columnResized', {
      detail: {
        column: this.dom,
        instance: _this,
      },
    })

    Sortable.create(children, {
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
      },
      draggable: `.${FIELD_CLASSNAME}`,
      handle: '.item-move',
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
    }
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
