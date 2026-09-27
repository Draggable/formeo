# Editor

`FormeoEditor` is the drag-and-drop form builder. This page lists its public methods and properties; the guides below go deeper.

- [Initialization Lifecycle](initialization.md) - how the editor loads resources and when it is ready
- [Component Events](component-events.md) - events fired by stages, rows, columns and fields
- [Clear Method](editor-clear-method.md) - resetting the editor to an empty form
- [Page Tabs](pages.md) - multi-page forms: add, rename, remove, reorder and switch pages
- [Options](../options/README.md) - everything you can pass to the constructor

## Constructor

```javascript
import { FormeoEditor } from 'formeo'

const editor = new FormeoEditor(options, formData)
```

| Argument   | Type             | Description                                                                                  |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `options`  | Object           | Required. See [Options](../options/README.md). Pass `{}` for defaults.                        |
| `formData` | Object \| String | Optional form definition (or its JSON string) to load. Takes priority over `options.formData`. |

Set `editorContainer` to an element or selector, otherwise the editor is built but not attached to the page.

## Properties

| Property      | Type    | Description                                                                         |
| ------------- | ------- | ----------------------------------------------------------------------------------- |
| `formData`    | Object  | The current form definition. Assigning a new value reloads the editor with it.      |
| `json`        | String  | `formData` serialised as JSON, with a `$schema` reference.                          |
| `initState`   | String  | `'created'`, `'loading'`, `'initializing'`, `'ready'`, `'error'` or `'destroyed'`.  |
| `isReady`     | Boolean | `true` once `initState` is `'ready'`.                                               |
| `isDestroyed` | Boolean | `true` once `destroy()` has been called.                                            |
| `i18n.setLang` | Function | Switch the editor language at runtime. Available once ready. See [i18n](../options/i18n/README.md). |
| `pages`       | EditorPages \| null | Page tabs API when the `pages` option is on. See [Page Tabs](pages.md). |

## Methods

| Method                     | Returns   | Description                                                                 |
| -------------------------- | --------- | --------------------------------------------------------------------------- |
| `whenReady()`              | Promise   | Resolves with the editor once it has rendered. Rejects if initialization fails, or if the editor is destroyed before or while it initializes. See [Initialization](initialization.md). |
| `loadData(formData)`       | -         | Replace the form being edited. Same as assigning `editor.formData`.        |
| `clear()`                  | -         | Reset to an empty form. See [Clear Method](editor-clear-method.md).        |
| `render()`                 | -         | Re-render the editor into `editorContainer`.                                |
| `destroy()`                | -         | Remove the editor from the page and release its resources. See [Destroying an editor](initialization.md#destroying-an-editor). |

## Related

- [Renderer](../renderer/renderer.md) - render saved `formData` as a working form
- [Events](../options/events/README.md) and [Actions](../options/actions/README.md) - react to or override editor behaviour
