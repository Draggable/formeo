# Config

The `config` option enables fine tuning of the editor's UI. With it you can disable, add, reorder and modify rows, columns, fields and their action buttons. Here are a few things you can do with the `config` option.

**Examples**

<details><summary>Annoy your users with an alert every time they add a row to the form.</summary>

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

</details>

<details><summary>Show only the "Edit" button for checkbox fields</summary>

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

</details>

<details><summary>Disable the conditions panel for a specific field</summary>

```javascript
{
  fields: {
    'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': { // apply to a specific field
      panels: {
        disabled: [
          'conditions'
        ]
      }
    }
  }
}
```

</details>****
