import defaultActions, { Actions } from '../common/actions.js'
import defaultEvents, { Events } from '../common/events.js'
import {
  buildFlatDataStructure,
  clone,
  formDataStorageKey,
  isAddress,
  parseData,
  sessionStorage,
  uuid,
} from '../common/utils/index.mjs'
import { splitAddress } from '../common/utils/string.mjs'
import { COMPONENT_INDEX_TYPE_MAP, DEFAULT_FORMDATA, version } from '../constants.js'
import defaultColumns, { Columns } from './columns/index.js'
import defaultControls, { Controls } from './controls/index.js'
import Data from './data.js'
import defaultFields, { Fields } from './fields/index.js'
import defaultRows, { Rows } from './rows/index.js'
import defaultStages, { Stages } from './stages/index.js'

export { Dialog } from './dialog.js'
export { Columns, Controls, Fields, Rows, Stages }

const getFormData = (formData, useSessionStorage = false) => {
  // If formData is explicitly provided (not null/undefined), always use it
  if (formData !== undefined && formData !== null) {
    const parsed = parseData(formData)
    if (parsed && typeof parsed === 'object') {
      const cloned = clone(parsed)
      // Ensure required structure exists
      return {
        id: cloned.id || DEFAULT_FORMDATA().id,
        stages: cloned.stages || DEFAULT_FORMDATA().stages,
        rows: cloned.rows || {},
        columns: cloned.columns || {},
        fields: cloned.fields || {},
      }
    }
    console.warn('Formeo: Invalid formData provided, using default')
  }

  if (useSessionStorage) {
    const sessionData = sessionStorage.get(formDataStorageKey(useSessionStorage))
    if (sessionData) {
      return sessionData
    }
  }

  return DEFAULT_FORMDATA()
}

export class Components extends Data {
  // an own field, so it shadows Data's `events` getter
  events = null

  /**
   * One editor's form: its stores, controls, Events and Actions
   * @param {Object} [context]
   * @param {Events} [context.events] the editor's Events
   * @param {Actions} [context.actions] the editor's Actions, built on `events` when omitted
   * @param {Object} [context.stores] existing { stages, rows, columns, fields } stores to use
   * @param {Controls} [context.controls] the editor's Controls, usually set once they are initialized
   */
  constructor({ events = new Events(), actions, stores = {}, controls = null } = {}) {
    super('components')
    this.disableEvents = true
    this.instanceId = uuid()
    this.events = events
    this.events.components = this
    this.actions = actions || new Actions(events).init()
    this.stages = stores.stages || new Stages()
    this.rows = stores.rows || new Rows()
    this.columns = stores.columns || new Columns()
    this.fields = stores.fields || new Fields()
    for (const store of [this.stages, this.rows, this.columns, this.fields]) {
      store.components = this
    }
    this.controls = controls
  }

  get controls() {
    return this._controls
  }

  set controls(controls) {
    this._controls = controls
    if (controls) {
      controls.components = this
    }
  }

  load = (formDataArg, opts = {}) => {
    this.empty()
    const formData = getFormData(formDataArg, opts.sessionStorage)

    this.opts = opts

    this.set('id', formData.id)
    this.add('stages', this.stages.load(formData.stages))
    this.add('rows', this.rows.load(formData.rows))
    this.add('columns', this.columns.load(formData.columns))
    this.add('fields', this.fields.load(formData.fields))

    for (const stage of Object.values(this.get('stages'))) {
      stage.loadChildren()
    }

    return this.data
  }

  /**
   * flattens the component tree
   * @returns {Object} where keys contains component type
   */
  flatList() {
    const result = {}

    for (const stageId of Object.keys(this.data.stages)) {
      buildFlatDataStructure(this.data, stageId, 'stages', result)
    }

    return result
  }

  getChildData = ({ type, id }) => {
    const component = this.get(type, id)
    if (component) {
      return component.getData()
    }
  }

  get json() {
    return window.JSON.stringify({
      $schema: `https://cdn.jsdelivr.net/npm/formeo@${version}/dist/formData_schema.json`,
      ...this.formData,
    })
  }

  get formData() {
    return {
      id: this.get('id'),
      stages: this.stages.getData(),
      rows: this.rows.getData(),
      columns: this.columns.getData(),
      fields: this.fields.getData(),
    }
  }

  set config(config) {
    const { stages, rows, columns, fields } = config
    this.stages.config = stages
    this.rows.config = rows
    this.columns.config = columns
    this.fields.config = fields
  }

  getIndex(type) {
    return this[type] || this[COMPONENT_INDEX_TYPE_MAP.get(type)]
  }

  /**
   * call `set` on a component in memory
   */
  setAddress(fullAddress, value) {
    if (!isAddress(fullAddress)) {
      return
    }
    const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress)
    const componentIndex = this.getIndex(type)
    const component = componentIndex.get(id)

    component?.set(localAddress, value)

    return component
  }

  /**
   * Fetch a component from memory by address
   */
  getAddress(fullAddress) {
    if (!isAddress(fullAddress)) {
      return
    }
    const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress)
    const componentIndex = this.getIndex(type)
    const component = componentIndex.get(id)

    if (localAddress.length && !component) {
      return
    }

    return localAddress.length ? component.get(localAddress) : component
  }
}

// legacy default instance assembled from the default stores, for existing unit tests only
const components = new Components({
  events: defaultEvents,
  actions: defaultActions,
  stores: { stages: defaultStages, rows: defaultRows, columns: defaultColumns, fields: defaultFields },
  controls: defaultControls,
})
defaultActions.events = defaultEvents

export default components
