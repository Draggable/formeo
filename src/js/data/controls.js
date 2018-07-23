import helpers from '../common/helpers'
import { uuid } from '../common/utils'

export class ControlData {
  constructor(name) {
    this.data = Object.create(null)
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
  add = (data = Object.create(null)) => {
    const { id } = data
    const controlId = id || uuid()
    const mergedData = Object.assign({}, this.defaultData, data)
    this.data[controlId] = mergedData
    return controlId
  }
  remove = controlId => {
    delete this.data[controlId]
  }
}

const controlData = new ControlData('controls')

export default controlData
