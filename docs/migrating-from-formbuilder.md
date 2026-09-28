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
[below](#post-processing-and-why)), and writes `<name>.formeo.json` to an output directory. Save it next to (or one
level above) your `formBuilder2Formeo` checkout as `batch-convert.mjs`, adjusting the import path if your layout
differs:

```javascript
// batch-convert.mjs
//
// Usage:
//   npx tsx batch-convert.mjs <inputDir> <outputDir>
//
// Requires a checkout of Draggable/formBuilder2Formeo with its dependencies installed
// (`npm install lodash uuid@3` inside that checkout) — see docs/migrating-from-formbuilder.md.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
// Adjust this path to your formBuilder2Formeo checkout.
// tsx's CJS interop double-wraps this module's default export, so unwrap it defensively.
import convertDataModule from './formBuilder2Formeo/src/convert-data.js'
const convertData = convertDataModule.default || convertDataModule

// Maps each formBuilder field type to its Formeo equivalent: `attrsType` (Formeo's
// `attrs.type`, where the renderer needs one) and `controlId` (so the editor recognises
// each field's control, offers its option list in the Conditions panel, and applies its
// locked/disabled attributes).
const formeoControlByFormBuilderType = {
  hidden: { controlId: 'hidden', attrsType: 'hidden' },
  'radio-group': { controlId: 'radio', attrsType: 'radio' },
  'checkbox-group': { controlId: 'checkbox', attrsType: 'checkbox' },
  date: { controlId: 'date-input', attrsType: 'date' },
  number: { controlId: 'number', attrsType: 'number' },
  file: { controlId: 'upload', attrsType: 'file' },
  text: { controlId: 'text-input', attrsType: 'text' },
  select: { controlId: 'select' }, // tag is already 'select'; not gated by attrs.type
  textarea: { controlId: 'textarea' },
  button: { controlId: 'button' },
  header: { controlId: 'html.header' },
  paragraph: { controlId: 'paragraph' },
  // Any formBuilder type not listed here (a custom formBuilder field plugin, e.g.
  // "starRating") has no built-in Formeo control: it's left as-is, and needs either a
  // custom Formeo control (see controls/custom-controls.md) or manual cleanup.
}

function postProcess(formeoData) {
  for (const field of Object.values(formeoData.fields)) {
    const mapping = formeoControlByFormBuilderType[field.meta?.id]
    if (!mapping) continue
    if (mapping.attrsType) {
      field.attrs = { ...field.attrs, type: mapping.attrsType }
    }
    // so the editor recognises each field's control
    field.meta = { ...field.meta, id: mapping.controlId }
    field.config = { ...field.config, controlId: mapping.controlId }
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

`convertData`'s output is close to Formeo's shape but not quite ready to use, in the editor or the renderer:

- **Fields keep formBuilder's control id, not Formeo's.** formBuilder's field `type` (`hidden`, `radio-group`,
  `checkbox-group`, `date`, `number`, `file`, `text`, `select`, `textarea`, `button`, `header`, `paragraph`, …)
  lands verbatim in each converted field's `meta.id`, but that's formBuilder's own control naming, not Formeo's.
  Formeo's built-in controls (`src/lib/js/components/controls/form/*.js` and `.../html/*.js`) register under their
  own `meta.id`, and several parts of Formeo look a field's control up by that id:

  - The renderer and Formeo's controls key rendering off `attrs.type`, not `meta.id` — for example the renderer
    only treats a field as an option group when `attrs.type` is `'checkbox'` or `'radio'`. Left unset, a converted
    hidden field renders as a plain text input, and a converted radio or checkbox group renders as one bare input
    instead of a group.
  - The editor's `Field#applyControlAttrConfig` looks up the registered control by `config.controlId` (falling
    back to `meta.id`) to read that control's `disabledAttrs`/`lockedAttrs` — for the built-in radio and checkbox
    controls, `disabledAttrs: ['type']`. If the id doesn't match a registered control, that lookup finds nothing.
  - `Field#isCheckable`, which the Conditions panel's autocomplete uses to decide whether to offer a field's
    option list, checks `config.controlId` against exactly `'radio'` or `'checkbox'` — formBuilder's
    `'radio-group'`/`'checkbox-group'` don't match, so a converted group's options silently don't show up as
    condition targets.

  The script above fixes both at once — `attrs.type` for the fields the renderer or a control gates on it, and
  `meta.id`/`config.controlId` for Formeo's own control id, read from each control's source file:

  | formBuilder `meta.id` | Formeo `attrs.type` | Formeo control id (`meta.id`/`config.controlId`) |
  | ---------------------- | -------------------- | -------------------------------------------------- |
  | `hidden`                | `hidden`              | `hidden`                                             |
  | `radio-group`           | `radio`               | `radio`                                              |
  | `checkbox-group`        | `checkbox`            | `checkbox`                                           |
  | `date`                  | `date`                | `date-input`                                         |
  | `number`                | `number`              | `number`                                             |
  | `file`                  | `file`                | `upload`                                             |
  | `text`                  | `text`                | `text-input`                                         |
  | `select`                | _(unchanged)_          | `select`                                             |
  | `textarea`              | _(unchanged)_          | `textarea`                                           |
  | `button`                | _(unchanged)_          | `button`                                             |
  | `header`                | _(unchanged)_          | `html.header`                                        |
  | `paragraph`             | _(unchanged)_          | `paragraph`                                          |

  A formBuilder type outside this table — a custom formBuilder field plugin, such as the sample data's
  `starRating` field — has no built-in Formeo control, so it's left as-is; give it a
  [custom control](controls/custom-controls.md) or handle it by hand.

- **Columns carry no `config` at all.** Formeo 5.9.3 fixed the renderer to default missing row/column config (see
  the CHANGELOG entry closing [#212](https://github.com/Draggable/formeo/issues/212)), so this step is only needed
  for older Formeo versions — but setting `config: {}` explicitly is harmless either way, so the script always does
  it.

With this post-processing applied, a converted, post-processed form behaves like a native Formeo one in both
places that matter:

- **Rendered with `FormeoRenderer`:** the radio group renders three `<input type="radio">` elements, the checkbox
  group renders one `<input type="checkbox">`, and the hidden field renders as `<input type="hidden">`.
- **Loaded in the editor:** the converted radio and checkbox group fields show up in the Conditions panel's option
  list, and their `type` attribute stays disabled in the edit panel, the same as a radio/checkbox group built in
  the editor itself. Skipping the `controlId`/`meta.id` remap (leaving formBuilder's own `'radio-group'` id in
  place) is what causes those fields to silently disappear from Conditions' option list.

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
