import { uuid, objToMap, mapToObj } from '../common/utils'

const mergeRowData = rowData => {
  const defaultRowData = {
    columns: [],
    config: {
      fieldset: false, // wrap contents of row in fieldset
      legend: '', // Legend for fieldset
      inputGroup: false, // is repeatable input-group?
    }
  }
  return objToMap(Object.assign({}, defaultRowData, rowData))
}

export const rows = new Map()

export default Object.create(null, {
  js: {
    get() {
      return mapToObj(rows)
    },
  },
  add: {
    value: (rowData = {}) => {
      const { id } = rowData
      const rowId = id || uuid()
      rows.set(rowId, mergeRowData(rowData))
      return rowId
    },
  },
  get: {
    value: rowId => rows.get(rowId),
  },
})
