import ComponentData from '../component-data.js'
import Column from './column.js'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['clone', 'move', 'edit', 'remove'],
    disabled: [],
  },
  panels: {
    disabled: [],
    // Attributes edits columns.<id>.attrs (#112)
    order: ['attrs'],
    attrs: {
      // id: conditions and the renderer find a column by #f-<id>; tag: would swap the element
      disabled: ['id', 'tag'],
      hideDisabled: true,
      locked: [],
    },
  },
}

export class Columns extends ComponentData {
  constructor(columnData) {
    super('columns', columnData)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Column(data, this.components)
  }
}

const columns = new Columns()

export default columns
