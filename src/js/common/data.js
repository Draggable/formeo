'use strict'
// import { fromJS } from 'immutable'
import events from './events'
import h from './helpers'
import { remove } from './utils'
import FormeoData from '../data'
import Columns from '../components/columns'
import Fields from '../components/fields'
import Stages from '../components/stages'

const formData = {}

// Object map of fields on the stage
const _data = {}
// let formData

const sessionFormData = () => {
  if (window.sessionStorage && _data.opts.sessionStorage) {
    return window.sessionStorage.getItem('formData')
  }
}

const data = {
  init: (opts, userFormData) => {
    _data.opts = opts

    const formData = Object.assign({}, sessionFormData(), userFormData)

    return FormeoData.load(formData)
  },

  // saveRowOrder: stage => {
  //   if (!stage) {
  //     stage = stages.activeStage
  //   }
  //   const rows = stage.getElementsByClassName('stage-rows')
  //   const stageData = stagesData.get(stage.id)
  //   const oldRowOrder = stageData.rows
  //   const newRowOrder = h.map(rows, rowId => rows[rowId].id)
  //   stagesData.set(`${stage.id}.rows`, newRowOrder)
  //   events.formeoUpdated = new window.CustomEvent('formeoUpdated', {
  //     data: {
  //       updateType: 'sort',
  //       changed: 'rows',
  //       oldValue: oldRowOrder,
  //       newValue: newRowOrder,
  //     },
  //   })
  //   document.dispatchEvent(events.formeoUpdated)
  //   return newRowOrder
  // },

  // saveColumnOrder: row => {
  //   const columns = row.getElementsByClassName('stage-columns')
  //   const columnOrder = h.map(columns, i => columns[i].id)
  //   rowsData.set(`${row.id}.columns`, columnOrder)
  //   return columnOrder
  // },

  saveFieldOrder: column => {
    const fields = column.getElementsByClassName('stage-fields')
    const fieldOrder = h.map(fields, i => fields[i].id)
    Columns.set(`${column.id}.fields`, fieldOrder)
    return fieldOrder
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
        return formData.get('stages')
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
      field: fieldId => formData.getIn(['fields', fieldId]),
      attrs: attrUL => {
        const fieldData = formData.getIn(['fields', attrUL.fieldId])
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
        const oldValue = formData.getIn(['fields', optionUL.fieldId]).options
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

    // console.log(group)

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
          id = Stages.activeStage.id
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
        const column = formData.getIn(['columns', id])
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
        let field = Fields.get(id)
        if (field) {
          field = field.field
          const column = formData.getIn(['columns', field.parentElement.id])
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

  save: (group = 'stages', id, disableThrottle = false) => {
    // if (disableThrottle) {
    //   data.saveThrottle = disableThrottle
    // }
    // // const doSave = function() {
    // const formData = data.saveType(group, id)
    // console.log(formData)
    // const storage = window.sessionStorage
    // // const formData =
    // if (storage && _data.opts.sessionStorage) {
    //   storage.setItem('formData', FormeoData.json)
    // }
    // if (_data.opts.debug) {
    //   console.log('Saved: ' + group)
    // }
    // events.formeoSaved = new window.CustomEvent('formeoSaved', {
    //   detail: {
    //     formData: FormeoData.js, // optimize the multiple calls, dont use get so have to explicitly calll
    //   },
    // })
    // document.dispatchEvent(events.formeoSaved)
    // //   return formData
    // // }
    // // if (!data.saveThrottle) {
    // //   doSave()
    // //   data.saveThrottle = true
    // //   setTimeout(() => {
    // //     if (data.saveThrottled) {
    // //       doSave()
    // //       data.saveThrottled = false
    // //     }
    // //     data.saveThrottle = false
    // //   }, 500)
    // // } else {
    // //   data.saveThrottled = true
    // // }
    // return formData
  },
}

export { data, formData }
