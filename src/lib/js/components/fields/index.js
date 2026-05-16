import { parseData } from '../../common/utils/index.mjs'
import { get, set } from '../../common/utils/object.mjs'
import ComponentData from '../component-data.js'
import Field from './field.js'

const DEFAULT_CONFIG = () => ({
  actionButtons: {
    buttons: ['move', 'edit', 'clone', 'remove'],
    disabled: [],
  },
  panels: {
    disabled: [],
    attrs: {
      disabled: ['type'],
      hideDisabled: true,
      locked: [],
    },
    order: ['attrs', 'options', 'conditions'],
  },
  label: {
    disableHTML: false,
  },
})

export class Fields extends ComponentData {
  /**
   * @param {Object} [data] - Initial field data
   * @param {Object} [events] - Events instance for dispatching events
   * @param {Object} [components] - Components instance for component lookup
   */
  constructor(data = Object.create(null), events = null, components = null) {
    super('fields', data, events, components)
    this.config = { all: DEFAULT_CONFIG() }
    /** @type {Object|null} */
    this.controls = null
  }

  /**
   * Set the Controls instance for auto-registering controls.
   * @param {Object} controls - The Controls instance
   */
  setControls(controls) {
    this.controls = controls
  }

  Component(data) {
    return new Field(data)
  }

  get = path => {
    let found = path && get(this.data, path)
    if (!found && this.controls) {
      const control = this.controls.get(path)
      if (control) {
        found = this.add(null, control.controlData)
      }
    }
    return found
  }

  getData = () => {
    return Object.entries(this.data).reduce((acc, [key, val]) => {
      const { conditions, ...data } = val?.getData() || val

      if (conditions?.length) {
        let hasConditions = true
        if (conditions.length === 1) {
          const [firstCondition] = conditions
          hasConditions = Boolean(firstCondition.if[0].source)
        }
        if (hasConditions) {
          data.conditions = conditions
        }
      }

      acc[key] = data
      return acc
    }, {})
  }

  load = (dataArg = Object.create(null)) => {
    const allFieldData = parseData(dataArg)
    this.empty()

    for (const [key, val] of Object.entries(allFieldData)) {
      const { meta, ...data } = val
      // meta object is only for controls, we want to migrate it out of field data
      // we only need the control id to tie actions back to control definitions
      if (meta?.id) {
        set(data, 'config.controlId', meta?.id)
      }
      this.add(key, data)
    }

    return this.data
  }
}

// Singleton instance for backward compatibility
const fields = new Fields()

export default fields
