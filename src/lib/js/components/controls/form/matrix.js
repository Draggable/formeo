import { defaultMatrix } from '../../../common/table.mjs'
import { tableText } from '../../../common/table-text.mjs'
import Control from '../control.js'

/**
 * A matrix (#349 phase 2): a table whose columns are radio choices for each row, ready to edit in the Table panel.
 * It's the same field data as the Table control, so any of its columns can become static text, checkboxes or text
 * fields. Its caption is its visible name, so its label stays hidden. The empty name shows the Name attribute.
 */
class MatrixControl extends Control {
  constructor() {
    super({
      tag: 'table',
      attrs: { className: '', name: '' },
      config: { label: tableText('controls.form.matrix'), hideLabel: true },
      meta: { group: 'common', icon: 'matrix', id: 'matrix' },
      table: defaultMatrix(
        column => tableText('table.newColumn', { column }),
        row => tableText('table.newRow', { row })
      ),
    })
  }
}

export default MatrixControl
