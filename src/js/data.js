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

    if (formData) {
      _data.formData = (typeof formData === 'string') ? JSON.parse(formData) : formData;
      _data.formData.id = formData.id || _data.opts.formID || helpers.uuid();
      data.loadMap();
    } else {
      _data.formData = {};
    }
    _data.formData.id = _data.opts.formID || helpers.uuid();
    _data.opts.formID = _data.formData.id;

    return data;
  },

  saveColumnOrder: (row) => {
    let columns = row.getElementsByClassName('stage-column');

    return dataMap.rows[row.id].columns = helpers.map(columns, (i) => {
      return columns[i].id;
    });
  },

  saveRowOrder: (row) => {
    let rows = row.parentElement.getElementsByClassName('stage-row');
    return dataMap.stage.rows = helpers.map(rows, (rowID) => {
      return rows[rowID].id;
    });
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

  jsonSave: (stage) => {
    stage.classList.toggle('stage-empty', (dataMap.stage.rows.length === 0));
    _data.formData.rows = data.saveMap();
    return _data.formData;
  },

  saveMap: () => {
    let map = {
      rows: (stage) => {
        return helpers.map(stage.rows, (i) => {
          let rowID = stage.rows[i],
            row = dataMap.rows[rowID];
          row.id = rowID;
          return Object.assign({}, row, {
            columns: map.columns(rowID)
          });
        });
      },
      columns: (rowID) => {
        let columns = dataMap.rows[rowID].columns;
        return helpers.map(columns, (i) => {
          let columnID = columns[i],
            column = dataMap.columns[columnID];
          column.id = columnID;
          return Object.assign({}, column, {
            fields: map.fields(columnID)
          });
        });
      },
      fields: (columnID) => {
        let fields = dataMap.columns[columnID].fields;
        return helpers.map(fields, (i) => {
          let fieldID = fields[i],
            field = dataMap.fields[fieldID];
          field.id = fieldID;
          return field;
        });
      }
    };
    return map.rows(dataMap.stage);
  },

  loadMap: () => {
    let map = {
      rows: () => {
        // map column ids to rows
        dataMap.stage.rows = helpers.map(_data.formData.rows, (i) => {
          let formDataRow = _data.formData.rows[i],
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

  save: () => {
    var stage = document.getElementById(_data.formData.id + '-stage');
    let doSave = {
      // xml: _this.xmlSave,
      json: data.jsonSave
    };

    // console.log(JSON.stringify(_data.formData));

    //trigger formSaved event
    document.dispatchEvent(events.formeoUpdate);
    // document.dispatchEvent(formBuilder.events.formSaved);
    return doSave[_data.opts.dataType](stage);
  },

  get: () => {
    return _data.formData;
  }
};

events.formeoUpdate = new CustomEvent('formeoUpdate', {
  detail: {
    formData: _data.formData
  }
});

export {
  data,
  dataMap,
  registeredFields
};
