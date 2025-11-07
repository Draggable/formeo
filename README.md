# Formeo

A highly configurable drag & drop form building module for creating dynamic, responsive forms with an intuitive visual editor.

![npm](https://img.shields.io/npm/v/formeo.svg) ![npm downloads](https://img.shields.io/npm/dm/formeo.svg) ![GitHub](https://img.shields.io/github/license/Draggable/formeo.svg) [![build](https://github.com/Draggable/formeo/workflows/build/badge.svg)](https://github.com/Draggable/formeo/actions?query=workflow%3Abuild)

## [Demo](https://formeo.io)

[![formeo-demo](https://user-images.githubusercontent.com/1457540/54798148-72c3c400-4c14-11e9-9d3f-bafe1ce0c8c1.gif)](https://formeo.io)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Framework Integration](#framework-integration)
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
  editorContainer: '#formeo-renderer',
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
      renderer.render(formData)
    }
  }
})

// Set up the renderer
const renderer = new FormeoRenderer({
  editorContainer: '#formeo-renderer'
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
