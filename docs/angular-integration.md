# Angular + Formeo Integration Guide

## Why the Demo Doesn't Load Real Angular v20

The current Angular demo in `src/demo/js/frameworks/angular.js` simulates Angular patterns rather than loading the actual Angular framework for several technical reasons:

### Technical Limitations

1. **Dynamic ES Module Loading Complexity**
   - Angular v20 requires complex module resolution
   - Dependencies between @angular/core, @angular/common, @angular/platform-browser
   - Browser ES module loading limitations

2. **Bundle Size Impact**
   - Angular v20 with dependencies is ~200KB+ minified
   - Would significantly slow down demo loading
   - Not suitable for quick demonstrations

3. **Build Tool Requirements**
   - Angular typically requires compilation (TypeScript → JavaScript)
   - Template compilation and bundling
   - Zone.js and other runtime dependencies

4. **Runtime Environment Mismatch**
   - Demo runs in vanilla browser environment
   - Angular expects Node.js tooling ecosystem

## Recommended Alternatives

### Option 1: Complete Angular Project Example (Recommended)

Create a separate Angular project that demonstrates real integration:

```bash
# Create new Angular project
ng new formeo-angular-example --routing --style=scss
cd formeo-angular-example

# Install Formeo
npm install formeo

# Run development server
ng serve
```

**Benefits:**
- Real Angular v20 environment
- Proper TypeScript support
- Full Angular CLI tooling
- Production-ready patterns

### Option 2: Improved CDN Loading (Experimental)

Update the demo to use Angular's standalone CDN bundles:

```javascript
// Load Angular via CDN (Angular v20 standalone)
async function loadAngularFromCDN() {
  const scripts = [
    'https://unpkg.com/@angular/core@20/bundles/core.umd.js',
    'https://unpkg.com/@angular/common@20/bundles/common.umd.js',
    'https://unpkg.com/@angular/platform-browser@20/bundles/platform-browser.umd.js'
  ];
  
  for (const src of scripts) {
    await loadScript(src);
  }
}
```

**Limitations:**
- Still complex dependency management
- Large download size
- Limited TypeScript support
- Not recommended for production

### Option 3: Web Components Approach

Use Angular Elements to create a web component:

```typescript
// Create Angular Element
import { createCustomElement } from '@angular/elements';
import { FormBuilderComponent } from './form-builder.component';

const FormBuilderElement = createCustomElement(FormBuilderComponent, { injector });
customElements.define('formeo-angular-builder', FormBuilderElement);
```

**Benefits:**
- Can be loaded in any environment
- Encapsulated Angular functionality
- Framework-agnostic usage

### Option 4: Stackblitz/CodeSandbox Integration

Embed live Angular examples using online IDEs:

```html
<iframe src="https://stackblitz.com/edit/formeo-angular-v20?embed=1"
        width="100%" height="600px"></iframe>
```

## Current Demo Value

The current simulated demo is still valuable because it:

1. **Shows Integration Patterns**: Demonstrates proper Angular component structure
2. **Provides Copy-Paste Code**: Complete, working examples for real projects
3. **Educational Value**: Teaches Angular + Formeo integration concepts
4. **Performance**: Loads quickly without framework overhead

## Implementation Recommendation

For your use case, I recommend:

1. **Keep the current demo** for quick pattern demonstration
2. **Add a complete Angular project** in `/docs/angular-integration-example/`
3. **Update the demo documentation** to clearly explain the simulation
4. **Add links to the full project** for developers who want real integration

This approach provides both quick learning (demo) and complete implementation (separate project).

## Migration Path

If you want to enhance the current demo:

```javascript
// Enhanced demo with better Angular simulation
export async function loadAngularDemo(container) {
  // 1. Show comprehensive setup instructions
  // 2. Provide modern Angular v20 code examples
  // 3. Demonstrate advanced patterns (signals, standalone components)
  // 4. Include service-based architecture examples
  // 5. Add TypeScript type definitions
}
```

The updated demo now includes:
- Modern Angular v20 patterns
- Standalone components
- Angular signals
- Service-based architecture
- Better TypeScript examples
- Comprehensive integration guide
