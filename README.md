Formeo v0.2.6
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
| Option  | Type | Value(s) | Default |
| ------------- | ------------- |------------- |------------- |
| [debug](#) | {Bool} | `true` \| `false` | `false` |
| [svgSprite](#) | {String} | svg sprite location | 'assets/img/formeo-sprite.svg' |
| [style](#) | {String} | formeo stylesheet location | `null` |

### Events
| Option  | Type | Value(s) | Default |
| ------------- | ------------- |------------- |------------- |
| [onSave](#) | {Function} | `Event` | () => {} |
| [onUpdate](#) | {Function} | `Event` | () => {} |

### i18N
| Option  | Type | Value(s) | Default |
| ------------- | ------------- |------------- |------------- |
| [langsDir](#) | {String} | location of language files | 'assets/lang/' |
| [langs](#) | {Array} | array of available locales | ['en-US'] |


## [Demo](https://Draggable.github.io/formeo) ##
[![formeo](https://cloud.githubusercontent.com/assets/1457540/15781593/c054681e-299e-11e6-823c-d5ec4b2c03dd.png)](https://draggable.github.io/formeo/)

## [Changelog](https://github.com/Draggable/formeo/blob/master/CHANGELOG.md) ##
