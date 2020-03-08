import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component'
import dom from '../../common/dom'
import events from '../../common/events'
import { numToPercent } from '../../common/utils'
import { ROW_CLASSNAME, COLUMN_TEMPLATES, ANIMATION_SPEED_FAST, COLUMN_CLASSNAME, bsColRegExp } from '../../constants'
import { removeCustomOption } from '../columns/events'

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {
      fieldset: false, // wrap contents of row in fieldset
      legend: '', // Legend for fieldset
      inputGroup: false, // is repeatable input-group?
    },
    children: [],
    className: [ROW_CLASSNAME],
  })

/**
 * Editor Row
 */
export default class Row extends Component {
  /**
   * Set default and generate dom for row in editor
   * @param  {String} dataID
   * @return {Object}
   */
  constructor(rowData) {
    super('row', Object.assign({}, DEFAULT_DATA(), rowData))

    const children = this.createChildWrap()

    this.dom = dom.create({
      tag: 'li',
      className: [ROW_CLASSNAME, 'empty'],
      dataset: {
        hoverTag: i18n.get('row'),
        editingHoverTag: i18n.get('editing.row'),
      },
      id: this.id,
      content: [this.getActionButtons(), this.editWindow, children],
    })

    this.sortable = Sortable.create(children, {
      animation: 150,
      fallbackClass: 'column-moving',
      forceFallback: true,
      group: {
        name: 'row',
        pull: true,
        put: ['row', 'column', 'controls'],
      },
      sort: true,
      disabled: false,
      onRemove: this.onRemove.bind(this),
      onEnd: this.onEnd.bind(this),
      onAdd: this.onAdd.bind(this),
      onSort: this.onSort.bind(this),
      filter: '.resize-x-handle',
      draggable: `.${COLUMN_CLASSNAME}`,
      handle: '.item-handle',
    })

    this.onRender()
  }

  /**
   * Edit window for Row
   * @return {Object} edit window dom config for Row
   */
  get editWindow() {
    const _this = this
    const editWindow = {
      className: `${this.name}-edit group-config`,
    }
    const fieldsetLabel = {
      tag: 'label',
      content: i18n.get('row.settings.fieldsetWrap'),
    }
    const fieldsetInput = {
      tag: 'input',
      id: _this.id + '-fieldset',
      attrs: {
        type: 'checkbox',
        checked: this.get('config.fieldset'),
        ariaLabel: i18n.get('row.settings.fieldsetWrap.aria'),
      },
      action: {
        click: ({ target: { checked } }) => {
          this.set('config.fieldset', Boolean(checked))
        },
      },
    }

    const inputGroupInput = {
      tag: 'input',
      id: `${this.id}-inputGroup`,
      attrs: {
        type: 'checkbox',
        checked: this.get('config.inputGroup'),
        ariaLabel: i18n.get('row.settings.inputGroup.aria'),
      },
      action: {
        click: ({ target: { checked } }) => this.set('config.inputGroup', checked),
      },
      config: {
        label: i18n.get('row.makeInputGroup'),
        description: i18n.get('row.makeInputGroupDesc'),
      },
    }

    // let fieldsetAddon = Object.assign({}, fieldsetLabel, {
    // content: [fieldsetInput, ' Fieldset']
    // });
    const inputAddon = {
      tag: 'span',
      className: 'input-group-addon',
      content: fieldsetInput,
    }
    const legendInput = {
      tag: 'input',
      attrs: {
        type: 'text',
        ariaLabel: 'Legend for fieldset',
        value: _this.get('config.legend'),
        placeholder: 'Legend',
      },
      action: {
        input: ({ target: { value } }) => _this.set('config.legend', value),
      },
      className: '',
    }

    const fieldsetInputGroup = {
      className: 'input-group',
      content: [inputAddon, legendInput],
    }

    const fieldSetControls = dom.formGroup([fieldsetLabel, fieldsetInputGroup])
    const columnSettingsPresetLabel = {
      tag: 'label',
      content: i18n.get('defineColumnWidths'),
      className: 'col-sm-4 form-control-label',
    }
    const columnSettingsPresetSelect = {
      className: 'col-sm-8',
      content: {
        className: 'column-preset',
      },
      action: {
        onRender: evt => {
          this.updateColumnPreset()
        },
      },
    }
    const columnSettingsPreset = dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], 'row')

    editWindow.children = [inputGroupInput, dom.create('hr'), fieldSetControls, dom.create('hr'), columnSettingsPreset]

    return editWindow
  }

  onAdd(...args) {
    super.onAdd(...args)
    this.autoColumnWidths()
  }

  onRemove(...args) {
    super.onRemove(...args)
    this.autoColumnWidths()
  }

  /**
   * Read columns and generate bootstrap cols
   * @param {Object} row DOM element
   */
  autoColumnWidths = () => {
    const columns = this.children

    if (!columns.length) {
      return
    }

    const width = parseFloat((100 / columns.length).toFixed(1)) / 1

    columns.forEach(column => {
      column.removeClasses(bsColRegExp)
      const colDom = column.dom
      const newColWidth = numToPercent(width)

      column.set('config.width', newColWidth)
      colDom.style.width = newColWidth
      colDom.dataset.colWidth = newColWidth
      const refreshTimeout = setTimeout(() => {
        clearTimeout(refreshTimeout)
        column.refreshFieldPanels()
      }, ANIMATION_SPEED_FAST)
      document.dispatchEvent(events.columnResized)
    })
    this.updateColumnPreset()
  }

  /**
   * Updates the column preset <select>
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset = () => {
    const oldColumnPreset = this.dom.querySelector('.column-preset')
    const rowEdit = oldColumnPreset.parentElement
    const columnPresetConfig = this.columnPresetControl(this.id)
    const newColumnPreset = dom.create(columnPresetConfig)

    rowEdit.replaceChild(newColumnPreset, oldColumnPreset)
    return columnPresetConfig
  }

  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths = widths => {
    if (widths === 'custom') {
      return
    }
    if (typeof widths === 'string') {
      widths = widths.split(',')
    }
    this.children.forEach((column, i) => {
      column.setWidth(`${widths[i]}%`)
      column.refreshFieldPanels()
    })
  }

  /**
   * Generates the element config for column layout in row
   * @return {Object} columnPresetControlConfig
   */
  columnPresetControl = () => {
    const _this = this
    const layoutPreset = {
      tag: 'select',
      attrs: {
        ariaLabel: i18n.get('defineColumnLayout'),
        className: 'column-preset',
      },
      action: {
        change: ({ target: { value } }) => {
          if (value !== 'custom') {
            removeCustomOption(this.dom)
            _this.setColumnWidths(value)
          }
        },
      },
      options: [],
    }
    const pMap = COLUMN_TEMPLATES

    const columns = this.children
    const pMapVal = pMap.get(columns.length - 1) || []
    const curVal = columns
      .map(Column => {
        const width = Column.get('config.width') || ''
        return Number(width.replace('%', '')).toFixed(1)
      })
      .join(',')
    if (pMapVal.length) {
      const options = pMapVal.slice()
      const isCustomVal = !options.find(val => val.value === curVal)
      if (isCustomVal) {
        options.push({
          value: curVal,
          label: curVal.replace(/,/g, ' | '),
          className: 'custom-column-widths',
        })
      }
      layoutPreset.options = options.map(val => {
        const option = Object.assign({}, val)
        if (val.value === curVal) {
          option.selected = true
        }
        return option
      })
    }

    return layoutPreset
  }
}
