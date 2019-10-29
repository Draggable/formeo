# Options

| Option                       | Type         | Description                                                                     | Example                     | Default                           |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------- | --------------------------- | --------------------------------- |
| ~~[allowEdit](#allowEdit)~~  | Boolean      | _deprecated_ when set to false, formData can only be rendered.                  | `true` \| `false`           | `true`                            |
| [debug](#debug)              | Boolean      | debug mode                                                                      | `true` \| `false`           | `false`                           |
| [editorContainer](#)         | String\|Node | define where this instance of Formeo will be added.                             | `'.editor-wrap'`            | `'.formeo-wrap'`                  |
| [svgSprite](#)               | String       | loads an svg sprite                                                             | `'path/to/svsprite'`        | `'https://.../formeo-sprite.svg'` |
| style                        | String       | loads a stylesheet to the page                                                  | `'path/to/stylesheet'`      | `null`                            |
| sessionStorage               | Boolean      | save form template state in sessionStorage                                      | `true` \| `false`           | `null`                            |
| iconFontFallback             | String       | use existing icon font as fallback                                              | `'glyphicons'`              | `null`                            |
| [events](events/)            | Object       | define callbacks for specific events                                            | (see [events](events/))     | `null`                            |
| [actions](actions/)          | Object       | define handlers for specific actions                                            | (see [actions](actions/))   | `null`                            |
| [config](config/)            | Object       | disable, add, reorder and modify rows, columns, fields and their action buttons | (see [config](config/))     | `{}`                              |
| [controls](controls/)        | Object       | disable, add, or reorder control elements and groups                            | (see [controls](controls/)) | `{}`                              |

## allowEdit
Set whether you want to allow editing on the current instance of Formeo. *deprecated*

## debug
Sets the editor in debug mode for verbose logging

## editorContainer
Attach the Formeo editor to an existing DOM element

## svgSprite
Formeo ships with its own svg sprite for icons. With this option you can load a different one or use an existing sprite on the page. To avoid loading the default option of `'https://draggable.github.io/formeo/assets/img/formeo-sprite.svg'`, set to `null`. Note* be sure there is an svg sprite with the id "formeo-sprite" in your document at the time Formeo is instantiated.

