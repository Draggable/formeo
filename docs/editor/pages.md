# Page Tabs

With the `pages` option on, each **stage** in the editor is a page: a tab bar sits above the stage, one tab per
stage, and only the active stage's content is shown. The option is opt-in and off by default. The renderer's
`pagination` option shows the result to end users — see [Multi-page forms](../renderer/renderer.md#multi-page-forms).

## Enabling

```javascript
new FormeoEditor({ editorContainer, pages: true })
```

With `pages` off, the editor is unchanged, even when `formData` already has more than one stage: no tab bar, no
extra DOM, and stages don't get a seeded `config.title`.

With `pages` on, every stage gets a string `config.title` (`''` when it had none, on load and when a page is
added), so the stage's edit panel always has a **Configuration** panel with a **Title** field. A page with an
empty title shows as "Page {n}" (1-based) on its tab.

## Using the tabs

| Action | What happens |
|---|---|
| Click a tab | Switches to that page |
| `+` (after the last tab) | Adds a new page and switches to it |
| Double-click a tab, or focus it and press <kbd>F2</kbd> | Renames it: an input replaces the tab, pre-filled with the current title. <kbd>Enter</kbd> or blur saves; <kbd>Escape</kbd> cancels. An empty value falls back to "Page {n}" |
| The stage's edit panel, Configuration → Title | Renames the page the same way |
| `×` on a tab, or focus it and press <kbd>Delete</kbd> | Removes the page (see [Actions](#actions)). An empty page is removed at once; a page with content asks first. The last page can't be removed, and has no `×`. There is no undo |
| Drag a tab, or focus it and press <kbd>Alt+ArrowLeft</kbd>/<kbd>Alt+ArrowRight</kbd> | Reorders the pages |
| Drop a row, column, field or control onto a tab | Moves it to the end of that page. The canvas stays on the page you're viewing; the target tab flashes and a screen-reader announcement says "Moved to {title}" |
| A row's "Move to page" button | Opens a dialog to move that row to another page (see [The "Move to page" row button](#the-move-to-page-row-button)) |

## Keyboard

The tab list follows the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with automatic
activation and a roving `tabindex`, matching the renderer's own tabs:

| Key on a focused tab | Action |
|---|---|
| <kbd>ArrowRight</kbd> / <kbd>ArrowLeft</kbd> | Next / previous tab, wrapping at the ends. Swapped when the editor's `dir` is `rtl`: <kbd>ArrowLeft</kbd> moves to the next tab |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last tab |
| <kbd>F2</kbd> | Rename |
| <kbd>Delete</kbd> | Remove (same as `×`); does nothing on the last page |
| <kbd>Alt+ArrowRight</kbd> / <kbd>Alt+ArrowLeft</kbd> | Move this page one place later / earlier (swapped in RTL); focus stays on the tab |

## `editor.pages`

`editor.pages` is `null` when the `pages` option is off. When it's on, it's the editor's `EditorPages` instance:

| Member | Description |
|---|---|
| `index` | The 0-based index of the active page |
| `count` | The number of pages |
| `activate(stageIdOrIndex, { focus = false } = {})` | Switches to a page, given its stage id or index. `focus: true` also moves focus to its tab |
| `add({ title = '' } = {})` | Appends a stage, activates it, focuses its tab, and returns the `Stage` |
| `destroy()` | Destroys its Sortable instances and listeners. Called by `editor.destroy()`. A rename still open is discarded: the typed title is not saved |

Everything else on `EditorPages` is internal and not part of its public API.

## Events

| Action | DOM events, in order | Option callbacks |
|---|---|---|
| Add page | `formeoAddedStage`, `formeoUpdated` | `onAdd`, `onAddStage`, then (throttled) `onUpdate`/`onChange` |
| Remove page | the removed children's `formeoRemoved*` events, `formeoRemovedStage`, `formeoUpdated` | `onRemove*`, `onRemove`, `onRemoveStage`, `onUpdate`/`onChange` |
| Rename | `formeoUpdatedStage` (`changePath: 'config.title'`), `formeoUpdated` | `onUpdate`, `onUpdateStage`, `onChange` |
| Reorder | `formeoUpdated` | `onUpdate`/`onChange` |
| Move content (drop on a tab, or "Move to page") | the row's/column's usual events, plus `formeoUpdated` | the same callbacks a drag fires today |
| Switch page | `formeoPageChanged` | `onPageChange` |

Every callback receives `{ timeStamp, type, detail }`, same as the rest of formeo's [events](../options/events/README.md).
For `onPageChange`, `detail` is `{ page, previousPage, stageId, previousStageId }`, where `page` and `previousPage`
are 0-based page indexes. It does not fire on the first render, on a re-render (`setLang`, for example), or when
the target page is already the active one.

```javascript
new FormeoEditor({
  pages: true,
  events: {
    onAddStage: ({ detail }) => console.log('page added', detail),
    onRemoveStage: ({ detail }) => console.log('page removed', detail),
    onPageChange: ({ detail }) => console.log(`page ${detail.previousPage} -> ${detail.page}`),
  },
})
```

`formeoPageChanged` bubbles. It's dispatched from the tab list element while that element is still in the page;
if it isn't (for example, mid-teardown), it's dispatched from `document` instead, same as formeo's other DOM
events.

## Actions

```javascript
new FormeoEditor({
  pages: true,
  actions: {
    remove: {
      page: evt => {
        if (evt.isEmpty || window.confirm(`Remove "${evt.title}" and everything on it?`)) {
          evt.removeAction()
        }
      },
    },
  },
})
```

`actions.remove.page(evt)` is called before a page is removed, whether by its `×` or by <kbd>Delete</kbd>:

| `evt` field | Description |
|---|---|
| `stage` | The `Stage` about to be removed |
| `stageId` | Its id |
| `index` | Its 0-based position |
| `title` | Its current title (falls back to "Page {n}" the same way its tab does) |
| `isEmpty` | `true` when the page has no rows |
| `removeAction` | Call it to actually remove the page. Not calling it cancels the removal; it can also be called later, e.g. after an async confirmation |

The default handler removes an empty page (`isEmpty`) at once, and otherwise opens an in-app dialog asking to
confirm before calling `removeAction`.

## The "Move to page" row button

With `pages` on, every row gets a "Move to page" button, `id: 'page'`, inserted just before Remove (or appended,
if a customized button list has no Remove). This happens even when `config.rows.*.actionButtons.buttons` has been
customized. The button is hidden automatically while there's only one page. It's for rows only: `'page'` in a
column's or field's `actionButtons.buttons` is ignored (drop a column or field on a tab to move it instead). Hide
it in every case with:

```javascript
new FormeoEditor({
  pages: true,
  config: {
    rows: {
      all: {
        actionButtons: { disabled: ['page'] },
      },
    },
  },
})
```

Clicking it opens a dialog with a `<select>` listing the other pages by title and a Move button; confirming
appends the row to the end of the chosen page. Only rows have this button — move a column or a field by
dropping it onto a tab instead (see [Using the tabs](#using-the-tabs)).

## Styling

| Class | Element |
|---|---|
| `.formeo-pages-editor[data-page-count]` | The wrapper around the tab bar and the stages. `data-page-count` is the number of pages |
| `.formeo-pages-bar` | The bar holding the tab list, the `+` button and the live status |
| `.formeo-page-tabs` | The tab list (`role="tablist"`) |
| `.formeo-page-tab-wrap` | One tab's wrapper (holds its tab button and, when there's more than one page, its `×`) |
| `.formeo-page-tab[aria-selected]` | A tab button; `aria-selected="true"` on the active one |
| `.formeo-page-remove` | A tab's `×` button |
| `.formeo-page-add` | The `+` button |
| `.formeo-page-title-input` | The input shown in place of a tab while renaming |
| `.formeo-page-tab-flash` | Added to `.formeo-page-tab-wrap` for about a second after content is dropped or moved onto it |
| `.formeo-pages-status` | The visually-hidden `aria-live="polite"` region used for "Moved to {title}" |
| `.move-to-page-dialog` | The "Move to page" dialog opened by the row button |
| `.remove-page-dialog` | The default remove-confirmation dialog |

While something is dragged over a tab, Sortable parks it inside that tab's `.formeo-page-tab-wrap`; CSS hides
everything there except the tab and remove buttons and highlights the tab with a `:has()` selector for that state
— there's no separate "drop" class name. The same highlight rule also matches `.formeo-page-tab-flash`, so a drop
and a "Move to page" move look the same.

Styling uses the `--formeo-*` design tokens and logical CSS properties throughout, so `.formeo-dark` and a
right-to-left `dir` work without any extra CSS.

## i18n

| Key | English fallback |
|---|---|
| `pages.label` | Pages |
| `pages.add` | Add page |
| `pages.untitled` | Page {n} |
| `pages.rename` | Rename page |
| `pages.remove` | Remove page "{title}" |
| `pages.removeConfirm` | Remove "{title}" and everything on it? |
| `pages.moveTo` | Move to page |
| `pages.move` | Move |
| `pages.moved` | Moved to {title} |

These strings use `i18n.get(key) || <fallback>`, so they respect the editor's `i18n` option once
`@draggable/formeo-languages` ships them; until then (and for locales it doesn't cover), the English fallback
above is shown everywhere.

## "Clear All"

The controls panel's "Clear All" still empties every page (removing their rows, columns and fields), but it
does not remove the pages themselves — the tab bar and its pages are unchanged.

## A note on `config.title`

The stage's edit panel shows a **Title** field under Configuration only while `pages` is on: turning `pages` on
seeds `config.title` on every stage and makes it editable there. With `pages` off, a `config.title` in a stage's or
any other component's data is kept in `formData` but not shown in its edit panel.

## A note on `stages.reorder()`

Page order is the key order of `formData.stages`. `stages.reorder(ids)` (used to drag-reorder tabs and for
Alt+Arrow) refuses to reorder — with a console warning, and no change — when any of the given ids look like an
array index (`"1"`, `"2"`, …), because such a key would always sort to the front of the object regardless of
when it was added. Formeo's own generated stage ids never look like this, but if you supply your own stage ids
directly in `formData`, keep them from looking like array indexes if you want to reorder pages by dragging or
with Alt+Arrow.

## Limitations

These are planned for a later phase:

- page conditions and skipping pages
