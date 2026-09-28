# Formeo

A highly configurable drag & drop form building module.

<div class="formeo-editor"></div>

## Introduction

Formeo is an extensible form editor written in vanilla Javascript. It builds on years of experience in creating [formBuilder](https://formbuilder.online/) and implements many of the feature requests received for that plug-in. A great deal a focus went into API development for Formeo to make almost every part of it pluggable.

### Features

- Column/inline field support
  - generate layouts for your form's fields
  - numerous presets for common layouts and resizable for custom layouts
- Conditional fields
  - programmatically hide/show or change row, column or field values
- Controls API
  - create forms with signature pads, interactive maps and more
  - extend or clone the built-in controls
- Rendering
  - render your form template using the same renderer used to generate the Formeo UI
  - or BYOR (Bring Your Own Renderer) to render form template data using third-party libraries.

## Usage

To start building forms with this module include formeo.min.js and formeo.min.css in your project and call:

```javascript
import { FormeoEditor, FormeoRenderer } from 'formeo'

// Set up a form builder
const editor = new FormeoEditor(options, formData)

// When you're ready, grab the form data object
// Typically you'd do this in the "onSave" event, which you can configure through the editor's options object
const formData = editor.formData

// Then, when you're ready to render the form, use
const renderer = new FormeoRenderer(options)
renderer.render(formData)
```

## API Reference

### `FormeoEditor`

#### `new FormeoEditor([options[, formData]])`

Initialize an editor. `options.editorContainer` (selector, element or jQuery object) sets where the editor is added. Without it, the editor isn't added to the page.

The `formData` object represents a form. It sets the initial form data for the `FormeoEditor`. For example, if you're editing an existing form, you can pass this object to restore the editor to the previous state.

#### `FormeoEditor#formData`

Get the form data object. That is, an object representing the current state of the form.

#### `FormeoEditor#json`

Get a JSON form of the form data

#### `FormeoEditor#initState`

Get the current initialization state. Returns one of: `'created'`, `'loading'`, `'initializing'`, `'ready'`, `'error'`, or `'destroyed'`.

#### `FormeoEditor#isReady`

Returns `true` if the editor has completed initialization and is ready for use.

#### `FormeoEditor#whenReady()`

Returns a Promise that resolves when the editor is ready. Useful for ensuring the editor is fully initialized before interacting with it. It rejects if initialization fails, and with `Error('Editor was destroyed')` if the editor is destroyed before or while it initializes.

```javascript
const editor = new FormeoEditor(options, formData)
await editor.whenReady()
// Editor is now fully initialized
console.log(editor.formData)
```

#### `FormeoEditor#clear()`

Reset the editor to its initial empty state. See [editor-clear-method.md](editor/editor-clear-method.md) for details.

#### `FormeoEditor#destroy()`

Remove the editor and its controls from the page and release what it holds: drag-and-drop instances, resize observers, its window resize listener, pending event callbacks and loaded components. None of its `events` callbacks (`onUpdate`, `onChange`, `onAdd`, `onRemove`, `onRender`, `onSave` and the rest) runs afterwards. `formData` and `json` return an empty form once it is destroyed, so read them first. Other editors on the page keep working, and a new editor can be created in the same container. Safe to call more than once, and before the editor is ready. See [Destroying an editor](editor/initialization.md#destroying-an-editor) for what it releases and its current limits.

```javascript
editor.destroy()
editor = new FormeoEditor({ editorContainer: '#form-builder' })
```

#### `FormeoEditor#isDestroyed`

Returns `true` once `destroy()` has been called.

### `FormeoRenderer`

#### `new FormeoRenderer([options[, formData]])`

Initialize a renderer. `options.renderContainer` is required for `render()`. `getRenderedForm()` and `html` work without it.

The `formData` object represents the form to render. It can be replaced later using the `FormeoRenderer#render()` function.

#### `FormeoRenderer#render([formData])`

Render the form, or update the rendered form to use the given `formData` object.

#### `FormeoRenderer#destroy()`

Remove the rendered form from the page and stop its pagination (the page navigation's document listeners are removed; `page` returns `0` and `pageCount` `1` until the next `render()`). The renderer keeps its options and `formData`, so `render()` can be called again afterwards. Safe to call more than once, and before `render()`.


## [Options](options/)

## [Editor](editor/)

- [Initialization Lifecycle](editor/initialization.md) - Understanding the editor's async initialization process
- [Component Events](editor/component-events.md) - Component lifecycle event system
- [Clear Method](editor/editor-clear-method.md) - Resetting the editor to initial state

## [TypeScript](typescript.md)

Type definitions ship with the package; this page lists what is typed and how to narrow the before-hook details.

## [Using a CSS Framework](css-frameworks.md)

The rendered markup and its classes, adding framework classes with `className`, and editor theming.

## [Migrating from formBuilder](migrating-from-formbuilder.md)

Batch-converting formBuilder form exports to Formeo's `formData` shape with `formBuilder2Formeo`.

## [Build Tools](tools/)
