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
automatically; a subclass (source checkouts only) is instantiated for you:

```javascript
const formeo = new FormeoEditor({
  editorContainer: '.formeo-editor',
  controls: {
    elements: [imageAnnotateControl], // or [ImageAnnotateControl] from a source checkout
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
  renderContainer: '#formeo-renderer',
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

## Control sets

A control set adds several fields at once, like formBuilder's `inputSets`: clicking or dropping it adds one new row
holding all of them. Define it in `controls.elements` with a `controlSet` key instead of `tag`/`attrs`:

```javascript
const addressSet = {
  id: 'address-set-control', // this control's own element id, used by controls.addElement(id) below;
  // give it one distinct from meta.id below, or a generated uuid is used instead
  meta: { group: 'common', id: 'address-set', icon: 'rows' },
  config: { label: 'Address' },
  controlSet: {
    layout: 'stacked', // default: one column; 'columns' gives each field its own column
    row: { config: { fieldset: true, legend: 'Address' } }, // optional data for the new row
    fields: [
      { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } },
      { control: 'text-input', attrs: { name: 'city' }, config: { label: 'City' } },
      {
        control: 'select',
        attrs: { name: 'country' },
        config: { label: 'Country' },
        options: [
          { label: 'Canada', value: 'ca', selected: false },
          { label: 'United States', value: 'us', selected: false },
        ],
      },
    ],
  },
}

new FormeoEditor({ editorContainer: '.formeo-editor', controls: { elements: [addressSet] } })
```

Each entry in `fields` is one field:

- With `control`, it starts from that control's data (what clicking the control would add; `control` is its
  `meta.id`, e.g. `'text-input'`, `'select'`, `'textarea'` or one of your own) and the entry's other keys override it.
  Arrays such as `options` replace the control's, rather than being added to them.
- Without `control`, the entry is the field's data as it is (`tag`, `attrs`, `config`, `options`). It can still name
  its own control with `meta.id`, which becomes its `config.controlId` — so control-level settings such as locked
  attributes and a renderer's `elements` actions apply to it, the same as a field added from that control directly.
- An unknown `control`, a layout control or another set is skipped with a console warning. A set left with no fields
  adds nothing.

Every add creates new ids, and changing one added field never changes another or the set's definition. `row` takes
the same data as a row's settings, so `config: { inputGroup: true }` makes the set a repeatable input group.

Where it goes: a click adds the row at the end of the current page. A drop on a page adds it where it was dropped; a
drop on a row or column adds it as a new row right after that row (a set never goes inside an existing column).

The [`onBeforeAdd`](../options/events/README.md#before-hooks) hook runs once for the whole set, with
`componentType: 'controlSet'`, the set's `controlId`, and `data: { layout, row, fields }`; `parent` and `index` are
the page and position the new row goes to. The usual events (`onAddRow`, `onAddColumn`, `onAddField`) follow for what
is added. `controls.addElement(id)` from your code adds a set without the hook; `id` is the control's own `id` (its
element id) — a generated uuid unless the definition sets a top-level `id` distinct from `meta.id`, as `address-set`
does above with `'address-set-control'` — not its `meta.id` itself, which `editor.controls.addElement('address-set')`
would throw on.

## See Also

- [Controls](README.md) - Overview of controls and control groups
- [Control Options](../options/controls/README.md) - Configure the control panel, including `elements`
- [Custom Attribute Types](custom-attribute-types.md) - Attribute input types for a control's `attrs`
- [Renderer: Custom Elements](../renderer/renderer.md#advanced-topics) - The renderer's `elements` option
- [Control sets](#control-sets) - Add several fields at once
- [Rich Text Editors](rich-text-editors.md) - A full worked example: a CKEditor 5 control
