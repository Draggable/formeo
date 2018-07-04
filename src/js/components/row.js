import i18n from 'mi18n'
import Sortable from 'sortablejs'
import dom from '../common/dom'
import h from '../common/helpers'
import { data, formData, registeredFields as rFields } from '../common/data'
import { uuid } from '../common/utils'

/**
 * Editor Row
 */
export default class Row {
  /**
   * Set default and generate dom for row in editor
   * @param  {String} dataID
   * @return {Object}
   */
  constructor(dataID) {
    let row

    const rowId = (this.rowId = dataID || uuid())

    const defaults = {
      columns: [],
      id: this.rowId,
      config: {
        fieldset: false, // wrap contents of row in fieldset
        legend: '', // Legend for fieldset
        inputGroup: false, // is repeatable input-group?
      },
      attrs: {
        className: 'f-row',
      },
    }

    formData.get('rows').set(rowId, h.merge(defaults, this.rowData))

    row = {
      tag: 'li',
      className: 'stage-rows empty-rows',
      dataset: {
        hoverTag: i18n.get('row'),
        editingHoverTag: i18n.get('editing.row'),
      },
      id: rowId,
      content: [dom.actionButtons(rowId, 'row'), this.editWindow],
      fType: 'rows',
    }

    row = dom.create(row)

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

    dom.rows.set(rowId, { row, sortable })

    return row
  }

  get rowData() {
    return h.getIn(formData, ['rows', this.rowId])
  }

  /**
   * Edit window for Row
   * @return {Object} [description]
   */
  get editWindow() {
    const _this = this
    const rowData = this.rowData

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
      id: _this.rowId + '-fieldset',
      attrs: {
        type: 'checkbox',
        checked: rowData.config.fieldset,
        ariaLabel: i18n.get('row.settings.fieldsetWrap.aria'),
      },
      action: {
        click: e => {
          rowData.config.fieldset = e.target.checked
          data.save()
        },
      },
    }

    const inputGroupInput = {
      tag: 'input',
      id: _this.rowId + '-inputGroup',
      attrs: {
        type: 'checkbox',
        checked: rowData.config.inputGroup,
        ariaLabel: i18n.get('row.settings.inputGroup.aria'),
      },
      action: {
        click: e => {
          rowData.config.inputGroup = e.target.checked
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
        value: rowData.config.legend,
        placeholder: 'Legend',
      },
      action: {
        input: e => {
          rowData.config.legend = e.target.value
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
      tag: 'div',
      className: 'col-sm-8',
      content: dom.columnPresetControl(_this.rowId),
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
