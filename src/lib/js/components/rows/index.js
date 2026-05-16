import ComponentData from '../component-data.js'
import Row from './row.js'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['move', 'edit', 'clone', 'remove'],
    disabled: [],
  },
}

export class Rows extends ComponentData {
  /**
   * @param {Object} [data] - Initial row data
   * @param {Object} [events] - Events instance for dispatching events
   * @param {Object} [components] - Components instance for component lookup
   */
  constructor(data = Object.create(null), events = null, components = null) {
    super('rows', data, events, components)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Row(data)
  }
}

// Singleton instance for backward compatibility
const rows = new Rows()

export default rows
