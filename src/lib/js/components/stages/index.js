import ComponentData from '../component-data.js'
import Stage from './stage.js'

const DEFAULT_CONFIG = () => ({
  actionButtons: {
    buttons: ['edit'],
    disabled: [],
  },
  panels: {
    disabled: [],
    order: ['attrs', 'options', 'conditions'],
  },
})

export class Stages extends ComponentData {
  /**
   * @param {Object} [data] - Initial stage data
   * @param {Object} [events] - Events instance for dispatching events
   * @param {Object} [components] - Components instance for component lookup
   */
  constructor(data = Object.create(null), events = null, components = null) {
    super('stages', data, events, components)
    this.config = { all: DEFAULT_CONFIG() }
  }
  Component(data) {
    return new Stage(data)
  }
}

// Singleton instance for backward compatibility
const stages = new Stages()

export default stages
