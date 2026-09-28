import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { Components } from './index.js'

/**
 * A one-field form whose ids are unique to this file
 * @return {Object} formData
 */
const oneField = () => ({
  id: 'form-h',
  stages: { 'stage-h': { id: 'stage-h', children: ['row-h'] } },
  rows: { 'row-h': { id: 'row-h', config: {}, children: ['col-h'] } },
  columns: { 'col-h': { id: 'col-h', config: { width: '100%' }, children: ['field-h'] } },
  fields: {
    'field-h': {
      id: 'field-h',
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'Name', controlId: 'text-input' },
    },
  },
})

const mounted = []

/**
 * One editor's Components, loaded with oneField() and mounted in the document
 * @param {Object} [options]
 * @param {Object} [options.callbacks] events option callbacks
 * @param {Object} [options.actions] actions options
 */
const setup = ({ callbacks = {}, actions = {} } = {}) => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init(actions) })
  components.load(oneField())
  const stage = components.stages.get('stage-h')
  document.body.appendChild(stage.dom)
  mounted.push(stage.dom)
  return {
    events,
    components,
    stage,
    row: components.rows.get('row-h'),
    column: components.columns.get('col-h'),
    field: components.fields.get('field-h'),
  }
}

/**
 * Clicks one of a component's own action buttons (not a child's)
 * @param {Component} component
 * @param {String} className e.g. 'item-remove', 'item-clone', 'edit-toggle'
 */
const clickAction = (component, className) =>
  component.dom.querySelector(`.${component.name}-actions .${className}`).click()

afterEach(() => {
  for (const element of mounted.splice(0)) {
    element.remove()
  }
  mock.restoreAll()
})

describe('canvas remove button → actions.remove.component (#281)', () => {
  it('asks actions.remove.component, which can hold the removal', () => {
    const seen = []
    const { components, field } = setup({ actions: { remove: { component: evt => seen.push(evt) } } })
    clickAction(field, 'item-remove')
    assert.equal(seen.length, 1)
    assert.equal(seen[0].component, field)
    assert.equal(seen[0].componentType, 'field')
    assert.equal(seen[0].componentId, 'field-h')
    assert.equal(typeof seen[0].removeAction, 'function')
    assert.equal(components.fields.get('field-h'), field, 'still there')
  })

  it('removes once removeAction is called', () => {
    const seen = []
    const { components, field } = setup({ actions: { remove: { component: evt => seen.push(evt) } } })
    clickAction(field, 'item-remove')
    seen[0].removeAction()
    assert.equal(components.fields.get('field-h'), undefined)
    assert.equal(field.isRegistered, false)
  })

  it('the default action removes a row with everything in it', () => {
    const { components, row } = setup()
    clickAction(row, 'item-remove')
    assert.equal(components.rows.get('row-h'), undefined)
    assert.equal(components.fields.get('field-h'), undefined)
  })

  it('removeAction is one-shot and safe after the component is gone', () => {
    const seen = []
    const { components, field } = setup({ actions: { remove: { component: evt => seen.push(evt) } } })
    clickAction(field, 'item-remove')
    field.remove() // something else removed it meanwhile
    assert.doesNotThrow(() => seen[0].removeAction())
    assert.doesNotThrow(() => seen[0].removeAction())
    assert.equal(components.fields.get('field-h'), undefined)
  })
})

describe('onBeforeRemove (#281)', () => {
  it('runs before actions.remove.component and can cancel it', () => {
    const order = []
    const { components, field } = setup({
      callbacks: {
        onBeforeRemove: ({ detail }) => {
          order.push(['before', detail.componentType, detail.componentId, detail.component === field])
          return false
        },
      },
      actions: { remove: { component: () => order.push(['action']) } },
    })
    clickAction(field, 'item-remove')
    assert.deepEqual(order, [['before', 'field', 'field-h', true]])
    assert.equal(components.fields.get('field-h'), field)
  })

  it('removes after an async onBeforeRemove resolves', async () => {
    let resolve
    const { components, column } = setup({
      callbacks: {
        onBeforeRemove: () =>
          new Promise(res => {
            resolve = res
          }),
      },
    })
    const result = column.requestRemove()
    assert.equal(components.columns.get('col-h'), column)
    resolve(true)
    await result
    assert.equal(components.columns.get('col-h'), undefined)
  })

  it('a second click while waiting is ignored', async () => {
    let resolve
    const onBeforeRemove = mock.fn(
      () =>
        new Promise(res => {
          resolve = res
        })
    )
    const { field } = setup({ callbacks: { onBeforeRemove } })
    const first = field.requestRemove()
    clickAction(field, 'item-remove')
    assert.equal(onBeforeRemove.mock.callCount(), 1)
    resolve()
    await first
  })
})
