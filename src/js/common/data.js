'use strict'
import events from './events'
import h from './helpers'
import dom from './dom'
import { mapToObj, objToMap, uuid, remove } from './utils'
// Object map of fields on the stage
const _data = {}
let formData

// Registered fields are the fields that are configured on init.
// This variable acts as a data buffer thats contains
// the configurations for a field's final view.
const registeredFields = {}

const sessionFormData = () => {
  if (window.sessionStorage && _data.opts.sessionStorage) {
    const sessionFormData = window.sessionStorage.getItem('formData')
    console.log(sessionFormData)
    return sessionFormData
  }
}

const data = {
  init: (opts, userFormData) => {
    const defaultFormData = {
      id: uuid(),
      settings: new Map(),
      stages: new Map(),
      rows: new Map(),
      columns: new Map(),
      fields: new Map(),
    }
    _data.opts = opts
    const _formData = userFormData || sessionFormData() || defaultFormData
    const processFormData = data => {
      if (typeof data === 'string') {
        data = window.JSON.parse(data)
      }

      formData = objToMap(Object.assign({}, defaultFormData, data))
      return formData
    }

    return processFormData(_formData)
  },

  saveColumnOrder: row => {
    const columns = row.getElementsByClassName('stage-columns')
    const columnOrder = h.map(columns, i => columns[i].id)
    h.getIn(formData, ['rows', row.id]).columns = columnOrder

    return columnOrder
  },

  saveFieldOrder: column => {
    const fields = column.getElementsByClassName('stage-fields')
    const fieldOrder = h.map(fields, i => fields[i].id)

    h.getIn(formData, ['columns', column.id]).fields = fieldOrder

    return fieldOrder
  },

  saveRowOrder: stage => {
    if (!stage) {
      stage = dom.activeStage
    }
    const stageRows = h.getIn(formData, ['stages', stage.id]).rows
    const oldValue = stageRows.slice()
    const rows = stage.getElementsByClassName('stage-rows')
    const rowOrder = h.map(rows, rowId => rows[rowId].id)
    stageRows.rows = rowOrder
    events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
      data: {
        updateType: 'sort',
        changed: 'rows',
        oldValue,
        newValue: rowOrder,
      },
    })
    document.dispatchEvent(events.formeoUpdated)
    return rowOrder
  },

  saveOptionOrder: parent => {
    const props = parent.getElementsByClassName('prop-wrap')
    const propData = h.map(props, i => {
      return props[i].propData
    })
    const fieldData = formData.fields.get(parent.fieldId)
    fieldData[parent.editGroup] = propData
    return propData
  },

  saveOrder: (group, parent) => {
    const saveOrder = {
      row: data.saveRowOrder,
      column: data.saveColumnOrder,
      field: data.saveFieldOrder,
      options: data.saveOptionOrder,
    }

    return saveOrder[group](parent)
  },

  /**
   * Formeo save functions
   * @param  {String} group [description]
   * @param  {String} id    [description]
   * @return {[type]}       [description]
   */
  saveType: (group, id) => {
    const map = {
      settings: () => {
        // let stage = formData.stages.settings;
        // formData.settings = [];

        // h.forEach(stage, (i, rowId) => {
        //   formData.rows[i] = h.clone(formData.rows[rowId]);
        // formData.rows[i] = Object.assign({}, formData.rows[rowId]);
        //   formData.rows[i].columns = map.columns(rowId);
        // });

        return formData.get('settings')
      },
      stages: () => {
        // data.saveRowOrder();
      },
      rows: () => {
        return formData.get('rows')
      },
      columns: rowId => {
        return formData.get('columns')
      },
      fields: columnId => {
        return formData.get('fields')
      },
      field: fieldId => h.getIn(formData, ['fields', fieldId]),
      attrs: attrUL => {
        const fieldData = h.getIn(formData, ['fields', attrUL.fieldId])
        const attrValues = fieldData.attrs
        events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
          data: {
            changed: 'field.attrs',
            updateType: 'update',
            attrValues,
          },
        })

        document.dispatchEvent(events.formeoUpdated)

        return attrValues
      },
      options: optionUL => {
        const oldValue = h.getIn(formData, ['fields', optionUL.fieldId]).options
        const newValue = data.saveOrder('options', optionUL)
        events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
          data: {
            changed: 'field.options',
            updateType: 'sort',
            oldValue,
            newValue,
          },
        })
        document.dispatchEvent(events.formeoUpdated)

        return newValue
      },
    }

    return map[group](id)
  },

  /**
   * Empties the data register for an element
   * and its children
   * @param  {String} type [description]
   * @param  {String} id   [description]
   * @return {Object}      [description]
   */
  empty: (type, id) => {
    const removed = {}
    const emptyType = {
      stages: id => {
        if (!id) {
          id = dom.activeStage.id
        }
        const stageData = formData.stages.get(id)
        const rows = stageData.rows
        removed.rows = rows.map(rowId => {
          emptyType['rows'](rowId)
          formData.rows.delete(rowId)
          return rowId
        })
        stageData.rows = []
      },
      rows: id => {
        const row = formData.rows.get(id)
        if (row) {
          let columns = row.columns
          removed.columns = columns.map(columnId => {
            emptyType['columns'](columnId)
            formData.get('columns').delete(columnId)
            return columnId
          })
          columns = []
        }
      },
      columns: id => {
        const column = h.getIn(formData, ['columns', id])
        if (column) {
          let fields = column.fields
          removed.fields = fields.map(fieldId => {
            formData.fields.delete(fieldId)
            return fieldId
          })
          fields = []
        }
      },
      fields: id => {
        let field = dom.fields.get(id)
        if (field) {
          field = field.field
          const column = h.getIn(formData, ['columns', field.parentElement.id])
          const oldValue = column.fields.slice()
          remove(column.fields, id)
          events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
            data: {
              updateType: 'removed',
              changed: 'column.fields',
              oldValue,
              newValue: column.fields,
            },
          })
          document.dispatchEvent(events.formeoUpdated)
        }
      },
    }

    emptyType[type](id)
    return removed
  },

  saveThrottle: false,
  saveThrottled: false,

  save: (group = 'stages', id, disableThrottle = false) => {
    if (disableThrottle) {
      data.saveThrottle = disableThrottle
    }
    const doSave = function() {
      data.saveType(group, id)
      const storage = window.sessionStorage

      if (storage && _data.opts.sessionStorage) {
        storage.setItem('formData', data.json)
      }

      if (_data.opts.debug) {
        console.log('Saved: ' + group)
      }

      events.formeoSaved = new window.CustomEvent('formeoSaved', {
        detail: {
          formData: data.js,
        },
      })

      document.dispatchEvent(events.formeoSaved)
      return formData
    }

    if (!data.saveThrottle) {
      doSave()
      data.saveThrottle = true
      setTimeout(() => {
        if (data.saveThrottled) {
          doSave()
          data.saveThrottled = false
        }
        data.saveThrottle = false
      }, 500)
    } else {
      data.saveThrottled = true
    }

    return formData
  },

  get js() {
    return mapToObj(formData)
  },

  get prepData() {
    const jsData = data.js
    console.log(data.js)
    // @todo, remember why I wanted to stringify DOM actions
    // Object.keys(jsData).forEach(type => {
    //   Object.keys(jsData[type]).forEach(entKey => {
    //     const entity = jsData[type][entKey]
    //     console.log(entity)
    //     if (entity.action) {
    //       Object.keys(entity.action).forEach(fn => {
    //         entity.action[fn] = entity.action[fn].toString()
    //       })
    //     }
    //   })
    // })
    return jsData
  },

  /**
   * getter method for JSON formData
   * @return {JSON} formData
   */
  get json() {
    return window.JSON.stringify(data.prepData, null, '\t')
  },
}

export { data, formData, registeredFields }
