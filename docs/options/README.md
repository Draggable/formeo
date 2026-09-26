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
| [stickyControls](#stickycontrols)   | Boolean      | keep the controls panel in view while scrolling                                | `true` \| `false`           | `false`                           |
| [controlOnLeft](#controlonleft)     | Boolean      | show controls left of the stage                                                | `true` \| `false`           | `false`                           |
| [onLoad](#onload)                   | Function     | called with the editor once it is ready                                        | `editor => {}`              | `() => {}` (no-op)                |
| [i18n](i18n/)                       | Object       | `{ location, locale, … }` for `@draggable/i18n`                                | (see [i18n](i18n/))         | `{ location: 'https://draggable.github.io/formeo/assets/lang/' }` |
| [events](events/)                   | Object       | define callbacks for specific events                                            | (see [events](events/))     | `{}`                              |
| [actions](actions/)                 | Object       | define handlers for specific actions                                            | (see [actions](actions/))   | `{}`                              |
| [config](config/)                   | Object       | disable, add, reorder and modify rows, columns, fields and their action buttons | (see [config](config/))     | `{}`                              |
| [controls](controls/)               | Object       | disable, add, or reorder control elements and groups                            | (see [controls](controls/)) | `{}`                              |

Panel order is set per component type with `config.fields.all.panels.order` (see [config](config/)).

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

## stickyControls
Keeps the controls panel in view while the page scrolls.

## controlOnLeft
Shows the controls panel to the left of the stage instead of the right.

## onLoad
Called with the editor instance once it has finished initializing.

```js
new FormeoEditor({ onLoad: editor => console.log('editor ready', editor) })
```

