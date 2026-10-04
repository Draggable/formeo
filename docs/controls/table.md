# Table

The **Table** control (HTML group) adds a table: a caption, an optional header row and rows of plain-text cells. It's
for showing information, such as opening hours or a price list. Give a column an input type and the table becomes a
**matrix**, a grid of radio, checkbox or text inputs (see [Input columns (matrix)](#input-columns-matrix)). The
**Matrix** control (form group) starts as one.

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
scroll region hides. A table without inputs has no value, so as a source there is nothing to compare (the same as a paragraph or header).
A matrix's rows and cells can be sources and targets; see [Conditions on rows and cells](#conditions-on-rows-and-cells).

## Input columns (matrix)

Each column's header in the Table panel has a type: **Static text** (the default), **Text field**, **Radio** or
**Checkbox**. A column with an input type shows that input in every row, and the table becomes a matrix. The
**Matrix** control starts as a matrix with a row-label column and three radio columns.

- **Radio** columns in a row are one group: pick one per row, as in a rating scale.
- Each **Checkbox** cell is its own yes/no answer.
- Each **Text field** cell is its own text answer.
- Static columns keep showing their cell text, so a column of row labels, or a fixed price, sits next to the inputs.

Once a table has an input column, its header row always shows, because the column labels name the choices. With
**Row headers** on, the first column holds the row labels and can't take an input.

### Values and names

Every input column and every row has a **value**, its key in the submitted data. The panel fills them in
(`column-1`, `row-1`, …) and you can change them. Spaces are fine. Square brackets become `-`, and a blank or
duplicate value is replaced with the next free `row-<n>` / `column-<n>` when you leave the box.

Inputs are named after the field's `name` attribute, or `f-<field id>` when it has none:

| Input | `name` | Submitted value |
|-------|--------|-----------------|
| Radio | `base[row]` | the column's value |
| Checkbox | `base[row][column]` | the column's value, when checked |
| Text field | `base[row][column]` | the text |

So a rating matrix named `visit` gives `userData` like this:

```js
{
  'visit[speed]': 'good',
  'visit[speed][comment]': 'Quick',
  'visit[price][wrap]': 'wrap',
}
```

`userData` is flat: one key per name, as for every other field. Setting `renderer.userData` with the same keys fills
the matrix back in. `userFormData` labels each entry `{caption}: {row}` or `{caption}: {row}, {column}`.

A server that parses bracketed names into nested objects (PHP, Rails, `qs`) sees `visit[speed]` as a string. If the
same row also has checkbox or text cells, `visit[speed][comment]` then asks for `visit[speed]` to be an object. Keep
radio choices and other inputs in separate rows, or separate matrices, if your server parses names that way.

### Data

```json
{
  "id": "a1b2c3d4",
  "tag": "table",
  "attrs": { "className": "", "name": "visit" },
  "config": { "label": "Matrix", "hideLabel": true, "controlId": "matrix" },
  "table": {
    "caption": "How was your visit?",
    "headerRow": true,
    "rowHeaders": true,
    "columns": [
      { "label": "" },
      { "label": "Poor", "value": "poor", "input": "radio" },
      { "label": "Good", "value": "good", "input": "radio" },
      { "label": "Comment", "value": "comment", "input": "text" }
    ],
    "rows": [
      { "value": "speed", "required": true, "cells": ["Speed", "", "", ""] },
      { "value": "price", "cells": ["Price", "", "", ""] }
    ]
  }
}
```

`input` is `radio`, `checkbox` or `text`. Any other value, or none, makes a static column. Cells under an input column
are kept but not shown.

### Required rows

Each row has a **Required** checkbox in the panel. A required row needs:

- a choice in its radio group
- at least one checked box among its checkbox cells
- text in every text cell

Validation is the browser's own, so multi-page forms stop on a page with an unanswered required row. A row or cell hidden by a
condition never blocks submit, and a hidden checkbox cell doesn't count towards its row's "at least one box".

### Conditions on rows and cells

In a condition, pick a row or a cell under the matrix field in the source or target list. The addresses are:

- row: `fields.<id>.table.rows[<index>]`
- cell: `fields.<id>.table.rows[<index>].cells[<column index>]`

| Address | As a source | As a target |
|---------|-------------|-------------|
| Row | `value` (its checked radio's value), `isChecked` / `isNotChecked` (any input in the row) | `isVisible` / `isNotVisible` (the whole row) |
| Radio or checkbox cell | `isChecked` / `isNotChecked` | `isChecked` / `isNotChecked`, `isVisible` / `isNotVisible` |
| Text cell | `value` | `value`, `isVisible` / `isNotVisible` |

Indexes count from 0 and include static columns, so with **Row headers** on, the first input column is `cells[1]`.
Like `options[<index>]`, an address points at a position: removing a row or column doesn't update conditions that
use it. A condition pointing at a row or cell that no longer exists does nothing. Reading `value` or `isChecked` from
the whole matrix field isn't supported; use a row or a cell. As a source, the whole field offers only
**is visible** / **is not visible**.

### Accessibility and narrow screens

- Each input is named by its row header and its column header, so a screen reader reads "Speed, Good, radio button".
  Without row headers, the name is "Row 1, Good".
- The matrix is a group named by its caption (or the field's label).
- A required row's header shows `*`, and its inputs carry `required`.
- When the matrix's container is narrower than about 30rem, each row stacks into a card: the row label, then one line
  per input with its column label. The table keeps its table, row and cell roles while stacked, so screen readers
  still announce it as a table.

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

Rows that the person filling in the form can add or remove are planned as a follow-up feature of
[#349](https://github.com/Draggable/formeo/issues/349).
