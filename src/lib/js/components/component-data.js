import { clone, merge, parseData, uuid } from '../common/utils/index.mjs'
import { get } from '../common/utils/object.mjs'
import { EVENT_FORMEO_ADDED_COLUMN, EVENT_FORMEO_ADDED_FIELD, EVENT_FORMEO_ADDED_ROW } from '../constants.js'
import Data from './data.js'

export default class ComponentData extends Data {
  /**
   * @param {string} name - Component type name (e.g., 'rows', 'columns')
   * @param {Object} [data] - Initial data
   * @param {Object} [events] - Events instance for dispatching events
   * @param {Object} [components] - Components instance for component lookup
   */
  constructor(name, data = Object.create(null), events = null, components = null) {
    super(name, data, events)
    this.components = components
    this.conditionMap = new Map()
  }

  load = dataArg => {
    const data = parseData(dataArg)
    this.empty()
    for (const [key, val] of Object.entries(data)) {
      this.add(key, val)
    }
    return this.data
  }

  /**
   * Retrieves data from the specified path or adds new data if no path is provided.
   * @param {string} [path] - The path to retrieve data from
   * @returns {*} The data retrieved or the result of adding new data
   */
  get = path => (path ? get(this.data, path) : this.add())

  /**
   * Adds a new component with the given id and data.
   * @param {string} [id] - The unique identifier for the component
   * @param {Object} [data] - The data to initialize the component with
   * @returns {Object} The newly created component
   */
  add = (id, data = Object.create(null)) => {
    const elemId = id || uuid()
    const component = this.Component({ ...data, id: elemId })
    this.data[elemId] = component
    this.active = component

    // Pass components reference to the component if available
    if (this.components && component.setComponents) {
      component.setComponents(this.components)
    }

    // Dispatch add events based on component type
    const componentEventMap = {
      row: EVENT_FORMEO_ADDED_ROW,
      column: EVENT_FORMEO_ADDED_COLUMN,
      field: EVENT_FORMEO_ADDED_FIELD,
    }

    const addEvent = componentEventMap[this.name]
    if (addEvent && this.events) {
      this.events.formeoUpdated(
        {
          entity: component,
          componentId: elemId,
          componentType: this.name,
          data: component.data,
        },
        addEvent
      )
    }

    return component
  }

  /**
   * Removes a component from the index
   * @param {String|Array} componentId
   */
  remove = componentId => {
    if (Array.isArray(componentId)) {
      for (const id of componentId) {
        this.get(id).remove()
      }
    } else {
      this.get(componentId).remove()
    }

    return this.data
  }

  /**
   * Deletes a component from the data object.
   * @param {string} componentId - The ID of the component to delete
   * @returns {string} The ID of the deleted component
   */
  delete = componentId => {
    delete this.data[componentId]
    return componentId
  }

  /**
   * Clears all instances from the store
   * @param {boolean} [isAnimated=true]
   */
  clearAll = (isAnimated = true) => {
    const promises = Object.values(this.data).map(component => component.empty(isAnimated))
    return Promise.all(promises)
  }

  /**
   * Extends the configVal for a component type
   * @return {Object} configVal
   */
  set config(config) {
    this.configVal = merge(this.configVal, clone(config))
  }

  /**
   * Reads configVal for a component type
   * @return {Object} configVal
   */
  get config() {
    return this.configVal
  }
}
