# React + Formeo Integration Guide

## Overview

The React integration demo showcases modern React patterns for integrating Formeo into React applications. It includes examples of hooks, functional components, context patterns, and TypeScript integration.

## Key Features

### 🎣 **Custom React Hooks**
- `useFormeoEditor`: Manages Formeo editor instances with React lifecycle
- `useFormeoRenderer`: Handles form rendering with proper cleanup
- Automatic memory management and cleanup

### ⚛️ **Modern React Patterns**
- Functional components with hooks
- React Context for global state management
- TypeScript support with proper typing
- Error boundaries and error handling

### 🎨 **Enhanced User Experience**
- Syntax highlighting for all code examples
- Interactive demo with React-like behavior
- Export functionality for form data
- Real-time form state management

## Code Examples Included

### 1. Custom Hooks
- Complete implementation of `useFormeoEditor` and `useFormeoRenderer`
- Proper dependency management and cleanup
- React lifecycle integration

### 2. Functional Components
- Modern React component with hooks
- Event handling and state management
- Form persistence and export features

### 3. Context Provider
- Global state management for multiple forms
- Reducer pattern for complex state
- Provider/Consumer pattern

### 4. TypeScript Integration
- Complete type definitions
- Interface declarations
- Proper typing for all components

## Installation Guide

```bash
# Create new React project
npx create-react-app my-formeo-app
cd my-formeo-app

# Install Formeo
npm install formeo

# Optional: Add TypeScript support
npm install --save-dev @types/react @types/react-dom typescript
```

## Best Practices Demonstrated

- **Memory Management**: Proper cleanup of Formeo instances
- **State Management**: Using React hooks and context effectively
- **TypeScript**: Complete type safety and IntelliSense support
- **Performance**: Efficient re-rendering and memoization
- **Error Handling**: Graceful error boundaries and fallbacks

## Integration Patterns

The demo shows three main integration approaches:

1. **Basic Hook Integration**: Simple useEffect-based setup
2. **Advanced Hook Pattern**: Custom hooks with complete lifecycle management
3. **Context-Based Architecture**: Global state management for complex applications

Each pattern is suitable for different use cases and complexity levels.

## Demo Structure

The React demo includes:
- **Interactive Editor**: Full Formeo editor with React integration
- **Live Renderer**: Real-time form rendering
- **Code Examples**: Copy-paste ready implementations
- **Syntax Highlighting**: Enhanced code readability
- **Export Features**: JSON export and form persistence

## Next Steps

For a complete React project with Formeo:
1. Follow the installation guide above
2. Copy the hook implementations from the demo
3. Integrate the components into your application
4. Customize styling and behavior as needed

The demo provides production-ready code that can be directly used in React applications.
