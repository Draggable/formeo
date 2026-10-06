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
scroll region hides. A table without inputs has no value, so as a source there is nothing to compare (the same as a
paragraph or header). A matrix's rows and cells can be sources and targets; see
[Conditions on rows and cells](#conditions-on-rows-and-cells).

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

Validation is the browser's own, so multi-page forms stop on a page with an unanswered required row. A row or cell
hidden by a condition never blocks submit, and a hidden checkbox cell doesn't count towards its row's "at least one
box".

### Conditions on rows and cells

In a condition, pick a row or a cell under the matrix field in the source or target list. The addresses are:

- row: `fields.<id>.table.rows[<index>]`
- cell: `fields.<id>.table.rows[<index>].cells[<column index>]`

| Address | As a source | As a target |
|---------|-------------|-------------|
| Row | `value` (see below), `isChecked` / `isNotChecked` (any input in it) | `isVisible` / `isNotVisible` |
| Radio or checkbox cell | `isChecked` / `isNotChecked` | `isChecked` / `isNotChecked`, `isVisible` / `isNotVisible` |
| Text cell | `value` | `value`, `isVisible` / `isNotVisible` |

A row's `value` is its checked radio's value, so a row offers it only when the matrix has a radio column.

Indexes count from 0 and include static columns, so with **Row headers** on, the first input column is `cells[1]`.
Like `options[<index>]`, an address points at a position: removing a row or column doesn't update conditions that
use it. A condition pointing at a row or cell that no longer exists does nothing. Reading `value` or `isChecked` from
the whole matrix field isn't supported; use a row or a cell. As a source, the whole field offers only
**is visible** / **is not visible**.

### Accessibility and narrow screens

- Each input is named by its row header and its column header, so a screen reader reads "Speed, Good, radio button".
  Without row headers, the name is "Row 1, Good".
- The matrix is a group named by its caption (or the field's label).
- A required row's inputs carry `required`. Its `*` mark follows the row header, or without row headers the row's
  first static cell. A row with no static cell shows no mark.
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

## Repeating rows

A table with at least one input column can let the person filling in the form add and remove rows, for line items,
household members or references. In the Table panel, tick **Repeating rows**, then set **Minimum rows** and, if you
want a limit, **Maximum rows**. Without an input column the checkbox is disabled.

```js
table: {
  caption: 'Order',
  rowHeaders: true,
  repeat: { min: 1, max: 10 }, // max: null (or leave it out) for no limit
  columns: [
    { label: 'Item' }, // the row header column
    { label: 'Qty', value: 'qty', input: 'text' },
    { label: 'Gift wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [{ cells: ['Item', '', ''], required: true }], // the template row
}
```

- **The template.** `rows[0]` is the template. Every row copies its static text, and its **Required** checkbox
  ("Every row required") applies to every row. While repeating, the panel shows only the template; other rows stay in
  the data and come back if you turn repeating off.
- **Row names.** With row headers on, rows are numbered from the template's first cell: "Item 1", "Item 2". With a blank
  first cell, or without row headers, they're "Row 1", "Row 2".
- **Limits.** The form starts with `min` rows. A row's remove button is disabled at `min`, and **+ Row** at `max`.
  `min: 0` starts with no rows.

### Names and userData

Rows are keyed by position, starting at 0, and stay contiguous: removing a row renumbers the rows after it.

| Input    | Name                 | userData                       |
| -------- | -------------------- | ------------------------------ |
| text     | `order[0][qty]`      | `'order[0][qty]': '2'`         |
| checkbox | `order[1][wrap]`     | `'order[1][wrap]': 'wrap'`     |
| radio    | `order[0]` (per row) | `'order[0]': '<column value>'` |

PHP and qs parse these names into an array of rows. Setting `renderer.userData` adds the rows a saved answer names
(up to `max`, or up to 500 rows when there is no `max`; a `max` above 500 is honoured), then fills them. It never
removes rows. Keys past the limit are reported in the setter's usual warning for keys with no matching field. The setter
adds rows quietly: no focus move, announcement or `formeo:rowschange`.

### Using it

- **+ Row** adds a row and moves focus to its first input. Each row's remove button ("Remove row 2") removes it, and
  focus moves to the next row's remove button, else the previous row's, else **+ Row**. A screen reader hears "Item 3
  added" or "Item 2 removed".
- Adding or removing a row fires a bubbling `formeo:rowschange` event (`detail: { action: 'add' | 'remove', index }`)
  on the table's wrapper, and the renderer's `onChange` receives it, so autosave sees the change.
- **Conditions** can show or hide the whole table. Rows and cells of a repeating table can't be condition sources or
  targets, and the picker doesn't list them. A row added while the table is hidden by a condition, or on a skipped
  page, isn't required or enabled until the table is shown, like the rows already there.
- On narrow screens the rows stack into cards like any matrix, each ending with its remove button.
- **Reset** clears the answers and keeps the rows.
- A repeating table inside an [input group](../renderer/renderer.md#input-groups) copy renders without its **+ Row**
  and remove buttons and keeps the rows it started with, and the `userData` setter doesn't grow it. That combination
  isn't supported.
