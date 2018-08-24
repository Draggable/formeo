import Sortable from 'sortablejs'
import i18n from 'mi18n'
import { data } from '../../common/data'
import h from '../../common/helpers'
import dom from '../../common/dom'
import Controls from '../controls'
import Row from '../rows/row'
import Component from '../component'
import events from '../../common/events'
import Rows from '../rows'
import stages from './index'

let stageOpts = {}
const DEFAULT_DATA = { children: [] }

/**
 * Stage is where fields and elements are dragged to.
 */
export default class Stage extends Component {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageData uuid
   * @return {Object} DOM element
   */
  constructor(stageData) {
    super('stage', Object.assign({}, DEFAULT_DATA, stageData))

    const defaultOptions = {
      formSettings: [
        {
          tag: 'input',
          id: 'form-title',
          attrs: {
            className: 'form-title',
            placeholder: i18n.get('Untitled Form'),
            value: i18n.get('Untitled Form'),
            type: 'text',
          },
          config: {
            label: i18n.get('Form Title'),
          },
        },
        {
          tag: 'input',
          id: 'form-novalidate',
          attrs: {
            className: 'form-novalidate',
            value: false,
            type: 'checkbox',
          },
          config: {
            label: i18n.get('Form novalidate'),
          },
        },
        {
          tag: 'input',
          id: 'form-tags',
          attrs: {
            className: 'form-tags',
            type: 'text',
          },
          config: {
            label: i18n.get('Tags'),
          },
        },
      ],
    }

    stageOpts = Object.assign(stageOpts, defaultOptions)

    this.dom = this.stageWrap()
    stages.activeStage = this
    // formData.get('stages').set(this.id, defaultStageData(this.id))
    // formData = formData.setIn(['stages', this.id], defaultStageData(this.id))

    // console.log('this.id', this.id)
    // console.log(set.toJS().stages)

    // return this.loadStage()
  }

  /**
   * Prep stage to receive rows
   * @return {Object} DOM element
   */
  loadStage() {
    // const _this = this
    // const stageWrap = this.dom
    Sortable.create(this.stage, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      group: {
        name: 'stages',
        pull: true,
        put: ['controls', 'rows', 'columns'],
      },
      sort: true,
      // Element is dropped into the list from another list
      onAdd: this.onAdd,
      // onRemove: this.onRemove,
      // onDrop: _this.onAdd.bind(_this),
      // onClone: evt => {
      //   console.log(evt)
      // },
      onStart: evt => {
        // console.log(evt)
        stages.activeStage = this.stage
      },
      // onUpdate: evt => {
      //   data.saveRowOrder()
      //   data.save()
      // },
      // onSort: this.onSort,
      // draggable: '.stage-rows',
      handle: '.item-handle',
    })

    // dom.stages.set(this.id, {
    //   stage: this.stage,
    // sortable,
    // })

    stages.activeStage = this.stage

    if (this.data.children.length) {
      this.loadRows(this.stage)
    }
  }

  /**
   * Loop through the formData and append it to the stage
   * @param  {Object} stage DOM element
   * @return {Array}  loaded rows
   */
  loadRows(stage) {
    if (!stage) {
      stage = stages.activeStage
    }

    // const stageData = formData.getIn(['stages', stage.id])
    const rows = this.data.children
    rows.forEach(rowId => {
      const row = this.addRow(rowId)
      row.loadColumns()
      // row.updateColumnPreset(row)
      stage.stage.appendChild(row.dom)
    })
  }

  /**
   * Generate the elements that make up the Stage
   * @return {Object} stage elements, settings, stage ul
   */
  elementConfigs() {
    const _this = this
    const config = {
      stage: {
        tag: 'ul',
        attrs: {
          className: ['stage', 'empty'],
          id: _this.id,
        },
        dataset: {
          hoverTag: i18n.get('getStarted'),
        },
        // fType: 'stages',
      },
      settings: {
        tag: 'div',
        attrs: {
          className: 'formeo-settings',
          id: `${_this.id}-settings`,
        },
        // fType: 'settings',
      },
    }

    config.settings.children = stageOpts.formSettings.slice()

    return config
  }

  /**
   * Callback for when a row is sorted
   * @param  {Object} evt
   */
  onSort = evt => {
    console.log('stage.js: onSort: \n', evt)
    data.save()
  }

  /**
   * Method for handling stage drop
   * @param  {Object} evt
   * @return {Object} formData
   */
  onAdd = evt => {
    console.log('Stage: onAdd', evt)
    stages.activeStage = this.stage
    const { from, item, to } = evt
    const newIndex = h.indexOfNode(item, to)
    const row = from.fType === 'stages' ? item : this.addRow()
    const fromColumn = from.fType === 'columns'
    const fromRow = from.fType === 'rows'
    let column

    if (from.fType === 'controlGroup') {
      const { meta } = Controls.get(item.id).controlData
      if (meta.group !== 'layout') {
        column = row.addColumn()
        column.addField(item.id)
        // dom.addField(column, item.id)
      } else if (meta.id === 'layout-column') {
        dom.addColumn(row)
      }
      dom.remove(item)
    } else if (fromColumn) {
      console.log({ fromColumn })
      column = dom.addColumn(row)
      column.appendChild(item)
      data.saveFieldOrder(column)
      dom.emptyClass(column)
    } else if (fromRow) {
      console.log({ fromRow })
      row.appendChild(item)
      data.saveColumnOrder(row)
      dom.emptyClass(row)
    }

    to.insertBefore(row.dom, to.children[newIndex])
    // dom.columnWidths(row)
    data.saveRowOrder(to)

    return data.save()
  }

  /**
   * Handle removal of a row from stage
   * @param  {Object} evt
   * @return {Object} formData
   */
  onRemove = evt => {
    return data.save()
  }

  /**
   * Returns the markup for the stage
   *
   * @return {DOM}
   */
  stageWrap() {
    if (this.stage) {
      return this.stage
    }
    const config = this.elementConfigs()

    const stageWrap = dom.create({
      tag: 'div',
      attrs: {
        className: 'stage-wrap',
      },
      content: [
        config.stage, // stage items
        config.settings,
      ],
    })
    this.stage = stageWrap.firstChild

    return stageWrap
  }

  get rows() {
    return this.data.children.map(childId => Rows.get(childId))
  }

  /**
   * Adds a row to the stage
   * @param {String} stageId
   * @param {String} rowId
   * @return {Object} DOM element
   */
  addRow = (rowId, index = this.rows.length) => {
    const row = new Row({ id: rowId })
    this.stage.appendChild(row.dom)
    // data.saveRowOrder(stage)
    this.emptyClass()
    this.set(`children.${index}`, row.id)
    events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'row',
        oldValue: undefined,
        newValue: row.rowData,
      },
    })
    document.dispatchEvent(events.formeoUpdated)
    return row
  }
}
