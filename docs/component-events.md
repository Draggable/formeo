# Component Event System

## Overview

This document describes the enhanced Component event system that allows you to configure event handlers for component lifecycle events. The system provides both backwards compatibility and enhanced functionality similar to the `action` config pattern in dom.js.

## What Changed

### 1. Enhanced Component Constructor
- Added `eventListeners` Map to store event handlers
- Added `initEventHandlers()` call to process config.events

### 2. New Event Methods
- `addEventListener(eventName, handler)` - Add event listeners programmatically
- `removeEventListener(eventName, handler)` - Remove specific event listeners  
- `dispatchComponentEvent(eventName, eventData)` - Dispatch events to all registered listeners

### 3. Enhanced Existing Methods
All major component lifecycle methods now dispatch events:

- **`onAdd`** - Dispatches when component is added to form
- **`remove`** - Dispatches `onRemove` before removal
- **`addChild`** - Dispatches enhanced `onAddChild` event
- **`onRender`** - Dispatches `onRender` event
- **`clone`** - Dispatches `onClone` event
- **`set`** - Dispatches `onUpdate` when data changes

## Available Events

| Event Name | When Triggered | Event Data |
|------------|----------------|------------|
| `onAdd` | Component added to form (via drag-drop OR addChild) | `{addedVia, ...}` + context-specific data |
| `onRemove` | Before component removal | `{path, parent, children}` |
| `onAddChild` | Child added to component (parent perspective) | `{parent, child, index, childData}` |
| `onRender` | Component rendered to DOM | `{dom}` |
| `onClone` | Component cloned | `{original, clone, parent}` |
| `onUpdate` | Component data changed | `{path, oldValue, newValue}` |

### Event Context Data

**onAdd Event Data:**
- **Via Drag-Drop:** `{from, to, item, newIndex, fromType, toType, addedComponent, addedVia: 'dragDrop'}`
- **Via addChild:** `{parent, child, index, childData, addedVia: 'addChild'}`

### When to Use Each Event

**Use `onAdd`** when you want to react to a component being added to the form, regardless of how it was added:
```javascript
onAdd: (eventData) => {
  console.log('Component added:', eventData.component.id)
  
  // Different handling based on how it was added
  if (eventData.addedVia === 'dragDrop') {
    // Handle drag-drop specific logic
  } else if (eventData.addedVia === 'addChild') {
    // Handle programmatic/click addition logic
  }
}
```

**Use `onAddChild`** when you want to react to this component receiving a new child:
```javascript
onAddChild: (eventData) => {
  console.log('I received a new child:', eventData.child.id)
  // This fires on the parent component
}
```

**Note:** When `addChild()` is called, both events fire:
1. `onAddChild` fires on the parent component
2. `onAdd` fires on the child component being added

All events include common data:
- `component` - The component instance
- `type` - Event name
- `timestamp` - When event occurred

## Configuration Usage

### Basic Configuration
```javascript
const config = {
  rows: {
    all: {
      events: {
        onAdd: (eventData) => {
          console.log('Row added:', eventData.component.id)
        },
        onRemove: (eventData) => {
          console.log('Row removed:', eventData.component.id)
        }
      }
    }
  }
}
```

### Targeting Specific Components
```javascript
const config = {
  fields: {
    // All text fields
    text: {
      events: {
        onAdd: (eventData) => {
          console.log('Text field added!')
        }
      }
    },
    
    // Specific field by ID
    'field-id-12345': {
      events: {
        onUpdate: (eventData) => {
          console.log('Specific field updated')
        }
      }
    }
  }
}
```

### Runtime Event Listeners
```javascript
// Add listeners programmatically
component.addEventListener('onUpdate', (eventData) => {
  console.log('Component updated:', eventData.path)
})

// Remove listeners
component.removeEventListener('onUpdate', handlerFunction)
```

## Backwards Compatibility

The refactoring maintains full backwards compatibility:

1. **Existing `config.events.onRender`** - Still works exactly as before
2. **Existing `config.events.onAddChild`** - Still called in addition to new event system
3. **Global formeo events** - Continue to be dispatched as before

## Migration Guide

### Before (Limited Event Support)
```javascript
const config = {
  rows: {
    all: {
      events: {
        onAdd: (element) => {
          console.log('Row added:', element.id)
        }
      }
    }
  }
}
```

### After (Enhanced Event Support)
```javascript
const config = {
  rows: {
    all: {
      events: {
        // Same onAdd works, but with more data
        onAdd: (eventData) => {
          console.log('Row added:', eventData.component.id)
          console.log('Added from:', eventData.fromType)
          console.log('Added to:', eventData.toType)
        },
        
        // New events available
        onRemove: (eventData) => {
          console.log('Row being removed')
        },
        
        onUpdate: (eventData) => {
          if (eventData.path === 'attrs.className') {
            console.log('Row class changed')
          }
        }
      }
    }
  }
}
```

## Benefits

### 1. Consistent Event Interface
All components now support the same set of events with consistent data structures.

### 2. Enhanced Debugging
Event data includes detailed context about what changed, when, and where.

### 3. Granular Control
Listen to specific property changes, component types, or individual instances.

### 4. Error Handling
Event handlers are wrapped in try-catch to prevent one handler from breaking others.

### 5. Runtime Flexibility
Add and remove event listeners dynamically without reconfiguring.

## Implementation Details

### Event Data Structure
```javascript
{
  component: ComponentInstance,    // The component that triggered the event
  type: 'onAdd',                  // Event name
  timestamp: 1699123456789,       // When event occurred
  // Event-specific data varies by event type
}
```

### Error Handling
If an event handler throws an error, it's logged to console but doesn't prevent other handlers from executing.

### Performance
- Event listeners are stored in efficient Map structures
- Events are only dispatched if listeners exist
- Minimal overhead when no listeners are configured

## Example Use Cases

### Auto-save on Changes
```javascript
stages: {
  all: {
    events: {
      onUpdate: (eventData) => {
        localStorage.setItem('formeo-autosave', JSON.stringify(eventData.component.data))
      }
    }
  }
}
```

### Validation on Field Updates
```javascript
fields: {
  all: {
    events: {
      onUpdate: (eventData) => {
        if (eventData.path === 'attrs.required' && eventData.newValue) {
          // Add visual required indicator
          eventData.component.dom.classList.add('field-required')
        }
      }
    }
  }
}
```

### Custom Analytics
```javascript
rows: {
  all: {
    events: {
      onAdd: (eventData) => {
        analytics.track('component_added', {
          type: 'row',
          id: eventData.component.id
        })
      }
    }
  }
}
```

This system provides a solid foundation for building more interactive and responsive form building experiences while maintaining the simplicity and backwards compatibility of the existing system.
