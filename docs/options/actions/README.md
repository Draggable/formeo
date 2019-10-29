# Actions

| Option             | Type     | Description                                    |
| ------------------ | -------- | ---------------------------------------------- |
| [add.attr](#)      | Function | Called when adding an attribute to an element  |
| [add.option](#)    | Function | Called when adding an option to a field        |
| [add.condition](#) | Function | Called when adding an condition to a field     |
| [click.button](#)  | Function | Called when clicking a [form action](#) button |
| [save](#)          | Function | Called when saving                             |

With Actions you can modify or completely replace some editor functions. For example the default action for adding an attribute will use `window.prompt` to get info from the user, if you want your application to use a custom modal or extend attribute validation with custom rules, you could do so by defining an action handler for `add.attr`.

## Full Example

```javascript
function addAttribute(evt) {
  const addAttributeForm = document.getElementById('add-attribute-form')
  const attrName = addAttributeForm.querySelector('.attr-name')
  const attrVal = addAttributeForm.querySelector('.attr-value')

  const dialog = $(addAttributeForm).dialog({
    autoOpen: true,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      'Add Attribute': () => evt.addAction(attrName, attrVal),
      Cancel: () => dialog.dialog('close'),
    },
    close: addAttributeForm.reset,
  })
}
```

```javascript
// formeo options
{
  actions: {
    add: {
      attr: addAttribute,
    },
  },
}
```
