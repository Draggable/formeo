# Dialog Component

A reusable Dialog component that wraps the native HTML `<dialog>` element with form functionality.

## Features

- Always wraps content in a `<form>` element
- Built using the `dom` class for consistent markup generation
- Handles `onSubmit` and `onCancel` callbacks
- Full keyboard support (Escape key handling)
- Static shorthand methods for common patterns
- Automatic cleanup on close

## Basic Usage

### Custom Dialog

```javascript
import Dialog from './components/dialog.js'

const dialog = new Dialog({
  title: 'Add Configuration',
  content: [
    {
      tag: 'label',
      children: [
        'Key',
        {
          tag: 'input',
          type: 'text',
          name: 'key',
          required: true,
        },
      ],
    },
    {
      tag: 'label',
      children: [
        'Value',
        {
          tag: 'input',
          type: 'text',
          name: 'value',
        },
      ],
    },
  ],
  onConfirm: (formData, dialog) => {
    const key = formData.get('key')
    const value = formData.get('value')
    console.log('Saved:', { key, value })
  },
  onCancel: (dialog) => {
    console.log('Dialog cancelled')
  },
})

dialog.open()
```

## Static Shorthand Methods

### Alert Dialog

```javascript
Dialog.alert('Operation completed successfully', () => {
  console.log('User acknowledged')
}).open()
```

### Confirmation Dialog

```javascript
Dialog.confirm(
  'Are you sure you want to delete this item?',
  () => {
    console.log('User confirmed')
    // Perform delete action
  },
  () => {
    console.log('User cancelled')
  }
).open()
```

### Prompt Dialog

```javascript
Dialog.prompt(
  'Enter your name:',
  (value) => {
    console.log('User entered:', value)
  },
  'Default Name' // Optional default value
).open()
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `''` | Dialog title (optional) |
| `content` | `Object\|Array` | `null` | DOM config for dialog body content |
| `onConfirm` | `Function` | `() => {}` | Callback when form is submitted, receives `(formData, dialog)` |
| `onCancel` | `Function` | `() => {}` | Callback when dialog is cancelled, receives `(dialog)` |
| `confirmText` | `string\|Function` | `i18n.get('save')` | Confirm button text |
| `cancelText` | `string\|Function` | `i18n.get('cancel')` | Cancel button text |
| `className` | `string` | `''` | Additional CSS class name(s) |
| `closeOnEscape` | `boolean` | `true` | Whether Escape key closes dialog |
| `position` | `string` | `'top'` | Positioning mode: `'top'` (upper center), `'center'` (middle), or `'trigger'` (near trigger element) |
| `triggerElement` | `HTMLElement` | `null` | Element that triggered the dialog (used with `position: 'trigger'`) |
| `triggerCoords` | `Object` | `null` | Manual coordinates `{x, y}` (used with `position: 'trigger'`) |

## Methods

### `open()`

Opens the dialog and displays it as a modal. Automatically appends to `document.body` and calls `showModal()`.

Returns the Dialog instance for chaining.

```javascript
const dialog = new Dialog({...})
dialog.open()
```

### `close()`

Closes and removes the dialog from the DOM. Automatically called after `onConfirm` or when cancel is triggered.

```javascript
dialog.close()
```

## Positioning

The Dialog component supports three positioning modes:

### Top Positioning (Default)

Dialog appears in the upper center of the viewport (20% from top):

```javascript
new Dialog({
  position: 'top', // default
  content: {...}
}).open()
```

### Center Positioning

Dialog appears in the exact center of the viewport:

```javascript
new Dialog({
  position: 'center',
  content: {...}
}).open()
```

### Trigger Positioning

Dialog appears near the element that triggered it:

```javascript
// Using trigger element
const button = document.querySelector('.add-config-btn')
button.addEventListener('click', (e) => {
  new Dialog({
    position: 'trigger',
    triggerElement: e.currentTarget,
    content: {...}
  }).open()
})

// Using manual coordinates
new Dialog({
  position: 'trigger',
  triggerCoords: { x: 200, y: 300 },
  content: {...}
}).open()
```

The dialog will automatically stay within viewport bounds with a 16px padding.

## Keyboard Support

- **Escape key**: Triggers `onCancel` callback and closes dialog (if `closeOnEscape: true`)
- **Enter key**: Submits form (if inside input fields)
- **Tab key**: Native focus management within dialog

## Styling

The dialog uses the following CSS classes:

- `.formeo-dialog` - Main dialog element
- `.dialog-form` - Form wrapper
- `.dialog-title` - Title heading
- `.dialog-body` - Content container
- `.dialog-actions` - Button container
- `.dialog-message` - Message paragraph (used in shorthands)
- `.dialog-prompt-input` - Prompt input field

Custom styling can be added via the `className` option or by targeting these classes in your CSS.

## Example: Edit Panel Integration

```javascript
import Dialog from '../dialog.js'

addConfiguration = () => {
  const newConfigItem = new EditPanelItem({...})

  const dialog = new Dialog({
    className: 'config-item-dialog',
    content: [
      {
        tag: 'label',
        children: [
          i18n.get('placeholder'),
          {
            tag: 'input',
            type: 'text',
            name: 'config-key-input',
            required: true,
          },
        ],
      },
      {
        tag: 'label',
        children: [
          i18n.get('value'),
          {
            tag: 'input',
            type: 'text',
            name: 'config-value-input',
          },
        ],
      },
    ],
    onConfirm: formData => {
      const configKey = formData.get('config-key-input').trim()
      const configValue = formData.get('config-value-input').trim()

      if (configKey) {
        this.component.set(`config.${configKey}`, configValue)
        newConfigItem.updateItemValues({ [configKey]: configValue })
        this.component.resizePanelWrap()
      }
    },
  })

  dialog.open()
}
```

## Browser Support

Uses native `<dialog>` element. For older browsers without native support, a polyfill is recommended.
