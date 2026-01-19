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

Returns a Promise that resolves when the editor reaches the `ready` state. This is the recommended way to wait for initialization.

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
2. **SessionStorage** - If `sessionStorage: true` option is set and data exists
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

  editor.whenReady().then(() => {
    setIsReady(true)
  })

  return () => {
    // Cleanup if needed
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
