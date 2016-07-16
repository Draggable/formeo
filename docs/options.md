# Options

Formeo is one of the most configurable form building modules of them all and this done mostly through the module's options.

<pre><code class="js">
  const defaults = {
    dataType: 'json',
    debug: false,
    className: 'formeo',
    container: '.formeo',
    prefix: 'formeo-',
    svgSprite: 'assets/img/formeo-sprite.svg',
    events: {},
    actions: {
      debug: false
    },
    i18n: {
      langsDir: 'assets/lang/',
      langs: [
        'en-US'
      ]
    }
  };
</code></pre>

| Option  | Type | Value(s) | Default |
| ------------- | ------------- |------------- |------------- |
| debug  | {Bool} | (true,false)  | `false` |
| svgSprite  | {String} | 'path/to/icon/file.svg' | none |
| events  | {Object} | Pass callbacks for specific events like `onFieldAdd`, `onColumnRemove` etc. | `{}` |
| actions  | {Object} | Pass handlers for specific actions such as `add.attr`, `click.btn` etc. | `{}` |
