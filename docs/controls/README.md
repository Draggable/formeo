# Controls

![formeo-controls](https://user-images.githubusercontent.com/1457540/56075239-26cbf100-5d74-11e9-8cd0-d4400705365f.png)

A Control refers to inputs and elements that can be dragged to the stage when editing a form. In their most basic form, they can be a javascript literal object that defines basic information about the element eg.

```javascript
const inputElement = {
  tag: 'input',
  attrs: {
    required: false, // will render a checkbox in the editor to toggle required attribute
    type: 'text',
    className: '' // accepts string or array of class names
  },
  config: {
    label: 'Input', // label that appears in the control side bar
    editorLabel: 'My Custom Input' // label that appears in the editor
  },
  meta: {
    group: 'common', // group id
    icon: 'text-input-icon', // needs to be an svg or font icon id
    id: 'text-input' // unique that can be used to reference the control
  },
}
```

## [Control Options](https://github.com/Draggable/formeo/tree/master/docs/options/controls)

## Control Groups

Formeo comes with a 3 groups of basic controls. These groups can be disabled, extended, [ordered](https://github.com/Draggable/formeo/tree/master/docs/options/controls#groupOrder), and more. The default control groups are `form`, `html`, and `layout`.

### Form Controls

Form controls are considered controls that users can interact with and at the time of writing Formeo ships with the following `form` controls:

- button
- checkbox-group
- input
  - date
  - file
  - hidden
  - number
  - text
- radio-group
- select
- textarea

### HTML Controls

HTML Controls are used to render html elements like `<p/>`, `<h1/>` and `<hr/>`. To make a Control's rendered html editable in the editor, set the `editableContent` to `true` when defining your control's `config`. Example:

```javascript
const paragraph = {
  tag: 'p',
  config: {
    label: 'Paragraph',
    editableContent: true
  },
  content:
    'This content can be edited in the editor'
}
```
