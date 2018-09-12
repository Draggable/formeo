import { uuid } from '../common/utils'
import helpers from '../common/helpers'

export default class Data {
  constructor(name, data = Object.create(null)) {
    this.data = data
    this.name = name
  }
  get size() {
    return Object.keys(this.data).length
  }
  get js() {
    return this.data
  }
  get json() {
    return this.data
  }
  toJSON = (data, format) => JSON.stringify(data, null, format)
  get = path => helpers.get(this.data, path)
  set = (path, val) => helpers.set(this.data, path, val)
  add = (id, data = Object.create(null)) => {
    const { id: dataId } = data
    const elemId = id || dataId || uuid()
    this.data[elemId] = data
    return elemId
  }
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
  getData = () => {
    return Object.entries(this.data).reduce((acc, [key, val]) => {
      acc[key] = val.data ? val.getData() : val
      return acc
    }, {})
  }
}
