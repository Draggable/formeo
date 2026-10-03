# Table

The **Table** control (HTML group) adds a static table: a caption, an optional header row and rows of plain-text
cells. It's for showing information, such as opening hours or a price list. It has no inputs, so it adds nothing to
`userData`.

## Building a table in the editor

Drag **Table** onto the stage, or click it, then open the field's edit panel. The **Table** tab comes first:

- **Caption**: the table's visible title, and the name screen readers announce.
- **Header row**: shows the column labels as the table's header (`<th scope="col">`). Turning it off keeps the
  labels, so you can turn it back on.
- **Row headers**: makes each row's first cell a row header (`<th scope="row">`).
- One text box per cell, and one per header label while **Header row** is on.
- **+ Row** and **+ Column** add a row or column at the end. Each row and column has a remove button. The last row and
  the last column can't be removed.

Everything in the panel works from the keyboard. After you add or remove a row or column, focus moves to the new
input or the next remove button, or to the add button when only one row or column is left. Cells are plain text:
anything that looks like HTML is shown as typed.

## Data

A table field keeps its structure in `table`:

```json
{
  "id": "a1b2c3d4",
  "tag": "table",
  "attrs": { "className": "" },
  "config": { "label": "Table", "hideLabel": true, "controlId": "table" },
  "table": {
    "caption": "Opening hours",
    "headerRow": true,
    "rowHeaders": false,
    "columns": [{ "label": "Day" }, { "label": "Hours" }],
    "rows": [{ "cells": ["Mon", "9–5"] }, { "cells": ["Tue", "9–1"] }]
  }
}
```

`caption` defaults to `""`, `headerRow` to `true` and `rowHeaders` to `false`. The renderer pads short rows with empty
cells and ignores extra ones, so every row has one cell per column. In TypeScript the shape is `TableData`.

## Rendered markup

```html
<div class="f-table-wrap" role="region" tabindex="0" aria-labelledby="f-a1b2c3d4-caption">
  <table id="f-a1b2c3d4" class="f-table">
    <caption id="f-a1b2c3d4-caption">Opening hours</caption>
    <thead><tr><th scope="col">Day</th><th scope="col">Hours</th></tr></thead>
    <tbody><tr><td>Mon</td><td>9–5</td></tr></tbody>
  </table>
</div>
```

- The field's id and `attrs` go on the `<table>`.
- On a narrow screen a wide table scrolls sideways inside the wrapper. The wrapper is focusable, so keyboard users can
  scroll it with the arrow keys.
- Without a caption, the wrapper is named by the field's label (`config.label`, "Table" by default).
- The field's label is never rendered as a `<label>`. The caption is the table's visible name.

## Styling

The table uses `--formeo-border` for cell borders and `--formeo-surface-muted` for header cells (see
[CSS frameworks](../css-frameworks.md) for theming). To use a CSS framework's table classes, set the field's
`className` attribute, for example `table table-striped` for Bootstrap. The classes land on the `<table>` next to
`f-table`.

## Conditions

A condition can show or hide a table: target the table field with **is visible** / **is not visible**, and the whole
scroll region hides. A table has no value, so as a source there is nothing to compare (the same as a paragraph or
header), and rows and cells can't be targeted.

## Migrating from a custom table control

Before the built-in control, a table needed a custom control. Both workarounds keep working:

- **A static table in `content`** (`tag: 'table'` with `tr`/`td` children, as suggested in
  [#349](https://github.com/Draggable/formeo/issues/349)). If your control used `meta.id: 'table'`, it replaces the
  built-in Table in the controls panel, because your `controls.elements` register after the built-in controls. Saved
  fields keep rendering from `content`.
- **`data-rows` / `data-cols` with an `onRender` action** (from
  [#260](https://github.com/Draggable/formeo/issues/260)). The editor and renderer leave it alone, and the action you
  pass through the renderer's `elements` still runs.

The built-in behaviour keys off the field's `table` data, not the control id: any field whose `table` is an object
renders and edits as a built-in table, so a custom control that already used a `table` object key for something else
should rename it.

To switch to the built-in control, remove your custom control from `controls.elements` (or give it a different
`meta.id`), then add a Table and copy your cells into it. Formeo doesn't convert old fields automatically: their
markup and render actions can't be mapped to cells reliably.

## Coming later

Tables with inputs in their cells, such as rating grids, and rows that the person filling in the form can add, are
planned as follow-up features of [#349](https://github.com/Draggable/formeo/issues/349).
