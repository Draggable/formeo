import ComponentData from '../component-data'
import Row from './row'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['handle', 'edit', 'clone', 'remove'],
    disabled: [],
  },
}

export class Rows extends ComponentData {
  constructor(rowData) {
    super('rows', rowData)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Row(data)
  }
}

const rows = new Rows()

export default rows
