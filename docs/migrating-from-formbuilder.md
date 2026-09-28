# Migrating from formBuilder

[Formeo is not formBuilder](controls/custom-controls.md#formeo-is-not-formbuilder) — separate projects with different
form-data shapes. If you have existing [formBuilder](https://formbuilder.online/) form exports and want to move them
into Formeo, [`Draggable/formBuilder2Formeo`](https://github.com/Draggable/formBuilder2Formeo) converts formBuilder's
JSON (or XML) into a Formeo `formData` object, and this page walks through running it in bulk over a directory of
exports.

## The converter

`formBuilder2Formeo` isn't published to npm, so clone it and install its dependencies:

```sh
gh repo clone Draggable/formBuilder2Formeo
cd formBuilder2Formeo
npm install lodash uuid@3
```

Its entry point is `src/convert-data.js`, which exports a single function:

```javascript
convertData(jsonOrXmlString) // -> a Formeo formData object
```

A few things to know before running it:

- It imports `uuid` v3's default export and `lodash/set` / `lodash/startCase` without file extensions, which plain
  Node ESM (`node --experimental-*`) can't resolve. A runner such as [`tsx`](https://github.com/privatenumber/tsx)
  can, and is what the batch script below uses (via `npx tsx`).
- Under `tsx`, the module's CJS/ESM interop ends up double-wrapping its default export (`{ default: { default:
  convertData } }` instead of `{ default: convertData }`), so unwrap it defensively — see the script below.
- If the input string starts with `<form-template>`, `convertData` parses it as XML through a `DOMParser`-based
  `parseXML`, which is browser-only and throws under plain Node. See [XML input](#xml-input) for two ways around
  that.

## The batch script

This script reads every `*.json` file from an input directory, converts each one, post-processes the result (see
[below](#post-processing-and-why)), and writes `<name>.formeo.json` to an output directory. It's the exact script
used to produce the sample output referenced further down — save it next to (or one level above) your
`formBuilder2Formeo` checkout as `batch-convert.mjs`, adjusting the import path if your layout differs:

```javascript
// batch-convert.mjs
//
// Usage:
//   npx tsx batch-convert.mjs <inputDir> <outputDir>
//
// Requires a checkout of Draggable/formBuilder2Formeo with its dependencies installed
// (`npm install lodash uuid@3` inside that checkout).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
// Adjust this path to your formBuilder2Formeo checkout.
// tsx's CJS interop double-wraps this module's default export, so unwrap it defensively.
import convertDataModule from './formBuilder2Formeo/src/convert-data.js'
const convertData = convertDataModule.default || convertDataModule

// formBuilder's field `type` (landed in each converted field's `meta.id`) to the
// `attrs.type` Formeo's own controls use (src/lib/js/components/controls/form/*.js).
// Without this, hidden fields render as text inputs and radio/checkbox groups render
// as a single bare input instead of a group (the renderer checks `attrs.type`, not `meta.id`).
const attrsTypeByMetaId = {
  hidden: 'hidden',
  'radio-group': 'radio',
  'checkbox-group': 'checkbox',
  date: 'date',
  number: 'number',
  file: 'file',
  text: 'text',
}

function postProcess(formeoData) {
  for (const field of Object.values(formeoData.fields)) {
    const attrsType = attrsTypeByMetaId[field.meta?.id]
    if (attrsType) {
      field.attrs = { ...field.attrs, type: attrsType }
    }
  }
  // Columns from formBuilder2Formeo have no `config` at all. Formeo >=5.9.3 (#212) defaults
  // that on render, but set it explicitly for older versions too.
  for (const column of Object.values(formeoData.columns)) {
    column.config = column.config || {}
  }
  return formeoData
}

const [inputDir, outputDir] = process.argv.slice(2)

for (const file of readdirSync(inputDir)) {
  if (!file.endsWith('.json')) continue
  const text = readFileSync(join(inputDir, file), 'utf8')
  const converted = postProcess(convertData(text))
  const outFile = join(outputDir, `${basename(file, '.json')}.formeo.json`)
  writeFileSync(outFile, JSON.stringify(converted, null, 2))
  console.log(`${file} -> ${outFile}`)
}
```

Run it against a directory of formBuilder JSON exports:

```sh
npx tsx batch-convert.mjs ./input ./output
```

which, run against two sample exports, produced:

```
form-1.json -> output/form-1.formeo.json
form-2.json -> output/form-2.formeo.json
```

Each `output/*.formeo.json` file is a Formeo `formData` object — hand it to `new FormeoEditor(options, formData)` or
`new FormeoRenderer(options, formData)` as-is.

## Post-processing and why

`convertData`'s output is close to Formeo's shape but not quite ready to render:

- **Fields carry no `attrs.type`.** formBuilder's field `type` lands in each converted field's `meta.id` (`hidden`,
  `radio-group`, `checkbox-group`, `date`, `number`, `file`, `text`, …), but Formeo's renderer and its own controls
  (`src/lib/js/components/controls/form/*.js`) key off `attrs.type`, not `meta.id` — for example the renderer only
  treats a field as an option group when `attrs.type` is `'checkbox'` or `'radio'`. Left unset, a converted hidden
  field renders as a plain text input, and a converted radio or checkbox group renders as one bare input instead of
  a group. The mapping the script above applies:

  | formBuilder `meta.id` | Formeo `attrs.type` |
  | ---------------------- | -------------------- |
  | `hidden`                | `hidden`              |
  | `radio-group`           | `radio`               |
  | `checkbox-group`        | `checkbox`            |
  | `date`                  | `date`                |
  | `number`                | `number`              |
  | `file`                  | `file`                |
  | `text`                  | `text`                |

  (`select` needs no change — its `tag` is already `select`, which Formeo's `SelectControl` also uses, and it isn't
  gated by `attrs.type`.)

- **Columns carry no `config` at all.** Formeo 5.9.3 fixed the renderer to default missing row/column config (see
  the CHANGELOG entry closing [#212](https://github.com/Draggable/formeo/issues/212)), so this step is only needed
  for older Formeo versions — but setting `config: {}` explicitly is harmless either way, so the script always does
  it.

This was verified by rendering one converted, post-processed output with `FormeoRenderer` in a scratch unit test:
the radio group rendered three `<input type="radio">` elements, the checkbox group rendered one
`<input type="checkbox">`, and the hidden field rendered as `<input type="hidden">`.

## XML input

formBuilder can also export XML (`<form-template>...</form-template>`), which `convertData` parses through a
`DOMParser`-based `parseXML` — browser-only, so it throws under plain Node. Two ways to still batch-convert XML
exports:

1. **Convert to JSON in formBuilder first.** formBuilder's own "Get Data" / export options can produce JSON
   directly; feed that JSON straight into the batch script above.
2. **Provide a `DOMParser`.** Install a DOM implementation such as [`jsdom`](https://github.com/jsdom/jsdom) and set
   a global `window.DOMParser` (for example `global.window = new JSDOM('').window`) before calling `convertData`
   with the XML string.

## Check your forms

Batch conversion (even with the post-processing above) is a starting point, not a guarantee — field types outside
the mapping table, custom formBuilder plugins, and layout details won't necessarily come through cleanly. After
converting, open each form in the Formeo editor and save it: that's the fastest way to confirm a form actually
looks and behaves the way you expect, and re-saving from the editor also canonicalizes the data to whatever shape
your installed Formeo version currently expects.
