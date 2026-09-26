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
