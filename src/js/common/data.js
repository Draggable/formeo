'use strict';
import events from './events';
import h from './helpers';

// Object map of fields on the stage
const _data = {};
let formData;

// Registered fields are the fields that are configured on init.
// This variable acts as a data buffer thats contains
// the configurations for a field's final view.
let registeredFields = {};

let data = {
  init: (opts, userFormData) => {
    _data.formData = {
      id: h.uuid(),
      settings: {},
      stages: {},
      rows: {},
      columns: {},
      fields: {}
    };
    _data.opts = Object.assign({}, opts);
    let processFormData = data => {
      if (typeof data === 'string') {
        data = window.JSON.parse(data);
      }

      _data.formData = data;
      _data.formData.id = data.id || _data.opts.formID || h.uuid();
      formData = _data.formData;
    };

    if (userFormData) {
      processFormData(userFormData);
    } else if (window.sessionStorage && _data.opts.sessionStorage) {
      let sessionFormData = window.sessionStorage.getItem('formData');
      if (sessionFormData) {
        processFormData(sessionFormData);
      }
    }

    if (!formData) {
      formData = _data.formData;
    }

    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      detail: {
        formData: _data.formData
      }
    });

    return formData;
  },

  saveColumnOrder: (row) => {
    let columns = row.getElementsByClassName('stage-column');
    let columnOrder = h.map(columns, (i) => {
      return columns[i].id;
    });

    formData.rows[row.id].columns = columnOrder;

    return columnOrder;
  },

  saveFieldOrder: (column) => {
    let fields = column.getElementsByClassName('stage-field');
    let fieldOrder = h.map(fields, (i) => {
      return fields[i].id;
    });

    formData.columns[column.id].fields = fieldOrder;

    return fieldOrder;
  },

  saveRowOrder: () => {
    let stage = document.getElementById(_data.formData.id + '-stage');
    let rows = stage.getElementsByClassName('stage-row');
    return formData.stages.rows = h.map(rows, rowID => rows[rowID].id);
  },

  savePropOrder: parent => {
    let props = parent.getElementsByClassName('prop-wrap');
    let fieldData = formData.fields[parent.fieldID];
    fieldData[parent.editGroup] = h.map(props, i => props[i].propData);
  },

  saveOrder: (group, parent) => {
    let saveOrder = {
      row: data.saveRowOrder,
      column: data.saveColumnOrder,
      field: data.saveFieldOrder,
      options: data.savePropOrder
    };

    return saveOrder[group](parent);
  },

  // getColumnData: (row) => {
  //   let columns = row.getElementsByClassName('stage-column'),
  //     allColumnData = [];
  //   Array.prototype.forEach.call(columns, function(column) {
  //     let columnData = {
  //       id: column.id,
  //       fields: column.getElementsByClassName('stage-field')
  //     };
  //     allColumnData.push(columnData);
  //   });
  //   return allColumnData;
  // },


  /**
   * Formeo save functions
   * @param  {String} group [description]
   * @param  {String} id    [description]
   * @return {[type]}       [description]
   */
  saveType: (group, id) => {
    let map = {
      settings: () => {
        let stage = formData.stages.settings;
        _data.formData.settings = [];

        h.forEach(stage, (i, rowID) => {
          _data.formData.rows[i] = h.clone(formData.rows[rowID]);
          // _data.formData.rows[i] = Object.assign({}, formData.rows[rowID]);
          _data.formData.rows[i].columns = map.columns(rowID);
        });

        return _data.formData.settings;
      },
      rows: () => {
        _data.saveRowOrder();
        return _data.formData.rows;
      },
      columns: rowID => {
        return h.clone(formData.rows[rowID].columns);
      },
      fields: columnID => {
        return h.clone(formData.columns[columnID].fields);
      },
      field: fieldID => {
        let fieldLink = data.fieldLink(fieldID);
        let setString = data.fieldSetString(fieldID);
        h.set(_data.formData, setString, h.clone(formData.fields[fieldID]));

        return fieldLink;
      },
      attrs: fieldID => {
        let fieldLink = data.fieldLink(fieldID);
        fieldLink.attrs = h.clone(formData.fields[fieldID].attrs);

        return fieldLink.attrs;
      },
      options: fieldID => {
        let fieldLink = data.fieldLink(fieldID);
        fieldLink.options = formData.fields[fieldID].options.slice();

        return fieldLink.options;
      }
    };

    return map[group](id);
  },

  // returns index of row in formData
  rowIndex: rowID => {
    return formData.stages.rows.indexOf(rowID);
  },

  // returns index of column in formData
  columnIndex: columnID => {
    let column = formData.columns[columnID];
    return formData.rows[column.parent].columns.indexOf(columnID);
  },

  // returns index of field in formData
  fieldIndex: fieldID => {
    let field = formData.fields[fieldID];
    return formData.columns[field.parent].fields.indexOf(fieldID);
  },

  /**
   * Return a map to fieldData in formData
   * @param  {String} fieldID
   * @return {Object}         fieldData
   */
  fieldIndexMap: (fieldID) => {
    let field = formData.fields[fieldID];
    let column = formData.columns[field.parent];
    let row = formData.rows[column.parent];
    let rowIndex = data.rowIndex(row.id);
    let columnIndex = data.columnIndex(column.id);
    let fieldIndex = data.fieldIndex(fieldID);

    return {
      rows: rowIndex,
      columns: columnIndex,
      fields: fieldIndex
    };
  },

  /**
   * Returns a setString
   * @param  {String} fieldID
   * @return {String}
   */
  fieldSetString: (fieldID) => {
    let indexMap = data.fieldIndexMap(fieldID);
    let setString = '';

    for (let prop in indexMap) {
      if (indexMap.hasOwnProperty(prop)) {
        setString += `${prop}[${indexMap[prop]}].`;
      }
    }

    return setString.substring(0, setString.length - 1);
  },

  // Provides a reference to a field in formData
  fieldLink: (fieldID) => {
      let field = formData.fields[fieldID];
      let column = formData.columns[field.parent];
      let row = formData.rows[column.parent];
      let rowIndex = data.rowIndex(row.id);
      let columnIndex = data.columnIndex(column.id);
      let fieldIndex = data.fieldIndex(fieldID);
      let rowData = _data.formData.rows[rowIndex];

    return rowData.columns[columnIndex].fields[fieldIndex];
  },

  // Provides a map to a column in formData
  columnLink: (columnID) => {
    let row = formData.rows[formData.columns[columnID].parent];
    let columnIndex = row.columns.indexOf(columnID);
    let rowIndex = formData.stages.rows.indexOf(row.id);
    return _data.formData.rows[rowIndex].columns[columnIndex];
  },

  // Provides a map to a row in formData
  rowLink: (rowID) => {
    let rowIndex = formData.stages.rows.indexOf(rowID);
    return _data.formData.rows[rowIndex];
  },

  jsonSave: (group, id) => {
    let stage = document.getElementById(_data.formData.id + '-stage');
    data.saveType(group, id);
    _data.formData = h.clone(formData);

    // stage.classList.toggle('stage-empty', (formData.rows.length === 0));
    return _data.formData;
  },

  save: (group = 'rows', id) => {
    let doSave = {
      // xml: _this.xmlSave,
      json: data.jsonSave
    };
    const storage = window.sessionStorage;
    const stringify = window.JSON.stringify;

    doSave[_data.opts.dataType](group, id);

    if (storage && _data.opts.sessionStorage) {
      // console.log('session.setItem');
      storage.setItem('formData', stringify(_data.formData));
    }

    if (_data.opts.debug) {
      console.log('Saved: ' + group);
    }

    // Shouldn't be the case? because every time
    // save is called there should be some formData update, right?
    document.dispatchEvent(events.formeoUpdated);
    return _data.formData;
  },

  get: () => {
    return _data.formData;
  }
};

export {
  data,
  formData,
  registeredFields
};
