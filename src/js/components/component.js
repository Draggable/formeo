import { uuid } from '../common/utils'
import helpers from '../common/helpers'

export default class Component {
  constructor(name, data = {}, defaultData = {}) {
    this.data = Object.assign({}, defaultData, data)
    this.id = this.data.id || uuid()
    this.name = name
  }
  // get size() {
  //   return Object.keys(this.data).length
  // }
  get js() {
    return this.data
  }
  get json() {
    return this.data
  }
  toJSON = (data, format) => JSON.stringify(data, null, format)
  get = path => helpers.get(this.data, path)
  set = (path, val) => helpers.set(this.data, path, val)
  // add = (data = Object.create(null)) => {
  //   const { id } = data
  //   const elemId = id || uuid()
  //   const mergedData = Object.assign({}, this.defaultData, data)
  //   this.data[elemId] = mergedData
  //   return elemId
  // }
  remove = path => {
    const delPath = path.split('.')
    const delItem = delPath.pop()
    const parent = helpers.get(this.data, delPath)
    if (Array.isArray(parent)) {
      parent.splice(Number(delItem), 1)
    } else {
      delete parent[delItem]
    }
    return parent
  }
  empty = () => {
    this.data = Object.create(null)
  }
}
