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
