# Framework Demos

This directory contains framework-specific demos for Formeo, allowing users to see how to integrate Formeo with different JavaScript frameworks.

## Structure

```
src/demo/js/frameworks/
├── vanilla.js      # Vanilla JavaScript demo (original implementation)
├── angular.js      # Angular integration demo
├── react.js        # React integration demo
└── [future-frameworks].js  # Placeholder for future framework demos
```

## Adding New Framework Demos

To add a new framework demo:

1. Create a new file in the `frameworks/` directory (e.g., `react.js`, `vue.js`)
2. Export an async function `load[Framework]Demo(container)` that:
   - Takes a DOM container element as parameter
   - Sets up the framework-specific demo content
   - Returns an object with `cleanup()` method for resource cleanup
3. Add the framework option to the select dropdown in `src/demo/index.html`
4. Import and add the framework to the `FrameworkLoader` class in `framework-loader.js`

## Framework Demo Requirements

Each framework demo should:

- **Provide working code examples** that developers can copy-paste
- **Show installation instructions** for the framework
- **Include component/service code** with proper TypeScript types when applicable
- **Demonstrate common patterns** like saving, loading, and clearing forms
- **Handle cleanup properly** to avoid memory leaks when switching frameworks
- **Follow the framework's best practices** and conventions

## Current Frameworks

### Vanilla JavaScript
- Located in: `vanilla.js`
- Shows the basic Formeo integration without any framework dependencies
- Includes all original demo functionality

### Angular
- Located in: `angular.js`
- Provides complete Angular component examples
- Shows proper Angular patterns for Formeo integration
- Includes TypeScript code with proper typing
- Demonstrates component lifecycle management

### React
- Located in: `react.js`
- Provides modern React hooks and patterns
- Shows custom hooks for Formeo integration
- Includes TypeScript examples with proper typing
- Demonstrates functional components and context patterns

## Future Framework Ideas

- **Vue.js**: Vue 3 Composition API examples
- **Svelte**: Modern Svelte component patterns
- **Lit**: Web Components with Lit library
- **Next.js**: Server-side rendering with React and Formeo
- **Nuxt.js**: Server-side rendering with Vue and Formeo

## Performance Considerations

The framework loader is designed to be performant by:

- Only loading the active framework demo
- Properly cleaning up resources when switching frameworks
- Using dynamic imports for framework-specific code
- Avoiding bundle size bloat through code splitting
