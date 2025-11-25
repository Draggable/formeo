import i18n from '@draggable/i18n'
import Sortable from 'sortablejs'
import dom from '../../common/dom.js'
import events from '../../common/events.js'
import h from '../../common/helpers.mjs'
import { COLUMN_CLASSNAME, FIELD_CLASSNAME } from '../../constants.js'
import Component from '../component.js'
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

    const childWrap = this.createChildWrap()

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
        childWrap,
      ],
    })

    this.processConfig()

    events.columnResized = new window.CustomEvent('columnResized', {
      detail: {
        column: this.dom,
        instance: this,
      },
    })

    Sortable.create(childWrap, {
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
  processConfig() {
    const columnWidth = h.get(this.data, 'config.width')
    if (columnWidth) {
      this.setDomWidth(columnWidth)
    }
  }

  // loops through children and refresh their edit panels
  refreshFieldPanels = () => {
    for (const field of this.children) {
      field.panels.nav.refresh()
    }
  }

  /**
   * Sets the width data and style for the column
   * @param {string} width - The width value to be set for the column
   * @returns {void}
   */
  setDomWidth = width => {
    this.dom.dataset.colWidth = width
    this.dom.style.width = width
  }

  /**
   * Sets a columns width
   * @param {String} width percent or pixel
   */
  setWidth = width => {
    this.setDomWidth(width)
    return this.set('config.width', width)
  }
}
