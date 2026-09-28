import { strict as assert } from 'node:assert'
import { after, afterEach, before, describe, it, mock } from 'node:test'
import Sortable from 'sortablejs'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import { loaded } from '../common/loaders.js'
import { CONTROL_GROUP_CLASSNAME } from '../constants.js'
import { controlSetDropTarget } from './controls/control-set.mjs'
import TinyMCEControl from './controls/html/tinymce.js'
import { Components, Controls } from './index.js'

/**
 * An Address set: two text inputs and a select, in a fieldset row
 * @param {String} [layout] 'stacked' or 'columns'
 * @return {Object} control definition
 */
const addressSet = (layout = 'stacked') => ({
  meta: { group: 'common', id: `address-${layout}`, icon: 'rows' },
  config: { label: `Address ${layout}` },
  controlSet: {
    layout,
    row: { config: { fieldset: true, legend: 'Address' } },
    fields: [
      { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } },
      { control: 'text-input', attrs: { name: 'city' }, config: { label: 'City' } },
      { control: 'select', attrs: { name: 'country' }, options: [{ label: 'Canada', value: 'ca', selected: false }] },
    ],
  },
})

const emptySet = {
  meta: { group: 'common', id: 'empty-set', icon: 'rows' },
  config: { label: 'Empty set' },
  controlSet: { fields: [{ control: 'nope' }] },
}

/**
 * Two rows of one field each, with ids unique to this file
 * @return {Object} formData
 */
const twoRows = () => ({
  id: 'form-s',
  stages: { 'stage-s': { id: 'stage-s', children: ['row-s1', 'row-s2'] } },
  rows: {
    'row-s1': { id: 'row-s1', config: {}, children: ['col-s1'] },
    'row-s2': { id: 'row-s2', config: {}, children: ['col-s2'] },
  },
  columns: {
    'col-s1': { id: 'col-s1', config: { width: '100%' }, children: ['field-s1'] },
    'col-s2': { id: 'col-s2', config: { width: '100%' }, children: ['field-s2'] },
  },
  fields: {
    'field-s1': {
      id: 'field-s1',
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'One', controlId: 'text-input' },
    },
    'field-s2': {
      id: 'field-s2',
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'Two', controlId: 'text-input' },
    },
  },
})

const mounted = []
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
afterEach(() => {
  for (const element of mounted.splice(0)) {
    element.remove()
  }
  mock.restoreAll()
})

/**
 * One editor's Components loaded with twoRows(), and its Controls with the test sets, mounted in the document
 * @param {Object} [callbacks] events option callbacks
 * @param {Object} [controlOptions] more Controls options
 */
const setup = async (callbacks = {}, controlOptions = {}) => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load(twoRows())
  const stage = components.stages.get('stage-s')
  document.body.appendChild(stage.dom)
  mounted.push(stage.dom)
  const controls = await new Controls(components).init(
    { elements: [addressSet(), addressSet('columns'), emptySet], ...controlOptions },
    false
  )
  components.controls = controls
  document.body.appendChild(controls.dom)
  mounted.push(controls.dom)
  return { components, controls, stage }
}

const controlElement = (controls, setId) => controls.dom.querySelector(`.${setId}-control`)
const fieldsOf = row => row.children.flatMap(column => column.children)
const fieldCount = components => Object.keys(components.fields.data).length
const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('clicking a control set (#227)', () => {
  it('describeControl expands a set into its layout, row and fields', async () => {
    const { controls } = await setup()
    const described = controls.describeControl(controlElement(controls, 'address-stacked').id)
    assert.equal(described.componentType, 'controlSet')
    assert.equal(described.controlId, 'address-stacked')
    assert.equal(described.data.layout, 'stacked')
    assert.equal(described.data.row.config.legend, 'Address')
    assert.deepEqual(
      described.data.fields.map(field => [field.tag, field.attrs.name, field.config.controlId]),
      [
        ['input', 'street', 'text-input'],
        ['input', 'city', 'text-input'],
        ['select', 'country', 'select'],
      ]
    )
    assert.deepEqual(described.data.fields[2].options, [{ label: 'Canada', value: 'ca', selected: false }])
  })

  it('asks onBeforeAdd once, then adds one row holding the fields', async () => {
    const seen = []
    const onAddField = mock.fn()
    const { components, controls, stage } = await setup({
      onBeforeAdd: ({ detail }) => {
        seen.push(detail)
      },
      onAddField,
    })
    controlElement(controls, 'address-stacked').querySelector('button').click()
    await tick()
    assert.equal(seen.length, 1)
    assert.equal(seen[0].componentType, 'controlSet')
    assert.equal(seen[0].controlId, 'address-stacked')
    assert.equal(seen[0].parent, stage)
    assert.equal(seen[0].index, 2)
    assert.equal(seen[0].addedVia, 'click')
    assert.equal(seen[0].data.fields.length, 3)
    assert.equal(stage.children.length, 3)
    const row = stage.children[2]
    assert.equal(row.get('config.fieldset'), true)
    assert.equal(row.get('config.legend'), 'Address')
    assert.equal(row.children.length, 1, 'stacked: one column')
    assert.deepEqual(
      fieldsOf(row).map(field => field.get('attrs.name')),
      ['street', 'city', 'country']
    )
    assert.equal(fieldCount(components), 5)
    assert.equal(onAddField.mock.callCount(), 3, 'the usual after-events, once per field')
  })

  it('false from onBeforeAdd adds nothing', async () => {
    const { components, controls, stage } = await setup({ onBeforeAdd: () => false })
    controlElement(controls, 'address-stacked').querySelector('button').click()
    assert.equal(stage.children.length, 2)
    assert.equal(fieldCount(components), 2)
  })

  it("layout: 'columns' puts each field in its own column, with equal widths", async () => {
    const { controls, stage } = await setup()
    controlElement(controls, 'address-columns').querySelector('button').click()
    const row = stage.children[2]
    assert.equal(row.children.length, 3)
    assert.deepEqual(
      row.children.map(column => column.children.length),
      [1, 1, 1]
    )
    assert.deepEqual(
      row.children.map(column => column.get('config.width')),
      ['33.3%', '33.3%', '33.3%']
    )
  })

  it('adding a set twice creates independent fields', async () => {
    const { controls, stage } = await setup()
    const id = controlElement(controls, 'address-stacked').id
    controls.addElement(id)
    controls.addElement(id)
    const [first, second] = [fieldsOf(stage.children[2]), fieldsOf(stage.children[3])]
    assert.notEqual(first[0].id, second[0].id)
    first[0].set('config.label', 'Street line 1')
    assert.equal(second[0].get('config.label'), 'Street')
  })

  it('controls.addElement adds a set without asking onBeforeAdd', async () => {
    const onBeforeAdd = mock.fn()
    const { controls, stage } = await setup({ onBeforeAdd })
    const row = controls.addElement(controlElement(controls, 'address-stacked').id)
    assert.equal(onBeforeAdd.mock.callCount(), 0)
    assert.equal(row, stage.children[2])
  })

  it('a set with no fields adds nothing and asks nothing', async () => {
    mock.method(console, 'warn', () => {})
    const onBeforeAdd = mock.fn()
    const { components, controls, stage } = await setup({ onBeforeAdd })
    controlElement(controls, 'empty-set').querySelector('button').click()
    assert.equal(controls.addElement(controlElement(controls, 'empty-set').id), undefined)
    assert.equal(onBeforeAdd.mock.callCount(), 0)
    assert.equal(stage.children.length, 2)
    assert.equal(fieldCount(components), 2)
  })

  it('a member naming another set or a layout control is skipped with a warning', async () => {
    const warn = mock.method(console, 'warn', () => {})
    const nested = {
      meta: { group: 'common', id: 'nested-set', icon: 'rows' },
      config: { label: 'Nested' },
      controlSet: { fields: [{ control: 'address-stacked' }, { control: 'layout-row' }, { control: 'text-input' }] },
    }
    const { controls } = await setup({}, { elements: [addressSet(), nested] })
    const described = controls.describeControl(controlElement(controls, 'nested-set').id)
    assert.equal(described.data.fields.length, 1)
    assert.equal(warn.mock.callCount(), 2)
  })

  it('dragging a set with ghostPreview on keeps its own button instead of a field preview', async () => {
    const { controls } = await setup({}, { ghostPreview: true })
    const item = controlElement(controls, 'address-stacked')
    const sortable = Sortable.get(item.closest(`.${CONTROL_GROUP_CLASSNAME}`))
    const clone = item.cloneNode(true)
    sortable.options.onClone({ clone, item })
    await tick()
    await tick()
    assert.ok(clone.querySelector('button'), 'still the control button')
    assert.equal(clone.querySelector('.formeo-field'), null)
  })
})

/**
 * Drops a control's element on a component the way Sortable does: the clone sits at newIndex, then onAdd runs
 * @param {Component} target stage, row or column
 * @param {Element} controlItem the control's <li>
 * @param {Number} newIndex
 */
const dropControl = (target, controlItem, newIndex) => {
  const item = document.createElement('li')
  item.id = controlItem.id
  const from = document.createElement('ul')
  from.className = CONTROL_GROUP_CLASSNAME
  const to = target.dom.querySelector('.children')
  to.insertBefore(item, to.children[newIndex] || null)
  return { item, result: target.onAdd({ from, to, item, newIndex }) }
}

const legendOf = row => row.get('config.legend')

describe('dropping a control set (#227)', () => {
  it('controlSetDropTarget: a stage at the drop index, otherwise right after the target row', async () => {
    const { components, stage } = await setup()
    assert.deepEqual(controlSetDropTarget(stage, 1), { stage, index: 1 })
    assert.deepEqual(controlSetDropTarget(components.rows.get('row-s1'), 0), { stage, index: 1 })
    assert.deepEqual(controlSetDropTarget(components.columns.get('col-s2'), 0), { stage, index: 2 })
  })

  it('a set dropped on the stage goes in at the drop index', async () => {
    const seen = []
    const { controls, stage } = await setup({ onBeforeAdd: ({ detail }) => seen.push(detail) })
    const { item, result } = dropControl(stage, controlElement(controls, 'address-stacked'), 1)
    assert.equal(item.isConnected, false)
    assert.deepEqual(
      stage.children.map(row => row.id).filter(id => id.startsWith('row-s')),
      ['row-s1', 'row-s2']
    )
    assert.equal(stage.children.length, 3)
    assert.equal(stage.children[1], result, 'onAdd returns the new row')
    assert.equal(legendOf(stage.children[1]), 'Address')
    assert.deepEqual(
      stage.get('children'),
      stage.children.map(row => row.id),
      'child order saved'
    )
    assert.equal(seen[0].componentType, 'controlSet')
    assert.equal(seen[0].parent, stage)
    assert.equal(seen[0].index, 1)
    assert.equal(seen[0].addedVia, 'dragDrop')
  })

  it('a set dropped in a column goes in as a new row right after that row; the column keeps its field', async () => {
    const seen = []
    const { components, controls, stage } = await setup({ onBeforeAdd: ({ detail }) => seen.push(detail) })
    const column = components.columns.get('col-s1')
    dropControl(column, controlElement(controls, 'address-stacked'), 0)
    assert.equal(stage.children.length, 3)
    assert.equal(stage.children[0].id, 'row-s1')
    assert.equal(legendOf(stage.children[1]), 'Address')
    assert.equal(stage.children[2].id, 'row-s2')
    assert.deepEqual(
      column.children.map(field => field.id),
      ['field-s1']
    )
    assert.equal(seen[0].parent, stage)
    assert.equal(seen[0].index, 1)
  })

  it('a set dropped in a column with no fields leaves that column marked empty', async () => {
    const { components, controls } = await setup()
    components.fields.get('field-s1').remove()
    const column = components.columns.get('col-s1')
    dropControl(column, controlElement(controls, 'address-stacked'), 0)
    assert.equal(column.children.length, 0)
    assert.equal(column.dom.classList.contains('empty'), true)
  })

  it('a cancelled set drop removes the placeholder and adds nothing', async () => {
    const { components, controls, stage } = await setup({ onBeforeAdd: () => false })
    const { item } = dropControl(stage, controlElement(controls, 'address-stacked'), 0)
    assert.equal(item.isConnected, false)
    assert.equal(stage.children.length, 2)
    assert.equal(fieldCount(components), 2)
  })

  it('a held set drop is added once allowed, appended if its index no longer fits', async () => {
    let resolve
    const { components, controls, stage } = await setup({
      onBeforeAdd: () =>
        new Promise(res => {
          resolve = res
        }),
    })
    dropControl(stage, controlElement(controls, 'address-stacked'), 2)
    components.rows.get('row-s2').remove()
    resolve(true)
    await tick()
    assert.equal(stage.children.length, 2)
    assert.equal(stage.children[0].id, 'row-s1')
    assert.equal(legendOf(stage.children[1]), 'Address')
  })

  it('a held set drop whose target row was removed while waiting adds nothing', async () => {
    let resolve
    const { components, controls, stage } = await setup({
      onBeforeAdd: () =>
        new Promise(res => {
          resolve = res
        }),
    })
    dropControl(components.columns.get('col-s1'), controlElement(controls, 'address-stacked'), 0)
    components.rows.get('row-s1').remove()
    resolve(true)
    await tick()
    assert.deepEqual(
      stage.children.map(row => row.id),
      ['row-s2']
    )
    assert.equal(fieldCount(components), 1)
  })

  it('dropping a set with no fields removes the placeholder, adds nothing and asks nothing', async () => {
    mock.method(console, 'warn', () => {})
    const onBeforeAdd = mock.fn()
    const { controls, stage } = await setup({ onBeforeAdd })
    const { item } = dropControl(stage, controlElement(controls, 'empty-set'), 0)
    assert.equal(item.isConnected, false)
    assert.equal(onBeforeAdd.mock.callCount(), 0)
    assert.equal(stage.children.length, 2)
  })

  it("a set dropped on a row keeps that row's column widths; the row itself is unchanged", async () => {
    const { components, controls, stage } = await setup()
    const row = components.rows.get('row-s1')
    row.addChild()
    const [col1, col2] = row.children
    col1.setWidth('25%')
    col2.setWidth('75%')
    const { result } = dropControl(row, controlElement(controls, 'address-stacked'), 0)
    assert.deepEqual(
      row.children.map(column => column.get('config.width')),
      ['25%', '75%']
    )
    assert.deepEqual(
      row.children.map(column => column.dom.style.width),
      ['25%', '75%']
    )
    assert.equal(stage.children[0], row, 'row-s1 unchanged, still first')
    assert.equal(legendOf(stage.children[1]), 'Address')
    assert.equal(stage.children[1], result, "the row's onAdd returns the new row")
  })

  it("an empty-set drop on a row also keeps that row's column widths", async () => {
    mock.method(console, 'warn', () => {})
    const { components, controls } = await setup()
    const row = components.rows.get('row-s1')
    row.addChild()
    const [col1, col2] = row.children
    col1.setWidth('25%')
    col2.setWidth('75%')
    dropControl(row, controlElement(controls, 'empty-set'), 0)
    assert.deepEqual(
      row.children.map(column => column.get('config.width')),
      ['25%', '75%']
    )
  })

  it('dropping a field control is unchanged', async () => {
    const { components, controls } = await setup()
    const column = components.columns.get('col-s1')
    const textControl = controls.dom.querySelector('.text-input-control')
    const { result } = dropControl(column, textControl, 1)
    assert.equal(column.children.length, 2)
    assert.equal(column.children[1], result)
  })
})
