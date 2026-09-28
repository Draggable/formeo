# TypeScript

Formeo ships hand-written type definitions: `dist/formeo.d.ts` for the ES module and UMD builds, and
`dist/formeo.d.cts` for the CommonJS build. `package.json` points `types` and every `exports` condition at them, so
`import { FormeoEditor } from 'formeo'` is typed with `moduleResolution` `bundler` or `node16`/`nodenext` (from ES
modules or CommonJS). There is nothing extra to install. Projects still on `moduleResolution: node` (`node10`) get the
types through the top-level `types` field on TypeScript 6 or older; TypeScript 7 removed that mode, so switch to
`bundler` or `nodenext` there.

Requires TypeScript 4.7+ (the `exports` conditions need `moduleResolution: node16`/`nodenext`, which 4.7 added;
`moduleResolution: bundler` needs 5.0+). Your `lib` needs `"dom"` — without it, most of this file's types don't
resolve (`HTMLElement`, `CustomEvent`, and the rest), and with the common `skipLibCheck: true` those errors are
silently skipped because they'd be reported inside a `.d.ts` file; set `skipLibCheck: false` at least once to check.

## What is typed

- `FormeoEditor` and `FormeoRenderer`: constructors, properties and methods, including `destroy()`, `editor.pages`
  and the renderer's `page` and `pageCount`. See [Editor](editor/README.md) and [Renderer](renderer/renderer.md).
- Every editor option ([Options](options/README.md)), including `config`, `controls`, `i18n`, `events` and `actions`.
- Every renderer option, including `pagination` and `events`.
- The form definition, `FormeoFormData`, with its conditions. It matches `dist/formData_schema.json`.
- Formeo's DOM events on `document`, so `evt.detail` is typed in `document.addEventListener('formeoBeforeSave', …)`.

## Before hooks narrow on `componentType`

The `detail` of `onBeforeAdd`, `onBeforeRemove` and the other [before hooks](options/events/README.md#before-hooks)
depends on what is being added or removed. Check `componentType` before reading keys only some of them have:

```typescript
import { FormeoEditor } from 'formeo'

new FormeoEditor({
  editorContainer: '#formeo-editor',
  events: {
    onBeforeAdd: ({ detail }) => {
      if (detail.componentType === 'stage') {
        return detail.index < 5 // at most five pages
      }
      return detail.controlId !== 'hidden-input'
    },
    onBeforeRemove: async ({ detail }) => {
      if (detail.componentType === 'stage') {
        return detail.isEmpty || window.confirm(`Remove "${detail.title}"?`)
      }
      return true
    },
  },
})
```

A hook cancels by returning `false`, or a Promise that resolves to `false`. Returning anything else, or nothing,
lets the change happen.

## DOM events

```typescript
document.addEventListener('formeoBeforeSave', evt => {
  if (Object.keys(evt.detail.formData.fields).length === 0) {
    evt.preventDefault()
  }
})
```

## Control sets

`ControlDefinition` also covers [control sets](controls/custom-controls.md#control-sets). A set has no `tag` of its
own, and `onBeforeAdd` reports it as `componentType: 'controlSet'` with `data: { layout, row, fields }`:

```typescript
import type { ControlDefinition } from 'formeo'

const addressSet: ControlDefinition = {
  meta: { group: 'common', id: 'address-set', icon: 'rows' },
  config: { label: 'Address' },
  controlSet: {
    layout: 'stacked',
    fields: [
      { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } },
      { control: 'text-input', attrs: { name: 'city' }, config: { label: 'City' } },
    ],
  },
}
```

## Older names

`FormeoOptions` and `FormData` are deprecated aliases of `FormeoEditorOptions` and `FormeoFormData`. Importing
`FormData` from `formeo` hides the browser's `FormData` in that file, so prefer `FormeoFormData`.

## Script tags

With the UMD build, `window.FormeoEditor` and `window.FormeoRenderer` are typed once the definitions are part of your
program, for example with `/// <reference types="formeo" />` in one file.

## What isn't typed

- Formeo's internals: the component stores behind `editor.Components`, `editor.events` and `editor.actions`. The
  stages, rows, columns and fields that events and actions hand you are typed as `FormeoComponent`, which only lists
  their public part (`id`, `name`, `data`, `dom`, `parent`, `children`, `get`, `set`, `remove`, `addChild`).
- The `Control` base class isn't published (see
  [Or subclass `Control`](controls/custom-controls.md#or-subclass-control)), so `ControlClass` only helps controls
  built from a source checkout.

## Replacing your own declarations

If your project has its own `declare module 'formeo'` block, delete it. What happens if you don't depends on where
it lives and on `skipLibCheck`:

- In a **module file** (one with its own `import`/`export`) with the common `skipLibCheck: true`, it merges with the
  shipped types silently — the shipped declaration wins, and any error shows up where your code reads a member only
  your shim declared, not where the shim is. With `skipLibCheck: false` it's a hard clash (TS2300 duplicate
  identifier) at both declarations.
- In a **global file** (no `import`/`export`) as a bodyless shorthand — `declare module 'formeo'` with no `{ }` —
  it replaces the shipped types with `any`, regardless of `skipLibCheck`.

If you declared `Window.FormeoEditor` or `FormeoRenderer` yourself, delete it: it now conflicts with formeo's own
declaration. Depending on where it lives and your `skipLibCheck` setting, the conflict shows up as TS2717, as errors
elsewhere in your code, or by silently replacing formeo's type.

Since formeo's public surface used to be untyped (`any`) everywhere, removing a shim like this — or just upgrading
past a version that lacked these types — can surface type errors in code that compiled before, now that TypeScript
is actually checking it.
