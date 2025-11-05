/**
 * Test to verify the enhanced Component event system works through Field
 */

import { strict as assert } from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import Field from './fields/field.js'

const fieldConfig = {
  tag: 'input',
  attrs: {
    required: false,
    type: 'text',
    className: '',
  },
  config: {
    label: 'Text Input',
    controlId: 'text-input',
    panels: { order: [], disabled: [] },
    actionButtons: { buttons: [], disabled: [] },
  },
  id: '1c48584a',
}

describe('Component Event System', () => {
  let component

  beforeEach(() => {
    component = new Field(fieldConfig)
  })

  it('should initialize event handlers from config', () => {
    // Test by manually setting config.events after component creation
    component.config.events = {
      onAdd: () => console.log('added'),
      onRemove: () => console.log('removed'),
    }

    // Re-initialize event handlers
    component.initEventHandlers()

    // Verify event listeners were initialized
    assert.ok(component.eventListeners instanceof Map)
    assert.ok(component.eventListeners.has('onAdd'))
    assert.ok(component.eventListeners.has('onRemove'))
    assert.equal(component.eventListeners.get('onAdd').length, 1)
    assert.equal(component.eventListeners.get('onRemove').length, 1)
  })

  it('should add and remove event listeners programmatically', () => {
    const testHandler = () => console.log('test')

    // Add event listener
    component.addEventListener('onTest', testHandler)
    assert.ok(component.eventListeners.has('onTest'))
    assert.equal(component.eventListeners.get('onTest').length, 1)

    // Remove event listener
    component.removeEventListener('onTest', testHandler)
    assert.equal(component.eventListeners.get('onTest').length, 0)
  })

  it('should dispatch events to registered handlers', () => {
    let eventReceived = false
    let eventData = null

    const testHandler = data => {
      eventReceived = true
      eventData = data
    }

    component.addEventListener('onTest', testHandler)

    // Dispatch event
    component.dispatchComponentEvent('onTest', { customData: 'test' })

    // Verify event was dispatched
    assert.ok(eventReceived)
    assert.ok(eventData)
    assert.equal(eventData.type, 'onTest')
    assert.equal(eventData.customData, 'test')
    assert.equal(eventData.component, component)
    assert.ok(typeof eventData.timestamp === 'number')
  })

  it('should handle errors in event handlers gracefully', () => {
    let successHandlerCalled = false

    // Add a handler that throws an error
    component.addEventListener('onTest', () => {
      throw new Error('Test error')
    })

    // Add a handler that should still execute
    component.addEventListener('onTest', () => {
      successHandlerCalled = true
    })

    // Dispatch event - should not throw
    assert.doesNotThrow(() => {
      component.dispatchComponentEvent('onTest', {})
    })

    // Success handler should still have been called
    assert.ok(successHandlerCalled)
  })

  it('should override set method to dispatch update events', () => {
    let updateEventReceived = false
    let updateEventData = null

    component.addEventListener('onUpdate', data => {
      updateEventReceived = true
      updateEventData = data
    })

    // Mock dom to trigger update events
    component.dom = document.createElement('div')

    // Set a value
    component.set('test.path', 'new value')

    // Verify update event was dispatched
    assert.ok(updateEventReceived)
    assert.equal(updateEventData.path, 'test.path')
    assert.equal(updateEventData.newValue, 'new value')
    assert.equal(updateEventData.oldValue, undefined)
  })
})
