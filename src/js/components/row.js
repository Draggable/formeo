import Sortable from 'sortablejs';
import DOM from '../common/dom';
import animate from '../common/animation';
import helpers from '../common/helpers';
import { data, dataMap } from '../common/data';

var dom = new DOM();

var i18n = {
  attributes: 'Attributes',
  attribute: 'Attribute',
  panelLabels: {
    attrs: 'Attrs',
    meta: 'Meta',
    options: 'Options'
  },
  attrs: {
    type: 'Type',
    className: 'Class'
  },
  meta: {
    label: 'Label',
    group: 'Group',
    icon: 'Icon'
  },
  options: 'Options',
  placeholders: {}
};

export default class Row {

  constructor(dataID) {
    let _this = this,
      rowDataDefault,
      editWindow,
      row;

    _this.rowID = dataID || helpers.uuid();

    rowDataDefault = {
        columns: [],
        id: _this.rowID,
        config: {
          fieldset: false, // wrap contents of row in fieldset
          legend: '' // Legend for fieldset
        }
      },
      editWindow = _this.editWindow();

    _this.rowData = helpers.extend(rowDataDefault, dataMap.rows[_this.rowID]);

    row = {
      tag: 'li',
      attrs: {
        className: 'stage-row'
      },
      dataset: {
        hoverTag: 'Row'
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
      content: [dom.actionButtons(_this.rowID, 'row'), editWindow],
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
      // onFilter: function(evt) {
      //   console.log(evt);

      // return false;
      // },
      // filter: '.stage-field'
    });

    // row.rowData = {
    //   save: _this.saveData.bind(_this),
    //   get: _this.data.bind(_this)
    // };

    row.rowData = _this.data;
    dataMap.rows[_this.rowID] = _this.rowData;

    return row;
  }

  editWindow() {
    let _this = this,

      editWindow = {
        tag: 'div',
        className: 'row-edit group-config'
      },
      divider = {
        tag: 'hr'
      },
      fieldsetLabel = {
        tag: 'label',
        content: 'Wrap row in a &lt;fieldset&gt; tag',
      },
      fieldsetInput = {
        tag: 'input',
        attrs: {
          type: 'checkbox',
          ariaLabel: 'Wrap Row in Fieldset'
        }
      },
      fieldsetAddon = Object.assign({}, fieldsetLabel, { content: [fieldsetInput, ' Fieldset'] }),
      inputAddon = {
        tag: 'span',
        className: 'input-group-addon',
        content: fieldsetAddon
      },
      legendInput = Object.assign({}, fieldsetInput, { attrs: { type: 'text', ariaLabel: 'Legend for fieldset', placeholder: 'Legend' }, className: 'form-control' }),
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
        content: dom.columnPresetControl()
      },
      columnSettingsPreset = dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], 'row');

    editWindow.content = [fieldSetControls, divider, columnSettingsLabel, columnSettingsPreset];

    return editWindow;
  }

  get data() {
    return this.rowID;
  }

  onMove(evt) {

  }

  onRemove(evt) {
    let row = evt.from,
      columns = row.querySelectorAll('.stage-column');
    if (!columns.length) {
      dom.remove(row);
    } else if (columns.length === 1) {
      columns[0].style.float = 'none';
    }
    dom.columnWidths(row);
  }

  onAdd(evt) {
    dom.columnWidths(evt.target);
    data.saveColumnOrder(evt.target);
    dom.updateColumnPreset(evt.target);

  }

  columnWidth() {

  }

}
