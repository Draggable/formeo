import Data from './data'
import { helpers } from '../common/helpers'
import { uuid } from '../common/utils'

export default class ComponentData extends Data {
  constructor(name, data) {
    super(name, data)
    this.load(data)
  }
  load = (data = Object.create(null)) => {
    this.empty()
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    Object.entries(data).forEach(([key, val]) => this.add(key, val))
    return this.data
  }
  get = path => (path ? helpers.get(this.data, path) : this.add())
  add = (id, data = Object.create(null)) => {
    const { id: dataId } = data
    const elemId = id || dataId || uuid()
    this.data[elemId] = new this.Component(Object.assign({}, data, { id: elemId }))

    return this.data[elemId]
  }
}
