# Events

Events are emitted by interacting with the form. While [actions](../actions/) let you override certain functionality, events simply allow you to react to an event (typically after an action completes).
Below are a list of built-in events.

| Option               | Type     | Description                       |
| -------------------- | -------- | --------------------------------- |
| [formeoLoaded](#)    | Function | Fires when Formeo loads           |
| [onAdd](#)           | Function | Fires when element is added       |
| [onSave](#)          | Function | Fires when form is saved          |
| [onUpdate](#)        | Function | Fires when form is updated        |
| [onRender](#)        | Function | Fires when an element is rendered |
| [confirmClearAll](#) | Function | Fires when form is cleared        |
