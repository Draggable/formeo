import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import Sortable from 'sortablejs'
import { destroySortables } from './sortable.js'

describe('destroySortables', () => {
  it('destroys Sortable instances on the root and its descendants', () => {
    const root = document.createElement('div')
    const list = document.createElement('ul')
    root.appendChild(list)
    Sortable.create(root)
    Sortable.create(list)
    assert.equal(destroySortables(root), 2)
    assert.ok(!Sortable.get(root))
    assert.ok(!Sortable.get(list))
  })

  it('returns 0 without a root', () => {
    assert.equal(destroySortables(null), 0)
  })
})

describe('Component#remove releases its Sortables (#166)', () => {
  const sortableElements = root => [root, ...root.querySelectorAll('*')].filter(el => Sortable.get(el))

  const oneColumnForm = key => ({
    id: `form-${key}`,
    stages: { [`stage-${key}`]: { id: `stage-${key}`, children: [`row-${key}`] } },
    rows: { [`row-${key}`]: { id: `row-${key}`, config: {}, children: [`col-${key}`] } },
    columns: { [`col-${key}`]: { id: `col-${key}`, config: { width: '100%' }, children: [] } },
    fields: {},
  })

  it('during a drag, releases them once the drop handler has finished', async () => {
    const { Components } = await import('../components/index.js')
    const components = new Components()
    components.load(oneColumnForm('d'))
    const column = components.columns.get('col-d')
    const el = column.sortable.el

    // a column emptied by a drag is removed from inside Sortable's drop handler
    const active = Sortable.active
    Sortable.active = Sortable.get(el)
    try {
      column.remove()
      assert.ok(Sortable.get(el), 'the Sortable handling the drop is not destroyed mid-drop')
    } finally {
      Sortable.active = active
    }
    await Promise.resolve()
    assert.ok(!Sortable.get(el))
  })

  it('a removed row leaves no Sortable on itself or its columns and fields', async () => {
    const { Components } = await import('../components/index.js')
    const components = new Components()
    components.load({
      id: 'form-s',
      stages: { 'stage-s': { id: 'stage-s', children: ['row-s', 'row-t'] } },
      rows: {
        'row-s': { id: 'row-s', config: {}, children: ['col-s'] },
        'row-t': { id: 'row-t', config: {}, children: [] },
      },
      columns: { 'col-s': { id: 'col-s', config: { width: '100%' }, children: ['field-s'] } },
      fields: {
        'field-s': {
          id: 'field-s',
          tag: 'select',
          attrs: {},
          config: { label: 'Pick' },
          options: [
            { label: 'One', value: 'one' },
            { label: 'Two', value: 'two' },
          ],
        },
      },
    })
    const row = components.rows.get('row-s')
    const before = sortableElements(row.dom)
    assert.ok(before.includes(row.sortable.el), 'the row has a Sortable')
    assert.ok(before.length > 2, 'its column and the field options have Sortables too')

    row.remove()

    assert.deepEqual(
      before.filter(el => Sortable.get(el)),
      []
    )
  })
})
