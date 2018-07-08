import { uuid, objToMap, mapToObj } from '../common/utils'

const mergeFieldData = fieldData => {
  const defaultFieldData = {
    // config: {},
    // fields: [],
  }
  return objToMap(Object.assign({}, defaultFieldData, fieldData))
}

export const fields = new Map()

export default Object.create(null, {
  js: {
    get() {
      return mapToObj(fields)
    },
  },
  add: {
    value: (fieldData = {}) => {
      const { id } = fieldData
      const fieldId = id || uuid()
      fields.set(fieldId, mergeFieldData(fieldData))
      return fieldId
    },
  },
  get: {
    value: fieldId => fields.get(fieldId),
  },
})
