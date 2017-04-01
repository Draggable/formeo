'use strict';
import events from './events';
import h from './helpers';
import dom from './dom';
import {
  strMapToObj,
  objToStrMap,
  uuid,
  remove
} from './utils';
// Object map of fields on the stage
const _data = {};
let formData;

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
    let oldValue = formData.stages.get(stage.id).rows.slice();
    let rows = stage.getElementsByClassName('stage-rows');
    let rowOrder = h.map(rows, rowID => rows[rowID].id);
    formData.stages.get(stage.id).rows = rowOrder;
    new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'sort',
        changed: 'rows',
        oldValue,
        newValue: rowOrder
      }
    });
    document.dispatchEvent(events.formeoUpdated);
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
        // data.saveRowOrder();
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
      attrs: attrUL => {
        const fieldData = formData.fields.get(attrUL.fieldID);
        let attrValues = fieldData.attrs;
        events.formeoUpdated = new CustomEvent('formeoUpdated', {
          data: {
            changed: 'field.attrs',
            updateType: 'update',
            attrValues
          }
        });

        document.dispatchEvent(events.formeoUpdated);

        return attrValues;
      },
      options: optionUL => {
        let oldValue = formData.fields.get(optionUL.fieldID).options;
        let newValue = data.saveOrder('options', optionUL);
        events.formeoUpdated = new CustomEvent('formeoUpdated', {
          data: {
            changed: 'field.options',
            updateType: 'sort',
            oldValue,
            newValue
          }
        });
        document.dispatchEvent(events.formeoUpdated);

        return newValue;
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
      },
      fields: id => {
        let field = dom.fields.get(id);
        if (field) {
          field = field.field;
          let column = formData.columns.get(field.parentElement.id);
          let oldValue = column.fields.slice();
          remove(column.fields, id);
          events.formeoUpdated = new CustomEvent('formeoUpdated', {
            data: {
              updateType: 'removed',
              changed: 'column.fields',
              oldValue,
              newValue: column.fields
            }
          });
          document.dispatchEvent(events.formeoUpdated);
        }
      }
    };

    emptyType[type](id);
    return removed;
  },

  saveThrottle: false,
  saveThrottled: false,

  save: (group = 'stages', id, disableThrottle = false) => {
    if (disableThrottle) {
      data.saveThrottle = disableThrottle;
    }
    const doSave = function() {
      data.saveType(group, id);
      const storage = window.sessionStorage;

      if (storage && _data.opts.sessionStorage) {
        storage.setItem('formData', data.json);
      }

      if (_data.opts.debug) {
        console.log('Saved: ' + group);
      }

      events.formeoSaved = new CustomEvent('formeoSaved', {
        detail: {
          formData: data.js
        }
      });

      document.dispatchEvent(events.formeoSaved);
      return formData;
    };

    if (!data.saveThrottle) {
      doSave();
      data.saveThrottle = true;
      setTimeout(() => {
        if (data.saveThrottled) {
          doSave();
          data.saveThrottled = false;
        }
        data.saveThrottle = false;
      }, 500);
    } else {
      data.saveThrottled = true;
    }

    return formData;
  },

  get js() {
    let jsData = {};

    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        jsData[key] = formData[key];
      } else {
        jsData[key] = strMapToObj(formData[key]);
      }
    });
    return jsData;
  },

  get prepData() {
    let jsData = data.js;
    Object.keys(jsData).forEach(type => {
      Object.keys(jsData[type]).forEach(entKey => {
        let entity = jsData[type][entKey];
        if (entity.action) {
          Object.keys(entity.action).forEach(fn => {
            entity.action[fn] = entity.action[fn].toString();
          });
        }
      });
    });
    return jsData;
  },

  /**
   * getter method for JSON formData
   * @return {JSON} formData
   */
  get json() {
    let preppedData = data.prepData;

    return window.JSON.stringify(preppedData, null, '\t');
  }
};

export {
  data,
  formData,
  registeredFields
};
