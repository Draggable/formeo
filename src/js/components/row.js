import i18n from 'mi18n'
import Sortable from 'sortablejs'
import dom from '../common/dom'
import h from '../common/helpers'
import { data, registeredFields as rFields } from '../common/data'
import rowsData from '../data/rows'

/**
 * Editor Row
 */
export default class Row {
  /**
   * Set default and generate dom for row in editor
   * @param  {String} dataID
   * @return {Object}
   */
  constructor(rowData) {
    this.id = rowsData.add(rowData)

    const rowConfig = {
      tag: 'li',
      className: 'stage-rows empty-rows',
      dataset: {
        hoverTag: i18n.get('row'),
        editingHoverTag: i18n.get('editing.row'),
      },
      id: this.id,
      content: [dom.actionButtons(this.id, 'row'), this.editWindow],
      fType: 'rows',
    }

    const row = dom.create(rowConfig)

    const sortable = Sortable.create(row, {
      animation: 150,
      fallbackClass: 'column-moving',
      forceFallback: true,
      group: { name: 'rows', pull: true, put: ['rows', 'controls', 'columns'] },
      sort: true,
      onRemove: this.onRemove,
      onEnd: this.onEnd,
      onAdd: this.onAdd,
      onSort: this.onSort,
      onMove: evt => {
        console.log(evt)
      },
      draggable: '.stage-columns',
      filter: '.resize-x-handle',
    })

    dom.rows.set(this.id, { row, sortable })
    this.dom = row
  }

  get rowData() {
    return rowsData.get(this.id)
  }

  /**
   * Edit window for Row
   * @return {Object} [description]
   */
  get editWindow() {
    const _this = this
    const rowData = this.rowData
    // debugger

    const editWindow = {
      tag: 'div',
      className: 'row-edit group-config',
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
        checked: h.get(rowData, 'config.fieldset'),
        ariaLabel: i18n.get('row.settings.fieldsetWrap.aria'),
      },
      action: {
        click: ({ target: { checked } }) => {
          rowData.setIn(['config', 'fieldset'], checked)
          data.save()
        },
      },
    }

    const inputGroupInput = {
      tag: 'input',
      id: _this.id + '-inputGroup',
      attrs: {
        type: 'checkbox',
        checked: h.get(rowData, 'config.inputGroup'),
        ariaLabel: i18n.get('row.settings.inputGroup.aria'),
      },
      action: {
        click: ({ target: { checked } }) => {
          h.get(rowData, ['config', 'inputGroup'], checked)
          // rowData.config.inputGroup = e.target.checked
          data.save()
        },
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
        value: h.get(rowData, 'config.legend'),
        placeholder: 'Legend',
      },
      action: {
        input: ({ target: { value } }) => {
          rowData['config'].legend = value
          data.save()
        },
      },
      className: '',
    }

    const fieldsetInputGroup = {
      tag: 'div',
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
      content: dom.columnPresetControl(this.id),
    }
    const formGroupContent = [columnSettingsPresetLabel, columnSettingsPresetSelect]
    const columnSettingsPreset = dom.formGroup(formGroupContent, 'row')

    editWindow.content = [
      inputGroupInput,
      dom.create('hr'),
      fieldSetControls,
      dom.create('hr'),
      columnSettingsLabel,
      columnSettingsPreset,
    ]

    return editWindow
  }

  /**
   * Update column order and save
   * @param  {Object} evt
   */
  onSort(evt) {
    data.saveColumnOrder(evt.target)
    data.save()
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onRemove(evt) {
    dom.columnWidths(evt.from)
    data.saveColumnOrder(evt.target)
    dom.emptyClass(evt.from)
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onEnd(evt) {
    console.log('onEnd', evt)
    if (evt.from.classList.contains('empty-rows')) {
      dom.removeEmpty(evt.from)
    }

    data.save()
  }

  /**
   * Handler for adding content to a row
   * @param  {Object} evt
   */
  onAdd(evt) {
    const { from, item, to } = evt
    const fromRow = from.fType === 'rows'
    const fromColumn = from.fType === 'columns'
    const fromControls = from.fType === 'controlGroup'
    let column
    console.log('row.js onAdd')

    if (fromRow) {
      column = item
    } else if (fromColumn || fromControls) {
      const meta = h.get(rFields[item.id], 'meta')
      if (meta.group !== 'layout') {
        column = dom.addColumn(to.id)
        dom.addField(column.id, item.id)
      } else if (meta.id === 'layout-column') {
        dom.addColumn(to.id)
      }
    }

    if (fromColumn || fromControls) {
      dom.remove(item)
    }

    data.saveColumnOrder(to)

    dom.columnWidths(to)
    dom.emptyClass(to)
    data.save()
  }
}
