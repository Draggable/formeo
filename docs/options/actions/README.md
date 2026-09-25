# Actions

| Option              | Type     | Description                                                                |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `add.attr`          | Function | Called when adding an attribute to an element                             |
| `add.option`        | Function | Called when adding an option to a field                                   |
| `add.condition`     | Function | Called when adding a condition to a field                                 |
| `add.config`        | Function | Called when adding a configuration item to a field                        |
| `remove.attrs`      | Function | Called by "Clear All" in the attributes panel; calls `evt.removeAction()`  |
| `remove.options`    | Function | Called by "Clear All" in the options panel; calls `evt.removeAction()`    |
| `remove.conditions` | Function | Called by "Clear All" in the conditions panel; calls `evt.removeAction()` |
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
        return false // keep your modal open
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

### Not supported yet

Attributes whose presence or options depend on the value of another attribute (for example, a `pattern` field that only appears when `type` is set to `text`) are not supported by the default add-attribute dialog. See [#233](https://github.com/Draggable/formeo/issues/233).
