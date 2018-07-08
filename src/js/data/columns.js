import { uuid, objToMap, mapToObj } from '../common/utils'

const mergeColumnData = columnData => {
  const defaultColumnData = {
    config: {},
    fields: [],
  }
  return objToMap(Object.assign({}, defaultColumnData, columnData))
}

export const columns = new Map()

export default Object.create(null, {
  js: {
    get() {
      return mapToObj(columns)
    },
  },
  add: {
    value: (columnData = {}) => {
      const { id } = columnData
      const columnId = id || uuid()
      columns.set(columnId, mergeColumnData(columnData))
      return columnId
    },
  },
  get: {
    value: columnId => columns.get(columnId),
  },
})
