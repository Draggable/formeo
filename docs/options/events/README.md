# Events

Events are emitted by interacting with the form. While [actions](../actions/) let you override certain functionality, events simply allow you to react to an event (typically after an action completes).

Formeo supports **two ways** to work with events:

1. **Configuration Callbacks** - Pass event handler functions in the `events` configuration option
2. **DOM Event Listeners** - Listen for custom events dispatched on the document

## Configuration Callbacks

Pass callback functions when initializing Formeo:

```javascript
const editor = new FormeoEditor({
  events: {
    onChange: (eventData) => {
      console.log('Form changed:', eventData)
    },
    onUpdate: (eventData) => {
      console.log('Form updated:', eventData)
    },
    onSave: (eventData) => {
      console.log('Form saved:', eventData.formData)
    }
  }
})
```

### Available Callback Options

| Option               | Type     | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `formeoLoaded`       | Function | Fires when Formeo loads                  |
| `onAdd`              | Function | Fires when element is added              |
| `onChange`           | Function | Fires when form data changes             |
| `onUpdate`           | Function | Fires when form is updated (all changes) |
| `onUpdateStage`      | Function | Fires when stage is updated              |
| `onUpdateRow`        | Function | Fires when row is updated                |
| `onUpdateColumn`     | Function | Fires when column is updated             |
| `onUpdateField`      | Function | Fires when field is updated              |
| `onAddRow`           | Function | Fires when row is added                  |
| `onAddColumn`        | Function | Fires when column is added               |
| `onAddField`         | Function | Fires when field is added                |
| `onRemoveRow`        | Function | Fires when row is removed                |
| `onRemoveColumn`     | Function | Fires when column is removed             |
| `onRemoveField`      | Function | Fires when field is removed              |
| `onSave`             | Function | Fires when form is saved                 |
| `onRender`           | Function | Fires when an element is rendered        |
| `confirmClearAll`    | Function | Fires when form is cleared               |

## DOM Event Listeners

Listen for custom events dispatched on the document:

```javascript
// Listen for any form update
document.addEventListener('formeoUpdated', (event) => {
  console.log('Form updated:', event.detail)
})

// Listen for changes (alias for formeoUpdated)
document.addEventListener('formeoChanged', (event) => {
  console.log('Form changed:', event.detail)
})

// Listen for specific component updates
document.addEventListener('formeoUpdatedField', (event) => {
  console.log('Field updated:', event.detail)
})
```

### Available DOM Events

| Event Name               | Description                              |
| ------------------------ | ---------------------------------------- |
| `formeoLoaded`           | Formeo has finished loading              |
| `formeoSaved`            | Form has been saved                      |
| `formeoUpdated`          | Form data has been updated               |
| `formeoChanged`          | Form data has changed (alias for updated)|
| `formeoUpdatedStage`     | Stage component was updated              |
| `formeoUpdatedRow`       | Row component was updated                |
| `formeoAddedRow`         | Row component was added                  |
| `formeoRemovedRow`       | Row component was removed                |
| `formeoUpdatedColumn`    | Column component was updated             |
| `formeoAddedColumn`      | Column component was added               |
| `formeoRemovedColumn`    | Column component was removed             |
| `formeoUpdatedField`     | Field component was updated              |
| `formeoAddedField`       | Field component was added                |
| `formeoRemovedField`     | Field component was removed              |
| `formeoCleared`          | Form has been cleared                    |
| `formeoOnRender`         | Component has been rendered              |
| `formeoConditionUpdated` | Conditional logic has been updated       |

## Event Data Structure

Events include detailed information about what changed:

```javascript
{
  timeStamp: 1699123456789,     // When the event occurred
  type: 'formeoUpdated',        // Event type
  detail: {                     // Event-specific details
    entity: Component,          // Component that changed
    dataPath: 'fields.abc123',  // Path to the component
    changePath: 'fields.abc123.attrs.label',  // Specific property
    value: 'New Label',         // New value
    previousValue: 'Old Label', // Previous value (if applicable)
    changeType: 'changed',      // 'added', 'removed', or 'changed'
    data: {...},                // Full component data
    src: HTMLElement            // DOM element (if applicable)
  }
}
```

## onChange vs onUpdate

Both callbacks receive the same event data, but serve different purposes:

- **`onChange`**: General notification that something in the form changed
- **`onUpdate`**: More specific notification about updates, can be used with component-specific variants

You can use either or both depending on your needs:

```javascript
const editor = new FormeoEditor({
  events: {
    // Handle all changes generically
    onChange: (evt) => {
      saveToLocalStorage(evt.detail)
    },
    
    // Handle updates with more granularity
    onUpdate: (evt) => {
      logChange(evt)
    },
    
    // Handle specific component updates
    onUpdateField: (evt) => {
      validateField(evt.detail)
    }
  }
})
```

## Mixing Both Approaches

You can use both configuration callbacks AND DOM event listeners together:

```javascript
// Configuration callback
const editor = new FormeoEditor({
  events: {
    onChange: (evt) => {
      console.log('Config callback:', evt)
    }
  }
})

// DOM event listener
document.addEventListener('formeoChanged', (evt) => {
  console.log('DOM listener:', evt.detail)
})
```

Both will be called when the form changes.

## Best Practices

1. **Use configuration callbacks** when you control the Formeo initialization
2. **Use DOM event listeners** when you need to react to Formeo events from external code
3. **Component-specific events** (like `onUpdateField`) are useful for targeted reactions
4. **Throttling**: The generic `formeoUpdated` event is automatically throttled to prevent excessive callbacks
5. **Event bubbling**: Set `bubbles: true` in configuration to enable event bubbling (useful for debugging)

## Example: Auto-save with Debounce

```javascript
import { debounce } from 'lodash'

const autoSave = debounce((formData) => {
  fetch('/api/forms/save', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' }
  })
}, 1000)

const editor = new FormeoEditor({
  events: {
    onChange: (evt) => {
      autoSave(evt.detail.data)
    }
  }
})
```

## Example: Field Validation

```javascript
const editor = new FormeoEditor({
  events: {
    onUpdateField: (evt) => {
      const { changePath, value } = evt.detail
      
      // Only validate when label changes
      if (changePath.endsWith('.attrs.label')) {
        if (!value || value.trim().length === 0) {
          console.warn('Field label cannot be empty')
        }
      }
    }
  }
})
```
