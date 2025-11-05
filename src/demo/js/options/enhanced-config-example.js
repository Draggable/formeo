/**
 * Example configuration showing the enhanced event system
 * This demonstrates how you can now configure multiple event handlers
 * for components using the new event system in Component.js
 */

const enhancedConfig = {
  rows: {
    all: {
      events: {
        // Original onAdd handler - now gets called for both drag-drop and click additions
        onAdd: eventData => {
          console.log('Row added:', eventData.component.id)
          console.log('Added via:', eventData.addedVia) // 'dragDrop' or 'addChild'

          if (eventData.addedVia === 'dragDrop') {
            console.log('Added via drag and drop from:', eventData.fromType)
          } else if (eventData.addedVia === 'addChild') {
            console.log('Added via addChild method to parent:', eventData.parent.id)
          }
        },

        // New event handlers available with the enhanced system
        onRemove: eventData => {
          console.log('Row being removed:', eventData.component.id)
          console.log('Parent:', eventData.parent?.id)
          console.log(
            'Children being removed:',
            eventData.children.map(c => c.id)
          )
        },

        onUpdate: eventData => {
          console.log('Row data updated:', eventData.component.id)
          console.log('Property changed:', eventData.path)
          console.log('Old value:', eventData.oldValue)
          console.log('New value:', eventData.newValue)
        },

        onClone: eventData => {
          console.log('Row cloned:', eventData.original.id, '-> clone:', eventData.clone.id)
        },

        onAddChild: eventData => {
          console.log('Child added to row:', eventData.parent.id)
          console.log('New child:', eventData.child.id)
          console.log('At index:', eventData.index)

          // Note: When addChild is called, both onAddChild (on parent) and onAdd (on child) are triggered
          // Use onAddChild when you want to react to this component receiving a new child
          // Use onAdd when you want to react to a component being added anywhere
        },

        onRender: eventData => {
          console.log('Row rendered:', eventData.component.id)
          // You can access the DOM element via eventData.dom
          // eventData.dom.style.border = '2px solid blue'
        },
      },
    },

    // You can also target specific row instances by ID
    'specific-row-id-here': {
      events: {
        onAdd: _eventData => {
          console.log('This specific row was added!')
        },
      },
    },
  },

  columns: {
    all: {
      events: {
        onAdd: eventData => {
          console.log('Column added:', eventData.component.id)
          console.log('Added via:', eventData.addedVia)

          if (eventData.addedVia === 'dragDrop') {
            console.log('Drag-drop - Added to:', eventData.toType)
            console.log('Drag-drop - From:', eventData.fromType)

            // Access the newly added component
            if (eventData.addedComponent) {
              console.log('Added component:', eventData.addedComponent.id)
            }
          } else if (eventData.addedVia === 'addChild') {
            console.log('Click/programmatic - Added to parent:', eventData.parent.id)
            console.log('Click/programmatic - At index:', eventData.index)
          }
        },

        onRemove: eventData => {
          console.log('Column removed:', eventData.component.id)

          // Trigger auto-resize of sibling columns
          if (eventData.parent && eventData.parent.name === 'row') {
            setTimeout(() => {
              eventData.parent.autoColumnWidths()
            }, 100)
          }
        },
      },
    },
  },

  fields: {
    all: {
      events: {
        onAdd: eventData => {
          console.log('Field added:', eventData.component.id)
        },

        onUpdate: eventData => {
          // React to specific property changes
          if (eventData.path === 'attrs.required') {
            console.log('Field required status changed:', eventData.newValue)

            // You could update the UI to show required indicator
            const component = eventData.component
            if (eventData.newValue) {
              component.dom.classList.add('field-required')
            } else {
              component.dom.classList.remove('field-required')
            }
          }
        },
      },
    },

    // Target specific field types
    text: {
      events: {
        onAdd: eventData => {
          console.log('Text field added!')
          // Auto-focus text fields when added
          setTimeout(() => {
            const input = eventData.component.dom.querySelector('input[type="text"]')
            if (input) {
              input.focus()
            }
          }, 100)
        },
      },
    },

    // Target specific field instances
    'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': {
      events: {
        onRender: eventData => {
          console.log('Specific field rendered:', eventData.component.id)

          // Auto-open edit panel for this specific field
          setTimeout(() => {
            eventData.component.toggleEdit(true)
          }, 333)
        },

        onUpdate: eventData => {
          console.log('Specific field updated:', eventData.path, eventData.newValue)
        },
      },
    },
  },

  stages: {
    all: {
      events: {
        onAdd: eventData => {
          console.log('Stage content added:', eventData.component.id)
        },

        onUpdate: eventData => {
          console.log('Stage updated:', eventData.path)

          // Save to localStorage whenever stage changes
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('formeo-autosave', JSON.stringify(eventData.component.data))
          }
        },
      },
    },
  },
}

// Example of programmatically adding event listeners
// This can be done at runtime, not just through config
function addRuntimeEventListeners(formeo) {
  // Add a listener to all existing rows
  for (const row of Object.values(formeo.Components.rows.data)) {
    row.addEventListener('onUpdate', eventData => {
      console.log('Runtime listener - row updated:', eventData.component.id)
    })
  }

  // Add a global listener that gets called for any component
  document.addEventListener('formeoUpdated', event => {
    console.log('Global formeo event:', event.detail.eventType, event.detail.component?.id)
  })
}

// Example of removing event listeners
function removeEventListener(component, eventName, handler) {
  component.removeEventListener(eventName, handler)
}

export default enhancedConfig
export { addRuntimeEventListeners, removeEventListener }
