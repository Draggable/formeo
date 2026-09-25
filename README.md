# Formeo

A highly configurable drag & drop form building module for creating dynamic, responsive forms with an intuitive visual editor.

![npm](https://img.shields.io/npm/v/formeo.svg) ![npm downloads](https://img.shields.io/npm/dm/formeo.svg) ![GitHub](https://img.shields.io/github/license/Draggable/formeo.svg) [![build](https://github.com/Draggable/formeo/actions/workflows/publish.yaml/badge.svg)](https://github.com/Draggable/formeo/actions/workflows/publish.yaml)

## [Demo](https://formeo.io)

[![formeo-demo](https://user-images.githubusercontent.com/1457540/54798148-72c3c400-4c14-11e9-9d3f-bafe1ce0c8c1.gif)](https://formeo.io)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Framework Integration](#framework-integration)
- [Theming](#theming)
- [Documentation](#documentation)
- [Development](#development)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Features

- 🎯 **Drag & Drop Editing** - Intuitive visual form builder
- 📐 **Column/Inline Layout** - Create multi-column forms and inline field groups
- 🔀 **Conditional Fields** - Show/hide fields based on user input
- 🎨 **Custom Controls** - Extensible control API for custom field types
- 🌍 **i18n Support** - Multi-language support out of the box
- 📱 **Responsive** - Mobile-friendly form editor and renderer
- ⚡ **Zero Config** - Works out of the box with sensible defaults
- 🔧 **Highly Configurable** - Extensive options and event system
- 📦 **TypeScript Support** - Full type definitions included
- 🎭 **Preview Mode** - Test forms before deployment

## Installation

### NPM

```bash
npm install formeo
```

### Yarn

```bash
yarn add formeo
```

### CDN

For quick prototyping or simple projects, you can use a CDN:

```html
<!-- JavaScript -->
<script src="https://unpkg.com/formeo@latest/dist/formeo.umd.js"></script>

<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/formeo@latest/dist/formeo.min.css">
```

## Usage

### Basic Setup

First, import Formeo into your project:

```javascript
import { FormeoEditor, FormeoRenderer } from 'formeo'
import 'formeo/dist/formeo.min.css'
```

### Creating a Form Editor

```javascript
// Create a container element in your HTML
// <div id="formeo-editor"></div>

const editorOptions = {
  editorContainer: '#formeo-editor',
  // Add any additional options here
}

// Initialize the editor
const editor = new FormeoEditor(editorOptions)
```

### Saving Form Data

```javascript
// Get the form data (typically in an onSave event)
const formData = editor.formData

// Save to your backend
fetch('/api/forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

### Rendering a Form

```javascript
// Create a container element for the rendered form
// <div id="formeo-renderer"></div>

const rendererOptions = {
  renderContainer: '#formeo-renderer',
  // Add any additional options here
}

// Initialize the renderer and render the form
const renderer = new FormeoRenderer(rendererOptions)
renderer.render(formData)
```

### Complete Example

```javascript
import { FormeoEditor, FormeoRenderer } from 'formeo'
import 'formeo/dist/formeo.min.css'

// Set up the editor
const editor = new FormeoEditor({
  editorContainer: '#formeo-editor',
  events: {
    onSave: (formData) => {
      console.log('Form saved:', formData)
      // Render the form
      renderer.render(formData.formData)
    }
  }
})

// Set up the renderer
const renderer = new FormeoRenderer({
  renderContainer: '#formeo-renderer'
})
```

### TypeScript

Formeo includes TypeScript definitions. Import and use with full type support:

```typescript
import { FormeoEditor, FormeoRenderer } from 'formeo'
import type { FormeoOptions, FormData } from 'formeo'

const options: FormeoOptions = {
  editorContainer: '#formeo-editor'
}

const editor = new FormeoEditor(options)
const formData: FormData = editor.formData
```

## Framework Integration

Formeo can be integrated with popular frontend frameworks:

- **[React Integration Guide](https://github.com/Draggable/formeo/blob/main/docs/react-integration.md)** - Custom hooks, functional components, and Context API patterns
- **[Angular Integration Guide](https://github.com/Draggable/formeo/blob/main/docs/angular-integration.md)** - Services, components, and standalone patterns

## Theming

Every color formeo uses is a `--formeo-*` CSS custom property, declared on `:root` with zero specificity. Override them on `:root` or `<body>`: formeo appends its dialogs to `document.body`, so a rule scoped to the editor's container misses them. A narrower selector works too if it also covers `.formeo-dialog` and, when you move the controls panel with `controls.container`, `.formeo-controls`. For example, to map your own dark theme:

```css
:root {
  color-scheme: dark;
  color: #fafafa;
  --formeo-bg: #0a0a0a;
  --formeo-bg-hover: #1a1a1a;
  --formeo-text: #fafafa;
  --formeo-border: #262626;
  --formeo-icon: #e5e5e5;
}
```

- **Dark preset:** add the `formeo-dark` class to `<body>` (or `:root`). It sets `color-scheme: dark` on that subtree, so your own native controls inside it darken too. Dialogs take the preset's background and text colors as well.
- **Your own dark theme:** set `color-scheme: dark` as well, and make sure your mapping's scope includes `.formeo-dialog`. Outside the preset, formeo leaves the dialog's own background and text color, the text color of inputs and selects, and the checkboxes to the browser, which only switches them to dark-mode colors under a dark `color-scheme`.
- **Text color:** outside the dark preset, the editor and controls containers inherit the page's `color`. Setting `--formeo-text` alone only recolors text formeo colors explicitly, not inherited labels, so set `color` on your container too.
- **Derived properties:** some defaults are computed from another color at build time and don't follow when you override that color. If you change the base, override these too: `--formeo-bg-hover`, `--formeo-overlay`, `--formeo-danger-subtle`, `--formeo-column-outline-soft`, and the `--formeo-*-highlight` / `--formeo-*-highlight-text` properties.

The full list, with defaults, is in [`_properties.scss`](https://github.com/Draggable/formeo/blob/main/src/lib/sass/base/_properties.scss). It isn't included in the npm package. The groups, without the `--formeo-` prefix, are:

- **Surfaces:** `bg`, `bg-hover`, `surface-muted`, `stage-bg`, `stage-shadow`, `overlay`
- **Text and icons:** `text`, `text-strong`, `text-secondary`, `text-muted`, `text-subtle`, `on-accent`, `icon`
- **Borders and focus:** `border`, `border-strong`, `focus`
- **Accents:** `primary`, `success`, `warning` and `danger` (each with a `-dark` variant), `danger-subtle`, `info`, `remove-bg`
- **Component outlines:** `{stage,row,column,field,option}-outline`, `-outline-text`, `-highlight` and `-highlight-text`, plus `column-outline-soft`

**Visual changes from 5.1.3:** icons that hard-coded `#444` (header, paragraph and the triangles) now use `--formeo-icon`, which defaults to `#000`. The column resize-handle triangles now use the column outline color (`--formeo-column-outline-soft`, or the darker `--formeo-column-outline` on hover) instead of `#444`.

## Documentation

Comprehensive documentation is available in the [docs](https://github.com/Draggable/formeo/blob/main/docs/README.md) directory:

- **[Options](https://github.com/Draggable/formeo/blob/main/docs/options/README.md)** - Complete configuration reference
- **[Controls](https://github.com/Draggable/formeo/blob/main/docs/controls/README.md)** - Custom field types and controls API
- **[Events](https://github.com/Draggable/formeo/blob/main/docs/options/events/README.md)** - Available events and callbacks
- **[Actions](https://github.com/Draggable/formeo/blob/main/docs/options/actions/README.md)** - Action handlers
- **[Editor API](https://github.com/Draggable/formeo/blob/main/docs/editor/README.md)** - Editor methods and properties
- **[Build Tools](https://github.com/Draggable/formeo/blob/main/docs/tools/README.md)** - Development and build utilities

## Development

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)
- npm or yarn

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Draggable/formeo.git
cd formeo

# Install dependencies
npm install

# Start development server
npm start
```

The demo will be available at `http://localhost:5173/`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build library and demo
npm run build:lib    # Build library only
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code with Biome
```

### Running Tests

```bash
# Unit tests
npm test

# End-to-end tests
npm run playwright:test

# View test report
npm run playwright:test:report
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Draggable/formeo/blob/main/CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and conventions
- Submitting pull requests
- Reporting issues

## License

Formeo is [MIT licensed](https://github.com/Draggable/formeo/blob/main/LICENSE).

## [Docs](https://github.com/Draggable/formeo/blob/main/docs/README.md)

## [Changelog](https://github.com/Draggable/formeo/blob/main/CHANGELOG.md)

---

Made with ❤️ by [Draggable](https://draggable.io)
