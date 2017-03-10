'use strict';
import events from './events';
import h from './helpers';
import dom from './dom';

// Object map of fields on the stage
const _data = {};
let formData;
let update;

// Registered fields are the fields that are configured on init.
// This variable acts as a data buffer thats contains
// the configurations for a field's final view.
let registeredFields = {};

let data = {
  init: (opts, userFormData) => {
    let defaultFormData = {
      id: h.uuid(),
      settings: {},
      stages: {},
      rows: {},
      columns: {},
      fields: {}
    };
    _data.opts = opts;
    let processFormData = data => {
      if (typeof data === 'string') {
        data = window.JSON.parse(data);
      }


      let id = data.id || h.uuid();

      formData = Object.assign({}, defaultFormData, {id}, data);
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
      formData = defaultFormData;
    }

    events.formeoUpdated = new CustomEvent('formeoUpdated', update);
    events.formeoUpdated.data = update;

    return formData;
  },

  saveColumnOrder: row => {
    let columns = row.getElementsByClassName('stage-column');
    let columnOrder = h.map(columns, i => columns[i].id);

    formData.rows[row.id].columns = columnOrder;

    return columnOrder;
  },

  saveFieldOrder: column => {
    let fields = column.getElementsByClassName('stage-field');
    let fieldOrder = h.map(fields, (i) => {
      return fields[i].id;
    });

    formData.columns[column.id].fields = fieldOrder;

    return fieldOrder;
  },

  saveRowOrder: () => {
    let stage = dom.activeStage;
    let rows = dom.activeStage.getElementsByClassName('stage-row');
    let rowOrder = h.map(rows, rowID => rows[rowID].id);
    formData.stages[stage.id].rows = rowOrder;
    return rowOrder;
  },

  saveOptionOrder: parent => {
    console.log(parent);
    let props = parent.getElementsByClassName('prop-wrap');
    let propData = h.map(props, i => {
      return props[i].propData;
    });
    formData.fields[parent.fieldID][parent.editGroup] = propData;
    return propData;
  },

  saveOrder: (group, parent) => {
    let saveOrder = {
      row: data.saveRowOrder,
      column: data.saveColumnOrder,
      field: data.saveFieldOrder,
      options: data.saveOptionOrder
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
        formData.settings = [];

        h.forEach(stage, (i, rowID) => {
          formData.rows[i] = h.clone(formData.rows[rowID]);
          // formData.rows[i] = Object.assign({}, formData.rows[rowID]);
          formData.rows[i].columns = map.columns(rowID);
        });

        return formData.settings;
      },
      rows: () => {
        data.saveRowOrder();
        return formData.rows;
      },
      columns: rowID => {
        return formData.columns;
      },
      fields: columnID => {
        return formData.fields;
      },
      field: fieldID => {
        return formData.fields[fieldID];
      },
      attrs: fieldID => {
        return formData.fields[fieldID].attrs;
      },
      options: optionUL => {
        events.formeoUpdated.data = {
          changed: 'options',
          oldValue: formData.fields[optionUL.fieldID].options,
          newValue: data.saveOrder('options', optionUL)
        };
        document.dispatchEvent(events.formeoUpdated);

        return update;
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
  fieldSetString: fieldID => {
    let indexMap = data.fieldIndexMap(fieldID);
    let setString = '';

    for (let prop in indexMap) {
      if (indexMap.hasOwnProperty(prop)) {
        setString += `${prop}[${indexMap[prop]}].`;
      }
    }

    return setString.substring(0, setString.length - 1);
  },

  // Empties the data register for an element
  // and its children
  empty: (type, id) => {
    let removed = {};
    const emptyType = {
      stage: id => {
        let rows = formData.stages[id].rows;
        removed.rows = rows.map(rowID => {
          emptyType['row'](rowID);
          delete formData.rows[rowID];
          return rowID;
        });
      },
      row: id => {
        let columns = formData.rows[id].columns;
        removed.columns = columns.map(columnID => {
          emptyType['column'](columnID);
          delete formData.columns[columnID];
          return columnID;
        });
      },
      column: id => {
        let fields = formData.columns[id].fields;
        removed.fields = fields.map(fieldID => {
          delete formData.fields[fieldID];
          return fieldID;
        });
      }
    };

    emptyType[type](id);
    return removed;
  },

  jsonSave: (group, id) => {
    data.saveType(group, id);
    formData = h.clone(formData);
    let noData = (Object.entries(formData.rows) === 0);

    dom.activeStage.classList.toggle('stage-empty', noData);
    return formData;
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
      storage.setItem('formData', stringify(formData));
    }

    if (_data.opts.debug) {
      console.log('Saved: ' + group);
    }

    // Shouldn't be the case? because every time
    // save is called there should be some formData update, right?
    // document.dispatchEvent(events.formeoUpdated);
    return formData;
  },

  get: () => {
    return formData;
  }
};

export {
  data,
  formData,
  registeredFields
};
