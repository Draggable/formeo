import Data from './data'
import { get } from '../common/helpers'
import { uuid, clone, merge } from '../common/utils'

export default class ComponentData extends Data {
  load = (data = Object.create(null)) => {
    this.empty()
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    Object.entries(data).forEach(([key, val]) => this.add(key, val))
    return this.data
  }

  get = path => (path ? get(this.data, path) : this.add())

  add = (id, data = Object.create(null)) => {
    const elemId = id || uuid()
    const component = this.Component(Object.assign({}, data, { id: elemId }))
    this.set(elemId, component)
    this.active = component

    return component
  }

  /**
   * removes a component form the index
   * @param {String|Array} componentId
   */
  remove = componentId => {
    if (Array.isArray(componentId)) {
      componentId.forEach(id => {
        this.get(id).remove()
      })
    } else {
      this.get(componentId).remove()
    }

    return this.data
  }

  delete = componentId => {
    delete this.data[componentId]
    return componentId
  }

  /**
   * Clears all instances from the store
   * @param {Object} evt
   */
  clearAll = (isAnimated = true) => {
    const promises = Object.values(this.data).map(component => component.empty(isAnimated))
    return Promise.all(promises)
  }

  /**
   * Extends the configVal for a component type,
   * eventually read by Component
   * @return {Object} configVal
   */
  set config(config) {
    this.configVal = merge(this.configVal, clone(config))
    return this.configVal
  }

  /**
   * Reads configVal for a component type
   * @return {Object} configVal
   */
  get config() {
    return this.configVal
  }

  conditionMap = new Map()
}
