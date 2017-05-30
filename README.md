Formeo v0.7.17
===========

A zero dependency JavaScript module for drag and drop form creation.

## Features
- Extensible builder with plethora of options
- Simple drag & drop interface
- Column layouts
- Custom fields
- Preview mode
- i18n support

## Usage
To start building forms with this module include formeo.min.js and formeo.min.css in your project and call:
```
new Formeo({ container: '.build-form' });
```

## Options
### General
| Option  | Type | Value(s) | Default | Description |
| ------------- | ------------- | ------------- | ------------- |  ------------- |
| [allowEdit](#) | {Bool} | `true` \| `false` | `false` | When set to false, formData can only be rendered. |
| [debug](#) | {Bool} | `true` \| `false` | `false` | debug mode |
| [container](#) | {String\|Node} | '.editor-wrap' | '.formeo-wrap' | Define where this instance of Formeo will be added. |
| [svgSprite](#) | {String} | 'path/to/svsprite' | `null` | loads an svg sprite, leave blank if your sprite is already included in page.
| [style](#) | {String} | 'path/to/stylesheet' | `null` | loads a stylesheet to the page |
| [sessionStorage](#) | {Bool} | `true` \| `false` | `null` | loads a stylesheet to the page |
| [iconFontFallback](#) | {String} | 'glyphicons' | `null` | uses an existing font-icon when svg icon is not available |
| [config](#) | {Object} | {...} | {...} | disable, add, reorder and modify row, column and field action buttons |

### Events

| Option  | Type | Value(s) | Default | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| [onAdd](#) | {Function} | `Event` | evt => {} | Fires when element is added to another element, returns evt details |
| [onSave](#) | {Function} | `Event` | evt => {} | Fires on full form save, returns full formData |
| [onUpdate](#) | {Function} | `Event` | evt => {} | Fires on individual updates, returns updated data |
| [confirmClearAll](#) | {Function} | `Event` | evt => {} | Fires when form clear button is clicked, returns evt details and `clearAllAction()` |

### Actions
unlike events, action usually take place before an event has fired allowing you to modify how an action will complete. For example the default callback for adding an attribute is:
```
evt => {
  let attr = window.prompt(evt.message.attr);
  let val;
  if (attr) {
    val = String(window.prompt(evt.message.value, ''));
    evt.addAction(attr, val);
  }
}
``` 
By replacing the default callback you could use your own modal or prompt dialog and do some additional validation before calling `evt.addAction()`.

| Option  | Type | Value(s) | Default | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| [add.attr](#) | {Function} | `Event` | evt => {} | Fires when adding an attribute to an element, returns evt details and `addAction()` |
| [add.option](#) | {Function} | `Event` | evt => {} | Fires when adding nd option to a field, returns evt details and `addAction()` |
| [click.button](#) | {Function} | `Event` | evt => {} | Called when clicking a form action button |
| [save](#) | {Function} | `Event` | evt => {} | Fires on individual updates, returns updated data |

### i18N
| Option  | Type | Value(s) | Default |
| ------------- | ------------- |------------- | ------------- |
| [extension](#) | {String} | '' | '.lang' |
| [locale](#) | {String} | 'de-DE' | 'en-US' |
| [location](#) | {String} | 'path/to/language/files' | 'assets/lang/' |
| [langs](#) | {Array} | array of available locales | ['en-US'] |
| [preloaded](#) | {Object} | key/value pairs of strings | {en-US: {...}} |


## [Demo](https://Draggable.github.io/formeo) ##
[![formeo](https://cloud.githubusercontent.com/assets/1457540/15781593/c054681e-299e-11e6-823c-d5ec4b2c03dd.png)](https://draggable.github.io/formeo/)

## [Changelog](https://github.com/Draggable/formeo/blob/master/CHANGELOG.md) ##
