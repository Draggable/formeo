import isEqual from 'lodash/isEqual'
import { uuid } from '../common/utils'
import helpers from '../common/helpers'
import events from '../common/events'
import { CHANGE_TYPES } from '../constants'

export default class Data {
  constructor(name, data = Object.create(null)) {
    this.data = data
    this.name = name
    this.dataPath = ''
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
  getChangeType = (oldVal, newVal) => {
    const change = CHANGE_TYPES.find(({ condition }) => condition(oldVal, newVal)) || { type: 'unknown' }
    change.desc = !change.type === 'added' ? `${oldVal} to ${newVal}` : newVal
    return change
  }
  set = (path, newVal) => {
    const oldVal = this.get(path)

    if (isEqual(oldVal, newVal)) {
      return null
    }

    const data = helpers.set(this.data, path, newVal)

    if (!this.disableEvents) {
      const change = this.getChangeType(oldVal, newVal)
      const evtData = {
        entity: this,
        dataPath: this.dataPath.replace(/\.+$/, ''),
        changePath: this.dataPath + path,
        value: newVal,
        data,
        change: `${change.type}: ${change.desc}`,
        src: this.dom,
      }
      if (oldVal) {
        evtData.previousValue = oldVal
      }
      events.formeoUpdated(evtData)
    }

    return data
  }
  add = (id, data = Object.create(null)) => {
    const { id: dataId } = data
    const elemId = id || dataId || uuid()
    return this.set(elemId, data)
  }
  remove = path => {
    const delPath = path.split('.')
    const delItem = delPath.pop()
    const parent = this.get(delPath)
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
