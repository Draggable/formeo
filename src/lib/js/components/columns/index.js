import ComponentData from '../component-data.js'
import Column from './column.js'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['clone', 'move', 'remove'],
    disabled: [],
  },
}

export class Columns extends ComponentData {
  /**
   * @param {Object} [data] - Initial column data
   * @param {Object} [events] - Events instance for dispatching events
   * @param {Object} [components] - Components instance for component lookup
   */
  constructor(data = Object.create(null), events = null, components = null) {
    super('columns', data, events, components)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Column(data)
  }
}

// Singleton instance for backward compatibility
const columns = new Columns()

export default columns
