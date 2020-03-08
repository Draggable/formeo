# Controls Options

Control options can be used to disable, extend and modify the Formeo's control panel.

| Option                        | Type    | Description                                                                         | Example                                      | Default                        |
| ----------------------------- | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| [sortable](#sortable)         | String  | allow controls to be reordered by users                                             | `true`                                       | `false`                        |
| [disable](#disable)           | Object  | disable built-in elements or groups                                                 | `{elements: ['number']}`                     | `{}`                           |
| [elements](#elements)         | Array   | define custom elements                                                              | [see below](#elements)                       | `[]`                           |
| [elementOrder](#elementOrder) | Object  | set order of elements in a group                                                    | `{html: ['header', 'paragraph', 'divider']}` | `[]`                           |
| [groups](#groups)             | Array   | define custom [control groups](../../controls/#control-groups) beyond the default 3 | [see below](#groups)                         | `[]`                           |
| [groupOrder](#groupOrder)     | Array   | set order of [control groups](../../controls/#control-groups)                       | `['html', 'layout']`                         | `['common', 'html', 'layout']` |
| [ghostPreview](#ghostPreview) | Boolean | use a live preview of the control when dragging                                     | `true`                                       | `false`                        |

## sortable

```javascript
const controlOptions = {
  sortable: true,
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```

## disable

Disable built-in elements or groups

```javascript
const controlOptions = {
  disable: {
    elements: ['number'],
    groups: ['layout'],
    formActions: true, // cancel and save buttons will not be shown
    // formActions: ['clearBtn'], // only the clear button will be disabled
  },
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```

## elements

Define a custom element. Does _not_ remove existing elements.

```javascript
const controlOptions = {
  elements: [
    {
      tag: 'input', // HTML tag used to render the element
      config: {
        label: 'Email',
        disabledAttrs: ['type'], // Attributes hidden from the user
        lockedAttrs: [], // Attributes that cannot be deleted
      },
      meta: {
        group: 'common',
        id: 'email',
        icon: 'email', // Icon name in icon set
      },
      attrs: {
        // actual attributes on the HTML element, and their default values
        type: 'email', // type field is important if tag==input
        name: 'email',
      },
      options: [
        // Used for element types like radio buttons
        // {label: 'Option 1', value: 'opt1', selected: true}
      ],
    },
  ],
  elementOrder: {
    // Must be set in conjunction or it may not appear in the group
    common: ['email' /* ...rest of the elements */],
  },
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```

## elementOrder

Set the element order within a control group. May be overridden if [sortable](#sortable) is set to true

```javascript
const controlOptions = {
  elementOrder: {
    html: ['header', 'paragraph', 'divider'],
  },
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```

## groups

Define a custom [control group](../../controls/#control-groups) beyond the default 3. Does _not_ remove existing groups

```javascript
const controlOptions = {
  groups: [
    {
      id: 'mygroup',
      label: 'My Amazing Group!',
      elementOrder: ['myelement'],
    },
  ],
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```

## groupOrder

Set the group panel order with `groupOrder`

```javascript
const controlOptions = {
  groupOrder: ['common', 'html'],
}

const formeoOptions = {
  controls: controlOptions,
}

const formeo = new FormeoEditor(formeoOptions)
```
