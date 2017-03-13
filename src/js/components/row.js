import i18n from 'mi18n';
import Sortable from 'sortablejs';
import dom from '../common/dom';
import h from '../common/helpers';
import {data, formData, registeredFields as rFields} from '../common/data';

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

    let rowID = _this.rowID = dataID || h.uuid();

    defaults = {
        columns: [],
        id: _this.rowID,
        config: {
          fieldset: false, // wrap contents of row in fieldset
          legend: '' // Legend for fieldset
        },
        attrs: {
          className: 'row'
        }
      };

    // _this.rowData = h.extend(defaults, formData.rows[_this.rowID]);
    formData.rows.set(rowID, h.extend(defaults, formData.rows.get(rowID)));

    row = {
      tag: 'li',
      className: 'stage-row empty-rows',
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
      content: [dom.actionButtons(rowID, 'row'), _this.editWindow()],
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
      draggable: '.stage-column',
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
  editWindow() {
    let _this = this;

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
        change: (e) => {
          console.log(e);
        }
      },
      config: {
        label: ' Fieldset',
        noWrap: true
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
    let fieldSetControls = dom.formGroup([fieldsetLabel, fieldsetInputGroup]);
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
      fieldSetControls,
      '<hr>',
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
    console.log(evt);
    // evt.to.classList.remove('empty-row');
    // console.log('dragging column');
  }

  /**
   * [onMove description]
   * @param  {[type]} evt [description]
   */
  onSort(evt) {
    // console.log(evt);
    if (evt.target) {
      data.save('columns', evt.target.id);
      // console.log('onSort', evt);
    }
  }

  /**
   * Handler for removing content from a row
   * @param  {Object} evt
   */
  onRemove(evt) {
    console.log('onRemove', evt);
    let row = evt.from;
    let columns = row.querySelectorAll('.stage-column');
    if (!columns.length) {
      dom.remove(row);
    } else if (columns.length === 1) {
      columns[0].style.float = 'none';
    }

    dom.columnWidths(row);
    dom.updateColumnPreset(evt.target);

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
