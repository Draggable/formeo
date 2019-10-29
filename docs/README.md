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
  - works with external data
- Controls API
  - create forms with signature pads, interactive maps and more
  - extend or clone the built-in controls
- External Data
  - User session information in your forms such as name
  - Dynamic data like remotely loaded select options
- Rendering
  - render your form template using the same renderer used to generate the Formeo UI
  - or BYOR (Bring Your Own Renderer) to render form template data using third-party libraries.

## Usage

To start building forms with this module include formeo.min.js and formeo.min.css in your project and call:

```javascript
import { FormeoEditor, FormeoRenderer } from 'formeo'

// Set up a form builder
const editor = new FormeoEditor() // or:
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

Initialize an editor. If no [`options` object](options/) is supplied, the editor attaches itself to the first element it finds with the class `formeo-wrap`.

The `formData` object represents a form. It sets the initial form data for the `FormeoEditor`. For example, if you're editing an existing form, you can pass this object to restore the editor to the previous state.

#### `FormeoEditor#formData`

Get the form data object. That is, an object representing the current state of the form.

#### `FormeoEditor#json`

Get a JSON form of the form data

### `FormeoRenderer`

#### `new FormeoRenderer([options[, formData]])`

Initialize a renderer. If no [`options` object](options/) is supplied, the renderer attaches itself to the first element it finds with the class `formeo-wrap`.

The `formData` object represents the form to render. It can be replaced later using the `FormeoRenderer#render()` function.

#### `FormeoRenderer#render([formData])`

Render the form, or update the rendered form to use the given `formData` object.


## [Options](options/)

## [Build Tools](tools/)
