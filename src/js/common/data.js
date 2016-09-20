'use strict';
import events from './events';
import helpers from './helpers';

// Object map of fields on the stage
var _data = {},
  dataMap = {
    stage: {},
    rows: {},
    columns: {},
    fields: {}
  };

// Registered fields are the fields that are configured on init. This variable acts as a data buffer
// thats contains the configurations for a field's final view.
var registeredFields = {};

var data = {
  init: (opts, formData) => {
    _data.opts = Object.assign({}, opts);
    let processFormData = (formData) => {
      _data.formData = (typeof formData === 'string') ? window.JSON.parse(formData) : formData;
      _data.formData.id = formData.id || _data.opts.formID || helpers.uuid();

      events.formeoUpdated = new CustomEvent('formeoUpdated', {
        detail: {
          formData: _data.formData
        }
      });

      data.loadMap();
    };

    if (formData) {
      processFormData(formData);
    } else if (window.sessionStorage) {
      formData = window.sessionStorage.getItem('formData');
      if (formData) {
        processFormData(formData);
      } else {
        _data.formData = {};
      }
    } else {
      _data.formData = {};
    }

    _data.formData.id = _data.opts.formID || helpers.uuid();
    _data.opts.formID = _data.formData.id;

    return data;
  },

  saveColumnOrder: (row) => {
    let columns = row.getElementsByClassName('stage-column');
    let columnOrder = helpers.map(columns, (i) => {
      return columns[i].id;
    });

    dataMap.rows[row.id].columns = columnOrder;

    return columnOrder;
  },

  saveFieldOrder: (column) => {
    let fields = column.getElementsByClassName('stage-field'),
      fieldOrder = helpers.map(fields, (i) => {
        return fields[i].id;
      });

    dataMap.columns[column.id].fields = fieldOrder;

    return fieldOrder;
  },

  saveRowOrder: () => {
    let stage = document.getElementById(_data.formData.id + '-stage'),
      rows = stage.getElementsByClassName('stage-row');
    return dataMap.stage.rows = helpers.map(rows, (rowID) => {
      return rows[rowID].id;
    });
  },

  savePropOrder: (parent) => {
    let props = parent.getElementsByClassName('prop-wrap');
    dataMap.fields[parent.fieldID][parent.editGroup] = helpers.map(props, (i) => {
      return props[i].propData;
    });
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
   * Converts dataMap into formData Object
   * @return {Object} formData JS Object
   */
  saveMap: (group, id) => {
    let map = {
      rows: () => {
        let rows = dataMap.stage.rows;
        _data.formData.rows = [];

        helpers.forEach(rows, (i, rowID) => {
          _data.formData.rows[i] = helpers.clone(dataMap.rows[rowID]);
          // _data.formData.rows[i] = Object.assign({}, dataMap.rows[rowID]);
          _data.formData.rows[i].columns = map.columns(rowID);
        });

        return _data.formData.rows;
      },
      columns: (rowID) => {
        let columns = dataMap.rows[rowID].columns,
          rowLink = data.rowLink(rowID);
        rowLink.columns = [];

        helpers.forEach(columns, (i, columnID) => {
          rowLink.columns[i] = helpers.clone(dataMap.columns[columnID]);
          // rowLink.columns[i] = Object.assign({}, dataMap.columns[columnID]);
          rowLink.columns[i].fields = map.fields(columnID);
        });

        return rowLink.columns;
      },
      fields: (columnID) => {
        let fields = dataMap.columns[columnID].fields,
          columnLink = data.columnLink(columnID);
        columnLink.fields = helpers.map(fields, (i) => {
          return helpers.clone(dataMap.fields[fields[i]]);
        });

        return columnLink.fields;
      },
      field: (fieldID) => {
        let fieldLink = data.fieldLink(fieldID),
          setString = data.fieldSetString(fieldID);
        helpers.set(_data.formData, setString, helpers.clone(dataMap.fields[fieldID]));

        return fieldLink;
      },
      attrs: (fieldID) => {
        let fieldLink = data.fieldLink(fieldID);
        fieldLink.attrs = helpers.clone(dataMap.fields[fieldID].attrs);

        return fieldLink.attrs;
      },
      options: (fieldID) => {
        let fieldLink = data.fieldLink(fieldID);
        fieldLink.options = dataMap.fields[fieldID].options.slice();

        return fieldLink.options;
      }
    };

    return map[group](id);
  },

  // returns index of row in formData
  rowIndex: (rowID) => {
    return dataMap.stage.rows.indexOf(rowID);
  },

  // returns index of column in formData
  columnIndex: (columnID) => {
    let column = dataMap.columns[columnID];
    return dataMap.rows[column.parent].columns.indexOf(columnID);
  },

  // returns index of field in formData
  fieldIndex: (fieldID) => {
    let field = dataMap.fields[fieldID];
    return dataMap.columns[field.parent].fields.indexOf(fieldID);
  },

  /**
   * Return a map to fieldData in formData
   * @param  {String} fieldID
   * @return {Object}         fieldData
   */
  fieldIndexMap: (fieldID) => {
    let field = dataMap.fields[fieldID],
      column = dataMap.columns[field.parent],
      row = dataMap.rows[column.parent],
      rowIndex = data.rowIndex(row.id),
      columnIndex = data.columnIndex(column.id),
      fieldIndex = data.fieldIndex(fieldID);

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
    let indexMap = data.fieldIndexMap(fieldID),
      setString = '';

    for (var prop in indexMap) {
      if (indexMap.hasOwnProperty(prop)) {
        setString += `${prop}[${indexMap[prop]}].`;
      }
    }

    return setString.substring(0, setString.length - 1);
  },

  // Provides a reference to a field in formData
  fieldLink: (fieldID) => {
    let field = dataMap.fields[fieldID],
      column = dataMap.columns[field.parent],
      row = dataMap.rows[column.parent],
      rowIndex = data.rowIndex(row.id),
      columnIndex = data.columnIndex(column.id),
      fieldIndex = data.fieldIndex(fieldID);

    return _data.formData.rows[rowIndex].columns[columnIndex].fields[fieldIndex];
  },

  // Provides a map to a column in formData
  columnLink: (columnID) => {
    let row = dataMap.rows[dataMap.columns[columnID].parent],
      columnIndex = row.columns.indexOf(columnID),
      rowIndex = dataMap.stage.rows.indexOf(row.id);
    return _data.formData.rows[rowIndex].columns[columnIndex];
  },

  // Provides a map to a row in formData
  rowLink: (rowID) => {
    let rowIndex = dataMap.stage.rows.indexOf(rowID);
    return _data.formData.rows[rowIndex];
  },

  loadMap: () => {
    let map = {
      rows: () => {
        let formData = helpers.copyObj(_data.formData);
        // map column ids to rows
        dataMap.stage.rows = helpers.map(formData.rows, (i) => {
          let formDataRow = formData.rows[i],
            rowID = formDataRow.id;
          dataMap.rows[rowID] = formDataRow;
          map.columns(formDataRow);
          return rowID;
        });
      },
      columns: (formDataRow) => {
        // map column ids to rows
        dataMap.rows[formDataRow.id].columns = helpers.map(formDataRow.columns, (i) => {
          let formDataColumn = formDataRow.columns[i],
            columnID = formDataColumn.id;
          dataMap.columns[columnID] = formDataColumn;
          map.fields(formDataColumn);
          return columnID;
        });
      },
      fields: (formDataColumn) => {
        dataMap.columns[formDataColumn.id].fields = helpers.map(formDataColumn.fields, (i) => {
          let formDataField = formDataColumn.fields[i],
            fieldID = formDataField.id;
          dataMap.fields[fieldID] = formDataField;
          return fieldID;
        });
      }
    };

    map.rows();
  },

  jsonSave: (group, id) => {
    let stage = document.getElementById(_data.formData.id + '-stage');
    data.saveMap(group, id);
    stage.classList.toggle('stage-empty', (dataMap.stage.rows.length === 0));
    return _data.formData;
  },

  save: (group = 'rows', id) => {
    var doSave = {
      // xml: _this.xmlSave,
      json: data.jsonSave
    };

    doSave[_data.opts.dataType](group, id);

    if (window.sessionStorage) {
      window.sessionStorage.setItem('formData', window.JSON.stringify(_data.formData));
    }

    if (_data.opts.debug) {
      console.log('Saved: ' + group);
    }

    return _data.formData;
  },

  get: () => {
    return _data.formData;
  }
};

export {
  data,
  dataMap,
  registeredFields
};
