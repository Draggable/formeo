import Sortable from 'sortablejs'
import h from '../../common/helpers'
import dom from '../../common/dom'
import Controls from '../controls'
import Component from '../component'
import { Rows } from '..'
import { STAGE_CLASSNAME } from '../../constants'

const DEFAULT_DATA = () => Object.freeze({ children: [] })

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
    super('stage', Object.assign({}, DEFAULT_DATA(), stageData))

    // @todo move formSettings to its own component
    // const defaultOptions = {
    //   formSettings: [
    //     {
    //       tag: 'input',
    //       id: 'form-title',
    //       attrs: {
    //         className: 'form-title',
    //         placeholder: i18n.get('Untitled Form'),
    //         value: i18n.get('Untitled Form'),
    //         type: 'text',
    //       },
    //       config: {
    //         label: i18n.get('Form Title'),
    //       },
    //     },
    //     {
    //       tag: 'input',
    //       id: 'form-novalidate',
    //       attrs: {
    //         className: 'form-novalidate',
    //         value: false,
    //         type: 'checkbox',
    //       },
    //       config: {
    //         label: i18n.get('Form novalidate'),
    //       },
    //     },
    //     {
    //       tag: 'input',
    //       id: 'form-tags',
    //       attrs: {
    //         className: 'form-tags',
    //         type: 'text',
    //       },
    //       config: {
    //         label: i18n.get('Tags'),
    //       },
    //     },
    //   ],
    // }

    this.dom = dom.create({
      tag: 'ul',
      attrs: {
        className: [STAGE_CLASSNAME, 'empty'],
        id: this.id,
      },
    })

    // Stages.activeStage = this
    // formData.get('stages').set(this.id, defaultStageData(this.id))
    // formData = formData.setIn(['stages', this.id], defaultStageData(this.id))

    // console.log('this.id', this.id)
    // console.log(set.toJS().stages)

    this.sortable = Sortable.create(this.dom, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      // group: 'stage',
      group: {
        name: 'stage',
        pull: true,
        put: ['row', 'column', 'controls'],
      },
      sort: true,
      disabled: false,
      // Element is dropped into the list from another list
      onAdd: this.onAdd,
      // onRemove: this.onRemove,
      // onDrop: _this.onAdd.bind(_this),
      // onClone: evt => {
      //   console.log(evt)
      // },
      // onStart: evt => {
      // console.log(evt)
      // Stages.activeStage = this
      // },
      // onUpdate: evt => {
      //   data.saveRowOrder()
      //   data.save()
      // },
      // onSort: this.onSort,
      draggable: '.stage-rows',
      handle: '.item-handle',
    })

    if (this.data.children.length) {
      this.loadRows()
    }
  }

  /**
   * Loop through the formData and append it to the stage
   * @return {Array}  loaded rows
   */
  loadRows() {
    console.log(this.data.children)
    // const stage = this.dom
    // const stageData = formData.getIn(['stages', stage.id])
    // const rows = this.data.children
    // rows.forEach(rowId => {
    //   const row = this.addRow(rowId)
    //   row.loadColumns()
    // row.updateColumnPreset(row)
    //   stage.appendChild(row.dom)
    // })
  }

  /**
   * Callback for when a row is sorted
   * @param  {Object} evt
   */
  onSort = evt => {
    console.log('stage.js: onSort: \n', evt)
    // data.save()
  }

  /**
   * Method for handling stage drop
   * @param  {Object} evt
   * @return {Object} formData
   */
  onAdd = ({ from, item, to }) => {
    const newIndex = h.indexOfNode(item, to)
    const row = dom.isStage(from) ? Rows.get(item.id) : this.addRow()
    const fromType = dom.componentType(from)

    const onAddConditions = {
      // from Controls
      controls: () => {
        const { meta } = Controls.get(item.id).controlData
        if (meta.group !== 'layout') {
          row.addColumn().addField(item.id)
        } else if (meta.id === 'layout-column') {
          row.addColumn()
        }
        dom.remove(item)
      },
      row: () => row.addColumn(item.id),
      column: () => row.addColumn().addField(item.id),
    }

    onAddConditions[fromType] && onAddConditions[fromType]()
    to.insertBefore(row.dom, to.children[newIndex])
    this.emptyClass()
    this.saveRowOrder()
  }

  saveRowOrder = () => {
    const newRowOrder = this.children.map(({ id }) => id)
    this.set('children', newRowOrder)
    return newRowOrder
  }

  /**
   * Handle removal of a row from stage
   * @param  {Object} evt
   * @return {Object} formData
   */
  onRemove = evt => {
    // return data.save()
  }

  /**
   * Adds a row to the stage
   * @param {String} stageId
   * @param {String} rowId
   * @return {Object} DOM element
   */
  addRow = (rowId, index = this.children.length) => {
    const row = Rows.add(rowId)
    this.dom.appendChild(row.dom)
    this.set(`children.${index}`, row.id)
    this.emptyClass()
    return row
  }
}
