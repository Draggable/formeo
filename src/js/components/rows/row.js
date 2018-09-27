import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component'
import dom from '../../common/dom'
import events from '../../common/events'
import { bsGridRegEx } from '../../common/helpers'
import { numToPercent } from '../../common/utils'
import { ROW_CLASSNAME, COLUMN_TEMPLATES, ANIMATION_SPEED_BASE } from '../../constants'

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {
      fieldset: false, // wrap contents of row in fieldset
      legend: '', // Legend for fieldset
      inputGroup: false, // is repeatable input-group?
    },
    children: [],
    className: ['f-row'],
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

    const rowConfig = {
      tag: 'li',
      className: `${ROW_CLASSNAME} empty`,
      dataset: {
        hoverTag: i18n.get('row'),
        editingHoverTag: i18n.get('editing.row'),
      },
      id: this.id,
      content: [this.getActionButtons(), this.editWindow],
    }

    const row = dom.create(rowConfig)

    this.sortable = Sortable.create(row, {
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
      draggable: '.stage-columns',
      handle: '.item-handle',
    })

    this.dom = row
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
    const columnSettingsLabel = Object.assign({}, fieldsetLabel, {
      content: 'Define column widths',
    })
    const columnSettingsPresetLabel = Object.assign({}, fieldsetLabel, {
      content: 'Layout Preset',
      className: 'col-sm-4 form-control-label',
    })
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
    const formGroupContent = [columnSettingsPresetLabel, columnSettingsPresetSelect]
    const columnSettingsPreset = dom.formGroup(formGroupContent, 'row')

    editWindow.children = [
      inputGroupInput,
      dom.create('hr'),
      fieldSetControls,
      dom.create('hr'),
      columnSettingsLabel,
      columnSettingsPreset,
    ]

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
   * @param  {Object}  row    DOM element
   */
  autoColumnWidths = () => {
    const columns = this.children
    if (!columns.length) {
      return
    }
    const width = parseFloat((100 / columns.length).toFixed(1)) / 1

    columns.forEach(column => {
      column.removeClasses(bsGridRegEx)
      const colDom = column.dom
      const newColWidth = numToPercent(width)

      column.set('config.width', newColWidth)
      colDom.style.width = newColWidth
      colDom.dataset.colWidth = newColWidth
      setTimeout(column.refreshFieldPanels, ANIMATION_SPEED_BASE)
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
        ariaLabel: 'Define a column layout', // @todo i18n
        className: 'column-preset',
      },
      action: {
        change: ({ target: { value } }) => {
          // @todo FIX!
          // const dRow = this.rows.get(this.id)
          _this.setColumnWidths(value)
        },
      },
    }
    const pMap = COLUMN_TEMPLATES

    // if (this.children) {
    const columns = this.children
    const pMapVal = pMap.get(columns.length - 1)
    layoutPreset.options = pMapVal || pMap.get('custom')
    const curVal = columns
      .map(Column => {
        const width = Column.get('config.width') || ''
        return width.replace('%', '')
      })
      .join(',')
    if (pMapVal) {
      pMapVal.forEach((val, i) => {
        const options = layoutPreset.options
        if (val.value === curVal) {
          options[i].selected = true
        } else {
          delete options[i].selected
          options[options.length - 1].selected = true
        }
      })
    }
    // } else {
    //   layoutPreset.options = pMap.get(1)
    // }

    return layoutPreset
  }
}
