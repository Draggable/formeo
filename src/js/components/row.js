import i18n from 'mi18n';
import Sortable from 'sortablejs';
import DOM from '../common/dom';
import helpers from '../common/helpers';
import { data, dataMap } from '../common/data';

var dom = new DOM();

export default class Row {

  constructor(dataID) {
    let _this = this,
      rowDataDefault,
      row;

    _this.rowID = dataID || helpers.uuid();

    rowDataDefault = {
        columns: [],
        id: _this.rowID,
        config: {
          fieldset: false, // wrap contents of row in fieldset
          legend: '' // Legend for fieldset
        }
      };

    // _this.rowData = helpers.extend(rowDataDefault, dataMap.rows[_this.rowID]);
    dataMap.rows[_this.rowID] = helpers.extend(rowDataDefault, dataMap.rows[_this.rowID]);

console.log(_this.rowID);

    row = {
      tag: 'li',
      attrs: {
        className: 'stage-row'
      },
      dataset: {
        hoverTag: i18n.get('row')
      },
      action: {
        mouseover: (evt) => {
          // evt.target.classList.add('hovering');
        },
        mouseout: (evt) => {
          // evt.target.classList.remove('hovering');
        }
      },
      id: _this.rowID,
      content: [dom.actionButtons(_this.rowID, 'row'), _this.editWindow()],
      fType: 'row'
    };

    row = dom.create(row);

    Sortable.create(row, {
      animation: 150,
      fallbackClass: 'column-moving',
      forceFallback: true,
      group: { name: 'rows', pull: true, put: ['rows'] },
      sort: true,
      draggable: '.stage-column',
      handle: '.column-handle',
      // filter: '.group-actions',
      onRemove: _this.onRemove,
      onAdd: _this.onAdd,
      onMove: _this.onMove,
      onSort: _this.onSort
    });

    return row;
  }

  editWindow() {
    let _this = this,

      editWindow = {
        tag: 'div',
        className: 'row-edit group-config'
      },
      fieldsetLabel = {
        tag: 'label',
        content: i18n.get('row.settings.fieldsetWrap')
      },
      fieldsetInput = {
        tag: 'input',
        id: _this.rowID + '-fieldset',
        attrs: {
          type: 'checkbox',
          ariaLabel: i18n.get('row.settings.fieldsetWrap.aria')
        },
        action: {
          change: (e) => {
            console.log(e);
          }
        },
        config: {
          label: ' Fieldset',
          noWrap: true
        }
      },
      // fieldsetAddon = Object.assign({}, fieldsetLabel, { content: [fieldsetInput, ' Fieldset'] }),
      // fieldsetAddon = Object.assign({}, fieldsetLabel, { content: [fieldsetInput, ' Fieldset'] }),
      inputAddon = {
        tag: 'span',
        className: 'input-group-addon',
        content: fieldsetInput
      },
      legendInput = {
        tag: 'input',
        attrs: { type: 'text', ariaLabel: 'Legend for fieldset', placeholder: 'Legend' },
        className: 'form-control'
      },
      fieldsetInputGroup = {
        tag: 'div',
        className: 'input-group',
        content: [inputAddon, legendInput]
      },
      fieldSetControls = dom.formGroup([fieldsetLabel, fieldsetInputGroup]),
      columnSettingsLabel = Object.assign({}, fieldsetLabel, { content: 'Define column widths' }),
      columnSettingsPresetLabel = Object.assign({}, fieldsetLabel, { content: 'Layout Preset', className: 'col-sm-2 form-control-label' });
    let columnSettingsPresetSelect = {
        tag: 'div',
        className: 'col-sm-10',
        content: dom.columnPresetControl(_this.rowID)
      },
      columnSettingsPreset = dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], 'row');

    editWindow.content = [fieldSetControls, '<hr>', columnSettingsLabel, columnSettingsPreset];

    return editWindow;
  }

  onMove(evt) {

  }

  onSort(evt) {
    // console.log('onSort', evt);
    data.save('columns', evt.target.id);
  }

  onRemove(evt) {
    console.log('onRemove', evt);
    let row = evt.from,
      columns = row.querySelectorAll('.stage-column');
    if (!columns.length) {
      dom.remove(row);
      data.saveRowOrder();
      data.save('rows');
    } else if (columns.length === 1) {
      columns[0].style.float = 'none';
    }

    dom.columnWidths(row);
    dom.updateColumnPreset(evt.target);
    data.save('columns', row.id);
  }

  onAdd(evt) {
    console.log('onAdd', evt);
    let column = dataMap.columns[evt.item.id];
    column.parent = evt.target.id;
    dom.columnWidths(evt.target);
    data.saveRowOrder(evt.target);
    data.saveColumnOrder(evt.target);
    dom.updateColumnPreset(evt.target);
    data.save('columns', evt.target.id);
  }

  columnWidth() {

  }

}
