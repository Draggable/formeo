import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import { CONTROL_GROUP_CLASSNAME } from '../constants.js'
import Control from './controls/control.js'
import columnControl from './controls/layout/column.js'
import rowControl from './controls/layout/row.js'
import defaultComponents from './index.js'

const { stages: Stages, rows: Rows, columns: Columns, fields: Fields, controls: Controls } = defaultComponents

const textControl = {
  tag: 'input',
  attrs: { type: 'text' },
  config: { label: 'Text Input' },
  meta: { group: 'common', icon: 'text-input', id: 'text-input' },
}

/**
 * Drops a registered control onto a fresh stage the way Sortable does
 * @param  {Control} control
 * @return {Object} the stage the control was dropped on
 */
const dropOnStage = control => {
  Controls.add(control)

  const stage = Stages.add()
  const item = document.createElement('li')
  item.id = control.id
  const from = document.createElement('ul')
  from.className = CONTROL_GROUP_CLASSNAME
  from.appendChild(item)

  stage.onAdd({ from, to: stage.dom.querySelector('.children'), item, newIndex: 0 })

  return stage
}

describe('layout controls dropped on the stage', () => {
  test('a row keeps its own defaults instead of the control label', () => {
    const stage = dropOnStage(new Control(rowControl))

    const [rowId] = stage.get('children')
    const config = Rows.get(rowId).get('config')

    assert.equal(config.label, undefined)
    assert.deepEqual(config, { fieldset: false, legend: '', inputGroup: false })
  })

  test('a column keeps its own defaults instead of the control label', () => {
    const stage = dropOnStage(new Control(columnControl))

    const [rowId] = stage.get('children')
    const [columnId] = Rows.get(rowId).get('children')
    const config = Columns.get(columnId).get('config')

    assert.equal(config.label, undefined)
    assert.equal(config.width, '100%')
  })

  test('a field control still brings its own data', () => {
    const stage = dropOnStage(new Control(textControl))

    const [rowId] = stage.get('children')
    const [columnId] = Rows.get(rowId).get('children')
    const [fieldId] = Columns.get(columnId).get('children')
    const field = Fields.get(fieldId)

    assert.equal(field.get('config.label'), 'Text Input')
    assert.equal(field.get('config.controlId'), 'text-input')
  })
})
