import { settings as _settings } from './settings'
import { stages as _stages } from './stages'
import { rows as _rows } from './rows'
import { columns as _columns } from './columns'
import { fields as _fields } from './fields'
import { uuid, objToMap, mapToObj } from '../common/utils'

// export const methods = {
//   toJSON: shouldFormat => JSON.stringify(formData.toJS(), null, shouldFormat && '\t'),
//   toJS: () => {
//     // console.log(formData.keys())
//     return mapToObj(formData)
//     // return this.keys()
//     // return console.log(args, this)
//   },
//   load: data => {
//     if (typeof data === 'string') {
//       data = JSON.parse(data)
//     }
//     Object.entries(data).forEach(([key, val]) => {
//       if (val instanceof Object && !Array.isArray(val)) {
//         val = objToMap(val)
//       }
//       formData.set(key, val)
//     })
//     return formData
//   },
// }

// export const handler = {
//   get: function(target, key, receiver) {
//     return key in methods ? Reflect.get(methods, key, target) : target[key] || undefined
//   },
//   // toJS: () => console.log(this),
// }

// export const baseHandlers = {
//   getIn: (path, fallback) => path.reduce((acc, part) => this.get(part, fallback), this),
//   setIn: (path, value) => {
//     const key = path.pop()
//     // console.log()
//     return this.getIn(path).set(key, value)
//   },
// }

// export const form = Map({
//   id: uuid(),
// })
// export const rows = Map()
// export const columns = Map()
// export const fields = Map()

// const defaultFormData = () => ({
//   id: uuid(),
//   settings: {},
//   stages: {},
//   rows: {},
//   columns: {},
//   fields: {},
// })

// export class FormeoData1 {
//   constructor(data) {
//     if (typeof data === 'string') {
//       data = JSON.parse(data)
//     }

//     // this = fromJS(data || defaultFormData())
//   }
//   get = (key, fallback) => {
//     const value = this.data.get(key)
//     return value !== undefined ? value : typeof fallback !== 'function' ? fallback : fallback()
//   }
//   set = (key, value) => {
//     this.data.set(key, value)
//   }
//   getIn = (path, fallback) => {
//     let value = path.reduce((acc, part) => this.get(part, fallback), this)
//     if (value instanceof Map) {
//       value = new FormeoData(value)
//     }
//     return value
//   }
//   setIn = (path, value) => {
//     const key = path.pop()
//     console.log()
//     return this.getIn(path).set(key, value)
//   }
// }

// export const formData =

export const settings = _settings
export const stages = _stages
export const rows = _rows
export const columns = _columns
export const fields = _fields

// const formData = objToMap({
//   id: uuid(),
//   settings,
//   stages,
//   rows,
//   columns,
//   fields,
// })

export const formData = objToMap({
  id: uuid(),
  settings,
  stages,
  rows,
  columns,
  // fields,
})

const formeoData = Object.create(null, {
  js: {
    get() {
      return mapToObj(formData)
    },
  },
  json: {
    get() {
      return JSON.stringify(formeoData.js)
    },
  },
  toJS: {
    value: data => mapToObj(data),
  },
  toJSON: {
    value: data => JSON.stringify(data),
  },
  load: {
    value: data => data => {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }
      Object.entries(data).forEach(([key, val]) => {
        if (val instanceof Object && !Array.isArray(val)) {
          // val = objToMap(val)
        }
        formData.set(key, val)
      })
      return formData
    },
  },
})

export default formeoData

// export default new Proxy(formData, handler)
