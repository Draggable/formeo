import { FormeoEditor, FormeoRenderer } from '../../../lib/js/index.js'
import { editorOptions, renderOptions } from '../options/index.js'

export async function loadAngularDemo(container) {
  // Create the Angular demo structure
  container.innerHTML = `
    <div class="angular-demo">
      <h3>Angular Integration Demo</h3>
      <p>This demo shows how to integrate Formeo with Angular. Below is a complete Angular component example that you can use in your Angular applications.</p>
      
      <div class="code-example">
        <h4>1. Install Formeo</h4>
        <pre><code>npm install formeo</code></pre>
        
        <h4>2. Angular Component (form-builder.component.ts)</h4>
        <pre><code>${escapeHtml(angularComponentCode)}</code></pre>
        
        <h4>3. Component Template (form-builder.component.html)</h4>
        <pre><code>${escapeHtml(angularTemplateCode)}</code></pre>
        
        <h4>4. Module Setup (app.module.ts)</h4>
        <pre><code>${escapeHtml(angularModuleCode)}</code></pre>
        
        <h4>5. Live Demo</h4>
        <div class="demo-container">
          <form class="build-form-angular"></form>
          <div class="render-form-angular"></div>
        </div>
      </div>
    </div>
  `

  // Initialize Formeo in the demo container
  const demoContainer = container.querySelector('.demo-container')
  if (demoContainer) {
    const formElement = document.createElement('form')
    formElement.className = 'build-form-angular'
    const renderElement = document.createElement('div')
    renderElement.className = 'render-form-angular'

    demoContainer.innerHTML = ''
    demoContainer.appendChild(formElement)
    demoContainer.appendChild(renderElement)

    // Update options for Angular demo
    const angularEditorOptions = {
      ...editorOptions,
      editorContainer: '.build-form-angular',
      events: {
        ...editorOptions.events,
        onSave: formData => {
          console.log('Angular demo - Form saved:', formData)
          // In a real Angular app, you would emit this to a parent component
          // or call a service to save the form data
        },
      },
    }

    const angularRenderOptions = {
      ...renderOptions,
      renderContainer: '.render-form-angular',
    }

    const editor = new FormeoEditor(angularEditorOptions)
    const renderer = new FormeoRenderer(angularRenderOptions)

    // For demo purposes, add basic action buttons
    const actionButtonsContainer = document.getElementById('editor-action-buttons')
    if (actionButtonsContainer) {
      actionButtonsContainer.innerHTML = `
        <button class="btn btn-primary" onclick="window.angularDemoSave()">Save Form</button>
        <button class="btn btn-secondary" onclick="window.angularDemoClear()">Clear Form</button>
      `
    }

    // Expose methods for button interactions
    window.angularDemoSave = () => {
      const formData = editor.formData
      console.log('Angular demo save:', formData)
      alert('Form data saved to console (check dev tools)')
    }

    window.angularDemoClear = () => {
      editor.clear()
      renderer.clear()
    }

    return {
      editor,
      renderer,
      cleanup: () => {
        // Cleanup
        if (editor?.destroy) {
          editor.destroy()
        }
        if (renderer?.destroy) {
          renderer.destroy()
        }
        delete window.angularDemoSave
        delete window.angularDemoClear
        if (actionButtonsContainer) {
          actionButtonsContainer.innerHTML = ''
        }
      },
    }
  }

  return {
    cleanup: () => {},
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const angularComponentCode = `import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormeoEditor, FormeoRenderer } from 'formeo';

@Component({
  selector: 'app-form-builder',
  template: \`
    <div class="form-builder-container">
      <div class="editor-container" #editorContainer></div>
      <div class="render-container" #renderContainer></div>
      <div class="actions">
        <button (click)="saveForm()">Save Form</button>
        <button (click)="clearForm()">Clear Form</button>
        <button (click)="loadFormData()">Load Sample Data</button>
      </div>
    </div>
  \`,
  styles: [\`
    .form-builder-container {
      display: flex;
      gap: 20px;
      padding: 20px;
    }
    .editor-container {
      flex: 1;
      min-height: 500px;
    }
    .render-container {
      flex: 1;
      min-height: 500px;
      border: 1px solid #ddd;
      padding: 10px;
    }
    .actions {
      margin-top: 20px;
      button {
        margin-right: 10px;
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          background: #0056b3;
        }
      }
    }
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
      events: {
        onSave: (formData: any) => {
          this.handleFormSave(formData);
        },
        onChange: (formData: any) => {
          this.handleFormChange(formData);
        }
      },
      sessionStorage: true,
      i18n: {
        location: './assets/lang'
      }
    };

    const renderOptions = {
      renderContainer: this.renderContainer.nativeElement
    };

    this.editor = new FormeoEditor(editorOptions);
    this.renderer = new FormeoRenderer(renderOptions);
  }

  saveForm() {
    if (this.editor) {
      const formData = this.editor.formData;
      console.log('Form saved:', formData);
      // Emit to parent component or call service
      this.formSaved.emit(formData);
    }
  }

  clearForm() {
    if (this.editor && this.renderer) {
      this.editor.clear();
      this.renderer.clear();
    }
  }

  loadFormData() {
    const sampleData = {
      id: 'sample-form',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Sample Text Field',
          name: 'sample_text',
          required: true
        },
        {
          id: 'field-2',
          type: 'email',
          label: 'Email Field',
          name: 'email',
          required: true
        }
      ]
    };

    if (this.editor) {
      this.editor.formData = sampleData;
    }
  }

  private handleFormSave(formData: any) {
    console.log('Form auto-saved:', formData);
  }

  private handleFormChange(formData: any) {
    console.log('Form changed:', formData);
  }

  private cleanup() {
    if (this.editor && this.editor.destroy) {
      this.editor.destroy();
    }
    if (this.renderer && this.renderer.destroy) {
      this.renderer.destroy();
    }
  }
}`

const angularTemplateCode = `<div class="form-builder-wrapper">
  <h2>Form Builder</h2>
  <app-form-builder (formSaved)="onFormSaved($event)"></app-form-builder>
</div>`

const angularModuleCode = `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { AppComponent } from './app.component';

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
export class AppModule { }`
