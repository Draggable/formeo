# Using a CSS Framework

`FormeoRenderer` renders forms as plain HTML, but Formeo also ships its own stylesheet
(`dist/formeo.min.css`) that targets that markup — `.formeo input`, `.formeo select`, `.formeo textarea` and
`.formeo button` rules, plus the flex/float rules that lay rows and columns out side by side. Whether that
stylesheet is on the page or not changes how a framework like Bootstrap interacts with the rendered form, so this
guide covers both: what the rendered markup looks like, what `formeo.min.css` does to it if it's loaded, and how
to combine it with a framework either way.

## The rendered markup

This is what `FormeoRenderer` actually produces for a form with a text field, a required checkbox group, a radio
group and a select, trimmed to the structural elements and their classes:

```html
<form class="formeo-render formeo formeo-rendered-0" id="f-my-form">
  <div class="formeo-stage" id="stage-1" data-stage-id="stage-1">
    <div class="formeo-row-wrap">
      <div id="f-row-1">
        <div style="width: 50%;" id="f-col-1">
          <!-- one wrapper per field, see below -->
        </div>
      </div>
    </div>
  </div>
</form>
```

- **Form:** `formeo-render formeo formeo-rendered-N` — `N` is how many `.formeo-render` forms were already on the
  page when this one rendered (0 for the first).
- **Stage:** `formeo-stage`.
- **Row:** a form built in the editor saves `className: ['formeo-row']` on every row, so an editor-built form's
  row elements render with that class. Hand-written or converted `formData` that doesn't set `className` won't
  have it, and the row is just an unclassed element wrapped in a div with `formeo-row-wrap`.
- **Column:** same as rows — editor-built columns carry `className: ['formeo-column']`; hand-written data may not.
  Either way its width comes from an inline `style="width: ...%"` (from the column's `config.width`, `100%` if
  unset).
- **Field:** a field with a visible label is wrapped in a div with `f-field` and its label position,
  `f-label-top|bottom|before|after` (see [Label position](renderer/renderer.md#label-position)). A field without a
  visible label has no wrapper.
- **Checkbox/radio options:** each option is wrapped in a div with a fixed `f-checkbox` or `f-radio` class.
- **Required mark:** the `*` next to a label is a `<span class="text-error">`.
- **Tooltip:** `<span class="f-tooltip" data-tooltip="...">`.
- **Help text:** `<small class="f-help-text">`.

None of these are Bootstrap's (or another framework's) own class names, so a framework's CSS never directly
targets Formeo's rendered markup. What *does* touch it is Formeo's own stylesheet, if it's on the page — see the
next section — plus whatever classes you add yourself via `className` (see [below](#adding-framework-classes-with-classname)).

## Does formeo.min.css apply to the rendered form?

Only if it's on the page. `FormeoRenderer` never loads a stylesheet itself — it just renders HTML. `formeo.min.css`
ends up on the page one of two ways:

- You import it yourself, the same way the [renderer guide's own example](renderer/renderer.md#installation) or the
  root README's CDN `<link>` does.
- The *editor*'s default `style` option loads it (see [Options](options/README.md)) — so if you're previewing a
  rendered form next to a live `FormeoEditor` on the same page, it's already there.

If neither applies — no editor on the page, and you didn't import the CSS — the rendered form is unstyled HTML and
a framework's own classes and defaults are all that touch it.

## What formeo.min.css does if it's loaded

`formeo.min.css` is one stylesheet that covers both the editor's UI and rendered forms; the rules that affect a
rendered form are scoped under `.formeo.formeo-render`, plus a few bare-element rules scoped only to `.formeo`:

- `.formeo input`, `.formeo select`, `.formeo textarea`, `.formeo button` set width, padding, border-radius, etc.
  These have specificity `(0,1,1)` — one class, one element — which beats a framework class alone, like
  Bootstrap's `.form-control` or `.btn-primary` at `(0,1,0)`, when both land on the same `<input>`. In practice
  this means loading `formeo.min.css` *after* Bootstrap can still leave inputs looking like Formeo's defaults
  instead of Bootstrap's.
- `.formeo.formeo-render .formeo-row { display: flex; ... }` and `.formeo.formeo-render .formeo-column {
  float: left; ... }` are what lay a row's columns out side by side. These only apply where the `formeo-row`/
  `formeo-column` classes exist — see the note above about editor-built vs. hand-written `formData`.

You have two reasonable options:

**Load `formeo.min.css` and override what you need.** Because Formeo's element rules have specificity `(0,1,1)`,
a plain framework class won't beat them — write your override against `.formeo`, or your framework's own scoped
selector, so it wins on specificity too:

```css
/* Restore Bootstrap's input styling over Formeo's defaults */
.formeo.formeo-render .form-control {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
}
```

**Or don't load `formeo.min.css` at all**, and write your own row/column layout instead — the rendered markup
above still gives you `.formeo-row`/`.formeo-column` (on editor-built data) or plain wrapper elements to target:

```css
.formeo-row {
  display: flex;
  gap: 1rem;
}
.formeo-column {
  flex: 1;
}
```

Either way, the fields themselves (inputs, selects, labels) are unstyled by Formeo if you skip the stylesheet, so
a framework's own form classes apply cleanly.

## Adding framework classes with `className`

Any field's `attrs.className` becomes a class on its rendered element — set it as a default in a custom control, or
per-field in the editor:

```javascript
// as a default on a custom control (see Custom Controls: https://github.com/Draggable/formeo/blob/main/docs/controls/custom-controls.md)
attrs: {
  className: 'form-control', // Bootstrap's input class
}
```

**Radio and checkbox groups are a special case.** `className` on a group's `attrs` lands on the group's own wrapper
elements (the div the group's label and options are wrapped in) — it does **not** reach each individual option; every
option keeps the fixed `f-checkbox`/`f-radio` wrap regardless of `className` (`processOptions` in
`src/lib/js/common/dom.js`). If your framework needs a per-option class (Bootstrap's `form-check`, for example),
target `.f-checkbox`/`.f-radio` directly in your own CSS rather than relying on `className`.

**Tables** take `className` on the `<table>` itself, next to `f-table`, so `className: 'table table-striped'` gives a
[Table](controls/table.md) Bootstrap's table styles.

## Framework dependencies only some controls need

If only one control needs a framework's CSS/JS (a date picker, a rich text editor), don't load it for the whole
page — give that control its own `dependencies: { js, css }`, fetched once and deduped by URL the first time the
control is used. See [Custom Controls](controls/custom-controls.md) and, for a full worked example,
[Rich Text Editors](controls/rich-text-editors.md).

## Editor theming

The editor UI itself (not the rendered form) is styled with `--formeo-*` CSS custom properties, so you can restyle
it — dark mode, brand colors — without fighting a framework's own resets. See the root README's
[Theming](https://github.com/Draggable/formeo/blob/main/README.md#theming) section for the full list of properties
and how to override them.

## Skip the editor's automatic stylesheet load

The editor loads `formeo.min.css` automatically by default (the `style` option, documented in
[Options](options/README.md)); set it to `null` to skip that automatic load, e.g. if you're building the editor's
chrome entirely with your own framework-based styles:

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  style: null,
})
```

This only stops the *editor's* automatic load. `FormeoRenderer` never loads a stylesheet automatically either way
— see [Does formeo.min.css apply to the rendered form?](#does-formeomincss-apply-to-the-rendered-form) above for
how it ends up on the page (or doesn't) when you're using the renderer on its own.

## See Also

- [Custom Controls](controls/custom-controls.md) - `dependencies`, `attrs`, and the control object shape
- [Options](options/README.md) - The editor's `style` option
- [README: Theming](https://github.com/Draggable/formeo/blob/main/README.md#theming) - `--formeo-*` custom properties
