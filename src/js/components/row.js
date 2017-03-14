import i18n from 'mi18n';
import Sortable from 'sortablejs';
import dom from '../common/dom';
import h from '../common/helpers';
import {data, formData, registeredFields as rFields} from '../common/data';
import {uuid} from '../common/utils';

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
    let _this = this;
    let defaults;
    let row;

    let rowID = _this.rowID = dataID || uuid();

    defaults = {
        columns: [],
        id: _this.rowID,
        config: {
          fieldset: false, // wrap contents of row in fieldset
          legend: '', // Legend for fieldset
          inputGroup: false // is repeatable input-group?
        },
        attrs: {
          className: 'row'
        }
      };

    let rowData = formData.rows.get(rowID);

    formData.rows.set(rowID, h.extend(defaults, rowData));

    row = {
      tag: 'li',
      className: 'stage-rows empty-rows',
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
      id: rowID,
      content: [dom.actionButtons(rowID, 'row'), _this.editWindow],
      fType: 'rows'
    };

    row = dom.create(row);
    dom.rows.set(rowID, row);

    Sortable.create(row, {
      animation: 150,
      fallbackClass: 'column-moving',
      forceFallback: true,
      group: {name: 'rows', pull: true, put: ['rows', 'controls', 'columns']},
      sort: true,
      draggable: '.stage-columns',
      handle: '.column-handle',
      // filter: '.group-actions',
      onRemove: _this.onRemove,
      onAdd: _this.onAdd,
      onMove: _this.onMove,
      onSort: _this.onSort,
      filter: '.layout-control'
    });

    return row;
  }

  /**
   * [editWindow description]
   * @return {[type]} [description]
   */
  get editWindow() {
    let _this = this;
    let rowData = formData.rows.get(_this.rowID);

    let editWindow = {
      tag: 'div',
      className: 'row-edit group-config'
    };
    let fieldsetLabel = {
      tag: 'label',
      content: i18n.get('row.settings.fieldsetWrap')
    };
    let fieldsetInput = {
      tag: 'input',
      id: _this.rowID + '-fieldset',
      attrs: {
        type: 'checkbox',
        ariaLabel: i18n.get('row.settings.fieldsetWrap.aria')
      },
      action: {
        click: e => console.log(e)
      },
      config: {
        label: ' Fieldset',
        noWrap: true
      }
    };

    let inputGroupInput = {
      tag: 'input',
      id: _this.rowID + '-inputGroup',
      attrs: {
        type: 'checkbox',
        checked: rowData.config.inputGroup,
        ariaLabel: i18n.get('row.settings.inputGroup.aria')
      },
      action: {
        click: e => {
          let rowData = formData.rows.get(_this.rowID);
          rowData.config.inputGroup = e.target.checked;
          data.save();
        }
      },
      config: {
        label: 'Make this row an input group.',
        //eslint-disable-next-line
        description: 'Input Groups enable users to add sets of inputs at a time.'
      }
    };

    // let fieldsetAddon = Object.assign({}, fieldsetLabel, {
      // content: [fieldsetInput, ' Fieldset']
    // });
    let inputAddon = {
      tag: 'span',
      className: 'input-group-addon',
      content: fieldsetInput
    };
    let legendInput = {
      tag: 'input',
      attrs: {
        type: 'text',
        ariaLabel: 'Legend for fieldset',
        placeholder: 'Legend'
      },
      className: 'form-control'
    };
    let fieldsetInputGroup = {
      tag: 'div',
      className: 'input-group',
      content: [inputAddon, legendInput]
    };

    let fieldSetControls = [
      fieldsetLabel,
      fieldsetInputGroup
    ];
    fieldSetControls = dom.formGroup(fieldSetControls);
    let columnSettingsLabel = Object.assign({}, fieldsetLabel, {
      content: 'Define column widths'
    });
    let columnSettingsPresetLabel = Object.assign({}, fieldsetLabel, {
      content: 'Layout Preset', className: 'col-sm-2 form-control-label'
    });
    let columnSettingsPresetSelect = {
      tag: 'div',
      className: 'col-sm-10',
      content: dom.columnPresetControl(_this.rowID)
    };
    let formGroupContent = [
      columnSettingsPresetLabel,
      columnSettingsPresetSelect
    ];
    let columnSettingsPreset = dom.formGroup(formGroupContent, 'row');

    editWindow.content = [
      inputGroupInput,
      dom.create('hr'),
      fieldSetControls,
      dom.create('hr'),
      columnSettingsLabel,
      columnSettingsPreset
    ];

    return editWindow;
  }

  /**
   * [onMove description]
   * @param  {[type]} evt [description]
   */
  onMove(evt) {
    // console.log(evt);
  }

  /**
   * [onMove description]
   * @param  {[type]} evt [description]
   */
  onSort(evt) {
    data.saveColumnOrder(evt.target);
    data.save();
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onRemove(evt) {
    dom.columnWidths(evt.from);

    data.save();
  }

  /**
   * Handler for adding content to a row
   * @param  {Object} evt
   */
  onAdd(evt) {
    let {from, item, to} = evt;
    let fromRow = from.fType === 'rows';
    let fromColumn = from.fType === 'columns';
    let fromControls = from.fType === 'controlGroup';
    let column;

    if (fromRow) {
      column = item;
    } else if(fromColumn || fromControls) {
      let meta = h.get(rFields[item.id], 'meta');
      if (meta.group !== 'layout') {
        column = dom.addColumn(to.id);
        dom.addField(column.id, item.id);
      } else if (meta.id === 'layout-column') {
        dom.addColumn(to.id);
      }
    }

    if (fromColumn || fromControls) {
      dom.remove(item);
    }

    data.saveColumnOrder(to);
    dom.updateColumnPreset(to);
    if (fromColumn) {
      dom.updateColumnPreset(from);
    }

    dom.columnWidths(to);
    data.save();
  }

}
