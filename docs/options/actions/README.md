# Actions

| Option              | Type     | Description                                                                |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `add.attr`          | Function | Called when adding an attribute to an element                             |
| `add.option`        | Function | Called when adding an option to a field                                   |
| `add.condition`     | Function | Called when adding a condition to a field                                 |
| `add.config`        | Function | Called when adding a configuration item to a field                        |
| `remove.attrs`      | Function | Defined, but no "Clear All" button is currently rendered in the attributes panel; calls `evt.removeAction()`  |
| `remove.options`    | Function | Defined, but no "Clear All" button is currently rendered in the options panel; calls `evt.removeAction()`    |
| `remove.conditions` | Function | Called by "Clear All" in the conditions panel; calls `evt.removeAction()` |
| `remove.component`  | Function | Called when a row, column or field's remove (×) button is clicked; call `evt.removeAction()` to remove it. Default: removes at once. See [Confirm before deleting](#confirm-before-deleting) |
| `remove.page`       | Function | Called before a page is removed from its tab; call `evt.removeAction()` to remove it. Default: removes an empty page, asks first for a page with content. See [Page Tabs](../../editor/pages.md#actions) |
| `click.button`      | Function | Called when clicking a form action button                                 |
| `save`              | Function | Called when saving                                                        |

With Actions you can modify or completely replace some editor functions. By default, adding an attribute opens a small dialog in the editor. Define `add.attr` to use your own UI or extra validation.

## Full Example

```javascript
// evt: { addAction(name, value), isDisabled(propName), isLocked(propName), message: { attr, value }, btnCoords }
function addAttribute(evt) {
  openMyModal({
    title: evt.message.attr,
    onSave: (name, value) => {
      if (evt.isDisabled(`attrs.${name}`)) {
        return false // your own modal: keep it open (Formeo's Dialog doesn't use this)
      }
      evt.addAction(name, value) // pass strings, not input elements
    },
  })
}

const editor = new FormeoEditor({
  editorContainer: '#formeo-editor',
  actions: {
    add: {
      attr: addAttribute, // pass the function itself; don't call it
    },
  },
})
```

## Confirm before deleting

`actions.remove.component(evt)` runs when a row, column or field's remove button is clicked. Formeo only removes the
component when you call `evt.removeAction()`, so you can ask first, or call it later from your own dialog. Not calling
it cancels the removal.

| `evt` field     | Description                                           |
| --------------- | ----------------------------------------------------- |
| `component`     | The row, column or field about to be removed          |
| `componentType` | `'row'`, `'column'` or `'field'`                      |
| `componentId`   | Its id                                                |
| `removeAction`  | Call it to remove the component. Only the first call does anything |

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  actions: {
    remove: {
      component: evt => {
        if (window.confirm(`Delete this ${evt.componentType}?`)) {
          evt.removeAction()
        }
      },
    },
  },
})
```

### Not supported yet

Attributes whose presence or options depend on the value of another attribute (for example, a `pattern` field that only appears when `type` is set to `text`) are not supported by the default add-attribute dialog. See [#233](https://github.com/Draggable/formeo/issues/233).
