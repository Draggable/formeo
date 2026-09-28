# Consent-Aware Attribution

A recipe for capturing marketing attribution (`utm_*`, `gclid`, `fbclid`) from a form's URL and getting it to your
backend, without sending it anywhere until the visitor has consented.

## What this is and isn't

This is a host-side recipe, not a Formeo feature. Formeo has no concept of consent, attribution, or analytics, and
it sends nothing to anywhere on its own — every network call and every consent check below is code your app
provides. Nothing here names or requires a particular analytics vendor, tag manager, or CRM; adapt the allowlist and
the transport (Option A or Option B) to whatever your backend expects.

Consent and retention are the host application's responsibility. Formeo only renders a `<form>`, reads
`renderer.userData`, and (optionally) holds attribution values in hidden fields you add to the form — it doesn't
decide whether capturing attribution is allowed, and it doesn't store or transmit anything by itself.

## Consent first

Read attribution parameters only after your own consent check passes. Formeo has no opinion on how consent is
tracked — a cookie banner, a consent management platform, a stored preference — so treat this as a stub you replace
with your app's real check:

```javascript
// Provided by your app / consent management tooling. Formeo does not implement this.
function hasAttributionConsent() {
  // e.g. return window.__consent?.marketing === true
  return false
}
```

Nothing below should run before `hasAttributionConsent()` returns `true`.

## An allowlist

Read attribution only from an explicit allowlist of query parameters, never the whole query string. Keep values
non-empty and cap their length so a malformed or hostile URL can't stuff arbitrary data into your backend:

```javascript
const ATTRIBUTION_ALLOWLIST = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
const MAX_ATTRIBUTION_VALUE_LENGTH = 200

function readAttribution(search = location.search) {
  const params = new URLSearchParams(search)
  const attribution = {}
  for (const key of ATTRIBUTION_ALLOWLIST) {
    const value = params.get(key)
    if (value) {
      attribution[key] = value.slice(0, MAX_ATTRIBUTION_VALUE_LENGTH)
    }
  }
  return attribution
}
```

Call this only after `hasAttributionConsent()` is `true`:

```javascript
const attribution = hasAttributionConsent() ? readAttribution() : {}
```

There are two ways to get `attribution` to your backend: add it at submit time (Option A), or store it in the
rendered form as hidden fields (Option B). Option A needs no form changes; Option B keeps attribution alongside the
rest of the submission if your backend only looks at one payload.

## Option A: add it at submit

Attach the attribution object to the payload yourself in `events.onSubmit` — no changes to the form's fields are
needed:

```javascript
const renderer = new FormeoRenderer({
  renderContainer: '#formeo-renderer',
  formData,
  events: {
    onSubmit: ({ event, userData }) => {
      event.preventDefault()
      const attribution = hasAttributionConsent() ? readAttribution() : {}
      fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, attribution }),
      })
    },
  },
})
renderer.render()
```

`events.onSubmit` fires with `{ event, form, userData }` — `userData` is already `renderer.userData` read from the
form at submit time, so nothing else needs computing here.

## Option B: store it in the form

If your backend expects a single flat payload (for example, a plain HTML form POST with no JavaScript handling),
add a [Hidden field](../controls/README.md) for each allowlisted key you want to capture, and give each one a
`name` matching the allowlist exactly (the Hidden control has no default `name` — set `attrs.name` on the field,
either in the editor's Attributes panel or directly in the field's `formData`):

```javascript
fields: {
  'attribution-utm-source': {
    id: 'attribution-utm-source',
    tag: 'input',
    attrs: { type: 'hidden', name: 'utm_source', value: '' },
    config: { label: 'utm_source', hideLabel: true },
  },
  // ...one per allowlisted key you want to capture
}
```

After `render()`, check which of those fields the rendered form actually has, and only fill in the ones present.
This keeps attribution scoped to fields the form author deliberately added. It's also independent of how
`renderer.userData`'s setter treats a key with no matching field: the setter currently skips it and logs one
console warning, but don't rely on that warning, and don't rely on it throwing, since it never throws:

```javascript
const container = document.getElementById('formeo-renderer')
const renderer = new FormeoRenderer({ renderContainer: container, formData })
renderer.render()

// same <form> element as renderer.renderedForm
const form = container.querySelector('.formeo-render')
const present = key => Boolean(form?.elements[key])

const attribution = hasAttributionConsent() ? readAttribution() : {}
const filtered = Object.fromEntries(Object.entries(attribution).filter(([key]) => present(key)))

renderer.userData = filtered
```

Filtering with `present()` before assigning means every key in `filtered` is guaranteed to match a field, so the
assignment fills exactly those hidden fields and nothing else. When the form submits (a native POST, or your own
`fetch(form.action, { body: new FormData(form) })` in `onSubmit`), the filled hidden fields go out with the rest of
the fields.

## Retention and deletion

How long attribution values are kept, where they're stored, and how a visitor's data is deleted on request are the
host application's policy — Formeo has no storage of its own to configure. Whatever you choose, don't keep more
than the allowlist above needs: attribution values only need to answer "where did this submission come from," not
build a profile of the visitor.
