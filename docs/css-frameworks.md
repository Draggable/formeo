# Using a CSS Framework

`FormeoRenderer` renders forms as plain HTML — nothing Formeo-specific is required to style it. Load Bootstrap (or
any other CSS framework) on the page as you normally would, and it applies to the rendered form like any other
content. Only the *editor* optionally loads a Formeo stylesheet (see [`style: null`](#skip-formeos-editor-stylesheet)
below); the renderer never loads one for you, so a framework's own styles aren't fighting anything by default.

## The rendered markup

This is what `FormeoRenderer` actually produces (verified by rendering a form with a text field, a required
checkbox group, a radio group and a select in a unit-test probe, then reading the resulting DOM), trimmed to the
structural elements and their classes:

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
- **Row:** the row's own element carries no class by default; it's wrapped in a div with `formeo-row-wrap`.
- **Column:** no class either — its width comes from an inline `style="width: ...%"` (from the column's
  `config.width`, `100%` if unset), not a class.
- **Checkbox/radio options:** each option is wrapped in a div with a fixed `f-checkbox` or `f-radio` class.
- **Required mark:** the `*` next to a label is a `<span class="text-error">`.
- **Tooltip:** `<span class="f-tooltip" data-tooltip="...">`.
- **Help text:** `<small class="f-help-text">`.

None of these resemble a framework's own class names, so out of the box a framework's CSS doesn't touch the
rendered form. Either write your own rules against the classes above, or add the framework's classes to fields —
see below.

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

## Skip Formeo's editor stylesheet

The editor loads its own stylesheet by default (the `style` option, documented in
[Options](options/README.md)); set it to `null` to skip loading it, e.g. if you're building the editor's chrome
entirely with your own framework-based styles:

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  style: null,
})
```

This only applies to the editor — `FormeoRenderer` has no stylesheet of its own to skip.

## See Also

- [Custom Controls](controls/custom-controls.md) - `dependencies`, `attrs`, and the control object shape
- [Options](options/README.md) - The editor's `style` option
- [README: Theming](https://github.com/Draggable/formeo/blob/main/README.md#theming) - `--formeo-*` custom properties
