# Editor Initialization Lifecycle

## Overview

The FormeoEditor uses an asynchronous initialization process that loads resources (icons, CSS, i18n) before the editor becomes interactive. This document describes the initialization states and how to work with them.

## Initialization States

The editor progresses through the following states:

| State | Description |
|-------|-------------|
| `created` | Constructor has run, but async loading hasn't started |
| `loading` | Loading remote resources (icons, CSS, i18n) |
| `initializing` | Resources loaded, setting up controls and components |
| `ready` | Editor is fully initialized and ready for use |
| `error` | An error occurred during initialization |
| `destroyed` | `destroy()` was called; the editor is no longer on the page |

## State API

### `editor.initState`

Returns the current initialization state as a string.

```javascript
const editor = new FormeoEditor(options, formData)
console.log(editor.initState) // 'created' initially
```

### `editor.isReady`

Returns `true` if the editor has completed initialization.

```javascript
if (editor.isReady) {
  console.log('Editor is ready!')
}
```

### `editor.whenReady()`

Returns a Promise that resolves when the editor reaches the `ready` state. This is the recommended way to wait for initialization. If initialization fails, it rejects with the error that stopped it when `whenReady()` was already waiting on the editor's controls, and otherwise with `Error('Editor initialization failed')`. It rejects with `Error('Editor was destroyed')` if the editor is destroyed before or while it initializes, including a `whenReady()` that was already waiting.

```javascript
const editor = new FormeoEditor(options, formData)
await editor.whenReady()
// Safe to interact with the editor now
```

## Initialization Flow

```
┌─────────────┐
│   created   │  Constructor completes
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   loading   │  Loading icons, CSS, i18n
└──────┬──────┘
       │
       ▼
┌─────────────┐
│initializing │  Setting up controls, loading form data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    ready    │  Editor is fully functional
└─────────────┘
```

## Form Data Priority

When the editor initializes, it loads form data with the following priority:

1. **User-provided data** - Data passed to the constructor via `formData` option or second argument
2. **SessionStorage** - If the `sessionStorage` option is `true` or a key, and data is saved under that key
3. **Default empty form** - A new form with one empty stage

User-provided data is "locked" at construction time and preserved through the entire initialization process, preventing race conditions.

## Language Changes

When changing the editor language via `editor.i18n.setLang()`, the editor refreshes its UI without reloading form data. This ensures that:

- Form data is preserved when switching languages
- Only the UI labels and controls are updated
- No race conditions occur during language switching

```javascript
// This is safe - form data is preserved
await editor.whenReady()
editor.i18n.setLang('de-DE')
// Form data remains intact
```

## Best Practices

### Wait for Ready State

Always wait for the editor to be ready before interacting with form data:

```javascript
// Good
const editor = new FormeoEditor(options, formData)
await editor.whenReady()
console.log(editor.formData)

// Also good - using callback
const editor = new FormeoEditor({
  ...options,
  onLoad: (editor) => {
    console.log(editor.formData)
  }
}, formData)
```

### Framework Integration

When integrating with React, Angular, or other frameworks:

```javascript
// React example
useEffect(() => {
  const editor = new FormeoEditor(options, formData)
  editorRef.current = editor

  editor
    .whenReady()
    .then(() => setIsReady(true))
    .catch(error => {
      // StrictMode unmounts the first editor while it is still loading, so its whenReady() rejects
      if (!editor.isDestroyed) {
        console.error(error)
      }
    })

  return () => {
    editor.destroy()
  }
}, [])
```

### Checking State Before Operations

For operations that require a ready editor:

```javascript
function saveForm() {
  if (!editor.isReady) {
    console.warn('Editor not ready yet')
    return
  }
  const data = editor.formData
  // Save data...
}
```

## Exported Constants

The `INIT_STATES` constant is exported for type checking:

```javascript
import { FormeoEditor, INIT_STATES } from 'formeo'

const editor = new FormeoEditor(options)

if (editor.initState === INIT_STATES.READY) {
  // Editor is ready
}
```

Available states:
- `INIT_STATES.CREATED`
- `INIT_STATES.LOADING_RESOURCES`
- `INIT_STATES.INITIALIZING`
- `INIT_STATES.READY`
- `INIT_STATES.ERROR`
- `INIT_STATES.DESTROYED`

## Multiple editors on one page

Each `FormeoEditor` keeps its own form data, controls, conditions and event callbacks, so several editors can share a page:

```javascript
const orders = new FormeoEditor({ editorContainer: '#orders', sessionStorage: 'orders-form' })
const returns = new FormeoEditor({ editorContainer: '#returns', sessionStorage: 'returns-form' })
```

Each editor saves to and restores from its own key. Form data passed to the constructor wins over sessionStorage (see [Form Data Priority](#form-data-priority)), so an editor given `formData` always starts from that data and only uses its key for saving.

Give each editor its own `editorContainer`, and a distinct `sessionStorage` key if you use one (a warning is logged if two editors on the page share a key; an editor re-created after the previous one left the page, as in a remount, takes the key over without a warning). Some settings are page-wide and the last editor created wins: the icon sprite and icon font (`svgSprite`, `iconFont`), the stylesheet (`style`), and the interface language, which is also remembered in sessionStorage. `editor.i18n.setLang()` changes that page-wide language but only re-renders the editor it is called on; call it on each editor to update them all.

## Destroying an editor

`editor.destroy()` removes the editor and its controls from the page and releases what it holds:

- the drag-and-drop (Sortable) instances on its stages, rows, columns, controls and option lists
- the resize observers of its edit and control panels
- its window `resize` listener, and a resize update or trailing `onUpdate`/`onChange` that is still pending
- a control drag in progress from its controls, which ends: the drag ghost is removed and the page scrollbar comes back
- its loaded components, and its hold on its `sessionStorage` key, so a new editor can use the key without a warning
- the page-wide tooltip, but only when it is the last editor on the page; while other editors remain, they keep it

```javascript
const editor = new FormeoEditor({ editorContainer: '#form-builder' })

// later, when the modal or view closes
editor.destroy()

// a new editor can mount in the same container
const next = new FormeoEditor({ editorContainer: '#form-builder' })
```

After `destroy()`, `initState` is `'destroyed'` and `isDestroyed` is `true`. None of the editor's `events` callbacks (`onUpdate`, `onChange`, `onAdd`, `onRemove`, `onRender`, `onSave` and the rest) runs again, including one that was already scheduled. This covers the `events` option only: `actions` callbacks and `events` set in a component's `config` are not switched off.

`formData` and `json` return an empty form after `destroy()`, so read `formData` before calling it if you need the form.

`render()`, `load()`, `loadData()` and `clear()` do nothing, and `whenReady()` rejects with `Error('Editor was destroyed')`, including a `whenReady()` that was waiting when the editor was destroyed. `i18n.setLang()` doesn't re-render a destroyed editor, though it still changes the page-wide language; `editor.i18n` is only set once the editor's controls are built, so it is `undefined` on an editor destroyed before that point. An editor destroyed before it is ready never renders, and one destroyed from its own `onLoad` or `formeoLoaded` callback stays destroyed. `destroy()` is safe to call more than once.

Current limit: `destroy()` releases the components and controls the editor holds when it is called. When `clear()`, `load()`, `loadData()`, assigning `formData` or `i18n.setLang()` replaced components or controls earlier, the drag-and-drop instances and resize observers of the replaced ones are not released yet.

`destroy()` doesn't change sessionStorage: a saved form stays saved. It also leaves the container element in place, and leaves the page-wide settings (stylesheet, icon sprite, language) loaded. Other editors on the page keep working.
