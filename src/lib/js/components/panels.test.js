import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import Field from './fields/field.js'
import { Components } from './index.js'
import Panels from './panels.js'

const panelOptions = () => ({
  id: 'p-1',
  type: 'controls',
  panels: [{ config: { label: 'One' }, attrs: { className: 'f-panel' }, children: [] }],
})

describe('Panels#destroy', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  // Panels schedules observe() with window.setTimeout, which is jsdom's own timer
  const captureTimeouts = () => {
    const pending = new Map()
    let nextId = 1
    mock.method(window, 'setTimeout', callback => {
      const id = nextId++
      pending.set(id, callback)
      return id
    })
    mock.method(window, 'clearTimeout', id => pending.delete(id))
    return () => {
      for (const callback of pending.values()) callback()
      pending.clear()
    }
  }

  it('observes the panels once the pending timeout runs', () => {
    const observe = mock.method(window.ResizeObserver.prototype, 'observe')
    const runTimeouts = captureTimeouts()
    new Panels(panelOptions())
    runTimeouts()
    assert.equal(observe.mock.callCount(), 1)
  })

  it('disconnects the resize observer and cancels a pending observe', () => {
    const observe = mock.method(window.ResizeObserver.prototype, 'observe')
    const disconnect = mock.method(window.ResizeObserver.prototype, 'disconnect')
    const runTimeouts = captureTimeouts()
    const panels = new Panels(panelOptions())
    panels.destroy()
    runTimeouts()
    assert.equal(disconnect.mock.callCount(), 1)
    assert.equal(observe.mock.callCount(), 0)
  })

  it('is safe to call twice', () => {
    const panels = new Panels(panelOptions())
    assert.doesNotThrow(() => {
      panels.destroy()
      panels.destroy()
    })
  })

  it('a component that rebuilds its edit panels destroys the previous Panels', () => {
    const field = new Field({ tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } }, new Components())
    const destroy = mock.method(field.panels, 'destroy')
    field.updateEditPanels()
    assert.equal(destroy.mock.callCount(), 1)
  })

  it('a removed component destroys its Panels', () => {
    const components = new Components()
    components.load({
      id: 'form-p',
      stages: { 'stage-p': { id: 'stage-p', children: ['row-p'] } },
      rows: { 'row-p': { id: 'row-p', config: {}, children: ['col-p'] } },
      columns: { 'col-p': { id: 'col-p', config: { width: '100%' }, children: ['field-p'] } },
      fields: { 'field-p': { id: 'field-p', tag: 'input', attrs: { type: 'text' }, config: { label: 'P' } } },
    })
    const field = components.fields.get('field-p')
    const destroy = mock.method(field.panels, 'destroy')
    field.remove()
    assert.equal(destroy.mock.callCount(), 1)
  })
})
