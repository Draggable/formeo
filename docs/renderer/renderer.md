# FormeoRenderer Class

The `FormeoRenderer` class is responsible for rendering Formeo form data into interactive HTML forms. It converts the structured form data into DOM elements, handles user interactions, applies conditional logic, and provides methods to retrieve user-submitted data.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Constructor](#constructor)
- [Properties](#properties)
- [Methods](#methods)
- [Events](#events)
- [Working with User Data](#working-with-user-data)
- [Multi-page forms](#multi-page-forms)
- [Conditional Logic](#conditional-logic)
- [Examples](#examples)

## Installation

Formeo ships ESM, CommonJS and UMD builds. Pick the one that matches how you load it.

### ESM

```javascript
import { FormeoRenderer } from 'formeo'
import 'formeo/dist/formeo.min.css'
```

### CommonJS

```javascript
const { FormeoRenderer } = require('formeo')
```

This works in Node from the release that ships the `.cjs` build (5.9.1+). Formeo renders in a browser, so in Node this is for bundlers and SSR imports, not for calling `render()` server-side.

### UMD (CDN, no build step)

```html
<script
  src="https://unpkg.com/formeo@5.13.1/dist/formeo.umd.js"
  integrity="sha384-REPLACE_WITH_THE_HASH_FOR_THE_PINNED_VERSION"
  crossorigin="anonymous"
></script>
```

Pin a version instead of `@latest` so the hash stays valid, and add the matching `integrity` hash (shown on unpkg's file listing for that version) with `crossorigin="anonymous"`. This exposes `window.FormeoRenderer` (and `window.FormeoEditor`) globally.

## Basic Usage

```javascript
// Initialize the renderer with form data
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

// Render the form
renderer.render()

// Get user-submitted data
const userData = renderer.userData
console.log(userData)
```

## Constructor

### `new FormeoRenderer(opts, formDataArg)`

Creates a new FormeoRenderer instance.

**Parameters:**

- `opts` (Object): Configuration options
  - `renderContainer` (HTMLElement): The DOM element where the form will be rendered
  - `elements` (Object): Custom form elements/controls configuration
  - `formData` (Object): The form structure data to render
  - `config` (Object): Additional rendering configuration
    - `attrs` (Object): Attributes for the rendered `<form>`, e.g. `method`, `action`, `enctype`, `novalidate`
  - `pagination` (String|Object, optional): Show the form's stages one at a time as tabs or a wizard. See [Multi-page forms](#multi-page-forms)
  - `events` (Object): `onRender`, `onChange`, `onSubmit`, `onPageChange` callbacks (see [Events](#events))
- `formDataArg` (Object, optional): Alternative way to pass form data

**Example:**

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('my-form'),
  formData: {
    id: 'contact-form',
    stages: { /* stage data */ },
    rows: { /* row data */ },
    columns: { /* column data */ },
    fields: { /* field data */ }
  }
})
```

## Properties

### Getters

#### `formData`

Returns the current form structure data.

```javascript
const formStructure = renderer.formData
```

#### `userData`

Gets the user-submitted data from the rendered form as a plain object. Automatically handles multiple values for the same field (like checkbox groups) by converting them into arrays.

**Returns:** `Object.<string, string|string[]>`

**Example:**

```javascript
// Single values
{ username: 'john', email: 'john@example.com' }

// Multiple values for checkbox group
{ username: 'john', hobbies: ['reading', 'gaming', 'coding'] }
```

#### `userFormData`

Gets the user form data as an array of field objects, combining user input values with component metadata.

**Returns:** `Array<{key: string, value: any, label: string}>`

Each object contains:
- `key`: The field identifier
- `value`: The user's input value for the field
- `label`: The field's label from component configuration

**Example:**

```javascript
const formData = renderer.userFormData
// [
//   { key: 'username', value: 'john', label: 'Username' },
//   { key: 'email', value: 'john@example.com', label: 'Email Address' },
//   { key: 'hobbies', value: ['reading', 'gaming'], label: 'Hobbies' }
// ]
```

#### `html`

Returns the rendered form as an HTML string. With [pagination](#multi-page-forms), the string holds every page as it
is in the DOM at that moment: the navigation, and the pages not on show marked `hidden`. A static string has no page
switching of its own.

```javascript
const htmlString = renderer.html
```

#### `page`

The index (0-based) of the currently shown page, when the `pagination` option is set. `0` when there is no pagination (see [Multi-page forms](#multi-page-forms)).

```javascript
renderer.page // 0
```

#### `pageCount`

The number of pages. `1` when there is no pagination or the form has a single stage.

```javascript
renderer.pageCount // 1
```

### Setters

#### `formData`

Sets the form structure data and cleans it.

```javascript
renderer.formData = newFormData
```

#### `page`

Shows a page without validating the one being left. Out-of-range indexes are clamped to the available pages. A
[skipped page](#skipping-pages) gives way to the next page in play. A no-op without pagination.

```javascript
renderer.page = 1
```

#### `userData`

Sets user data programmatically into the form fields. Useful for pre-filling forms or restoring saved data.

**Parameters:** `Object` - Key-value pairs where keys are field names and values are the data to set

**Example:**

```javascript
renderer.userData = {
  username: 'john_doe',
  email: 'john@example.com',
  hobbies: ['reading', 'gaming'] // For checkbox groups
}
```

> Keys with no matching field are skipped, and the renderer logs one console warning that lists them. The setter never throws, so answers saved from an older version of a form still restore. A `<select multiple>` takes an array of values.

## Methods

### `render(formData)`

Renders the form data to the target container element. If a form is already rendered, it replaces the existing form.
With [pagination](#multi-page-forms), the page on show stays on show when its stage is in the new form data (matched
by stage id, wherever the stage now sits); otherwise the form starts on its first page. `onPageChange` doesn't fire,
and focus doesn't move. After `destroy()`, the next render starts on the first page.

**Parameters:**
- `formData` (Object, optional): Form structure data. Defaults to the instance's current formData.

**Example:**

```javascript
renderer.render()

// Or render different form data
renderer.render(differentFormData)
```

### `getRenderedForm(formData)`

Generates and returns the rendered form as a DOM element without appending it to the container.

**Parameters:**
- `formData` (Object, optional): Form structure data. Defaults to the instance's current formData.

**Returns:** `HTMLFormElement`

**Example:**

```javascript
const formElement = renderer.getRenderedForm()
document.body.appendChild(formElement)
```

### `destroy()`

Removes the rendered form from the page and stops its [pagination](#multi-page-forms): the page navigation's document listeners are removed, and `page` returns `0` and `pageCount` `1` until the next `render()`. The renderer keeps its options and `formData`, so `render()` can be called again afterwards. Safe to call more than once, and before `render()`.

```javascript
renderer.destroy()
```

## Events

Pass an `events` object to the constructor to run code when the form renders, when a field changes, and when the form is submitted.

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData,
  events: {
    onRender: ({ form, renderer, formData }) => {
      // form is already attached to renderContainer
      console.log('rendered', form)
    },
    onChange: ({ event, target, form, userData }) => {
      console.log('field changed', target.name, userData)
    },
    onSubmit: ({ event, form, userData }) => {
      event.preventDefault() // the app decides whether/how to prevent the default submit
      console.log('submitted', userData)
    },
    onPageChange: ({ page, previousPage, stageId, form, renderer }) => {
      console.log('page changed', previousPage, '->', page)
    },
  },
})

renderer.render()
```

### `onRender({ form, renderer, formData })`

Fires synchronously after `render()` attaches the rendered `<form>` to `renderContainer`. Because `render()` is synchronous, code that runs right after calling it already sees the attached form; `onRender` is useful when that code lives elsewhere, such as inside the `events` object itself. It does **not** fire when reading `html` or calling `getRenderedForm()` directly, since neither attaches the form to the container.

### `onChange({ event, target, form, userData })`

Fires on every `input` event within the rendered form, including one fired by a condition's `value` action after the form has rendered. The conditions applied while rendering don't fire it. `userData` has the same shape as `renderer.userData` and is read from the form the event came from, at the time of the event.

For a multi-option checkbox group, `target.name` ends in `[]` but the matching `userData` key does not. Look it up with `userData[target.name.replace(/\[\]$/, '')]`.

### `onSubmit({ event, form, userData })`

Fires on the form's native `submit` event. Formeo does not call `event.preventDefault()` for you — the app decides whether to stop the browser's default submission and how to handle `userData`.

### `onPageChange({ page, previousPage, stageId, previousStageId, form, renderer })`

Fires with the `pagination` option (see [Multi-page forms](#multi-page-forms)) on every real page change: clicking a tab or a step, Previous/Next, Enter acting as Next, setting `renderer.page`, or a validation pass jumping to the page of the first invalid control. It does **not** fire on a render (the first one, or a later one that keeps the page), or when the target page is the same as the current one (for example clicking the current tab, or setting `renderer.page` to its current value). `stageId` and `previousStageId` are the ids of the stages shown and left. A page change caused by a [skipped page](#skipping-pages) fires it too.

### Legacy: `config.action.onRender`

`config.action.onRender` is still supported for backwards compatibility. Unlike `events.onRender`, it runs on the next animation frame after the form has been attached to the page (see `dom.onRender`), rather than synchronously:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData,
  config: {
    action: {
      onRender: form => console.log('form is in the page', form),
    },
  },
})
```

## Working with User Data

### Retrieving User Data

There are two primary ways to get user-submitted data:

#### 1. As a Plain Object (`userData`)

Best for simple processing and API submissions:

```javascript
const data = renderer.userData
// { name: 'John', email: 'john@example.com', subscribe: 'true' }

// Send to API
fetch('/api/submit', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

#### 2. As Structured Array (`userFormData`)

Best when you need field labels and metadata:

```javascript
const formData = renderer.userFormData
// [
//   { key: 'name', value: 'John', label: 'Full Name' },
//   { key: 'email', value: 'john@example.com', label: 'Email Address' }
// ]

// Display in a summary
formData.forEach(field => {
  console.log(`${field.label}: ${field.value}`)
})
```

### Setting User Data

You can programmatically populate form fields:

```javascript
// Pre-fill a form
renderer.userData = {
  username: 'john_doe',
  email: 'john@example.com',
  country: 'US'
}

// Works with checkbox groups
renderer.userData = {
  interests: ['technology', 'sports', 'music']
}

// Works with radio buttons
renderer.userData = {
  gender: 'male'
}
```

> Keys with no matching field are skipped, and the renderer logs one console warning that lists them. The setter never throws, so answers saved from an older version of a form still restore. A `<select multiple>` takes an array of values.

### Handling Different Field Types

#### Single Input Fields

```javascript
// Text, email, number, etc.
renderer.userData = { firstName: 'John' }
```

#### Checkbox and Radio Groups

A checkbox or radio group is one field with `options`. It renders as a wrapper element (`id="f-<fieldId>"`, the element conditions target) that holds one `<input>` per option.

- **Name.** Every option input is named `attrs.name` when it is set. Otherwise it falls back to `attrs.id`, then to the rendered field id (`f-<fieldId>`). `userData` is keyed by that name. Give two groups different names: radio groups that share a name act as one group. Checkbox groups with more than one option render their inputs as `name[]`, so a regular form POST sends every checked value (PHP, Rails and Express's `extended` parser read these as arrays). `userData` drops a trailing `[]` from every field name, including one the author already put in `attrs.name`, so `{ hobbies: ['reading', 'coding'] }` either way. One checked value is still a string. The `userData` setter accepts either form of the name (`hobbies` or `hobbies[]`).
- **Required.** A required radio group needs one option picked. A required checkbox group needs **at least one** box checked, not all of them. The browser's own validation message appears either way, and the group label shows `*`.
- **Other attributes.** `disabled` and `form` are copied to every option input. Everything else set on the group (`data-*`, `aria-*`, `title`, custom attributes) goes on the wrapper element.

```javascript
// Setting checked values; a single value is fine too
renderer.userData = { toppings: ['cheese', 'olives'] }

// Getting checked values
renderer.userData
// { toppings: ['cheese', 'olives'] } if several are checked
// { toppings: 'cheese' } if only one is checked

// With more than one option, the group's inputs are actually named "toppings[]" so a native
// <form> POST keeps every checked value; userData strips the suffix either way.
```

##### Other choice

Set `config.other: true` on a checkbox or radio group to add a last **Other** choice with a text box, so people can
answer with something you didn't list. In the editor, switch on **Other option** in the field's Configuration panel.

```javascript
{
  tag: 'input',
  attrs: { type: 'checkbox', name: 'hobbies' },
  config: { label: 'Hobbies', other: true, otherLabel: 'Something else' },
  options: [
    { label: 'Reading', value: 'reading' },
    { label: 'Coding', value: 'coding' },
  ],
}
```

- **Label.** The choice shows `config.otherLabel`, or `Other` when it's empty. When you switch Other on, the editor
  fills the label in the editor's language, and it's saved with the form.
- **Values.** Choosing Other submits `other` as one of the group's values, and the typed text posts under the group's
  name plus `-other`: `{ hobbies: ['reading', 'other'], 'hobbies-other': 'Knitting' }`. The text box is disabled until
  Other is chosen, so the `-other` key only appears while it is. An unnamed group uses its field id (`f-<fieldId>-other`).
- **Setting userData.** `renderer.userData = { hobbies: ['other'], 'hobbies-other': 'Knitting' }` checks Other and
  fills its text box.
- **userFormData.** The typed text's entry is labelled with the group label and the Other label, for example
  `Hobbies (Something else)`.
- **Required.** In a required group the text box is required too, but only while Other is chosen.
- **Conditions.** A condition can test the group for the value `other`. The typed text can't be a condition source,
  and Other isn't one of the group's `options`, so a condition can't check or uncheck it.
- **Names to avoid.** Don't give another field the name `<group name>-other`, or both answers will share that key. If
  the group already has an option whose value is `other`, as in the
  [two-field example](#example-show-a-field-for-other), delete that option and its companion field when you switch to
  the built-in Other.
- **Static HTML.** `getRenderedForm()` and `html` produce the text box disabled. Enabling it needs the listeners that
  `render()` attaches.

#### Radio Buttons

```javascript
// Setting selected radio button
renderer.userData = { size: 'medium' }

// Getting selected value
const data = renderer.userData
// { size: 'medium' }
```

### File uploads

The File Upload control renders a standard `<input type="file">`. Formeo doesn't upload anything itself; your app sends the file.

- `C:\fakepath\cv.pdf` is how browsers show a file input's `value`. The file itself is in the form's `FormData`.
- `renderer.userData` holds `File` objects for file inputs, and `JSON.stringify` turns a `File` into `{}`. Send `FormData` instead:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: '#formeo-renderer',
  events: {
    onSubmit: ({ event, form }) => {
      event.preventDefault()
      // don't set Content-Type: the browser adds the multipart boundary
      fetch('/upload', { method: 'POST', body: new FormData(form) })
    },
  },
})
renderer.render(formData)
```

For a regular (non-JavaScript) submit, set the form attributes:

```javascript
new FormeoRenderer({
  renderContainer: '#formeo-renderer',
  config: { attrs: { method: 'post', enctype: 'multipart/form-data', action: '/upload' } },
})
```

Give the upload field a `name` attribute in the editor to control the key your server receives.

## Multi-page forms

Each **stage** in `formData` is one page. Pass the `pagination` option to show them one at a time as tabs or a wizard, instead of all at once in a single `<form>`. Navigation (tabs, the wizard's Previous/Next bar and step list, and page headings) only applies with **2 or more stages** — a single-stage form always renders as before, with no navigation added, except that a Submit button is still appended below it when `submit: true` (see [Options](#options) below).

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  pagination: 'tabs', // or 'wizard', or an options object
})
```

### Options

`pagination` accepts:

- `'tabs'` — a `role="tablist"` of buttons, one per page, with the ARIA tabs pattern (see [Tabs](#tabs) below).
- `'wizard'` — Previous/Next buttons with an optional step list (see [Wizard](#wizard) below).
- An options object: `{ type, progress, submit, heading, labels: { previous, next, page, submit, tablist, steps, navigation, status } }`

| Key | Default | Meaning |
|-----|---------|---------|
| `type` | — (required) | `'tabs'` or `'wizard'` |
| `progress` | `true` | Wizard only: show the clickable step list above the pages. `false` leaves it out. |
| `submit` | `false` | Add a Submit button: in a wizard it replaces Next on the last page, in tabs it sits below the pages. A single-page form (no navigation) still gets the button, appended below the page. See [Wizard](#wizard) and [Tabs](#tabs). |
| `heading` | `false` | Show each page's title as a heading inside the page, once the form has 2 or more pages: `true` for `<h2>`, or a level from `2` to `6`. See [Page headings](#page-headings). |
| `labels.previous` | `'Previous'` | Wizard's Previous button text |
| `labels.next` | `'Next'` | Wizard's Next button text |
| `labels.submit` | `'Submit'` | The Submit button's text (with `submit: true`) |
| `labels.page` | `'Page {n}'` | Fallback page title, used when a stage has no `config.title`. `{n}` is replaced with the 1-based page number. |
| `labels.tablist` | `'Pages'` | Accessible name of the tablist |
| `labels.steps` | `'Progress'` | Accessible name of the wizard's step list |
| `labels.navigation` | `'Page navigation'` | Accessible name of the wizard's Previous/Next bar |
| `labels.status` | `'{title} ({n} of {count})'` | What screen readers hear on each wizard page change. `{title}` is the page's title, `{n}` its 1-based position and `{count}` the number of pages. |

To translate the navigation, pass your own strings in `labels`. The renderer doesn't load language files.

Any other value for `pagination` (including `undefined`, `null`, or an unrecognized `type`) is treated as no pagination, and every stage renders visibly as it did before this feature.

### Page titles

A page's title comes from `stages[<id>].config.title`. If a stage has no title, the page falls back to `labels.page` (`'Page 2'`, or `'Seite 2'` with `labels: { page: 'Seite {n}' }`). Titles show up as tab labels and, in a wizard, as step list labels.

```javascript
formData.stages['stage-1'].config = { title: 'About you' }
```

### Page headings

With `heading`, each page starts with a heading holding its title (the same text as its tab or step, including the
`labels.page` fallback): `<h2 class="formeo-pages-heading">` for `heading: true`, or pick the level that fits your
page's outline with `heading: 2` to `heading: 6`. In a wizard, each page is a `role="group"` named by its heading; tab
panels stay named by their tab. Headings only make sense as navigation aids, so a single-stage form never gets one,
even with `heading: true`.

```javascript
new FormeoRenderer({ renderContainer, pagination: { type: 'wizard', heading: 3 } })
```

### Tabs

Clicking a tab shows its page immediately; there is no validation on switching. The tablist follows the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with automatic activation and roving `tabindex`:

- `ArrowLeft` / `ArrowRight` move to the previous/next tab and wrap around at the ends. In a right-to-left form (`dir="rtl"`), they swap: `ArrowLeft` moves to the next tab.
- `Home` / `End` jump to the first/last tab.
- Moving focus to a tab shows its page right away.

Each page gets an `id` unique to its form (the tab's `aria-controls` points at it), because the stage's own id is also used by the editor and by any other form rendered from the same `formData`. The stage id stays on the page as `data-stage-id`.

With `submit: true`, a Submit button is added below the pages, in `<div class="formeo-pages-actions">`, and is shown
on every tab. Submitting still shows the page of the first invalid control (see [Validation](#validation)). A
single-page form with `submit: true` gets this same button and wrapper, with no tablist above it.

### Wizard

A wizard adds:

- An optional step list (`<ol class="formeo-pages-steps">`, on by default — set `progress: false` to remove it). Each step shows the page's title and a `data-state` of `"done"`, `"current"` or `"upcoming"`. Clicking a step ahead of the current page validates every page in between (see [Validation](#validation) below); clicking a step behind the current page is always allowed.
- A bottom bar (`<div role="group">`) with a Previous button, a Next button, and a visually-hidden status such as "Account (2 of 3)" (`aria-live="polite"`, announced to screen readers on every page change; set its wording with `labels.status`). Next validates the current page before moving on. Next is hidden on the [last page in play](#skipping-pages), and Previous is disabled on the first.
- Pressing <kbd>Enter</kbd> in a text `<input>` (not a submit/button/reset/image/file input) acts as Next on every page but the last page in play, instead of submitting a half-filled form. Textareas keep their newline behavior. On the last page in play, Enter submits the form natively.
- With `submit: true`, a Submit button (`<button type="submit" class="formeo-pages-submit">`, text from
  `labels.submit`) takes Next's place on the last page in play. Without it, end the wizard with a submit field of your
  own on its last page in play: Next disappears there, and without a submit button some browsers won't submit on
  <kbd>Enter</kbd>. A single-page wizard with `submit: true` gets this button below the page too, in its own
  `<div class="formeo-pages-actions">`, since there's no Previous/Next bar to hold it.

### Skipping pages

A [condition](#conditional-logic) can skip a page: give it a `then` action whose target is the page's stage,
`stages.<stageId>`, with `targetProperty: 'isNotVisible'`. `isVisible` brings the page back. Nothing is undone
automatically, so pair the two, as for fields:

```javascript
stages: {
  'about-you': {
    id: 'about-you',
    config: { title: 'About you' },
    children: ['row-1'],
    conditions: [
      {
        if: [{ source: 'fields.account-type', sourceProperty: 'value', comparison: '!=', target: 'business' }],
        then: [{ target: 'stages.company', targetProperty: 'isNotVisible' }],
      },
      {
        if: [{ source: 'fields.account-type', sourceProperty: 'value', comparison: '==', target: 'business' }],
        then: [{ target: 'stages.company', targetProperty: 'isVisible' }],
      },
    ],
  },
  // …
}
```

A skipped page:

- **Leaves the navigation.** Its tab or step is hidden. Next, Previous, <kbd>Enter</kbd>, the step list and the tab keys
  pass over it, and the status counts only the pages still in play ("Contact (2 of 2)"). Steps are numbered without a
  gap.
- **Doesn't validate or submit.** Its controls are disabled while it's skipped, so they never block Next or submit, and
  its answers are left out of `userData` and of a native form POST. Their values stay in the page, so they're back if
  the page is.
- **Can be the page on show.** The next page in play takes its place (or the previous one, at the end), and
  `onPageChange` fires. Focus moves to the new page only when it was on the skipped one. A form, or a page kept by
  `render()`, whose first page starts out skipped opens on the next page in play without `onPageChange`.
- **Never leaves the form empty.** A condition can't skip the last page still in play; it logs a warning instead.
- **Keeps its index.** `renderer.page` and `pageCount` still count every stage. Setting `renderer.page` to a skipped
  page shows the next page in play.

While a page is skipped, conditions read its fields as unanswered: an empty value, unchecked and not visible. Its
answers stay on the page and count again if it comes back. So if "Account type" skips the Company page, a VAT page
shown only when "VAT registered?" (a field on the Company page) is "yes" drops out along with Company, and returns
with it. A condition that skips or brings back a page still reads that page's own fields as they are, so a page can
skip itself. Conditions reading a page's fields run again whenever it's skipped or comes back, so a `value` action
driven by its answers can fire then too: "VAT registered?" `!=` "yes" setting another field to "none" sets it as
Company is skipped.

A skipped page can hold the author's own submit field. With `submit: false` (the default), skipping the page holding
it disables that button along with every other control on the page, leaving the form with no enabled submit — Enter
does nothing either, since the disabled button was the form's default button. Keep your own submit field on a page no
condition can skip, or use `submit: true` instead. This applies to tabs, the wizard and an unpaginated form alike.

Without `pagination`, a skipped stage just disappears, with its answers.

The editor writes these conditions from a page's Conditions panel (see [Page Tabs](../editor/pages.md#skipping-pages)).

### Validation

Whether the user submits the form or clicks Next/a step, an invalid control never gets silently skipped:

- The wizard's Next button and step list validate the current page (and, for a step further ahead, every page up to but not including the target) the way native submission would, stopping at and reporting the first invalid control.
- Submitting the form (a submit button, <kbd>Enter</kbd>'s implicit submission, or `form.requestSubmit()`) or calling `form.reportValidity()` shows the page holding the **first** invalid control, so the browser's native validation bubble lands on a visible field.
- A plain `checkValidity()`, on the form or on a single control, is silent and never switches pages. It's safe to call from `onChange`, for example to disable a submit button until the form is valid.
- A [condition](#conditional-logic) that hides a field suspends only its `required`: the field stops being required until it's shown again (see [`then` actions](#then-actions)), regardless of which page it lives on. A hidden field that fails another constraint, such as `pattern` or a value that doesn't match its `type`, still blocks submission and Next, as it would natively.
- A form with `novalidate` is never checked, just as native submission skips it: Next, Enter and the step list move on freely.

### Accessible names

The tablist, the wizard's step list and its Previous/Next bar are named for assistive technology by `labels.tablist`
(`'Pages'`), `labels.steps` (`'Progress'`) and `labels.navigation` (`'Page navigation'`). Translate them along with the
button labels:

```javascript
pagination: {
  type: 'wizard',
  labels: {
    previous: 'Zurück',
    next: 'Weiter',
    page: 'Seite {n}',
    submit: 'Absenden',
    tablist: 'Seiten',
    steps: 'Fortschritt',
    navigation: 'Seitennavigation',
    status: '{title} ({n} von {count})',
  },
}
```

### `renderer.page`, `renderer.pageCount`, `onPageChange`

```javascript
renderer.page // 0-based index of the page currently shown
renderer.page = 1 // shows a page directly; out-of-range indexes are clamped; does not validate
renderer.pageCount // number of pages (1 without pagination or with a single stage)
```

Pass `events.onPageChange` to run code on every real page change — see [`onPageChange`](#onpagechange-page-previouspage-stageid-previousstageid-form-renderer-).

### Styling

Pagination renders these class names for styling:

| Class | Element |
|-------|---------|
| `.formeo-pages-nav` | The tablist (`<nav role="tablist">`) or the wizard's Previous/Next bar (`<div role="group">`) |
| `.formeo-pages-tabs` | Modifier on `.formeo-pages-nav` when it's the tablist |
| `.formeo-pages-tab` | A tab button |
| `.formeo-pages-wizard` | Modifier on `.formeo-pages-nav` when it's the wizard's Previous/Next bar |
| `.formeo-pages-steps` | The wizard's step list (`<ol>`) |
| `.formeo-pages-step[data-state]` | A step (`<li>`); `data-state` is `"done"`, `"current"` or `"upcoming"` |
| `.formeo-pages-previous` | The wizard's Previous button |
| `.formeo-pages-next` | The wizard's Next button |
| `.formeo-pages-submit` | The Submit button added by `submit: true` |
| `.formeo-pages-actions` | In tabs, the bar below the pages holding the Submit button |
| `.formeo-pages-heading` | A page's heading, added by `heading` |
| `.formeo-pages-status` | The wizard's page status, e.g. "About you (1 of 2)" (visually hidden, screen-reader only) |
| `.formeo-stage[data-skipped]` | A page skipped by a condition (also `hidden`) |

### Example

```javascript
const formData = {
  id: 'signup',
  stages: {
    'stage-1': { id: 'stage-1', config: { title: 'About you' }, children: ['row-1'] },
    'stage-2': { id: 'stage-2', config: { title: 'Account' }, children: ['row-2'] },
  },
  rows: {
    'row-1': { id: 'row-1', config: {}, children: ['col-1'] },
    'row-2': { id: 'row-2', config: {}, children: ['col-2'] },
  },
  columns: {
    'col-1': { id: 'col-1', config: { width: '100%' }, children: ['name'] },
    'col-2': { id: 'col-2', config: { width: '100%' }, children: ['email'] },
  },
  fields: {
    name: { id: 'name', tag: 'input', attrs: { type: 'text', name: 'name' }, config: { label: 'Name' } },
    email: {
      id: 'email',
      tag: 'input',
      attrs: { type: 'email', name: 'email', required: true },
      config: { label: 'Email' },
    },
  },
}

const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  pagination: 'wizard',
  events: {
    onPageChange: ({ page }) => console.log(`page ${page + 1}`),
  },
})

renderer.render(formData)
```

### Limitations

- The editor builds pages with its `pages` option (see [Page Tabs](../editor/pages.md)); you can also define them directly in `formData`.

## Conditional Logic

Conditions let one component react to another: show or hide a field or a whole row, check an option, or set a value. The editor writes them from a field's **Conditions** panel. You can also write them by hand in `formData`.

### Where conditions live

Any component (field, row, column or stage) can carry a `conditions` array. Each entry is one condition:

```javascript
{
  if: [ /* one or more clauses */ ],
  then: [ /* one or more actions */ ],
}
```

When every clause of an `if` group matches, every action in `then` runs. Components are referenced by **address**: `fields.<fieldId>`, `rows.<rowId>`, `columns.<columnId>`, or one option of a group, `fields.<fieldId>.options[<index>]`. Addresses use the ids from `formData`, without the `f-` prefix the renderer adds to element ids.

A column works as a clause `source`, but a show/hide action that targets a column hides the whole row it sits in. To hide part of a row, target its fields.

### `if` clauses

| Key | Values | Meaning |
|-----|--------|---------|
| `source` | address | The component to read. |
| `sourceProperty` | `value`, `isChecked`, `isNotChecked`, `isVisible`, `isNotVisible` | What to read. `value` is the text of an input, the selected value of a select (an array for `multiple`), the checked value of a radio group, or the list of checked values of a checkbox group. The other four are true/false, and a clause using them matches when they are true, so `comparison` and `target` are ignored. |
| `comparison` | `==` (`equals`), `!=` (`notEquals`), `⊃` (`contains`), `!⊃` (`notContains`) | How to compare `value` with `target`. For checkbox groups and multi-selects, `==` matches when any checked value equals `target`. |
| `target` | text, or an address | The value to compare against, or another component whose `targetProperty` is compared. |
| `targetProperty` | `value` | Used only when `target` is an address. |
| `logical` | `&&` (`and`), `\|\|` (`or`) | Joins this clause to the one before it. Ignored on the first clause, and a missing value means OR. `&&` binds tighter than `\|\|`: `A \|\| B && C` means `A \|\| (B && C)`. |

The editor saves the symbol forms (`==`, `&&`); the word forms are accepted too.

### `then` actions

| `targetProperty` | Effect on `target` (an address) |
|------------------|-----------------------------------|
| `isVisible` / `isNotVisible` | Shows or hides the target (a field or a whole row). Required inputs inside a hidden target stop being required until it is shown again. |
| `isChecked` / `isNotChecked` | Checks or unchecks the target. Point at one option: `fields.<id>.options[<index>]`. |
| `value` | Sets the target's value to `value` when `assignment` is `=`. An `input` event fires, so conditions that read the target run too. |

### When conditions run

Each condition runs once when the form renders, and again whenever a component its clauses read from changes (`input` for text fields, `change` for selects, checkboxes and radios). Nothing is undone automatically when a condition stops matching. To hide a field **except** when something is true, pair two conditions, as in the first example.

### Example: show a field for "Other"

For a checkbox or radio group, use the built-in [Other choice](#other-choice) instead. This pattern is for fields
without one, such as a select.

```javascript
fields: {
  country: {
    id: 'country',
    tag: 'select',
    config: { label: 'Country' },
    options: [
      { label: 'Canada', value: 'ca' },
      { label: 'Other', value: 'other' },
    ],
  },
  'country-other': {
    id: 'country-other',
    tag: 'input',
    attrs: { type: 'text', required: true },
    config: { label: 'Which country?' },
    conditions: [
      {
        if: [{ source: 'fields.country', sourceProperty: 'value', comparison: '!=', target: 'other' }],
        then: [{ target: 'fields.country-other', targetProperty: 'isNotVisible' }],
      },
      {
        if: [{ source: 'fields.country', sourceProperty: 'value', comparison: '==', target: 'other' }],
        then: [{ target: 'fields.country-other', targetProperty: 'isVisible' }],
      },
    ],
  },
}
```

### Example: show a field only when two answers match (AND / OR)

The discount code field appears only for a Team plan with 10 seats. The first condition hides it when either answer differs (`||`). The second shows it when both match (`&&`).

```javascript
fields: {
  plan: {
    id: 'plan',
    tag: 'input',
    attrs: { type: 'radio' },
    config: { label: 'Plan' },
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Team', value: 'team' },
    ],
  },
  seats: {
    id: 'seats',
    tag: 'input',
    attrs: { type: 'number' },
    config: { label: 'Seats' },
  },
  'discount-note': {
    id: 'discount-note',
    tag: 'input',
    attrs: { type: 'text' },
    config: { label: 'Discount code' },
    conditions: [
      {
        if: [
          { source: 'fields.plan', sourceProperty: 'value', comparison: '!=', target: 'team' },
          { logical: '||', source: 'fields.seats', sourceProperty: 'value', comparison: '!=', target: '10' },
        ],
        then: [{ target: 'fields.discount-note', targetProperty: 'isNotVisible' }],
      },
      {
        if: [
          { source: 'fields.plan', sourceProperty: 'value', comparison: '==', target: 'team' },
          { logical: '&&', source: 'fields.seats', sourceProperty: 'value', comparison: '==', target: '10' },
        ],
        then: [{ target: 'fields.discount-note', targetProperty: 'isVisible' }],
      },
    ],
  },
}
```

Both examples are covered by tests in `src/lib/js/renderer/conditions.test.js`.

## Examples

### Example 1: Basic Form Rendering

```javascript
import { FormeoRenderer } from 'formeo'

const formData = {
  id: 'my-form',
  stages: { /* ... */ },
  rows: { /* ... */ },
  columns: { /* ... */ },
  fields: { /* ... */ }
}

const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: formData
})

renderer.render()
```

### Example 2: Form with Submit Handler

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

// Add submit handler
const form = document.querySelector('.formeo-render')
form.addEventListener('submit', (e) => {
  e.preventDefault()

  const userData = renderer.userData
  console.log('User submitted:', userData)

  // Or get with labels
  const userFormData = renderer.userFormData
  console.log('Structured data:', userFormData)

  // Submit to API
  // Forms with file inputs: send new FormData(form) instead (see File uploads)
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
})
```

### Example 3: Pre-filling Form Data

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

// Load saved data (e.g., from localStorage or API)
const savedData = {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: ['newsletter', 'updates']
}

// Pre-fill the form
renderer.userData = savedData
```

### Example 4: Dynamic Form Updates

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: initialFormData
})

renderer.render()

// Later, switch to a different form
document.getElementById('load-different-form').addEventListener('click', () => {
  renderer.render(differentFormData)
})
```

### Example 5: Form Validation and Processing

```javascript
const renderer = new FormeoRenderer({
  renderContainer: document.getElementById('form-container'),
  formData: myFormData
})

renderer.render()

const form = document.querySelector('.formeo-render')
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Get structured data with labels
  const formData = renderer.userFormData

  // Validate required fields
  const errors = []
  formData.forEach(field => {
    if (field.label.includes('*') && !field.value) {
      errors.push(`${field.label} is required`)
    }
  })

  if (errors.length > 0) {
    alert('Please fix the following errors:\n' + errors.join('\n'))
    return
  }

  // Process submission
  try {
    // Forms with file inputs: send new FormData(form) instead (see File uploads)
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(renderer.userData)
    })

    if (response.ok) {
      alert('Form submitted successfully!')
      form.reset()
    }
  } catch (error) {
    console.error('Submission error:', error)
    alert('Failed to submit form')
  }
})
```

## Advanced Topics

### Custom Elements

You can provide custom form elements through the `elements` option:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: container,
  formData: myFormData,
  elements: {
    'custom-field': {
      // Custom element configuration
      action: {
        // Custom event handlers
      },
      dependencies: {
        // Required scripts/styles
      }
    }
  }
})
```

### Input Groups

The renderer supports dynamic input groups that allow users to add/remove field sets:

```javascript
// In form data, set inputGroup: true in row config
{
  config: {
    inputGroup: true,
    legend: 'Phone Numbers'
  }
}

// Users can click "Add +" to duplicate the field group
// Each cloned group gets a unique ID and a remove button
```

### Row and column attributes

A row's `attrs` and a column's `attrs` render on the `.formeo-row` / `.formeo-column` element, the one with id
`f-<id>`. The fieldset or wrapper around a row gets none of them. Conditions find their target by that id, but
show and hide its parent element (for a row, the `formeo-row-wrap` div or fieldset), not the element itself.

```javascript
rows: {
  'row-1': {
    id: 'row-1',
    className: ['formeo-row'], // saved by the editor
    config: {},
    children: ['col-1'],
    attrs: { 'data-section': 'contact', className: 'contact' },
  },
},
// renders <div class="formeo-row contact" data-section="contact" id="f-row-1">
```

- `className` and `class` are both merged with the component's own class list, `formeo-row` / `formeo-column` for
  editor-built forms.
- A column's `style` is kept without any `width` declaration, even an `!important` one, and the width from
  `config.width` is added after it, so `config.width` always wins.
- `id` and `tag` are ignored: Formeo needs the element's id and always renders a `div`.

### Label position

`config.labelPosition` sets where a field's label sits:

| Value    | Layout                 | Order          |
| -------- | ---------------------- | -------------- |
| `top`    | label above            | label, control |
| `bottom` | label below            | control, label |
| `before` | label beside, leading  | label, control |
| `after`  | label beside, trailing | control, label |

`before` and `after` follow the text direction, so in a right-to-left form `before` is on the right. The label and
control are always in the DOM in the order you see them, so screen readers read them in that order. In the editor it's
the Label Position dropdown in a field's Configuration panel.

Without `labelPosition`, a lone checkbox or radio is `after` and everything else is `top`. A checkbox or radio group's
`labelPosition` moves the group's label. Each option's label always follows its own input.

Every rendered field with a visible label is wrapped like this:

```html
<div class="f-field f-label-before">
  <label for="f-name">Name</label>
  <input id="f-name" name="name" type="text">
</div>
```

`before` and `after` sit side by side while the control has at least half the row. In a narrower column or viewport
they stack, with the label above (`before`) or below (`after`). The label's width beside the control is
`--formeo-label-width`, `10rem` by default:

```css
.my-form {
  --formeo-label-width: 14rem;
}
```

A checkbox or radio group is named by its label: the group is `role="group"` with `aria-labelledby` pointing at the
label, whose id is `f-<id>-label`.

Fields without a visible label (`hideLabel`, hidden inputs, headers, paragraphs, dividers and buttons) have no wrapper,
and `labelPosition` doesn't apply to them.

**`labelAfter`:** older forms and control definitions may use `config.labelAfter`. The renderer still reads it: `true`
is `bottom` (`after` for a lone checkbox or radio) and `false` is `top` (`before`). `labelPosition` wins when both are
set. The editor converts `labelAfter` to `labelPosition` when it loads a field, so the form saves with
`labelPosition`.

**Replacing a `:has()` workaround:** if you used a rule like
`.formeo-render div:has(> label + input) { display: flex; }` to put labels beside inputs, set `labelPosition: 'before'`
on those fields (or target `.f-field.f-label-before`) and delete the rule. The built-in layout also stacks on narrow
screens.

### Accessing Components

The renderer caches all rendered components internally:

```javascript
// Components are stored in this.components
// Keyed by their base ID (without the render prefix)

// You can access component data if needed
const component = renderer.components[componentId]
```

## Best Practices

1. **Always render before accessing userData**: Ensure `render()` is called before trying to get user data.

2. **Use userFormData for display**: When showing submission summaries or confirmations, use `userFormData` to include labels.

3. **Use userData for API submissions**: For backend processing, `userData` provides a clean object structure.

4. **Handle arrays properly**: Remember that checkbox groups return arrays when multiple values are selected.

5. **Clean form data**: The renderer automatically cleans form data, so don't worry about data format inconsistencies.

6. **Re-render for new forms**: Call `render()` with new form data to switch between different forms.

## API Reference Summary

| Property/Method | Type | Description |
|----------------|------|-------------|
| `formData` (get) | Object | Get current form structure |
| `formData` (set) | - | Set form structure |
| `userData` (get) | Object | Get user-submitted data as object |
| `userData` (set) | - | Set/pre-fill form field values |
| `userFormData` (get) | Array | Get user data with labels and metadata |
| `html` (get) | String | Get rendered form as HTML string |
| `page` (get) | Number | Get the 0-based index of the currently shown page |
| `page` (set) | - | Show a page without validating; index is clamped |
| `pageCount` (get) | Number | Get the number of pages (1 without pagination) |
| `render(formData)` | - | Render form to container |
| `getRenderedForm(formData)` | HTMLElement | Get rendered form element |

## Troubleshooting

**Form not rendering:**
- Ensure `renderContainer` is a valid DOM element
- Check that `formData` has the required structure (stages, rows, columns, fields)

**userData returns empty object:**
- Make sure the form has been rendered
- Check that form fields have proper `name` attributes
- Checkbox and radio groups submit under attrs.name, falling back to attrs.id, then f-<fieldId>
- Checkbox groups with more than one option add `[]` to that name

**Checkbox values not appearing as arrays:**
- If only one checkbox is selected, it returns a single value
- Multiple selections automatically convert to arrays

**Conditions not working:**
- `if` must be an array of clauses, and addresses look like `fields.<fieldId>` (the id from formData, without `f-`)
- `then` uses `isVisible` / `isNotVisible` / `isChecked` / `isNotChecked` / `value`, not `visible` or `set`
- Conditions don't undo themselves; add the opposite condition to show a field again
