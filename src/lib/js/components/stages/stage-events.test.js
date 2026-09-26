import { strict as assert } from 'node:assert'
import { describe, it, mock } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { EVENT_FORMEO_ADDED_STAGE, EVENT_FORMEO_REMOVED_STAGE } from '../../constants.js'
import { Components } from '../index.js'

const twoPages = () => ({
  id: 'form-s',
  stages: {
    's-1': { id: 's-1', children: ['r-1'] },
    's-2': { id: 's-2', children: [] },
  },
  rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['f-1'] } },
  fields: { 'f-1': { id: 'f-1', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } } },
})

const editorState = (callbacks = {}) => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load(twoPages(), {})
  return components
}

const listen = (type, run) => {
  const seen = []
  const listener = evt => seen.push(evt.detail)
  document.addEventListener(type, listener)
  try {
    run()
  } finally {
    document.removeEventListener(type, listener)
  }
  return seen
}

describe('stage add and remove events (#122)', () => {
  it('fires formeoAddedStage, then onAdd and onAddStage, when a stage is added', () => {
    const onAdd = mock.fn()
    const onAddStage = mock.fn()
    const components = editorState({ onAdd, onAddStage })
    let stage
    const seen = listen(EVENT_FORMEO_ADDED_STAGE, () => {
      stage = components.stages.add()
    })

    assert.deepEqual(
      seen.map(({ componentId, componentType }) => ({ componentId, componentType })),
      [{ componentId: stage.id, componentType: 'stage' }]
    )
    assert.equal(onAdd.mock.callCount(), 1)
    assert.equal(onAddStage.mock.callCount(), 1)
    assert.equal(onAddStage.mock.calls[0].arguments[0].detail.componentId, stage.id)
  })

  it('stays silent while formData loads', () => {
    const onAddStage = mock.fn()
    editorState({ onAddStage })
    assert.equal(onAddStage.mock.callCount(), 0)
  })

  it('removes a stage with its rows, columns and fields', () => {
    const onRemoveStage = mock.fn()
    const onRemoveRow = mock.fn()
    const components = editorState({ onRemoveStage, onRemoveRow })
    let removed
    const seen = listen(EVENT_FORMEO_REMOVED_STAGE, () => {
      removed = components.stages.get('s-1').remove()
    })

    assert.equal(removed, 's-1')
    assert.deepEqual(Object.keys(components.formData.stages), ['s-2'])
    assert.deepEqual(components.formData.rows, {})
    assert.deepEqual(components.formData.columns, {})
    assert.deepEqual(components.formData.fields, {})
    assert.equal(onRemoveRow.mock.callCount(), 1)
    assert.equal(onRemoveStage.mock.callCount(), 1)
    assert.deepEqual(
      seen.map(({ componentId, componentType }) => ({ componentId, componentType })),
      [{ componentId: 's-1', componentType: 'stage' }]
    )
  })

  it('points stages.active at a remaining stage when the active one goes', () => {
    const components = editorState()
    // loading leaves the last stage active
    assert.equal(components.stages.active.id, 's-2')
    components.stages.get('s-2').remove()
    assert.equal(components.stages.active.id, 's-1')
  })

  it('never removes the last stage', () => {
    const onRemoveStage = mock.fn()
    const components = editorState({ onRemoveStage })
    components.stages.get('s-2').remove()

    assert.equal(components.stages.get('s-1').remove(), null)
    assert.deepEqual(Object.keys(components.formData.stages), ['s-1'])
    assert.equal(onRemoveStage.mock.callCount(), 1)
  })
})
