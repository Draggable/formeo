import { FormeoEditor, FormeoRenderer } from '../../../lib/js/index.js'
import { editorOptions, renderOptions } from '../options/index.js'

/**
 * Angular Integration Demo
 *
 * Note: This demo simulates Angular patterns rather than loading the full framework
 * due to browser compatibility and performance considerations. For a real Angular
 * integration, see the complete Angular project example in /docs/angular-integration-example/
 * Full integration to come in codesandbox.io/angular example in future.
 */
export async function loadAngularDemo(container) {
  // Show loading state while demo initializes
  container.innerHTML = `
    <div class="angular-demo">
      <h3>Angular Integration Demo</h3>
      <p>Demonstrating Formeo integration patterns for Angular applications</p>
      <div class="loading-message">
        <p>Initializing Angular-style Formeo integration demo...</p>
      </div>
    </div>
  `

  try {
    // Initialize the Angular-style demo
    await initializeAngularStyleDemo()

    // Load Highlight.js for syntax highlighting
    const hljs = await loadHighlightJs()
    if (hljs) {
      console.log('Highlight.js loaded successfully')
    }

    // Create the demo structure with comprehensive instructions
    container.innerHTML = `
      <div class="angular-demo">
        <h3>Angular Integration Demo</h3>
        <div class="demo-description">
          <p>This demo shows how to integrate Formeo with Angular applications using modern patterns.</p>
          <div class="notice">
            <strong>Note:</strong> This is a pattern demonstration. For a complete Angular v20 project with Formeo, 
            see <code>/docs/angular-integration-example/</code> in the repository.
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
            <pre><code class="language-bash"># Install Angular CLI (if not already installed)
npm install -g @angular/cli@20

# Create new Angular project
ng new my-formeo-app --routing=true --style=scss

# Navigate to project
cd my-formeo-app

# Install Formeo
npm install formeo</code></pre>
          </div>

          <div class="guide-section">
            <h4>2. Angular Component Implementation</h4>
            <pre><code class="language-typescript">${escapeHtml(modernAngularComponentCode)}</code></pre>
          </div>

          <div class="guide-section">
            <h4>3. Service for Formeo Management (Optional)</h4>
            <pre><code class="language-typescript">${escapeHtml(angularServiceCode)}</code></pre>
          </div>

          <div class="guide-section">
            <h4>4. Module Configuration</h4>
            <pre><code class="language-typescript">${escapeHtml(angularModuleCode)}</code></pre>
          </div>
        </div>

        <h4>Interactive Demo (Angular Patterns)</h4>
        <div class="angular-app-container">
          <div id="angular-app-root"></div>
        </div>
      </div>
    `

    // Initialize the real Angular application
    const angularApp = await initializeAngularApp()

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
      angularApp,
      cleanup: () => {
        // Cleanup Angular application
        if (angularApp?.destroy) {
          angularApp.destroy()
        }

        // Clear the container
        const appRoot = document.getElementById('angular-app-root')
        if (appRoot) {
          appRoot.innerHTML = ''
        }
      },
    }
  } catch (error) {
    console.error('Failed to load Angular demo:', error)
    container.innerHTML = `
      <div class="angular-demo">
        <h3>Angular Integration Demo</h3>
        <div class="error-message">
          <h4>Failed to load Angular demo</h4>
          <p>${error.message}</p>
          <p>This demo requires an internet connection to load Angular framework files.</p>
          <button class="retry-button" onclick="window.frameworkLoader?.switchFramework('angular')">Retry</button>
        </div>
      </div>
    `

    return {
      cleanup: () => {},
    }
  }
}

/**
 * Simulates Angular environment for the demo
 */
async function initializeAngularStyleDemo() {
  // Simulate Angular initialization delay
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('Angular-style demo environment ready')
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
    .angular-demo .guide-section {
      margin-bottom: 24px;
    }

    .angular-demo .guide-section h4 {
      color: #333;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #007bff;
    }

    .angular-demo pre {
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      overflow-x: auto;
      position: relative;
    }

    .angular-demo pre code {
      background: transparent;
      padding: 0;
      border: none;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #24292e;
    }

    .angular-demo pre code.language-typescript:before,
    .angular-demo pre code.language-bash:before {
      content: attr(class);
      position: absolute;
      top: 8px;
      right: 12px;
      background: #007bff;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .angular-demo pre code.language-typescript:before {
      content: 'TypeScript';
    }

    .angular-demo pre code.language-bash:before {
      content: 'Bash';
    }

    .angular-demo .hljs {
      background: transparent !important;
    }

    .angular-demo .code-example {
      background: #ffffff;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 20px;
      margin-top: 16px;
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
 * Initializes a simulated Angular application with Formeo integration
 */
async function initializeAngularApp() {
  const appRoot = document.getElementById('angular-app-root')
  if (!appRoot) return null

  // Create Angular-like component structure
  appRoot.innerHTML = `
    <div class="angular-component">
      <div class="form-builder-container">
        <div class="editor-section">
          <h5>Form Builder (Angular Component)</h5>
          <div class="angular-form-editor"></div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="angular-save-btn">Save Form</button>
          <button class="btn btn-secondary" id="angular-render-btn">Render Form</button>
          <button class="btn btn-secondary" id="angular-clear-btn">Clear Form</button>
        </div>
        <div class="render-section">
          <h5>Rendered Form (Angular Template)</h5>
          <div class="angular-form-renderer"></div>
        </div>
      </div>
    </div>
  `

  // Initialize Formeo within the Angular component structure
  const editorElement = appRoot.querySelector('.angular-form-editor')
  const rendererElement = appRoot.querySelector('.angular-form-renderer')

  if (editorElement && rendererElement) {
    // Create form and render elements
    const formElement = document.createElement('form')
    formElement.className = 'build-form-angular-real'
    const renderElement = document.createElement('div')
    renderElement.className = 'render-form-angular-real'

    editorElement.appendChild(formElement)
    rendererElement.appendChild(renderElement)

    // Angular-style options
    const angularEditorOptions = {
      ...editorOptions,
      editorContainer: '.build-form-angular-real',
      events: {
        ...editorOptions.events,
        onSave: formData => {
          console.log('Angular Component - Form saved:', formData)
        },
        onChange: formData => {
          console.log('Angular Component - Form changed:', formData)
        },
      },
    }

    const angularRenderOptions = {
      ...renderOptions,
      renderContainer: '.render-form-angular-real',
    }

    const editor = new FormeoEditor(angularEditorOptions)
    const renderer = new FormeoRenderer(angularRenderOptions)

    // Add Angular-style event handlers
    const saveBtn = appRoot.querySelector('#angular-save-btn')
    const renderBtn = appRoot.querySelector('#angular-render-btn')
    const clearBtn = appRoot.querySelector('#angular-clear-btn')

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const formData = editor.formData
        console.log('Angular Component - Save clicked:', formData)
        alert('Form saved! Check console for form data.')
      })
    }

    if (renderBtn) {
      renderBtn.addEventListener('click', () => {
        const formData = editor.formData
        if (formData && Object.keys(formData).length > 0) {
          renderElement.style.display = 'block'
          renderer.render(formData)
          console.log('Angular Component - Render clicked:', formData)
        } else {
          alert('Please create a form first before rendering')
        }
      })
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        // Clear the editor using the new clear method
        if (editor) {
          editor.clear()
        }
        // Clear the renderer by setting innerHTML to empty
        if (renderer && renderElement) {
          renderElement.innerHTML = ''
          renderElement.style.display = 'none'
        }
        console.log('Angular Component - Clear clicked')
      })
    }

    // Return Angular app-like object
    return {
      editor,
      renderer,
      destroy: () => {
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

// Modern Angular component code example for Angular v20
const modernAngularComponentCode = `import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { FormeoEditor, FormeoRenderer } from 'formeo';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  template: \`
    <div class="form-builder-container">
      <div class="editor-section">
        <h5>Form Editor</h5>
        <div #editorContainer class="editor-container"></div>
      </div>
      
      <div class="actions">
        <button (click)="saveForm()" class="btn btn-primary">Save Form</button>
        <button (click)="renderForm()" class="btn btn-secondary">Render Form</button>
        <button (click)="clearForm()" class="btn btn-secondary">Clear Form</button>
        <button (click)="exportFormData()" class="btn btn-info">Export Data</button>
      </div>
      
      <div class="render-section">
        <h5>Rendered Form</h5>
        <div #renderContainer class="render-container"></div>
      </div>
    </div>
  \`,
  styles: [\`
    .form-builder-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }
    
    .editor-container, .render-container {
      min-height: 400px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: #fafafa;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-primary:hover { background: #0056b3; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #545b62; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-info:hover { background: #117a8b; }
  \`]
})
export class FormBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @ViewChild('renderContainer', { static: true }) renderContainer!: ElementRef;
  
  private editor: FormeoEditor | null = null;
  private renderer: FormeoRenderer | null = null;

  ngOnInit() {
    this.initializeFormeo();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeFormeo() {
    const editorOptions = {
      editorContainer: this.editorContainer.nativeElement,
      sessionStorage: true,
      events: {
        onSave: (formData: any) => this.handleFormSave(formData),
        onChange: (formData: any) => this.handleFormChange(formData),
        onLoad: (formData: any) => this.handleFormLoad(formData)
      },
      config: {
        disableFields: [], // Customize which fields to disable
        controls: {
          // Customize available controls
        }
      }
    };

    const renderOptions = {
      renderContainer: this.renderContainer.nativeElement,
      config: {
        events: {
          onSubmit: (formData: any) => this.handleFormSubmit(formData)
        }
      }
    };

    this.editor = new FormeoEditor(editorOptions);
    this.renderer = new FormeoRenderer(renderOptions);
  }

  saveForm() {
    if (!this.editor) return;
    
    const formData = this.editor.formData;
    
    // Example: Save to localStorage or send to server
    localStorage.setItem('formeo-form', JSON.stringify(formData));
    
    console.log('Form saved:', formData);
    // You could dispatch an Angular event or call a service here
  }

  renderForm() {
    if (!this.editor || !this.renderer) return;
    
    const formData = this.editor.formData;
    
    if (formData && Object.keys(formData).length > 0) {
      this.renderer.render(formData);
      console.log('Form rendered:', formData);
    } else {
      alert('Please create a form first');
    }
  }

  clearForm() {
    if (this.editor) {
      this.editor.clear();
    }
    if (this.renderer && this.renderContainer) {
      this.renderContainer.nativeElement.innerHTML = '';
    }
    localStorage.removeItem('formeo-form');
    console.log('Form cleared');
  }

  exportFormData() {
    if (!this.editor) return;
    
    const formData = this.editor.formData;
    const blob = new Blob([JSON.stringify(formData, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formeo-form.json';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  private handleFormSave(formData: any) {
    console.log('Form auto-saved:', formData);
    // Integrate with Angular services, state management, etc.
  }

  private handleFormChange(formData: any) {
    console.log('Form changed:', formData);
    // React to form changes in your Angular app
  }

  private handleFormLoad(formData: any) {
    console.log('Form loaded:', formData);
  }

  private handleFormSubmit(formData: any) {
    console.log('Rendered form submitted:', formData);
    // Handle form submission in your Angular app
  }

  private cleanup() {
    if (this.editor?.destroy) {
      this.editor.destroy();
    }
    if (this.renderer?.destroy) {
      this.renderer.destroy();
    }
  }
}`

// Angular service for managing Formeo instances
const angularServiceCode = `import { Injectable, signal } from '@angular/core';
import { FormeoEditor, FormeoRenderer } from 'formeo';

export interface FormeoConfig {
  editorOptions?: any;
  renderOptions?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FormeoService {
  // Using Angular signals for reactive state
  private formDataSignal = signal<any>(null);
  private editorsSignal = signal<Map<string, FormeoEditor>>(new Map());
  private renderersSignal = signal<Map<string, FormeoRenderer>>(new Map());

  // Public readonly signals
  readonly formData = this.formDataSignal.asReadonly();
  readonly editors = this.editorsSignal.asReadonly();
  readonly renderers = this.renderersSignal.asReadonly();

  createEditor(containerId: string, container: HTMLElement, config?: FormeoConfig): FormeoEditor {
    const defaultOptions = {
      editorContainer: container,
      sessionStorage: true,
      events: {
        onSave: (formData: any) => this.updateFormData(formData),
        onChange: (formData: any) => this.updateFormData(formData)
      }
    };

    const options = { ...defaultOptions, ...config?.editorOptions };
    const editor = new FormeoEditor(options);
    
    // Update editors map
    const currentEditors = new Map(this.editorsSignal());
    currentEditors.set(containerId, editor);
    this.editorsSignal.set(currentEditors);

    return editor;
  }

  createRenderer(containerId: string, container: HTMLElement, config?: FormeoConfig): FormeoRenderer {
    const defaultOptions = {
      renderContainer: container,
      config: {
        events: {
          onSubmit: (formData: any) => this.handleFormSubmit(formData)
        }
      }
    };

    const options = { ...defaultOptions, ...config?.renderOptions };
    const renderer = new FormeoRenderer(options);
    
    // Update renderers map
    const currentRenderers = new Map(this.renderersSignal());
    currentRenderers.set(containerId, renderer);
    this.renderersSignal.set(currentRenderers);

    return renderer;
  }

  getEditor(containerId: string): FormeoEditor | undefined {
    return this.editorsSignal().get(containerId);
  }

  getRenderer(containerId: string): FormeoRenderer | undefined {
    return this.renderersSignal().get(containerId);
  }

  destroyEditor(containerId: string): void {
    const editor = this.editorsSignal().get(containerId);
    if (editor?.destroy) {
      editor.destroy();
    }
    
    const currentEditors = new Map(this.editorsSignal());
    currentEditors.delete(containerId);
    this.editorsSignal.set(currentEditors);
  }

  destroyRenderer(containerId: string): void {
    const renderer = this.renderersSignal().get(containerId);
    if (renderer?.destroy) {
      renderer.destroy();
    }
    
    const currentRenderers = new Map(this.renderersSignal());
    currentRenderers.delete(containerId);
    this.renderersSignal.set(currentRenderers);
  }

  saveForm(containerId: string): any {
    const editor = this.getEditor(containerId);
    if (editor) {
      const formData = editor.formData;
      this.updateFormData(formData);
      return formData;
    }
    return null;
  }

  loadForm(containerId: string, formData: any): void {
    const editor = this.getEditor(containerId);
    if (editor && formData) {
      editor.render(formData);
      this.updateFormData(formData);
    }
  }

  private updateFormData(formData: any): void {
    this.formDataSignal.set(formData);
  }

  private handleFormSubmit(formData: any): void {
    console.log('Form submitted via service:', formData);
    // Handle form submission logic here
  }
}`

// Angular module configuration
const angularModuleCode = `// app.config.ts (for standalone applications)
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Add other providers as needed
  ]
};

// Or for traditional module-based applications:
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';

@NgModule({
  declarations: [
    AppComponent,
    FormBuilderComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));`
