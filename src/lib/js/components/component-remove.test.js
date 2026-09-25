import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import events from '../common/events.js'
import { EVENT_FORMEO_UPDATED } from '../constants.js'
import Components from './index.js'
import Stages from './stages/index.js'

const buildStage = () => {
  const stage = Stages.add()
  document.body.appendChild(stage.dom)
  const row = stage.addChild()
  const column = row.addChild()
  const field = column.addChild({ tag: 'input', attrs: { type: 'text', required: true }, config: { label: 'Name' } })
  return { stage, row, column, field }
}

describe('Component.remove emits formeoUpdated (#246)', () => {
  let removals
  const onUpdated = evt => {
    if (evt.detail?.changeType === 'removed') {
      removals.push(evt.detail)
    }
  }

  beforeEach(() => {
    removals = []
    document.addEventListener(EVENT_FORMEO_UPDATED, onUpdated)
  })

  afterEach(() => {
    document.removeEventListener(EVENT_FORMEO_UPDATED, onUpdated)
    mock.timers.reset()
  })

  it('reports a removed field with its parent children path', () => {
    const { column, field } = buildStage()
    field.remove()
    const removal = removals.find(r => r.componentId === field.id)
    assert.ok(removal, 'a removed update was dispatched')
    assert.equal(removal.componentType, 'field')
    assert.equal(removal.changePath, `columns.${column.id}.children`)
    assert.ok(!removal.value.includes(field.id))
    assert.ok(removal.previousValue.includes(field.id))
    assert.equal(Components.fields.data[field.id], undefined, 'dispatched after the field left the index')
  })

  it('reports every component removed with a row, deepest first', () => {
    const { row, column, field } = buildStage()
    row.remove()
    assert.deepEqual(
      removals.map(r => r.componentId),
      [field.id, column.id, row.id]
    )
  })

  it('reports a removed attribute', () => {
    const { field } = buildStage()
    field.remove('attrs.required')
    const removal = removals.at(-1)
    assert.equal(removal.changePath, `fields.${field.id}.attrs.required`)
    assert.equal(removal.previousValue, true)
    assert.equal(field.get('attrs.required'), undefined)
  })

  it('calls onUpdate with the final formData after a cascading removal', () => {
    mock.timers.enable({ apis: ['Date', 'setTimeout'], now: Date.now() + 10_000 })
    const onUpdate = mock.fn()
    events.init({ onUpdate })
    const { row } = buildStage()
    mock.timers.tick(1000)
    onUpdate.mock.resetCalls()

    row.remove()
    mock.timers.tick(1000)

    const lastCall = onUpdate.mock.calls.at(-1)
    assert.ok(lastCall, 'onUpdate was called')
    assert.equal(lastCall.arguments[0].detail.rows[row.id], undefined)
  })
})
