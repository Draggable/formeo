// biome-ignore assist/source/organizeImports: import order necessary for Controls circular dependency
import { buildFlatDataStructure, clone, isAddress, parseData, sessionStorage } from '../common/utils/index.mjs'
import { splitAddress } from '../common/utils/string.mjs'
import { COMPONENT_INDEX_TYPE_MAP, DEFAULT_FORMDATA, SESSION_FORMDATA_KEY, version } from '../constants.js'
import { Columns as ColumnsClass } from './columns/index.js'
import Data from './data.js'
import { Fields as FieldsClass } from './fields/index.js'
import { Rows as RowsClass } from './rows/index.js'
import { Stages as StagesClass } from './stages/index.js'
import ControlsData from './controls/index.js'
export { Dialog } from './dialog.js'

// Re-export class constructors for per-instance creation
export { StagesClass as Stages, RowsClass as Rows, ColumnsClass as Columns, FieldsClass as Fields }
export const Controls = ControlsData

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
    const sessionData = sessionStorage.get(SESSION_FORMDATA_KEY)
    if (sessionData) {
      return sessionData
    }
  }

  return DEFAULT_FORMDATA()
}

/**
 * Components class manages the component hierarchy (stages, rows, columns, fields).
 * Each FormeoEditor instance creates its own Components object so that
 * multiple editors on the same page maintain separate state.
 */
export class Components extends Data {
  /**
   * @param {Object} events - The Events instance for this editor
   * @param {Object} actions - The Actions instance for this editor
   */
  constructor(events, actions = null) {
    super('components', Object.create(null), events)
    this.disableEvents = true
    this.actions = actions

    // Create per-instance data stores
    this.stages = new StagesClass(undefined, events, this)
    this.rows = new RowsClass(undefined, events, this)
    this.columns = new ColumnsClass(undefined, events, this)
    this.fields = new FieldsClass(undefined, events, this)
  }

  /**
   * Set the Controls instance for the fields data store.
   * @param {Object} controls - The Controls instance
   */
  setControls(controls) {
    this.fields.setControls(controls)
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
   * Flattens the component tree
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
   * Call `set` on a component in memory
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

// Singleton instance for backward compatibility
const components = new Components(null)

export default components
