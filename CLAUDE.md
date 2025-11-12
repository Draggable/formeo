# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Formeo is a zero-dependency, highly configurable drag-and-drop form builder library. It provides two main classes:
- **FormeoEditor**: Visual form building interface with drag-and-drop capabilities
- **FormeoRenderer**: Renders form definitions into functional HTML forms

The library is framework-agnostic and provides TypeScript definitions. It's distributed as UMD, ES, and CommonJS modules.

## Development Commands

### Core Development
```bash
npm start                    # Build icons and start dev server at http://localhost:5173
npm run dev                  # Start dev server only
npm run build                # Build library and demo (runs build:lib first)
npm run build:lib            # Build library for distribution (both minified and unminified)
```

### Testing
```bash
npm test                                # Run unit tests with Node.js native test runner
npm run test:watch                      # Run tests in watch mode
npm run test:updateSnapshots            # Update test snapshots
npm run playwright:test                 # Run e2e tests
npm run playwright:test:ui          # Run e2e tests with browser UI
npm run playwright:test:report          # View Playwright test report
```

### Code Quality
```bash
npm run lint                 # Lint with Biome
npm run lint:fix            # Lint and auto-fix issues
npm run format              # Format code with Biome
```

### Other
```bash
npm run preview             # Preview production build locally
npm run build:icons         # Generate SVG sprite from icons
```

## Architecture

### Component Hierarchy

Formeo uses a hierarchical component system with four core levels:
1. **Stage** → top-level container (equivalent to a form/page)
2. **Row** → horizontal sections within a stage
3. **Column** → vertical divisions within a row (enables multi-column layouts)
4. **Field** → individual form controls (input, select, textarea, etc.)

Each component type is managed by dedicated data classes in `/src/lib/js/components/`:
- `stages/index.js` - StagesData
- `rows/index.js` - RowsData
- `columns/index.js` - ColumnsData
- `fields/index.js` - FieldsData

All components extend the base `Component` class (`/src/lib/js/components/component.js`), which provides:
- Event system with `addEventListener`/`removeEventListener`
- Data management via `get`/`set` methods
- DOM rendering with `render()` method
- Address-based component lookup (e.g., `stages.abc-123.rows`)

### Data Flow

**FormData Structure**: The canonical form definition is a flat structure with components keyed by ID:
```javascript
{
  id: "form-id",
  stages: { "stage-id": { id: "stage-id", attrs: {}, children: ["row-id-1"] } },
  rows: { "row-id-1": { id: "row-id-1", children: ["col-id-1"] } },
  columns: { "col-id-1": { id: "col-id-1", children: ["field-id-1"] } },
  fields: { "field-id-1": { id: "field-id-1", tag: "input", attrs: { type: "text" } } }
}
```

**Address System**: Components are accessed via dot-notation addresses: `stages.{id}.rows` or `fields.{id}.attrs.label`. See `splitAddress()` in `/src/lib/js/common/utils/string.mjs`.

**Components Singleton**: The `/src/lib/js/components/index.js` exports a singleton `Components` instance that acts as the central data store. Access it via:
- `Components.get(type, id)` - Get component instance
- `Components.getAddress('stages.abc-123')` - Get component by address
- `Components.formData` - Get complete form definition

### Key Modules

**DOM Utilities** (`/src/lib/js/common/dom.js`):
- `dom.render(data, tag)` - Render data to DOM elements
- `dom.create({tag, content, attributes})` - Create DOM elements
- `dom.empty(element)` - Remove all children
- Extensive DOM manipulation helpers

**Events System** (`/src/lib/js/common/events.js`):
- Global event bus for component communication
- Component-level events via `Component.addEventListener()`
- Supports bubbling and custom event data

**Actions System** (`/src/lib/js/common/actions.js`):
- Handles user actions (add, remove, clone, edit components)
- Integrates with undo/redo if enabled

**Controls** (`/src/lib/js/components/controls/index.js`):
- Extensible control registry for form field types
- Each control type (input, select, textarea, etc.) is defined in `/src/lib/js/components/controls/form/`
- Custom controls can be registered via the `controls` config option

**Edit Panel** (`/src/lib/js/components/edit-panel/edit-panel.js`):
- Sidebar for editing component properties
- Auto-generates edit forms based on control metadata

### Renderer Architecture

The `FormeoRenderer` class (`/src/lib/js/renderer/index.js`) converts formData into rendered HTML forms:
- Processes conditional logic (show/hide fields based on conditions)
- Handles field attributes, validation, and user data
- Exposes `userData` getter/setter for form values
- Completely separate from editor code (no shared DOM dependencies)

## Code Conventions

- **Formatting**: Use Biome (line width 120, single quotes, 2 spaces)
- **Module System**: ES modules (`.js` and `.mjs` files). Use `.mjs` for pure utility modules without DOM dependencies
- **Imports**: Relative paths required, import order enforced by Biome
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Constants**: UPPER_SNAKE_CASE in `/src/lib/js/constants.js`
- **Testing**: Use Node.js native test runner with snapshot support
- **Commits**: Conventional commits enforced (types: feat, fix, chore, docs, style, refactor, test, build, ci, perf, revert)

## Important Implementation Notes

- **Circular Dependencies**: Be aware that `Components` has circular imports with individual component types. The `/src/lib/js/components/index.js` carefully manages this with lazy loading.
- **Event System**: Components can define events in their config that fire during lifecycle (onCreate, onRender, onRemove). The Events module in `/src/lib/js/common/events.js` coordinates these.
- **Internationalization**: Uses `@draggable/i18n` package. Language files loaded from CDN by default. See `/src/lib/js/config.js` for i18n config.
- **Icons**: SVG sprite generated at build time from `/src/lib/icons/`. Icon references use the pattern `#formeo-sprite-{icon-name}`.
- **SessionStorage**: Editor can persist formData to sessionStorage. Controlled by `sessionStorage` option.
- **TypeScript**: No TypeScript source files, but type definitions should be maintained for consumers.

## Git Hooks

Lefthook is configured with:
- **pre-commit**: Runs Biome linting/formatting on staged files
- **pre-push**: Runs full test suite
- **commit-msg**: Validates conventional commit format

## Build Output

The build process produces:
- `dist/formeo.es.js` - ES module
- `dist/formeo.cjs.js` - CommonJS module
- `dist/formeo.umd.js` - UMD bundle (unpkg default)
- `dist/formeo.min.*.js` - Minified versions
- `dist/formeo.min.css` - Compiled styles
- `dist/formeo-sprite.svg` - Icon sprite
- `dist/formData_schema.json` - JSON Schema for form data validation

## CI/CD

- **Semantic Release**: Automated versioning and publishing to npm on main branch
- **GitHub Actions**: Playwright tests run on PRs, deploy to GitHub Pages on publish
- **Conventional Commits**: Required for proper semantic versioning

## Repository Structure

```
src/
├── lib/               # Core library source
│   ├── js/
│   │   ├── editor.js           # FormeoEditor main class
│   │   ├── renderer/           # FormeoRenderer implementation
│   │   ├── components/         # Component hierarchy (stages/rows/columns/fields)
│   │   ├── common/             # Shared utilities (dom, events, actions)
│   │   ├── config.js           # Default configuration
│   │   └── constants.js        # Global constants
│   ├── sass/          # Styles
│   └── icons/         # SVG icons for sprite generation
└── demo/              # Demo site source

tools/                 # Build and development utilities
dist/                  # Build output (gitignored)
docs/                  # Documentation
```
