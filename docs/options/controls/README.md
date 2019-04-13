# Controls Options

Control options can be used to disable, extend and modify the Formeo's control panel.

| Option                    | Type   | Description                             | Example              | Default                        |
| ------------------------- | ------ | --------------------------------------- | -------------------- | ------------------------------ |
| [sortable](#sortable)     | String | allow controls to be reordered by users | `true`               | `false`                        |
| [groupOrder](#groupOrder) | Array  | allow controls to be reordered by users | `['html', 'layout']` | `['common', 'html', 'layout']` |

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
