# Formeo

A pure JavaScript module for drag and drop form creation.

![npm](https://img.shields.io/npm/v/formeo.svg) ![GitHub](https://img.shields.io/github/license/Draggable/formeo.svg) [![build](https://github.com/Draggable/formeo/workflows/build/badge.svg)](https://github.com/Draggable/formeo/actions?query=workflow%3Abuild)

## [Demo](https://draggable.github.io/formeo/)

[![formeo-demo](https://user-images.githubusercontent.com/1457540/54798148-72c3c400-4c14-11e9-9d3f-bafe1ce0c8c1.gif)](https://draggable.github.io/formeo/)

## Features

- Drag & drop editing
- Extensible builder with plethora of options
- Column/inline fields
- Custom fields
- Preview mode
- i18n support

## Installation

### NPM

```
npm install --save formeo
```

### Manual

```
<script src="https://draggable.github.io/formeo/assets/js/formeo.min.js"></script>
```

## Usage

To start building forms with this module include formeo.min.js and formeo.min.css in your project and call:

```javascript
import { FormeoEditor, FormeoRenderer } from 'formeo'

// Set up a form builder
const editor = new FormeoEditor(options)

// When you're ready, grab the form data object
// Typically you'd do this in the "onSave" event, which you can configure through the editor's options object
const formData = editor.formData

// Then, when you're ready to render the form, use
const renderer = new FormeoRenderer(options)
renderer.render(formData)
```

## [Docs](https://github.com/Draggable/formeo/blob/master/docs/README.md)

## [Changelog](https://github.com/Draggable/formeo/blob/master/CHANGELOG.md)
