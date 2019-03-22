# i18N
Configure Formeo to use any language.

| Option         | Type   | Description                    | Example                                | Default          |
| -------------- | ------ | ------------------------------ | -------------------------------------- | ---------------- |
| [extension](#) | String | language file extension        | `'.txt'`                               | `'.lang'`        |
| [locale](#)    | String | starting locale                | `'de-DE'`                              | `'en-US'`        |
| [location](#)  | String | fetchable path                 | `'path/to/language/files'`             | `'assets/lang/'` |
| [langs](#)     | Array  | array of available locales     | `['en-US', 'pt-PT']`                   | `['en-US']`      |
| [override](#)  | Object | entire dictionary or overrides | `{'en-US': {textInput: 'Short Text'}}` | `{en-US: {...}}` |

Full Example

```javascript
// formeo options
{
  i18n: {
    extension: '.lang',
    location: 'assets/lang/',
    langs: ['hu-HU', 'en-US'],
    locale: 'hu-HU',
    override: {
      'hu-HU': {
        success: 'Siker'
      }
    }
  }
}
```
