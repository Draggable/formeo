import { strict as assert } from 'node:assert'
import { afterEach, before, beforeEach, describe, it, mock } from 'node:test'
import Sortable from 'sortablejs'
import { loaded } from '../../common/loaders.js'
import { Components, Controls } from '../index.js'
import TinyMCEControl from './html/tinymce.js'

describe('Controls#destroy (#166)', () => {
  let localStorage

  before(() => {
    // jsdom never loads the TinyMCE script, so init() would wait for it forever
    loaded.js.add(new TinyMCEControl().dependencies.js)
  })

  beforeEach(() => {
    // the control groups keep their order in localStorage, which Node has no store for here
    localStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true })
  })

  afterEach(() => {
    mock.restoreAll()
    if (localStorage) {
      Object.defineProperty(globalThis, 'localStorage', localStorage)
    } else {
      delete globalThis.localStorage
    }
    document.documentElement.style.overflow = ''
  })

  const buildControls = async () => {
    const controls = await new Controls(new Components()).init({}, false)
    document.body.appendChild(controls.dom)
    return controls
  }

  it('destroys its Sortables and Panels and removes its DOM', async () => {
    const controls = await buildControls()
    const groups = [...controls.groups]
    const destroyPanels = mock.method(controls.panels, 'destroy')

    controls.destroy()

    assert.ok(groups.length > 0)
    assert.deepEqual(
      groups.filter(group => Sortable.get(group)),
      []
    )
    assert.equal(destroyPanels.mock.callCount(), 1)
    assert.equal(controls.dom.isConnected, false)
  })

  it('restores the page overflow hidden by a control drag in progress', async () => {
    document.documentElement.style.overflow = 'auto'
    const controls = await buildControls()
    // what the controls' Sortable does when a drag starts
    Sortable.get(controls.groups[0]).options.onStart()
    assert.equal(document.documentElement.style.overflow, 'hidden')

    controls.destroy()

    assert.equal(document.documentElement.style.overflow, 'auto')
    assert.equal(controls.originalDocumentOverflow, null)
  })

  it('leaves the page overflow alone when no drag is in progress', async () => {
    const controls = await buildControls()
    document.documentElement.style.overflow = 'scroll'

    controls.destroy()

    assert.equal(document.documentElement.style.overflow, 'scroll')
  })

  it('removes the drag ghost of a control drag in progress', async () => {
    const controls = await buildControls()
    const ghost = document.createElement('div')
    document.body.appendChild(ghost)
    const { active, ghost: previousGhost } = Sortable
    Sortable.active = Sortable.get(controls.groups[0])
    Sortable.ghost = ghost
    try {
      controls.destroy()
    } finally {
      Sortable.active = active
      Sortable.ghost = previousGhost
    }

    assert.equal(ghost.isConnected, false)
  })

  it("leaves another editor's drag ghost alone", async () => {
    const controls = await buildControls()
    const otherList = document.createElement('div')
    document.body.appendChild(otherList)
    const ghost = document.createElement('div')
    document.body.appendChild(ghost)
    const { active, ghost: previousGhost } = Sortable
    Sortable.active = Sortable.create(otherList)
    Sortable.ghost = ghost
    let ghostKept
    try {
      controls.destroy()
      ghostKept = ghost.isConnected
    } finally {
      Sortable.get(otherList).destroy()
      Sortable.active = active
      Sortable.ghost = previousGhost
      otherList.remove()
      ghost.remove()
    }

    assert.equal(ghostKept, true)
  })

  it('is safe to call twice, and before init()', async () => {
    const controls = await buildControls()
    assert.doesNotThrow(() => {
      controls.destroy()
      controls.destroy()
      new Controls(new Components()).destroy()
    })
  })
})
