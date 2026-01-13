import { FormeoEditor, FormeoRenderer } from '../../../lib/js/index.js'
import { editorOptions, renderOptions } from '../options/index.js'

/**
 * React Integration Demo
 *
 * Note: This demo simulates React patterns rather than loading the full framework
 * due to browser compatibility and performance considerations. For a real React
 * integration, see the complete React project example in /docs/react-integration-example/
 */
export async function loadReactDemo(container) {
  // Show loading state while demo initializes
  container.innerHTML = `
    <div class="react-demo">
      <h3>React Integration Demo</h3>
      <p>Demonstrating Formeo integration patterns for React applications</p>
      <div class="loading-message">
        <p>Initializing React-style Formeo integration demo...</p>
      </div>
    </div>
  `

  try {
    // Initialize the React-style demo
    await initializeReactStyleDemo()

    // Load Highlight.js for syntax highlighting
    const hljs = await loadHighlightJs()
    if (hljs) {
      console.log('Highlight.js loaded successfully for React demo')
    }

    // Create the demo structure with comprehensive instructions
    container.innerHTML = `
      <div class="react-demo">
        <h3>React Integration Demo</h3>
        <div class="demo-description">
          <p>This demo shows how to integrate Formeo with React applications using modern hooks and patterns.</p>
          <div class="notice">
            <strong>Note:</strong> This is a pattern demonstration. For a complete React project with Formeo,
            see <code>/docs/react-integration-example/</code> in the repository.
          </div>
        </div>

        <div class="instructions-toggle">
          <button class="toggle-button" id="toggle-instructions">
            <span class="toggle-text">Show Implementation Guide</span>
            <span class="toggle-icon">▼</span>
          </button>
        </div>

        <div class="code-example" id="instructions-section" style="display: none;">
          <div class="guide-section">
            <h4>1. Install Dependencies</h4>
            <pre><code class="language-bash"># Create new React project
npx create-react-app my-formeo-app
cd my-formeo-app

# Install Formeo
npm install formeo

# Install additional dependencies for TypeScript (optional)
npm install --save-dev @types/react @types/react-dom typescript</code></pre>
          </div>

          <div class="guide-section">
            <h4>2. React Hook for Formeo</h4>
            <pre><code class="language-typescript">${escapeHtml(reactHookCode)}</code></pre>
          </div>

          <div class="guide-section">
            <h4>3. React Component Implementation</h4>
            <pre><code class="language-typescript">${escapeHtml(reactComponentCode)}</code></pre>
          </div>

          <div class="guide-section">
            <h4>4. Context Provider (Advanced)</h4>
            <pre><code class="language-typescript">${escapeHtml(reactContextCode)}</code></pre>
          </div>
        </div>

        <h4>Interactive Demo (React Patterns)</h4>
        <div class="react-app-container">
          <div id="react-app-root"></div>
        </div>
      </div>
    `

    // Initialize the real React application simulation
    const reactApp = await initializeReactApp()

    // Apply initial syntax highlighting
    applySyntaxHighlighting()

    // Add toggle functionality for instructions
    const toggleButton = container.querySelector('#toggle-instructions')
    const instructionsSection = container.querySelector('#instructions-section')
    const toggleText = toggleButton.querySelector('.toggle-text')
    const toggleIcon = toggleButton.querySelector('.toggle-icon')

    if (toggleButton && instructionsSection) {
      toggleButton.addEventListener('click', () => {
        const isExpanded = instructionsSection.style.display === 'block'
        instructionsSection.style.display = isExpanded ? 'none' : 'block'
        toggleText.textContent = isExpanded ? 'Show Implementation Guide' : 'Hide Implementation Guide'
        toggleIcon.textContent = isExpanded ? '▼' : '▲'

        // Apply syntax highlighting when instructions are shown
        if (!isExpanded) {
          // Small delay to ensure DOM is updated
          setTimeout(() => applySyntaxHighlighting(), 50)
        }
      })
    }

    return {
      reactApp,
      cleanup: () => {
        // Cleanup React application
        if (reactApp?.cleanup) {
          reactApp.cleanup()
        }

        // Clear the container
        const appRoot = document.getElementById('react-app-root')
        if (appRoot) {
          appRoot.innerHTML = ''
        }
      },
    }
  } catch (error) {
    console.error('Failed to load React demo:', error)
    container.innerHTML = `
      <div class="react-demo">
        <h3>React Integration Demo</h3>
        <div class="error-message">
          <h4>Failed to load React demo</h4>
          <p>${error.message}</p>
          <p>This demo requires an internet connection to load Highlight.js for syntax highlighting.</p>
          <button class="retry-button" onclick="window.frameworkLoader?.switchFramework('react')">Retry</button>
        </div>
      </div>
    `

    return {
      cleanup: () => {},
    }
  }
}

/**
 * Simulates React environment for the demo
 */
async function initializeReactStyleDemo() {
  // Simulate React initialization delay
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('React-style demo environment ready')
}

/**
 * Loads Highlight.js library and applies syntax highlighting
 */
async function loadHighlightJs() {
  // Check if Highlight.js is already loaded
  if (window.hljs) {
    return window.hljs
  }

  try {
    // Load Highlight.js CSS
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
    document.head.appendChild(cssLink)

    // Add custom styles for better code presentation
    addCodeBlockStyles()

    // Load Highlight.js JavaScript
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js')

    // Load additional languages for better TypeScript support
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js')

    return window.hljs
  } catch (error) {
    console.warn('Failed to load Highlight.js:', error)
    return null
  }
}

/**
 * Adds custom styles for code blocks
 */
function addCodeBlockStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .react-demo .guide-section {
      margin-bottom: 24px;
    }

    .react-demo .guide-section h4 {
      color: #333;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #61dafb;
    }

    .react-demo pre {
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      overflow-x: auto;
      position: relative;
    }

    .react-demo pre code {
      background: transparent;
      padding: 0;
      border: none;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #24292e;
    }

    .react-demo pre code.language-typescript:before,
    .react-demo pre code.language-bash:before {
      content: attr(class);
      position: absolute;
      top: 8px;
      right: 12px;
      background: #61dafb;
      color: #282c34;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .react-demo pre code.language-typescript:before {
      content: 'TypeScript';
    }

    .react-demo pre code.language-bash:before {
      content: 'Bash';
    }

    .react-demo .hljs {
      background: transparent !important;
    }

    .react-demo .code-example {
      background: #ffffff;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 20px;
      margin-top: 16px;
    }

    .react-demo .notice {
      background: #e8f4fd;
      border: 1px solid #61dafb;
      border-radius: 6px;
      padding: 12px;
      margin: 12px 0;
    }
  `
  document.head.appendChild(style)
}

/**
 * Utility function to load external scripts
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Applies syntax highlighting to code blocks
 */
function applySyntaxHighlighting() {
  if (window.hljs) {
    // Highlight all code blocks
    document.querySelectorAll('pre code').forEach(block => {
      try {
        window.hljs.highlightElement(block)
      } catch (error) {
        console.warn('Failed to highlight code block:', error)
      }
    })
  } else {
    // Fallback: Add basic styling if Highlight.js isn't available
    document.querySelectorAll('pre code').forEach(block => {
      block.style.fontFamily = "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
      block.style.fontSize = '14px'
      block.style.lineHeight = '1.5'
    })
  }
}

/**
 * Initializes a simulated React application with Formeo integration
 */
async function initializeReactApp() {
  const appRoot = document.getElementById('react-app-root')
  if (!appRoot) return null

  // Create React-like component structure
  appRoot.innerHTML = `
    <div class="react-component">
      <div class="form-builder-container">
        <div class="editor-section">
          <h5>Form Builder (React Component)</h5>
          <div class="react-form-editor"></div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="react-save-btn">Save Form</button>
          <button class="btn btn-secondary" id="react-render-btn">Render Form</button>
          <button class="btn btn-secondary" id="react-clear-btn">Clear Form</button>
          <button class="btn btn-info" id="react-export-btn">Export JSON</button>
        </div>
        <div class="render-section">
          <h5>Rendered Form (React Component)</h5>
          <div class="react-form-renderer"></div>
        </div>
      </div>
    </div>
  `

  // Initialize Formeo within the React component structure
  const editorElement = appRoot.querySelector('.react-form-editor')
  const rendererElement = appRoot.querySelector('.react-form-renderer')

  if (editorElement && rendererElement) {
    // Create form and render elements
    const formElement = document.createElement('form')
    formElement.className = 'build-form-react-real'
    const renderElement = document.createElement('div')
    renderElement.className = 'render-form-react-real'

    editorElement.appendChild(formElement)
    rendererElement.appendChild(renderElement)

    // React-style options
    const reactEditorOptions = {
      ...editorOptions,
      editorContainer: '.build-form-react-real',
      events: {
        ...editorOptions.events,
        onSave: formData => {
          console.log('React Component - Form saved:', formData)
        },
        onChange: formData => {
          console.log('React Component - Form changed:', formData)
        },
      },
    }

    const reactRenderOptions = {
      ...renderOptions,
      renderContainer: '.render-form-react-real',
    }

    const editor = new FormeoEditor(reactEditorOptions)
    const renderer = new FormeoRenderer(reactRenderOptions)

    // Add React-style event handlers
    const saveBtn = appRoot.querySelector('#react-save-btn')
    const renderBtn = appRoot.querySelector('#react-render-btn')
    const clearBtn = appRoot.querySelector('#react-clear-btn')
    const exportBtn = appRoot.querySelector('#react-export-btn')

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const formData = editor.formData
        console.log('React Component - Save clicked:', formData)
        // Simulate React state update
        localStorage.setItem('formeo-react-form', JSON.stringify(formData))
        alert('Form saved! Check console for form data.')
      })
    }

    if (renderBtn) {
      renderBtn.addEventListener('click', () => {
        const formData = editor.formData
        if (formData && Object.keys(formData).length > 0) {
          renderElement.style.display = 'block'
          renderer.render(formData)
          console.log('React Component - Render clicked:', formData)
        } else {
          alert('Please create a form first before rendering')
        }
      })
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        editor?.clear()
        // renderer?.clear()
        renderElement.style.display = 'none'
        localStorage.removeItem('formeo-react-form')
        console.log('React Component - Clear clicked')
      })
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const formData = editor.formData
        if (formData && Object.keys(formData).length > 0) {
          const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'formeo-react-form.json'
          a.click()
          URL.revokeObjectURL(url)
          console.log('React Component - Export clicked')
        } else {
          alert('Please create a form first before exporting')
        }
      })
    }

    // Return React app-like object
    return {
      editor,
      renderer,
      cleanup: () => {
        if (editor?.destroy) editor.destroy()
        if (renderer?.destroy) renderer.destroy()
      },
    }
  }

  return null
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// React hook code example
const reactHookCode = `import { useEffect, useRef, useCallback } from 'react';
import { FormeoEditor, FormeoRenderer } from 'formeo';

// Custom hook for Formeo Editor
export function useFormeoEditor(options = {}) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [formData, setFormData] = useState(null);

  const initializeEditor = useCallback(() => {
    if (containerRef.current && !editorRef.current) {
      const defaultOptions = {
        editorContainer: containerRef.current,
        sessionStorage: true,
        events: {
          onSave: (data) => {
            setFormData(data);
            options.onSave?.(data);
          },
          onChange: (data) => {
            setFormData(data);
            options.onChange?.(data);
          }
        }
      };

      editorRef.current = new FormeoEditor({
        ...defaultOptions,
        ...options
      });
    }
  }, [options]);

  const destroyEditor = useCallback(() => {
    if (editorRef.current?.destroy) {
      editorRef.current.destroy();
      editorRef.current = null;
    }
  }, []);

  const saveForm = useCallback(() => {
    if (editorRef.current) {
      const data = editorRef.current.formData;
      setFormData(data);
      return data;
    }
    return null;
  }, []);

  const loadForm = useCallback((data) => {
    if (editorRef.current && data) {
      editorRef.current.render(data);
      setFormData(data);
    }
  }, []);

  const clearForm = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.clear();
      setFormData(null);
    }
  }, []);

  useEffect(() => {
    initializeEditor();
    return destroyEditor;
  }, [initializeEditor, destroyEditor]);

  return {
    containerRef,
    formData,
    saveForm,
    loadForm,
    clearForm,
    editor: editorRef.current
  };
}

// Custom hook for Formeo Renderer
export function useFormeoRenderer(options = {}) {
  const rendererRef = useRef(null);
  const containerRef = useRef(null);

  const initializeRenderer = useCallback(() => {
    if (containerRef.current && !rendererRef.current) {
      const defaultOptions = {
        renderContainer: containerRef.current,
        config: {
          events: {
            onSubmit: (data) => {
              options.onSubmit?.(data);
            }
          }
        }
      };

      rendererRef.current = new FormeoRenderer({
        ...defaultOptions,
        ...options
      });
    }
  }, [options]);

  const destroyRenderer = useCallback(() => {
    if (rendererRef.current?.destroy) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }
  }, []);

  const renderForm = useCallback((formData) => {
    if (rendererRef.current && formData) {
      rendererRef.current.render(formData);
    }
  }, []);

  const clearRenderer = useCallback(() => {
    if (rendererRef.current && containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    initializeRenderer();
    return destroyRenderer;
  }, [initializeRenderer, destroyRenderer]);

  return {
    containerRef,
    renderForm,
    clearRenderer,
    renderer: rendererRef.current
  };
}`

// React component code example
const reactComponentCode = `import React, { useState } from 'react';
import { useFormeoEditor, useFormeoRenderer } from './hooks/useFormeo';

interface FormBuilderProps {
  onFormSave?: (formData: any) => void;
  onFormSubmit?: (formData: any) => void;
  initialFormData?: any;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  onFormSave,
  onFormSubmit,
  initialFormData
}) => {
  const [showRenderer, setShowRenderer] = useState(false);

  // Use custom hooks for Formeo integration
  const {
    containerRef: editorContainerRef,
    formData,
    saveForm,
    loadForm,
    clearForm
  } = useFormeoEditor({
    onSave: (data) => {
      console.log('Form saved:', data);
      onFormSave?.(data);
    },
    onChange: (data) => {
      console.log('Form changed:', data);
    }
  });

  const {
    containerRef: rendererContainerRef,
    renderForm,
    clearRenderer
  } = useFormeoRenderer({
    onSubmit: (data) => {
      console.log('Form submitted:', data);
      onFormSubmit?.(data);
    }
  });

  // Load initial form data on mount
  React.useEffect(() => {
    if (initialFormData) {
      loadForm(initialFormData);
    }
  }, [initialFormData, loadForm]);

  const handleSave = () => {
    const data = saveForm();
    if (data) {
      // Save to localStorage or send to API
      localStorage.setItem('formeo-form', JSON.stringify(data));
      alert('Form saved successfully!');
    }
  };

  const handleRender = () => {
    if (formData && Object.keys(formData).length > 0) {
      renderForm(formData);
      setShowRenderer(true);
    } else {
      alert('Please create a form first');
    }
  };

  const handleClear = () => {
    clearForm();
    clearRenderer();
    setShowRenderer(false);
  };

  const handleExport = () => {
    if (formData) {
      const blob = new Blob([JSON.stringify(formData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formeo-form.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="form-builder">
      <div className="editor-section">
        <h3>Form Builder</h3>
        <div
          ref={editorContainerRef}
          className="formeo-editor-container"
          style={{ minHeight: '400px', border: '1px solid #ddd', borderRadius: '8px' }}
        />
      </div>

      <div className="actions">
        <button onClick={handleSave} className="btn btn-primary">
          Save Form
        </button>
        <button onClick={handleRender} className="btn btn-secondary">
          Render Form
        </button>
        <button onClick={handleClear} className="btn btn-secondary">
          Clear Form
        </button>
        <button onClick={handleExport} className="btn btn-info">
          Export JSON
        </button>
      </div>

      {showRenderer && (
        <div className="renderer-section">
          <h3>Form Renderer</h3>
          <div
            ref={rendererContainerRef}
            className="formeo-renderer-container"
            style={{ minHeight: '300px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
};

// Example usage in App component
export default function App() {
  const [savedForms, setSavedForms] = useState([]);

  const handleFormSave = (formData) => {
    // Add to saved forms list
    setSavedForms(prev => [...prev, {
      id: Date.now(),
      name: \`Form \${prev.length + 1}\`,
      data: formData,
      createdAt: new Date().toISOString()
    }]);
  };

  const handleFormSubmit = (formData) => {
    // Handle form submission
    console.log('Submitted form data:', formData);
    // Send to API, process data, etc.
  };

  return (
    <div className="app">
      <h1>Formeo React Integration</h1>

      <FormBuilder
        onFormSave={handleFormSave}
        onFormSubmit={handleFormSubmit}
      />

      {savedForms.length > 0 && (
        <div className="saved-forms">
          <h3>Saved Forms</h3>
          <ul>
            {savedForms.map(form => (
              <li key={form.id}>
                {form.name} - {new Date(form.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}`

// React context code example
const reactContextCode = `import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FormeoEditor, FormeoRenderer } from 'formeo';

// Types
interface FormData {
  [key: string]: any;
}

interface FormeoState {
  forms: Record<string, FormData>;
  activeFormId: string | null;
  editors: Record<string, FormeoEditor>;
  renderers: Record<string, FormeoRenderer>;
}

type FormeoAction =
  | { type: 'SET_FORM_DATA'; payload: { id: string; data: FormData } }
  | { type: 'SET_ACTIVE_FORM'; payload: string }
  | { type: 'ADD_EDITOR'; payload: { id: string; editor: FormeoEditor } }
  | { type: 'ADD_RENDERER'; payload: { id: string; renderer: FormeoRenderer } }
  | { type: 'REMOVE_EDITOR'; payload: string }
  | { type: 'REMOVE_RENDERER'; payload: string }
  | { type: 'CLEAR_FORM'; payload: string };

// Context
const FormeoContext = createContext<{
  state: FormeoState;
  actions: {
    setFormData: (id: string, data: FormData) => void;
    setActiveForm: (id: string) => void;
    addEditor: (id: string, editor: FormeoEditor) => void;
    addRenderer: (id: string, renderer: FormeoRenderer) => void;
    removeEditor: (id: string) => void;
    removeRenderer: (id: string) => void;
    clearForm: (id: string) => void;
    getFormData: (id: string) => FormData | null;
  };
} | null>(null);

// Reducer
function formeoReducer(state: FormeoState, action: FormeoAction): FormeoState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload.id]: action.payload.data
        }
      };

    case 'SET_ACTIVE_FORM':
      return {
        ...state,
        activeFormId: action.payload
      };

    case 'ADD_EDITOR':
      return {
        ...state,
        editors: {
          ...state.editors,
          [action.payload.id]: action.payload.editor
        }
      };

    case 'ADD_RENDERER':
      return {
        ...state,
        renderers: {
          ...state.renderers,
          [action.payload.id]: action.payload.renderer
        }
      };

    case 'REMOVE_EDITOR':
      const { [action.payload]: removedEditor, ...restEditors } = state.editors;
      if (removedEditor?.destroy) {
        removedEditor.destroy();
      }
      return {
        ...state,
        editors: restEditors
      };

    case 'REMOVE_RENDERER':
      const { [action.payload]: removedRenderer, ...restRenderers } = state.renderers;
      if (removedRenderer?.destroy) {
        removedRenderer.destroy();
      }
      return {
        ...state,
        renderers: restRenderers
      };

    case 'CLEAR_FORM':
      const editor = state.editors[action.payload];
      const renderer = state.renderers[action.payload];

      if (editor) editor.clear();
      // Note: renderer clearing handled by component that owns the container

      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload]: {}
        }
      };

    default:
      return state;
  }
}

// Provider
export const FormeoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(formeoReducer, {
    forms: {},
    activeFormId: null,
    editors: {},
    renderers: {}
  });

  const actions = {
    setFormData: useCallback((id: string, data: FormData) => {
      dispatch({ type: 'SET_FORM_DATA', payload: { id, data } });
    }, []),

    setActiveForm: useCallback((id: string) => {
      dispatch({ type: 'SET_ACTIVE_FORM', payload: id });
    }, []),

    addEditor: useCallback((id: string, editor: FormeoEditor) => {
      dispatch({ type: 'ADD_EDITOR', payload: { id, editor } });
    }, []),

    addRenderer: useCallback((id: string, renderer: FormeoRenderer) => {
      dispatch({ type: 'ADD_RENDERER', payload: { id, renderer } });
    }, []),

    removeEditor: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_EDITOR', payload: id });
    }, []),

    removeRenderer: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_RENDERER', payload: id });
    }, []),

    clearForm: useCallback((id: string) => {
      dispatch({ type: 'CLEAR_FORM', payload: id });
    }, []),

    getFormData: useCallback((id: string) => {
      return state.forms[id] || null;
    }, [state.forms])
  };

  return (
    <FormeoContext.Provider value={{ state, actions }}>
      {children}
    </FormeoContext.Provider>
  );
};

// Custom hook to use Formeo context
export const useFormeoContext = () => {
  const context = useContext(FormeoContext);
  if (!context) {
    throw new Error('useFormeoContext must be used within FormeoProvider');
  }
  return context;
};

// Example component using context
export const FormManager: React.FC = () => {
  const { state, actions } = useFormeoContext();

  return (
    <div className="form-manager">
      <h3>Form Manager</h3>
      <p>Active Form: {state.activeFormId || 'None'}</p>
      <p>Total Forms: {Object.keys(state.forms).length}</p>
      <p>Active Editors: {Object.keys(state.editors).length}</p>
      <p>Active Renderers: {Object.keys(state.renderers).length}</p>
    </div>
  );
};`
