import isEqual from 'lodash/isEqual'
import { uuid } from '../common/utils'
import { get, set } from '../common/helpers'
import events from '../common/events'
import { CHANGE_TYPES } from '../constants'

export default class Data {
  constructor(name, data = Object.create(null)) {
    this.name = name
    this.data = data
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
  get = path => get(this.data, path)
  getChangeType = (oldVal, newVal) => {
    const change = CHANGE_TYPES.find(({ condition }) => condition(oldVal, newVal)) || { type: 'unknown' }
    change.desc = !change.type === 'added' ? `${oldVal} to ${newVal}` : newVal
    return change
  }
  set(path, newVal) {
    const oldVal = get(this.data, path)

    if (isEqual(oldVal, newVal)) {
      return this.data
    }

    const data = set(this.data, path, newVal)

    const callBackPath = Array.isArray(path) ? path.join('.') : path
    const callBackGroups = Object.keys(this.setCallbacks).filter(setKey => new RegExp(setKey).test(callBackPath))
    const cbArgs = { newVal, oldVal, path }
    callBackGroups.forEach(cbGroup => this.setCallbacks[cbGroup].forEach(cb => cb(cbArgs)))

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
  addSetCallback(path, cb) {
    if (this.setCallbacks[path]) {
      this.setCallbacks[path].push(cb)
    } else {
      this.setCallbacks[path] = [cb]
    }
  }
  removeSetCallback(path, cb) {
    this.setCallbacks[path] = this.setCallbacks[path].filter(setCb => setCb !== cb)
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
  empty() {
    this.data = Object.create(null)
  }
  getData = () => {
    return Object.entries(this.data).reduce((acc, [key, val]) => {
      acc[key] = val?.data ? val.getData() : val
      return acc
    }, {})
  }
  setCallbacks = {}
  configVal = Object.create(null)
}
