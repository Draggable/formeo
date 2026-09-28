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
| `onRemove`           | Function | Fires when a row, column or field is removed, or a page (with `pages`) |
| `onAddStage`         | Function | Fires when a page (stage) is added. See [Page Tabs](../../editor/pages.md#events) |
| `onRemoveStage`      | Function | Fires when a page (stage) is removed. See [Page Tabs](../../editor/pages.md#events) |
| `onChange`           | Function | Fires when form data changes             |
| `onUpdate`           | Function | Fires when form data changes, including removals (throttled; receives the whole formData as detail) |
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
| `onBeforeRemove`     | Function | Runs before a row, column, field or page is removed by the user; can cancel or hold it. See [Before hooks](#before-hooks) |
| `onBeforeAdd`        | Function | Runs before the user adds a row, column or field from the controls, or a page; can cancel or hold it. See [Before hooks](#before-hooks) |
| `onBeforeClone`      | Function | Runs before the user clones a row, column or field; can cancel or hold it. See [Before hooks](#before-hooks) |
| `onBeforeSave`       | Function | Runs before the Save button saves; can cancel or hold it. See [Before hooks](#before-hooks) |
| `onSave`             | Function | Fires when form is saved                 |
| `onRender`           | Function | Fires when an element is rendered        |
| `onEditOpen`         | Function | Fires when a row, column or field's edit panel opens. See [Edit panel events](#edit-panel-events) |
| `onEditClose`        | Function | Fires when a row, column or field's edit panel closes. See [Edit panel events](#edit-panel-events) |
| `onPageChange`       | Function | Fires when the active page tab switches (with the `pages` option). See [Page Tabs](../../editor/pages.md#events) |
| `confirmClearAll`    | Function | Fires when form is cleared               |

`onAdd`, `onAddRow`, `onAddColumn` and `onAddField` fire for rows, columns and fields added after the editor loads, not for the ones loaded from `formData`. `onAdd` also fires, with `onAddStage`, for a page added after the editor loads (with `pages`).

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
| `formeoBeforeRemove`     | Before a user removes a row, column, field or page; cancelable. See [Before hooks](#before-hooks) |
| `formeoBeforeAdd`        | Before a user adds a row, column, field or page; cancelable. See [Before hooks](#before-hooks) |
| `formeoBeforeClone`      | Before a user clones a row, column or field; cancelable. See [Before hooks](#before-hooks) |
| `formeoBeforeSave`       | Before the Save button saves; cancelable. See [Before hooks](#before-hooks) |
| `formeoCleared`          | Form has been cleared                    |
| `formeoOnRender`         | Component has been rendered              |
| `formeoEditOpened`       | A row, column or field's edit panel opened |
| `formeoEditClosed`       | A row, column or field's edit panel closed |
| `formeoConditionUpdated` | Conditional logic has been updated       |

Like the callbacks, `formeoAddedRow`, `formeoAddedColumn` and `formeoAddedField` fire for components added after load, not for components loaded from `formData`.

Callbacks passed in `events` only fire for their own editor. DOM events on `document` fire for every editor on the page, and some of them carry no source element, so to tell editors apart use each editor's `events` callbacks. `formeoLoaded`'s `event.detail.formeo` does tell you which editor loaded.

## Before hooks

Before hooks run before the user changes the form, and can cancel the change or make it wait. Each one is both an
option callback and a cancelable DOM event.

| Callback         | DOM event            | Runs before                                                                                                 | `detail` |
| ---------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| `onBeforeAdd`    | `formeoBeforeAdd`    | a row, column or field is added by clicking or dropping a control, or a page with the + tab (with `pages`)    | `{ componentType, controlId, data, parent, index, addedVia }`; a page has only `componentType: 'stage'` and `index` |
| `onBeforeRemove` | `formeoBeforeRemove` | a row, column or field is removed with its × button, or a page with its × or <kbd>Delete</kbd> (with `pages`) | `{ component, componentType, componentId }`; a page adds `index`, `title` and `isEmpty` |
| `onBeforeClone`  | `formeoBeforeClone`  | a row, column or field is cloned with its clone button                                                        | `{ component, componentType, componentId, parent }` |
| `onBeforeSave`   | `formeoBeforeSave`   | the Save button saves (before `actions.click.btn`, `actions.save.form`, the `sessionStorage` copy and `onSave`) | `{ formData }`; an allowed save saves this same formData |

For `onBeforeAdd`, `componentType` is what the control creates (`'field'`, `'row'`/`'column'` for the layout
controls, or `'controlSet'` for a [control set](../../controls/custom-controls.md#control-sets)), `controlId` is the
control's id (e.g. `'text-input'`), and `data` is what a new field starts from, or a set's `{ layout, row, fields }`;
treat it as read-only. `parent` and `index` say where it goes: the page and its row count for a click (every click
adds a new row at the end), or the stage, row or column it was dropped on and the drop position. `addedVia` is
`'click'` or `'dragDrop'`. A field dropped on a page or row also gets a new row or column around it; those don't run
hooks of their own. A control set always becomes a new row: `parent` and `index` are its page and position. If the
component it was dropped on is removed while the hook waits, nothing is added.

A callback cancels by returning `false` or calling `evt.preventDefault()`. To make Formeo wait, return a Promise: the
change happens when it resolves, and is cancelled if it resolves to `false`. A callback that throws, or a Promise that
rejects, also cancels; the error is logged.

```javascript
new FormeoEditor({
  events: {
    // ask your server whether the field is still in use
    onBeforeRemove: async ({ detail }) => {
      if (detail.componentType !== 'field') return true
      const response = await fetch(`/api/fields/${detail.componentId}/usage`)
      const { inUse } = await response.json()
      return !inUse
    },
  },
})
```

```javascript
new FormeoEditor({
  events: {
    // don't save a form without fields
    onBeforeSave: ({ detail }) => Object.keys(detail.formData.fields).length > 0,
  },
})
```

The DOM event is dispatched somewhere inside the editor, not always on the component's element: on the component's
element for `formeoBeforeRemove`, `formeoBeforeClone` and a dropped `formeoBeforeAdd`, but on the controls panel for a
clicked `formeoBeforeAdd`, the Save button for `formeoBeforeSave`, and the page tab list for a page's `formeoBeforeAdd`.
Either way it bubbles to `document` (unless `bubbles: false`). A listener cancels with `evt.preventDefault()`,
synchronously only:

```javascript
document.addEventListener('formeoBeforeRemove', evt => {
  if (evt.detail.componentType === 'row') evt.preventDefault()
})
```

The order is: the DOM event, then the callback (skipped if a listener cancelled), then the
[action](../actions/README.md) if there is one (`actions.remove.component`, or `actions.remove.page` for a page), then
the change and its usual events (`onRemove`, `onUpdate`, …). While a removal waits on its hook, clicking × again for
the same component is ignored, and while a save waits, clicking Save again is ignored. If the editor is destroyed
while a hook waits, the change never happens.

Before hooks only run for changes the user makes in the editor. Calling `addChild()`, `remove()`, `pages.add()` or
`clear()` from your code, dragging an existing component to a new place, and "Clear All" (see `confirmClearAll`)
don't run them.

## Edit panel events

`onEditOpen` and `onEditClose` fire when a row, column or field's edit panel opens or closes, with
`detail: { component, componentType, componentId }`. The `formeoEditOpened` and `formeoEditClosed` DOM events carry
the same `detail`; they're dispatched on the component's element and bubble to `document`. They only fire when the
panel actually opens or closes, can't be cancelled, and don't fire when a component is removed with its panel open.
formBuilder's `onOpenFieldEdit`/`onCloseFieldEdit` map to these, filtered to `componentType === 'field'`.

```javascript
new FormeoEditor({
  events: {
    onEditOpen: ({ detail }) => {
      if (detail.componentType === 'field') showFieldHelp(detail.componentId)
    },
    onEditClose: () => hideFieldHelp(),
  },
})
```

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

Removals use `changeType: 'removed'`. When a row, column or field is removed the detail also has `componentId` and `componentType`, and `changePath` points at the parent's children list.

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
