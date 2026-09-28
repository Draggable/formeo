# Actions

| Option              | Type     | Description                                                                |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `add.attr`          | Function | Called when adding an attribute to an element                             |
| `add.option`        | Function | Called when adding an option to a field                                   |
| `add.condition`     | Function | Called when adding a condition to a field                                 |
| `add.config`        | Function | Called when adding a configuration item to a field                        |
| `remove.attrs`      | Function | Called before an attribute is removed with its × button; call `evt.removeAction()` to remove it. See [Removing single items](#removing-single-items) |
| `remove.options`    | Function | Called before an option is removed with its × button; call `evt.removeAction()` to remove it |
| `remove.conditions` | Function | Called before a condition is removed with its × button, and by "Clear All" in the conditions panel (`evt.isClearAll: true`); call `evt.removeAction()` to remove |
| `remove.component`  | Function | Called when a row, column or field's remove (×) button is clicked; call `evt.removeAction()` to remove it. Default: removes at once. See [Confirm before deleting](#confirm-before-deleting) |
| `remove.page`       | Function | Called before a page is removed from its tab; call `evt.removeAction()` to remove it. Default: removes an empty page, asks first for a page with content. See [Page Tabs](../../editor/pages.md#actions) |
| `click.btn`         | Function | Called when the Save button is clicked, just before `save.form`; `evt` is `{ action, coords, message, button }` |
| `save.form`         | Function | Called with the formData when the form is saved                           |

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

While `onBeforeRemove` (see [Before hooks](../events/README.md#before-hooks)) waits, a second click of the same ×
button is ignored, so `window.confirm` above can't be asked twice. But once `actions.remove.component` itself is
running, Formeo isn't holding anything: a custom `remove.component` that opens its own non-modal dialog and waits for
the user can be reached by a second click in the meantime, asking again. Make such a dialog modal, or have it ignore a
repeat while it's already open.

## Removing single items

Removing one attribute, option or condition with its × button calls `remove.attrs`, `remove.options` or
`remove.conditions`. "Clear All" in the conditions panel calls `remove.conditions` too. `evt` has:

| `evt` field    | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `type`         | `'attrs'`, `'options'` or `'conditions'`                           |
| `itemKey`      | The removed item's path, e.g. `'options[1]'` or `'attrs.required'`. Not set for "Clear All" |
| `component`    | The component that owns the item. Not set for "Clear All"           |
| `isClearAll`   | `true` for "Clear All", `false` for a single item                  |
| `removeAction` | Call it to remove. Only the first call does anything; after the panel is rebuilt a held single-item removal does nothing |

Handlers written before single items used these actions now also run for single items; check `evt.isClearAll` if
yours should only handle "Clear All". Configuration items (the `config` panel) have no remove action.

### Not supported yet

Attributes whose presence or options depend on the value of another attribute (for example, a `pattern` field that only appears when `type` is set to `text`) are not supported by the default add-attribute dialog. See [#233](https://github.com/Draggable/formeo/issues/233).
