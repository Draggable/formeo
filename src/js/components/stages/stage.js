import Sortable from 'sortablejs'
// import { fromJS } from 'immutable'
import i18n from 'mi18n'
import { data } from '../../common/data'
import h from '../../common/helpers'
import dom from '../../common/dom'
import stagesData from '../../data/stages'
import Controls from '../controls'

let stageOpts = {}

/**
 * Stage is where fields and elements are dragged to.
 */
export default class Stage {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageData uuid
   * @return {Object} DOM element
   */
  constructor(stageData) {
    this.id = stagesData.add(stageData)

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
    // formData.get('stages').set(this.id, defaultStageData(this.id))
    // formData = formData.setIn(['stages', this.id], defaultStageData(this.id))

    // console.log('this.id', this.id)
    // console.log(set.toJS().stages)

    return this.loadStage()
  }

  get stageData() {
    return stagesData.get(this.id)
  }

  /**
   * Prep stage to receive rows
   * @return {Object} DOM element
   */
  loadStage() {
    // const _this = this
    const stageWrap = this.dom
    Sortable.create(stageWrap.firstChild, {
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
        dom.activeStage = this.stage
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

    dom.activeStage = this.stage

    if (this.stageData.children.length) {
      dom.loadRows(this.stage)
    }

    return stageWrap
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
        fType: 'stages',
      },
      settings: {
        tag: 'div',
        attrs: {
          className: 'formeo-settings',
          id: `${_this.id}-settings`,
        },
        fType: 'settings',
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
    console.log(evt)
    dom.activeStage = this.stage
    const { from, item, to } = evt
    const newIndex = h.indexOfNode(item, to)
    const row = from.fType === 'stages' ? item : dom.addRow()
    const fromColumn = from.fType === 'columns'
    const fromRow = from.fType === 'rows'
    let column

    if (from.fType === 'controlGroup') {
      const { meta } = Controls.get(item.id)
      if (meta.group !== 'layout') {
        column = dom.addColumn(row)
        dom.addField(column, item.id)
      } else if (meta.id === 'layout-column') {
        dom.addColumn(row)
      }
      dom.remove(item)
    } else if (fromColumn) {
      column = dom.addColumn(row)
      column.appendChild(item)
      data.saveFieldOrder(column)
      dom.emptyClass(column)
    } else if (fromRow) {
      row.appendChild(item)
      data.saveColumnOrder(row)
      dom.emptyClass(row)
    }

    to.insertBefore(row, to.children[newIndex])
    dom.columnWidths(row)
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
  get dom() {
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
}
