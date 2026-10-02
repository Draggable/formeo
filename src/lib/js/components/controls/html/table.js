import { defaultTable } from '../../../common/table.mjs'
import { tableText } from '../../../common/table-text.mjs'
import Control from '../control.js'

/**
 * A static table (#349): a caption, an optional header row and rows of plain-text cells, edited in the field's Table
 * panel. Its caption is its visible name, so its label stays hidden.
 */
class TableControl extends Control {
  constructor() {
    super({
      tag: 'table',
      attrs: { className: '' },
      config: { label: tableText('controls.html.table'), hideLabel: true },
      meta: { group: 'html', icon: 'table', id: 'table' },
      table: defaultTable(column => tableText('table.newColumn', { column })),
    })
  }
}

export default TableControl
