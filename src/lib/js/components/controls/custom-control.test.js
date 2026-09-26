import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import { CONTROL_GROUP_CLASSNAME } from '../../constants.js'
import Columns from '../columns/index.js'
import Fields from '../fields/index.js'
import Rows from '../rows/index.js'
import Stages from '../stages/index.js'
import Control from './control.js'
import Controls from './index.js'

// the example from docs/controls/custom-controls.md
class ImageAnnotateControl extends Control {
  constructor() {
    super({
      tag: 'div',
      config: { label: 'Image annotate' },
      meta: { group: 'common', id: 'image-annotate', icon: 'upload' },
      children: [{ tag: 'input', attrs: { type: 'hidden', name: 'annotation' } }],
      action: { onRender: () => {} },
    })
  }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('custom control subclass (#228)', () => {
  test('a Control subclass dropped on the stage becomes a field with its control id', async () => {
    const control = new ImageAnnotateControl()
    Controls.add(control)
    const stage = Stages.add()
    const item = Object.assign(document.createElement('li'), { id: control.id })
    const from = Object.assign(document.createElement('ul'), { className: CONTROL_GROUP_CLASSNAME })
    from.appendChild(item)
    stage.onAdd({ from, to: stage.dom.querySelector('.children'), item, newIndex: 0 })
    await flush()

    const [rowId] = stage.get('children')
    const [columnId] = Rows.get(rowId).get('children')
    const [fieldId] = Columns.get(columnId).get('children')
    const field = Fields.get(fieldId)
    assert.equal(field.get('config.controlId'), 'image-annotate')
    assert.equal(field.get('tag'), 'div')
  })
})
