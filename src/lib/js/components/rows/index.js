import ComponentData from '../component-data.js'
import Row from './row.js'

const DEFAULT_CONFIG = {
  actionButtons: {
    buttons: ['move', 'edit', 'clone', 'remove'],
    disabled: [],
  },
  panels: {
    disabled: [],
    // Settings is the row's own panel (Row#customPanels); Attributes edits rows.<id>.attrs (#112)
    order: ['settings', 'attrs'],
    attrs: {
      // id: conditions and the renderer find a row by #f-<id>; tag: would swap the element;
      // data-clone-of: written by the renderer's input-group clones
      disabled: ['id', 'tag', 'data-clone-of'],
      hideDisabled: true,
      locked: [],
    },
  },
}

export class Rows extends ComponentData {
  constructor(rowData) {
    super('rows', rowData)
    this.config = { all: DEFAULT_CONFIG }
  }
  Component(data) {
    return new Row(data, this.components)
  }
}

const rows = new Rows()

export default rows
