# FormeoRenderer Class

The `FormeoRenderer` class is responsible for rendering Formeo form data into interactive HTML forms. It converts the structured form data into DOM elements, handles user interactions, applies conditional logic, and provides methods to retrieve user-submitted data.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Constructor](#constructor)
- [Properties](#properties)
- [Methods](#methods)
- [Working with User Data](#working-with-user-data)
- [Conditional Logic](#conditional-logic)
- [Examples](#examples)

## Installation

```javascript
import FormeoRenderer from './path/to/renderer/index.js'
```

## Basic Usage

```javascript
// Initialize the renderer with form data
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

// Render the form
renderer.render()

// Get user-submitted data
const userData = renderer.userData
console.log(userData)
```

## Constructor

### `new FormeoRenderer(opts, formDataArg)`

Creates a new FormeoRenderer instance.

**Parameters:**

- `opts` (Object): Configuration options
  - `renderContainer` (HTMLElement): The DOM element where the form will be rendered
  - `elements` (Object): Custom form elements/controls configuration
  - `formData` (Object): The form structure data to render
  - `config` (Object): Additional rendering configuration
- `formDataArg` (Object, optional): Alternative way to pass form data

**Example:**

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('my-form'),
  formData: {
    id: 'contact-form',
    stages: { /* stage data */ },
    rows: { /* row data */ },
    columns: { /* column data */ },
    fields: { /* field data */ }
  }
})
```

## Properties

### Getters

#### `formData`

Returns the current form structure data.

```javascript
const formStructure = renderer.formData
```

#### `userData`

Gets the user-submitted data from the rendered form as a plain object. Automatically handles multiple values for the same field (like checkbox groups) by converting them into arrays.

**Returns:** `Object.<string, string|string[]>`

**Example:**

```javascript
// Single values
{ username: 'john', email: 'john@example.com' }

// Multiple values for checkbox group
{ username: 'john', hobbies: ['reading', 'gaming', 'coding'] }
```

#### `userFormData`

Gets the user form data as an array of field objects, combining user input values with component metadata.

**Returns:** `Array<{key: string, value: any, label: string}>`

Each object contains:
- `key`: The field identifier
- `value`: The user's input value for the field
- `label`: The field's label from component configuration

**Example:**

```javascript
const formData = renderer.userFormData
// [
//   { key: 'username', value: 'john', label: 'Username' },
//   { key: 'email', value: 'john@example.com', label: 'Email Address' },
//   { key: 'hobbies', value: ['reading', 'gaming'], label: 'Hobbies' }
// ]
```

#### `html`

Returns the rendered form as an HTML string.

```javascript
const htmlString = renderer.html
```

### Setters

#### `formData`

Sets the form structure data and cleans it.

```javascript
renderer.formData = newFormData
```

#### `userData`

Sets user data programmatically into the form fields. Useful for pre-filling forms or restoring saved data.

**Parameters:** `Object` - Key-value pairs where keys are field names and values are the data to set

**Example:**

```javascript
renderer.userData = {
  username: 'john_doe',
  email: 'john@example.com',
  hobbies: ['reading', 'gaming'] // For checkbox groups
}
```

## Methods

### `render(formData)`

Renders the form data to the target container element. If a form is already rendered, it replaces the existing form.

**Parameters:**
- `formData` (Object, optional): Form structure data. Defaults to the instance's current formData.

**Example:**

```javascript
renderer.render()

// Or render different form data
renderer.render(differentFormData)
```

### `getRenderedForm(formData)`

Generates and returns the rendered form as a DOM element without appending it to the container.

**Parameters:**
- `formData` (Object, optional): Form structure data. Defaults to the instance's current formData.

**Returns:** `HTMLFormElement`

**Example:**

```javascript
const formElement = renderer.getRenderedForm()
document.body.appendChild(formElement)
```

## Working with User Data

### Retrieving User Data

There are two primary ways to get user-submitted data:

#### 1. As a Plain Object (`userData`)

Best for simple processing and API submissions:

```javascript
const data = renderer.userData
// { name: 'John', email: 'john@example.com', subscribe: 'true' }

// Send to API
fetch('/api/submit', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

#### 2. As Structured Array (`userFormData`)

Best when you need field labels and metadata:

```javascript
const formData = renderer.userFormData
// [
//   { key: 'name', value: 'John', label: 'Full Name' },
//   { key: 'email', value: 'john@example.com', label: 'Email Address' }
// ]

// Display in a summary
formData.forEach(field => {
  console.log(`${field.label}: ${field.value}`)
})
```

### Setting User Data

You can programmatically populate form fields:

```javascript
// Pre-fill a form
renderer.userData = {
  username: 'john_doe',
  email: 'john@example.com',
  country: 'US'
}

// Works with checkbox groups
renderer.userData = {
  interests: ['technology', 'sports', 'music']
}

// Works with radio buttons
renderer.userData = {
  gender: 'male'
}
```

### Handling Different Field Types

#### Single Input Fields

```javascript
// Text, email, number, etc.
renderer.userData = { firstName: 'John' }
```

#### Checkbox Groups

Checkbox groups automatically convert to/from arrays:

```javascript
// Setting multiple checked values
renderer.userData = { hobbies: ['reading', 'gaming', 'coding'] }

// Getting checked values
const data = renderer.userData
// { hobbies: ['reading', 'gaming'] } if multiple checked
// { hobbies: 'reading' } if only one checked
```

#### Radio Buttons

```javascript
// Setting selected radio button
renderer.userData = { size: 'medium' }

// Getting selected value
const data = renderer.userData
// { size: 'medium' }
```

## Conditional Logic

The renderer supports conditional field display and behavior based on user input.

### How Conditions Work

Conditions are evaluated in real-time as users interact with the form. When a condition is met, specific actions are executed (show/hide fields, enable/disable inputs, etc.).

### Condition Structure

Conditions are defined in the form data and automatically applied by the renderer:

```javascript
const formWithConditions = {
  // ... form structure
  fields: {
    'field-1': {
      // ... field config
      conditions: [
        {
          if: {
            source: '@field.source-field-id',
            sourceProperty: 'value',
            comparison: 'equals',
            target: 'specific-value'
          },
          then: [
            {
              target: '@field.target-field-id',
              targetProperty: 'visible',
              assignment: 'set',
              value: true
            }
          ]
        }
      ]
    }
  }
}
```

### Supported Comparisons

- `equals`: Values are exactly equal
- `notEquals`: Values are not equal
- `contains`: Source value contains target value
- Additional comparisons available in `comparisonMap`

### Example: Show Field Based on Selection

```javascript
// Show "Other" text field when user selects "Other" in dropdown
{
  if: {
    source: '@field.country',
    sourceProperty: 'value',
    comparison: 'equals',
    target: 'other'
  },
  then: [
    {
      target: '@field.country-other',
      targetProperty: 'visible',
      assignment: 'set',
      value: true
    }
  ]
}
```

## Examples

### Example 1: Basic Form Rendering

```javascript
import FormeoRenderer from './renderer/index.js'

const formData = {
  id: 'my-form',
  stages: { /* ... */ },
  rows: { /* ... */ },
  columns: { /* ... */ },
  fields: { /* ... */ }
}

const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: formData
})

renderer.render()
```

### Example 2: Form with Submit Handler

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

// Add submit handler
const form = document.querySelector('.formeo-render')
form.addEventListener('submit', (e) => {
  e.preventDefault()

  const userData = renderer.userData
  console.log('User submitted:', userData)

  // Or get with labels
  const userFormData = renderer.userFormData
  console.log('Structured data:', userFormData)

  // Submit to API
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
})
```

### Example 3: Pre-filling Form Data

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

// Load saved data (e.g., from localStorage or API)
const savedData = {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: ['newsletter', 'updates']
}

// Pre-fill the form
renderer.userData = savedData
```

### Example 4: Dynamic Form Updates

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: initialFormData
})

renderer.render()

// Later, switch to a different form
document.getElementById('load-different-form').addEventListener('click', () => {
  renderer.render(differentFormData)
})
```

### Example 5: Form Validation and Processing

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

const form = document.querySelector('.formeo-render')
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Get structured data with labels
  const formData = renderer.userFormData

  // Validate required fields
  const errors = []
  formData.forEach(field => {
    if (field.label.includes('*') && !field.value) {
      errors.push(`${field.label} is required`)
    }
  })

  if (errors.length > 0) {
    alert('Please fix the following errors:\n' + errors.join('\n'))
    return
  }

  // Process submission
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(renderer.userData)
    })

    if (response.ok) {
      alert('Form submitted successfully!')
      form.reset()
    }
  } catch (error) {
    console.error('Submission error:', error)
    alert('Failed to submit form')
  }
})
```

## Advanced Topics

### Custom Elements

You can provide custom form elements through the `elements` option:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: container,
  formData: myFormData,
  elements: {
    'custom-field': {
      // Custom element configuration
      action: {
        // Custom event handlers
      },
      dependencies: {
        // Required scripts/styles
      }
    }
  }
})
```

### Input Groups

The renderer supports dynamic input groups that allow users to add/remove field sets:

```javascript
// In form data, set inputGroup: true in row config
{
  config: {
    inputGroup: true,
    legend: 'Phone Numbers'
  }
}

// Users can click "Add +" to duplicate the field group
// Each cloned group gets a unique ID and a remove button
```

### Accessing Components

The renderer caches all rendered components internally:

```javascript
// Components are stored in this.components
// Keyed by their base ID (without the render prefix)

// You can access component data if needed
const component = renderer.components[componentId]
```

## Best Practices

1. **Always render before accessing userData**: Ensure `render()` is called before trying to get user data.

2. **Use userFormData for display**: When showing submission summaries or confirmations, use `userFormData` to include labels.

3. **Use userData for API submissions**: For backend processing, `userData` provides a clean object structure.

4. **Handle arrays properly**: Remember that checkbox groups return arrays when multiple values are selected.

5. **Clean form data**: The renderer automatically cleans form data, so don't worry about data format inconsistencies.

6. **Re-render for new forms**: Call `render()` with new form data to switch between different forms.

## API Reference Summary

| Property/Method | Type | Description |
|----------------|------|-------------|
| `formData` (get) | Object | Get current form structure |
| `formData` (set) | - | Set form structure |
| `userData` (get) | Object | Get user-submitted data as object |
| `userData` (set) | - | Set/pre-fill form field values |
| `userFormData` (get) | Array | Get user data with labels and metadata |
| `html` (get) | String | Get rendered form as HTML string |
| `render(formData)` | - | Render form to container |
| `getRenderedForm(formData)` | HTMLElement | Get rendered form element |

## Troubleshooting

**Form not rendering:**
- Ensure `renderContainer` is a valid DOM element
- Check that `formData` has the required structure (stages, rows, columns, fields)

**userData returns empty object:**
- Make sure the form has been rendered
- Check that form fields have proper `name` attributes

**Checkbox values not appearing as arrays:**
- If only one checkbox is selected, it returns a single value
- Multiple selections automatically convert to arrays

**Conditions not working:**
- Verify condition syntax in form data
- Check that source and target fields exist
- Ensure fields have proper IDs in the format expected by conditions
