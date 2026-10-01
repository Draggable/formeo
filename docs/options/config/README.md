# Config

The `config` option enables fine tuning of the editor's UI. With it you can disable, add, reorder and modify rows, columns, fields and their action buttons.

## Usage

One can think of a config setting as having 3 parts: a scope supertype part, a scope subtype part, and a setting part. The scope parts allow us to get very specific with where the setting part should apply. It'll look something like this:

```javascript
const formeoOptions = {
  config: {
    SCOPE_SUPERTYPE: {
      SCOPE_SUBTYPE: {
        SETTING_PART: {}
      }
    }
  }
}
```

### Scope Supertype

There are 4 scope supertypes: `stages`, `rows`, `columns`, and `fields` (+externals?)

### Scope Subtype

The scope subtype can take one of 3 forms:

- The string `all` matches all members of the scope supertype
- A field type, like `checkbox`, matches fields of this type
- An object id, such as `'a33bcc32-c54c-46ed-9609-7cdb5b3dc511'`, matches that specific object

### Settings

You can override actions and events:

```javascript
events: { onRender: console.log },
```

You can limit the set of visible action buttons:

```javascript
actionButtons: {
  buttons: ['edit']
}
```

You can disable panels:

```javascript
panels: {
  disabled: ['conditions']
}
```

You can choose which `config` keys the Configuration panel offers (see [Configuration panel keys](#configuration-panel-keys)):

```javascript
panels: {
  config: {
    options: { hint: { default: '', label: 'Hint' } },
    disabled: ['tooltip'],
  },
}
```

## Configuration panel keys

A component's Configuration panel shows the `config` keys declared for it in `panels.config.options`. Its
"Add config" dialog offers the declared keys the component doesn't have yet, and its Add button hides when there are
none left. Keys that aren't declared, such as `controlId`, never show.

- `fields.all` declares `label`, `hideLabel`, `helpText`, `labelPosition`, `disableHtmlLabel` and `tooltip`.
  `labelPosition` is a dropdown (see [Label position](../../renderer/renderer.md#label-position)). It replaces
  `labelAfter`, which the editor converts on load.
- A control can declare more for its own fields with `configOptions` (see [elements](../controls/README.md#configoptions)).
- The checkbox and radio group controls declare `other` and `otherLabel`, which add an
  [Other choice](../../renderer/renderer.md#other-choice) to the group.
- Stages declare `title` when the editor's [`pages`](../../editor/pages.md) option is on and nothing otherwise, so a
  stage without pages has no Configuration panel.

A declaration is `{ default, label, options }`:

- `default` is the value a key added from the dialog starts with. It must be a boolean (edited with a checkbox), a
  string or a number (edited with a text input). Other defaults are ignored with a console warning.
- `label` is optional. It defaults to the `config.<key>` translation, then to the key in title case.
- `options` is optional and makes the item a dropdown: `[{ value, label }]`, where each `value` is a string and
  `default` is one of them. A missing `label` is the `<key>.<value>` translation, then the value in title case.
  Options that don't meet these rules make the declaration ignored, with a console warning.

Declarations merge in this order, later ones winning: `all`, the control's own `configOptions`, the field type, then the
component id. A key listed in `disabled` at any of those levels is hidden from the panel and the dialog. It stays in
the form data if it's already there.

### Add a "Hint" key to text inputs and hide Tooltip everywhere

```javascript
const formeoOptions = {
  config: {
    fields: {
      all: { panels: { config: { disabled: ['tooltip'] } } },
      'text-input': { panels: { config: { options: { hint: { default: '', label: 'Hint' } } } } },
    },
  },
}
```

## Examples

Here are a few things you can do with the `config` option.

### Annoy your users with an alert every time they add a row to the form.

```javascript
{
  rows: {
    all: { // "all" is a catch-all type that will be applied
      events: {
        onRender: element => {
          window.alert(`You just added a new row with the id "${element.id}"`)
        },
      },
    },
  }
}
```

### Show only the "Edit" button for checkbox fields

```javascript
{
  fields: {
    checkbox: { // checkbox is a registereed type, configurations will only be applied to checkbox
      actionButtons: {
        buttons: ['edit']
      }
    }
  }
}
```

### Disable the conditions panel for a specific field

```javascript
{
  fields: {
    'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': { // apply to a specific field
      panels: {
        disabled: ['conditions']
      }
    }
  }
}
```

### Stop users removing the required attribute

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  config: {
    fields: {
      all: { panels: { attrs: { locked: ['required'] } } }, // every field
      // 'text-input': { … } // one control type, or use a field id for one field
    },
  },
})
```

A locked attribute can't be removed, re-added with **+ Attribute**, or changed; locked checkboxes and selects are disabled. If one was removed before you locked it, remove the `locked` config entry, add it back with **+ Attribute** (name `required`, value `true`), then restore the lock.

### Row and column attributes

Rows and columns have an **Attributes** panel, like fields. Open a row with its edit button: the **Settings** tab
holds the input group, fieldset and column layout controls, and the **Attributes** tab adds attributes with
**+ Attribute**. Columns have an edit button that opens their Attributes panel.

Attributes are saved in `rows.<id>.attrs` and `columns.<id>.attrs` and rendered on the `.formeo-row` /
`.formeo-column` element (see [Row and column attributes](../../renderer/renderer.md#row-and-column-attributes)).
They are not applied in the editor, so a class like `d-none` can't hide a row while you build.

- Put classes in `className`. Formeo keeps its own `formeo-row` / `formeo-column` class separately and merges the two
  when rendering.
- `id` and `tag` are reserved on rows and columns, and `data-clone-of` on rows. The dialog refuses them. You can
  reserve more names with `panels.attrs.disabled`, but you can't free these.

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  config: {
    rows: {
      all: {
        panels: {
          attrs: { disabled: ['onclick'] }, // reserve another name
          // disabled: ['settings'], // hide the row Settings tab
        },
      },
    },
    columns: {
      all: { actionButtons: { disabled: ['edit'] } }, // no column edit button, as before
    },
  },
})
```

### Hide the add buttons

`panels.<panel>.add: false` hides that panel's add button: `attrs` (**+ Attribute**), `options` (**+ Option**),
`conditions` (**+ Condition**) and `config` (**+ Configuration**). It works in every scope, so a control id or
component id can set it back to `true`.

```javascript
new FormeoEditor({
  editorContainer: '#formeo-editor',
  config: {
    fields: {
      all: { panels: { attrs: { add: false } } }, // no + Attribute on any field
      select: { panels: { options: { add: false } } }, // no + Option on selects
      'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': { panels: { attrs: { add: true } } }, // except this field
    },
    rows: { all: { panels: { attrs: { add: false } } } },
    columns: { all: { panels: { attrs: { add: false } } } },
    stages: { all: { panels: { conditions: { add: false } } } }, // conditions live on the stage
  },
})
```

Attributes, options and conditions that are already there stay editable and removable. Use `locked` to stop that,
and `disabled` to hide them. The setting only changes the editor UI: your own code can still add attributes.
