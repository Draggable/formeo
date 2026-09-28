import { strict as assert } from 'node:assert'
import { after, afterEach, before, describe, it, mock } from 'node:test'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { loaded } from '../common/loaders.js'
import { CONTROL_GROUP_CLASSNAME } from '../constants.js'
import TinyMCEControl from './controls/html/tinymce.js'
import { Components, Controls } from './index.js'

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

describe('onBeforeAdd (#281)', () => {
  let localStorage
  before(() => {
    // jsdom never loads the TinyMCE script, so Controls#init would wait for it forever
    loaded.js.add(new TinyMCEControl().dependencies.js)
    localStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true })
  })
  after(() => {
    if (localStorage) {
      Object.defineProperty(globalThis, 'localStorage', localStorage)
    } else {
      delete globalThis.localStorage
    }
  })

  const withControls = async options => {
    const built = setup(options)
    const controls = await new Controls(built.components).init({}, false)
    built.components.controls = controls
    document.body.appendChild(controls.dom)
    mounted.push(controls.dom)
    const textControl = controls.dom.querySelector('.text-input-control')
    return { ...built, controls, textControl }
  }
  const fieldCount = components => Object.keys(components.fields.data).length
  const dropControl = (target, controlElement, newIndex) => {
    const item = document.createElement('li')
    item.id = controlElement.id
    const from = document.createElement('ul')
    from.className = CONTROL_GROUP_CLASSNAME
    const to = target.dom.querySelector('.children')
    to.insertBefore(item, to.children[newIndex] || null) // Sortable puts the dragged clone in place
    return { item, result: target.onAdd({ from, to, item, newIndex }) }
  }

  it('clicking a control asks first, and false adds nothing', async () => {
    const seen = []
    const { components, stage, textControl } = await withControls({
      callbacks: {
        onBeforeAdd: ({ detail }) => {
          seen.push(detail)
          return false
        },
      },
    })
    textControl.querySelector('button').click()
    assert.equal(fieldCount(components), 1)
    assert.equal(stage.children.length, 1)
    assert.equal(seen[0].componentType, 'field')
    assert.equal(seen[0].controlId, 'text-input')
    assert.equal(seen[0].data.config.controlId, 'text-input')
    assert.equal(seen[0].parent, stage)
    assert.equal(seen[0].index, 1)
    assert.equal(seen[0].addedVia, 'click')
  })

  it('a click held by a Promise adds to the page it was clicked on once it resolves', async () => {
    let resolve
    const { components, stage, controls, textControl } = await withControls({
      callbacks: {
        onBeforeAdd: () =>
          new Promise(res => {
            resolve = res
          }),
      },
    })
    const result = controls.requestAddElement(textControl.id)
    assert.equal(fieldCount(components), 1)
    components.stages.active = null // e.g. the user switched pages meanwhile
    resolve(true)
    await result
    assert.equal(fieldCount(components), 2)
    assert.equal(stage.children.length, 2)
  })

  it('a layout control reports its own component type', async () => {
    const seen = []
    const { controls } = await withControls({ callbacks: { onBeforeAdd: ({ detail }) => seen.push(detail) } })
    controls.dom.querySelector('.layout-column-control button').click()
    assert.equal(seen[0].componentType, 'column')
    assert.equal(seen[0].controlId, 'layout-column')
    assert.deepEqual(seen[0].data, {})
  })

  it('a cancelled drop removes the placeholder and adds nothing', async () => {
    const seen = []
    const { components, stage, textControl } = await withControls({
      callbacks: {
        onBeforeAdd: ({ detail }) => {
          seen.push(detail)
          return false
        },
      },
    })
    const { item } = dropControl(stage, textControl, 0)
    assert.equal(item.isConnected, false)
    assert.equal(stage.dom.querySelector('.children').children.length, 1)
    assert.equal(fieldCount(components), 1)
    assert.deepEqual(stage.get('children'), ['row-h'])
    assert.equal(seen[0].addedVia, 'dragDrop')
    assert.equal(seen[0].parent, stage)
    assert.equal(seen[0].index, 0)
  })

  it('an allowed drop adds the field where it was dropped, synchronously', async () => {
    const { components, column, textControl } = await withControls()
    const { result } = dropControl(column, textControl, 0)
    assert.equal(fieldCount(components), 2)
    assert.equal(column.children.length, 2)
    assert.equal(result, column.children[0], 'onAdd still returns the new field')
  })

  it('a drop whose column was removed while waiting adds nothing', async () => {
    let resolve
    const { components, row, column, textControl } = await withControls({
      callbacks: {
        onBeforeAdd: () =>
          new Promise(res => {
            resolve = res
          }),
      },
    })
    dropControl(column, textControl, 1)
    row.remove()
    resolve(true)
    await new Promise(res => setTimeout(res, 0))
    assert.equal(fieldCount(components), 0)
  })
})
