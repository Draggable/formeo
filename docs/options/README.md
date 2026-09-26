# Options

| Option                              | Type         | Description                                                                     | Example                     | Default                           |
| ----------------------------------- | ------------ | ------------------------------------------------------------------------------- | --------------------------- | --------------------------------- |
| ~~[allowEdit](#allowedit)~~         | Boolean      | _deprecated_ when set to false, formData can only be rendered.                  | `true` \| `false`           | `true`                            |
| [debug](#debug)                     | Boolean      | debug mode                                                                      | `true` \| `false`           | `false`                           |
| [editorContainer](#editorcontainer) | String\|Element\|jQuery | Where the editor is added: a selector, an element, or a jQuery object (its first element). Required. | `'#formeo-editor'`  | `null`                            |
| [svgSprite](#svgsprite)             | String       | loads an svg sprite                                                             | `'path/to/svsprite'`        | `null` (bundled sprite)           |
| style                               | String       | loads a stylesheet to the page                                                  | `'path/to/stylesheet'`      | `https://cdn.jsdelivr.net/npm/formeo@<version>/dist/formeo.min.css`, `null` to skip |
| sessionStorage                      | Boolean      | save form template state in sessionStorage                                      | `true` \| `false`           | `false`                           |
| iconFont                            | String       | use existing icon font as fallback                                              | `'glyphicons'`              | `null`                            |
| [events](events/)                   | Object       | define callbacks for specific events                                            | (see [events](events/))     | `null`                            |
| [actions](actions/)                 | Object       | define handlers for specific actions                                            | (see [actions](actions/))   | `null`                            |
| [config](config/)                   | Object       | disable, add, reorder and modify rows, columns, fields and their action buttons | (see [config](config/))     | `{}`                              |
| [controls](controls/)               | Object       | disable, add, or reorder control elements and groups                            | (see [controls](controls/)) | `{}`                              |

## allowEdit
Set whether you want to allow editing on the current instance of Formeo. *deprecated*

## debug
Sets the editor in debug mode for verbose logging

## editorContainer
Attach the Formeo editor to an existing DOM element. Accepts a selector, an element, or a jQuery object (its first element is used):

```js
new FormeoEditor({ editorContainer: this.$element }) // jQuery object
new FormeoEditor({ editorContainer: $('#builder') }) // jQuery selection
```

## svgSprite
The icons are bundled, so no request is made by default. Set a URL to load your own sprite; if that request fails, formeo falls back to the sprite on jsDelivr.

