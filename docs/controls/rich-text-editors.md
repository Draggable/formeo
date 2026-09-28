# Rich Text Editors

A recipe for wiring a modern WYSIWYG editor into Formeo as a custom control, using
[CKEditor 5](https://ckeditor.com/ckeditor-5/) as the example. It builds on
[Custom Controls](custom-controls.md) — read that first for the full picture (defining a control, registering it,
rendering it, and getting its value into `userData`). This page only covers what's specific to a CDN-loaded rich
text editor: waiting for the script to load before initializing, and syncing the editor's HTML back to the
`<textarea>` Formeo renders.

The built-in [`TinyMCEControl`](../../src/lib/js/components/controls/html/tinymce.js) follows the same
`dependencies` + `action.onRender` pattern shown here, against an older TinyMCE CDN build.

## The control

```javascript
const ckeditorControl = {
  tag: 'textarea',
  config: {
    label: 'Rich text',
  },
  meta: {
    group: 'html',
    id: 'ckeditor',
    icon: 'rich-text',
  },
  dependencies: {
    // see CKEditor's install page (link below) for the current version and CDN URL
    js: 'https://cdn.ckeditor.com/ckeditor5/<version>/ckeditor5.umd.js',
    css: 'https://cdn.ckeditor.com/ckeditor5/<version>/ckeditor5.css',
  },
  action: {
    onRender: elem => {
      whenGlobal('CKEDITOR').then(({ ClassicEditor }) => {
        ClassicEditor.create(elem, {
          licenseKey: 'YOUR_LICENSE_KEY', // see "License key" below
        }).then(editor => {
          // keep the source <textarea> (and so renderer.userData / a native form submit) in sync as the user types
          editor.model.document.on('change:data', () => {
            editor.updateSourceElement()
          })
        })
      })
    },
  },
}
```

Register it the same way as any other control, e.g.
`controls: { elements: [ckeditorControl], elementOrder: { html: ['ckeditor'] } }` when creating the
`FormeoEditor`. Because it renders on a `tag: 'textarea'` field, the renderer's default `userData` collection
already picks up its value by name — no hidden input needed, as long as `editor.updateSourceElement()` has run.

## CDN version and URL

Formeo's `dependencies` loader inserts a plain `<script src="...">` (not `type="module"`), which is what CKEditor's
**Cloud CDN, vanilla JS quick start** targets: it's a UMD bundle that exposes a `window.CKEDITOR` global (with
`ClassicEditor` and its plugins on it), not an ES module. Get the current version and exact URLs from CKEditor's own
install page rather than hard-coding them here, since they change over time:

- [CKEditor 5 — Vanilla JS CDN quick start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/cloud/quick-start.html)

## License key

`ClassicEditor.create()` requires a `licenseKey`. The free `'GPL'` value only works with a **self-hosted** install
(npm or a downloaded zip) — the **Cloud CDN** build used above always requires a key from a CKEditor account (a free
tier is available; check CKEditor's [licensing page](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-key-and-activation.html)
for current terms and limits). If you'd rather stay on the free GPL license, self-host the CKEditor files yourself
and point `dependencies.js`/`dependencies.css` at your own copy instead of the CDN.

## Waiting for the CDN script: `whenGlobal`

`dependencies` are fetched with `fetchDependencies()`, but the renderer's `processFields` calls it **without
awaiting it** (`src/lib/js/renderer/index.js:492-499`), so `action.onRender` can run before `ckeditor5.umd.js` has
finished loading and `window.CKEDITOR` exists yet. A small helper that polls for the global covers this — and works
for the editor's field preview too, since a control's own dependencies aren't guaranteed to be loaded by the time
its `action.onRender` fires there either:

```javascript
const whenGlobal = (name, { interval = 50, timeout = 15000 } = {}) =>
  new Promise((resolve, reject) => {
    const start = Date.now()
    ;(function check() {
      if (window[name]) {
        return resolve(window[name])
      }
      if (Date.now() - start > timeout) {
        return reject(new Error(`${name} did not become available within ${timeout}ms`))
      }
      setTimeout(check, interval)
    })()
  })
```

One more timing detail: `action.onRender` itself only fires once the field's node has a `parentElement`
([`dom.onRender`](../renderer/renderer.md#legacy-configactiononrender)), and gives up silently if that doesn't
happen within `ANIMATION_SPEED_BASE` (333ms) — not a concern for a normal render, but worth knowing if `onRender`
never seems to fire.

## Render it

`FormeoRenderer` needs its own copy of `dependencies` and `action`, keyed by `ckeditor` — the control's `meta.id` —
via the `elements` option, exactly as in [Custom Controls](custom-controls.md#render-it):

```javascript
const renderer = new FormeoRenderer({
  renderContainer: '#formeo-renderer',
  elements: {
    ckeditor: { action: ckeditorControl.action, dependencies: ckeditorControl.dependencies },
  },
})

renderer.render(savedFormData)
```

## See Also

- [Custom Controls](custom-controls.md) - Defining, registering, and rendering a control end to end
- [Renderer: Custom Elements](../renderer/renderer.md#advanced-topics) - The renderer's `elements` option
- [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest/getting-started/index.html)
