import { get } from '../../common/helpers'
import ComponentData from '../component-data'
import Field from './field'
import Controls from '../controls'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['handle', 'edit', 'clone', 'remove'],
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
}

export class Fields extends ComponentData {
  constructor(fieldData) {
    super('fields', fieldData)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Field(data)
  }
  get = path => {
    let found = path && get(this.data, path)
    if (!found) {
      const control = Controls.get(path)
      if (control) {
        found = this.add(null, control.controlData)
      }
    }
    return found
  }
}

const fields = new Fields()

export default fields
