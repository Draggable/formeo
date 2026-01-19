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

## Changing Language at Runtime

After the editor is initialized, you can change the language using the `setLang` method:

```javascript
const editor = new FormeoEditor(options, formData)
await editor.whenReady()

// Change to German
editor.i18n.setLang('de-DE')
```

### Data Preservation

When changing languages, the editor only refreshes the UI (labels, control names, etc.) without reloading form data. This ensures that:

- All form fields, rows, and stages remain intact
- User changes are preserved
- No data loss occurs during language switching

The language preference is stored in sessionStorage and will be restored on the next page load.
