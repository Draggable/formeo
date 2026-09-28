# Angular + Formeo Integration

A standalone Angular component that builds a form with `FormeoEditor`, previews it with `FormeoRenderer`, and
cleans up both on destroy. Verified against `formeo` 5.13.0; Angular 17+ syntax (standalone components,
`afterNextRender`).

## Install

```bash
npm install formeo
```

Add the stylesheet in `angular.json`:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "styles": ["node_modules/formeo/dist/formeo.min.css", "src/styles.scss"]
          }
        }
      }
    }
  }
}
```

(Or `@import 'formeo/dist/formeo.min.css';` from a global stylesheet instead, if you'd rather not touch
`angular.json`.)

## The component

```typescript
import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender } from '@angular/core'
import { FormeoEditor, FormeoRenderer } from 'formeo'

@Component({
  selector: 'app-form-builder',
  standalone: true,
  template: `
    <div #editorRef></div>
    <button type="button" (click)="preview()">Preview</button>
    <div #previewRef></div>
  `,
})
export class FormBuilderComponent implements OnDestroy {
  @ViewChild('editorRef', { static: true }) editorRef!: ElementRef<HTMLElement>
  @ViewChild('previewRef', { static: true }) previewRef!: ElementRef<HTMLElement>

  private editor?: FormeoEditor
  private renderer?: FormeoRenderer

  constructor() {
    // afterNextRender only runs in the browser (see "Server-side rendering" below), after the view
    // holding editorRef/previewRef has rendered.
    afterNextRender(() => {
      this.editor = new FormeoEditor({ editorContainer: this.editorRef.nativeElement })
      this.renderer = new FormeoRenderer({
        renderContainer: this.previewRef.nativeElement,
        events: {
          onSubmit: ({ event, userData }) => {
            event.preventDefault() // formeo doesn't call this for you
            console.log('submitted:', userData)
          },
        },
      })
    })
  }

  preview(): void {
    this.renderer?.render(this.editor?.formData)
  }

  ngOnDestroy(): void {
    this.editor?.destroy()
    this.renderer?.destroy()
  }
}
```

Notes:

- `editorContainer`/`renderContainer` take an `Element` directly, so the `@ViewChild` refs' `.nativeElement`
  work without a selector string.
- `editor.formData` is a getter — it always returns the editor's current form definition, so `preview()` just
  reads it and hands it to `renderer.render()`.
- `editor.destroy()` and `renderer.destroy()` both exist and are safe to call more than once; call them in
  `ngOnDestroy` so a routed-away component doesn't leak Sortable instances or DOM listeners.

## Reading submitted answers

The renderer's `onSubmit` event fires on the rendered `<form>`'s native `submit` event and hands you
`{ event, form, userData }`, where `userData` is the form's values keyed by field name (repeated names — checkbox
groups, multi-selects — become arrays). Formeo does not call `event.preventDefault()` itself, so call it yourself
if you're not doing a normal form POST:

```typescript
events: {
  onSubmit: ({ event, userData }) => {
    event.preventDefault()
    this.http.post('/api/submissions', userData).subscribe()
  },
}
```

## Server-side rendering (SSR)

`FormeoEditor` and `FormeoRenderer` both touch `document`, so only construct them in the browser. `afterNextRender`
(used above) already guarantees this — Angular's server renderer never invokes its callback, so no extra guard is
needed.

If you're not using `afterNextRender` (e.g. an older Angular version, or constructing Formeo somewhere other than
a component's injection context), guard the same code with `isPlatformBrowser`:

```typescript
import { Component, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

export class FormBuilderComponent {
  private platformId = inject(PLATFORM_ID)

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.editor = new FormeoEditor({ editorContainer: this.editorRef.nativeElement })
    }
  }
}
```

## TypeScript

Formeo ships its own type definitions (`dist/formeo.d.ts`, `dist/formeo.d.cts`) — nothing extra to install or
declare. See [TypeScript](typescript.md) for what's typed, including `FormeoRendererEvents['onSubmit']` and the
`UserData` type used above.

## The demo's Angular tab

The demo (`npm start`, then the Angular tab) shows the same construction pattern hand-rolled against plain DOM,
without loading Angular itself — see `src/demo/js/frameworks/angular.js`. It's there to demonstrate the pattern
quickly in the browser, not as a real Angular app; use the component above for that.
