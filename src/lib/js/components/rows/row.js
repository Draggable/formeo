import i18n from 'mi18n'
import Sortable from 'sortablejs'
import Component from '../component.js'
import dom from '../../common/dom.js'
import events from '../../common/events.js'
import { numToPercent } from '../../common/utils/index.mjs'
import {
  ROW_CLASSNAME,
  COLUMN_TEMPLATES,
  ANIMATION_SPEED_FAST,
  COLUMN_CLASSNAME,
  bsColRegExp,
  CUSTOM_COLUMN_OPTION_CLASSNAME,
  COLUMN_PRESET_CLASSNAME,
} from '../../constants.js'
import columnsData from '../columns/index.js'
import data from '../data.js'
import components from '../index.js'
import { forEach } from 'lodash'

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
    super('row', { ...DEFAULT_DATA(), ...rowData })

    const children = this.createChildWrap()

    this.dom = dom.create({
      tag: 'li',
      className: [ROW_CLASSNAME, 'empty'],
      dataset: {
        hoverTag: i18n.get('row'),
        editingHoverTag: i18n.get('editing.row'),
      },
      id: this.id,
      content: [this.getComponentTag(), this.getActionButtons(), this.editWindow, children],
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
      // filter: '.resize-x-handle', // use filter for frozen columns
      draggable: `.${COLUMN_CLASSNAME}`,
      handle: '.item-move',
    })
  }

  /**
   * Edit window for Row
   * @return {Object} edit window dom config for Row
   */
  get editWindow() {
    const _this = this

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
    this.columnPresetControl = dom.create(this.columnPresetControlConfig)
    const columnSettingsPresetSelect = {
      className: 'col-sm-8',
      content: this.columnPresetControl,
      action: {
        onRender: () => {
          this.updateColumnPreset()
        },
      },
    }
    const columnSettingsPreset = dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], 'row')
    const editWindowContents = [inputGroupInput, 'hr', fieldSetControls, 'hr', columnSettingsPreset]

    const editWindow = dom.create({
      className: `${this.name}-edit group-config`,
      action: {
        onRender: editWindow => {
          const timeout = setTimeout(() => {
            const elements = editWindowContents.map(elem => dom.create(elem))
            editWindow.append(...elements)
            clearTimeout(timeout)
          }, 1000)
        },
      },
    })

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
    this.columnPresetControl.innerHTML = ''
    const presetOptions = this.getColumnPresetOptions.map(({ label, ...attrs }) =>
      dom.create({
        tag: 'option',
        content: label,
        attrs,
      }),
    )
    this.columnPresetControl.append(...presetOptions)
  }

  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths = widths => {
    if (typeof widths === 'string') {
      widths = widths.split(',')
    }
    this.children.forEach((column, i) => {
      column.setWidth(`${widths[i]}%`)
      column.refreshFieldPanels()
    })
  }

  /**
   * Retrieves the preset options for columns based on the current configuration.
   *
   * @returns {Array<Object>} An array of option objects for column presets. Each object contains:
   * - `value` {string}: The comma-separated string of column widths.
   * - `label` {string}: The display label for the option, with widths separated by ' | '.
   * - `className` {string}: The CSS class name for custom column options.
   * - `selected` {boolean} [optional]: Indicates if the option is the current value.
   */
  get getColumnPresetOptions() {
    const columns = this.children
    const pMap = COLUMN_TEMPLATES
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
          className: CUSTOM_COLUMN_OPTION_CLASSNAME,
        })
      }

      return options.map(val => {
        const option = { ...val }
        option.selected = val.value === curVal
        return option
      })
    }

    return []
  }

  /**
   * Generates the element config for column layout in row
   * @return {Object} columnPresetControlConfig
   */
  get columnPresetControlConfig() {
    const _this = this
    const layoutPreset = {
      tag: 'select',
      attrs: {
        ariaLabel: i18n.get('defineColumnLayout'),
        className: COLUMN_PRESET_CLASSNAME,
      },
      action: {
        change: ({ target }) => {
          const { value } = target

          // forEach(target.children, option => {
          //   option.selected = option.value === value
          // })
          // if (value !== 'custom') {
          // removeCustomOption(this.dom)
          _this.setColumnWidths(value)
          // }
        },
      },
      options: this.getColumnPresetOptions,
    }

    return layoutPreset
  }
}
