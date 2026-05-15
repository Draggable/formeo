# Custom Attribute Types

By default, attributes in the editor's attribute pane are rendered as text inputs. Formeo supports several attribute input types that are automatically detected from the attribute value type, and you can also provide dropdown options for attributes.

## Supported Attribute Input Types

Formeo automatically maps JavaScript value types to editor input types:

| JavaScript Value Type | Editor Input | Example |
|---|---|---|
| `string` | Text input | `type: 'text'` |
| `number` | Number input | `maxLength: 100` |
| `boolean` | Checkbox | `required: false` |
| `array` of options | Select dropdown | See below |

## Select Dropdown Attributes

To render an attribute as a select dropdown, define its value as an array of option objects with `label`, `value`, and `selected` properties.

### Method 1: Define in Control Definition

When creating a custom control, set the attribute value to an array of options:

```javascript
const customControl = {
  tag: 'div',
  attrs: {
    // This renders as a text input
    className: '',

    // This renders as a select dropdown
    alignment: [
      { label: 'Left', value: 'left', selected: true },
      { label: 'Center', value: 'center', selected: false },
      { label: 'Right', value: 'right', selected: false },
    ],

    // This renders as a checkbox
    visible: true,
  },
  config: {
    label: 'Custom Element',
  },
  meta: {
    group: 'html',
    id: 'custom-element',
    icon: 'custom',
  },
}

const formeoOptions = {
  controls: {
    elements: [customControl],
  },
}

const formeo = new FormeoEditor(formeoOptions)
```

The built-in **header** control uses this pattern for its `tag` attribute (h1, h2, h3, h4):

```javascript
// From header.js
attrs: {
  tag: headerTags.map((tag, index) => ({
    label: tag.toUpperCase(),
    value: tag,
    selected: !index, // first item selected by default
  })),
  className: '',
},
```

### Method 2: Use config.attrs for Dropdown Options

You can also provide dropdown options through the `config` option. Set `config.attrs[attrName]` to an array of options, and the editor will render that attribute as a select dropdown instead of a text input.

```javascript
const formeoOptions = {
  config: {
    fields: {
      // Apply to all text-input fields
      'text-input': {
        attrs: {
          // Make the 'type' attribute a dropdown instead of a text input
          type: [
            { label: 'Text', value: 'text', selected: true },
            { label: 'Email', value: 'email', selected: false },
            { label: 'Password', value: 'password', selected: false },
            { label: 'Number', value: 'number', selected: false },
          ],
        },
      },
    },
  },
}

const formeo = new FormeoEditor(formeoOptions)
```

## Radio Button Attributes

Boolean attributes in the `options` panel (like `selected` on radio group or checkbox group options) are automatically rendered as radio buttons instead of checkboxes. This is handled internally by Formeo.

## Programmatic Attribute Addition

You can add attributes programmatically using the `addAttribute` method on the edit panel:

```javascript
// Get the field component and add a new attribute
const field = Components.fields.get(fieldId)
const editPanel = field.editPanels.get('attrs')

// Add a simple text attribute
editPanel.addAttribute('data-custom', 'some value')

// Add a boolean attribute (renders as checkbox)
editPanel.addAttribute('disabled', false)

// Add a number attribute (renders as number input)
editPanel.addAttribute('data-max', 100)
```

## Controlling Attribute Visibility

Use the `config` option to control which attributes are visible, disabled, or locked:

```javascript
const formeoOptions = {
  config: {
    fields: {
      'text-input': {
        // Hide specific attributes from the panel
        panels: {
          attrs: {
            disabled: ['type'], // hides the type attribute
            locked: ['name'],   // prevents removal of the name attribute
          },
        },
      },
    },
  },
}
```

You can also use `disabledAttrs` and `lockedAttrs` in the control definition:

```javascript
const customControl = {
  tag: 'input',
  attrs: {
    type: 'email',
    name: 'email',
  },
  config: {
    label: 'Email Input',
    disabledAttrs: ['type'],  // user cannot edit the type
    lockedAttrs: ['name'],    // user cannot remove the name attribute
  },
  meta: {
    group: 'common',
    id: 'email-input',
    icon: 'email',
  },
}
```

## Complete Example: Custom Control with Multiple Attribute Types

```javascript
const richControl = {
  tag: 'div',
  attrs: {
    // Text input
    className: '',

    // Select dropdown
    variant: [
      { label: 'Default', value: 'default', selected: true },
      { label: 'Primary', value: 'primary', selected: false },
      { label: 'Secondary', value: 'secondary', selected: false },
    ],

    // Checkbox
    collapsible: false,

    // Number input
    maxLines: 5,
  },
  config: {
    label: 'Rich Block',
    disabledAttrs: [],
    lockedAttrs: ['variant'],
  },
  meta: {
    group: 'html',
    id: 'rich-block',
    icon: 'block',
  },
  content: 'Rich block content',
}

const formeoOptions = {
  controls: {
    elements: [richControl],
    elementOrder: {
      html: ['rich-block', 'header', 'paragraph', 'divider'],
    },
  },
}

const formeo = new FormeoEditor(formeoOptions)
```

## See Also

- [Controls](../controls/README.md) - Overview of controls and control groups
- [Control Options](../options/controls/README.md) - Configure the control panel
- [Config Option](../options/config/README.md) - Fine-tune the editor UI
