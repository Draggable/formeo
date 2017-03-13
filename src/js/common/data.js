'use strict';
import events from './events';
import h from './helpers';
import dom from './dom';
import {strMapToObj, objToStrMap, uuid} from './utils';
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
      id: uuid(),
      settings: new Map(),
      stages: new Map(),
      rows: new Map(),
      columns: new Map(),
      fields: new Map()
    };
    _data.opts = opts;
    let processFormData = data => {
      if (typeof data === 'string') {
        data = window.JSON.parse(data);
      }

      data.settings = objToStrMap(data.settings);
      data.stages = objToStrMap(data.stages);
      data.rows = objToStrMap(data.rows);
      data.columns = objToStrMap(data.columns);
      data.fields = objToStrMap(data.fields);

      formData = Object.assign({}, defaultFormData, data);
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
    let columns = row.getElementsByClassName('stage-columns');
    let columnOrder = h.map(columns, i => columns[i].id);
    let rowData = formData.rows.get(row.id);

    rowData.columns = columnOrder;

    return columnOrder;
  },

  saveFieldOrder: column => {
    let fields = column.getElementsByClassName('stage-fields');
    let fieldOrder = h.map(fields, i => fields[i].id);

    formData.columns.get(column.id).fields = fieldOrder;

    return fieldOrder;
  },

  saveRowOrder: stage => {
    if (!stage) {
      stage = dom.activeStage;
    }
    let rows = stage.getElementsByClassName('stage-rows');
    let rowOrder = h.map(rows, rowID => rows[rowID].id);
    formData.stages.get(stage.id).rows = rowOrder;
    return rowOrder;
  },

  saveOptionOrder: parent => {
    let props = parent.getElementsByClassName('prop-wrap');
    let propData = h.map(props, i => {
      return props[i].propData;
    });
    let fieldData = formData.fields.get(parent.fieldID);
    fieldData[parent.editGroup] = propData;
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

  /**
   * Formeo save functions
   * @param  {String} group [description]
   * @param  {String} id    [description]
   * @return {[type]}       [description]
   */
  saveType: (group, id) => {
    let map = {
      settings: () => {
        // let stage = formData.stages.settings;
        // formData.settings = [];

        // h.forEach(stage, (i, rowID) => {
        //   formData.rows[i] = h.clone(formData.rows[rowID]);
          // formData.rows[i] = Object.assign({}, formData.rows[rowID]);
        //   formData.rows[i].columns = map.columns(rowID);
        // });

        return formData.settings;
      },
      stages: () => {
        data.saveRowOrder();
      },
      rows: () => {
        return formData.rows;
      },
      columns: rowID => {
        return formData.columns;
      },
      fields: columnID => {
        return formData.fields;
      },
      field: fieldID => {
        return formData.fields.get(fieldID);
      },
      attrs: fieldID => {
        return formData.fields.get(fieldID).attrs;
      },
      options: optionUL => {
        events.formeoUpdated.data = {
          changed: 'options',
          oldValue: formData.fields.get(optionUL.fieldID).options,
          newValue: data.saveOrder('options', optionUL)
        };
        document.dispatchEvent(events.formeoUpdated);

        return update;
      }
    };

    return map[group](id);
  },

  /**
   * Empties the data register for an element
   * and its children
   * @param  {String} type [description]
   * @param  {String} id   [description]
   * @return {Object}      [description]
   */
  empty: (type, id) => {
    let removed = {};
    const emptyType = {
      stages: id => {
        if (!id) {
          id = dom.activeStage.id;
        }
        let stageData = formData.stages.get(id);
        let rows = stageData.rows;
        removed.rows = rows.map(rowID => {
          emptyType['rows'](rowID);
          formData.rows.delete(rowID);
          return rowID;
        });
        stageData.rows = [];
      },
      rows: id => {
        let row = formData.rows.get(id);
        if (row) {
          let columns = row.columns;
          removed.columns = columns.map(columnID => {
            emptyType['columns'](columnID);
            formData.columns.delete(columnID);
            return columnID;
          });
          columns = [];
        }
      },
      columns: id => {
        let column = formData.columns.get(id);
        if (column) {
          let fields = column.fields;
          removed.fields = fields.map(fieldID => {
            formData.fields.delete(fieldID);
            return fieldID;
          });
          fields = [];
        }
      }
    };

    emptyType[type](id);
    return removed;
  },

  jsonSave: () => {
    let jsonData = {};

    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        jsonData[key] = formData[key];
      } else {
        jsonData[key] = strMapToObj(formData[key]);
      }
    });
    return jsonData;
  },

  save: (group = 'stages', id) => {
    data.saveType(group, id);
    let doSave = {
      json: data.jsonSave
    };
    const storage = window.sessionStorage;
    const stringify = window.JSON.stringify;

    let jsonData = doSave[_data.opts.dataType](group, id);

    if (storage && _data.opts.sessionStorage) {
      storage.setItem('formData', stringify(jsonData));
    }

    if (_data.opts.debug) {
      console.log('Saved: ' + group);
    }

    // toggle empty class if stage(s) have data
    // formData.stages.forEach(stage => {
    //   let stageDom = dom.stages.get(stage.id);
    //   stageDom.classList.toggle('empty-stages', !stage.rows.length);
    // });

    // Shouldn't be the case? because every time
    // save is called there should be some formData update, right?
    // document.dispatchEvent(events.formeoUpdated);
    return formData;
  },

  /**
   * getter method for JSON formData
   * @return {JSON} formData
   */
  get json() {
    return data.jsonSave();
  }
};

export {
  data,
  formData,
  registeredFields
};
