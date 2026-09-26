# Custom Controls

This walks through building a custom control end to end: defining it, registering it in the editor, and rendering
it with `FormeoRenderer`. It uses an image-annotation control (draw on an uploaded image, save the result) as a
running example, from [#228](https://github.com/Draggable/formeo/issues/228).

## Formeo is not formBuilder

Formeo and [formBuilder](https://formbuilder.online/) are separate, unrelated projects with different control
formats. A formBuilder control plugin will not load into Formeo's `controls.elements` option — controls have to be
written for Formeo's `Control` shape (documented below).

## Define a control as an object

The simplest way to add a control is a plain object, the same shape used by [`controls.elements`](../options/controls/README.md#elements):

```javascript
const imageAnnotateControl = {
  tag: 'div',
  config: {
    label: 'Image annotate',
  },
  meta: {
    group: 'common', // control group id
    id: 'image-annotate', // unique id referenced by config.controlId, elements, etc.
    icon: 'upload', // svg or font icon id
  },
  attrs: {
    className: 'image-annotate',
  },
  children: [
    // a hidden input carries the control's value into userData (see below)
    { tag: 'input', attrs: { type: 'hidden', name: 'annotation' } },
  ],
  dependencies: {
    js: 'https://cdn.example.com/annotate.min.js',
    css: 'https://cdn.example.com/annotate.min.css',
  },
  // action.onRender runs on the editor's field preview, once it is in the page
  action: {
    onRender: elem => {
      window.annotate.init(elem)
    },
  },
}
```

`dependencies` are fetched once (deduped by URL) before the control is added to the panel. `action.onRender` is not
saved in `formData` — functions aren't serializable — so a `FormeoRenderer` that renders this control's saved output
needs the same hook passed in separately (see [Render it](#render-it)).

## Or subclass `Control`

For anything more than a static object — computed defaults, instance state, or a control you want to contribute
back to Formeo — subclass `Control`. This is the pattern Formeo's own built-in controls use, such as
[`TinyMCEControl`](../../src/lib/js/components/controls/html/tinymce.js):

```javascript
// src/lib/js/components/controls/html/image-annotate.js
import Control from '../control.js'

class ImageAnnotateControl extends Control {
  constructor() {
    super({
      tag: 'div',
      config: { label: 'Image annotate' },
      meta: { group: 'common', id: 'image-annotate', icon: 'upload' },
      children: [{ tag: 'input', attrs: { type: 'hidden', name: 'annotation' } }],
      dependencies: { js: 'https://cdn.example.com/annotate.min.js' },
      action: {
        onRender: elem => window.annotate.init(elem),
      },
    })
  }
}

export default ImageAnnotateControl
```

`Control` is an internal class — it's part of `src/`, which isn't published to npm (the package only ships
`dist/`) — so this path only works from a checkout of the Formeo source (for example, building a control to
contribute upstream). Consumers of the published package should use the plain-object form above instead.

## Register it

Pass either form to `controls.elements` when creating the editor. A plain object is wrapped in `Control`
automatically; a subclass is instantiated for you:

```javascript
const formeo = new FormeoEditor({
  editorContainer: '.formeo-editor',
  controls: {
    elements: [ImageAnnotateControl], // or [imageAnnotateControl]
    elementOrder: {
      common: ['image-annotate'],
    },
  },
})
```

## Render it

Functions aren't saved in `formData`, so `FormeoRenderer` needs its own copy of `dependencies` and `action`, keyed by
the control's `meta.id` via the `elements` option:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: '.formeo-render',
  elements: {
    'image-annotate': {
      dependencies: { js: 'https://cdn.example.com/annotate.min.js' },
      action: {
        onRender: elem => window.annotate.init(elem),
      },
    },
  },
})

renderer.render(savedFormData)
```

`onRender` here fires once the rendered field is attached to the page (see [`dom.onRender`](../renderer/renderer.md#legacy-configactiononrender)).

## Get its value into `userData`

The renderer collects `userData` from named form inputs, regardless of what control renders around them. Write the
control's value into the hidden input from [Define a control as an object](#define-a-control-as-an-object) whenever
it changes, e.g. as a data URL after the user finishes annotating:

```javascript
action: {
  onRender: elem => {
    const hiddenInput = elem.querySelector('input[name="annotation"]')
    window.annotate.init(elem, {
      onChange: dataUrl => {
        hiddenInput.value = dataUrl
      },
    })
  },
},
```

Once that input's value is set, `renderer.userData.annotation` (and `renderer.userFormData`) reflects it like any
other field.

## See Also

- [Controls](README.md) - Overview of controls and control groups
- [Control Options](../options/controls/README.md) - Configure the control panel, including `elements`
- [Custom Attribute Types](custom-attribute-types.md) - Attribute input types for a control's `attrs`
- [Renderer: Custom Elements](../renderer/renderer.md#advanced-topics) - The renderer's `elements` option
