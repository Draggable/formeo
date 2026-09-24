const escapeSelector = selector => selector.replace(/[()[\].]/g, m => `\\${m}`)

/** A whole rule whose selector is exactly `selectorSource` (a regex source), starting where a rule may start. */
const rule = selectorSource => new RegExp(String.raw`(?<=(?:^|[{};]|\*/)\s*)${selectorSource}\s*\{([^}]*)\}\s*`, 'g')

function splitDeclarations(body = '') {
  return body
    .split(';')
    .map(decl => decl.trim())
    .filter(Boolean)
}

function readDeclarations(body) {
  const map = new Map()
  for (const decl of splitDeclarations(body)) {
    const match = decl.match(/^(--formeo-[\w-]+)\s*:\s*([\s\S]+)$/)
    if (match) map.set(match[1], match[2])
  }
  return map
}

/** Remove the single `selector { … }` property block, throwing if it appears more than once or holds other rules. */
function takeBlock(css, selector, allowed) {
  const re = rule(escapeSelector(selector))
  const matches = [...css.matchAll(re)]
  if (matches.length > 1) {
    throw new Error(`Expected at most one ${selector} block, found ${matches.length}`)
  }
  const body = matches[0]?.[1]
  const stray = splitDeclarations(body).filter(decl => !allowed.test(decl))
  if (stray.length) {
    throw new Error(`${selector} may only declare ${allowed.source}; found: ${stray.join('; ')}`)
  }
  return { body, css: css.replace(re, '') }
}

/** Rules intentionally added by this change; removed before comparing to baseline. */
export const ALLOWED_ADDITIONS = [
  rule(String.raw`:where\(\.svg-icon\)`),
  rule(
    String.raw`:where\(\.formeo-dark\) :where\(\.formeo, \.formeo-controls, \.formeo-dialog\),\s*` +
      String.raw`:where\(\.formeo-dark\):where\(\.formeo, \.formeo-controls, \.formeo-dialog\)`
  ),
  rule(
    String.raw`\.formeo-dark \.formeo\.formeo-editor \.conditions-prop-inputs label\.condition-label\.then-condition-label,\s*` +
      String.raw`\.formeo-dark\.formeo\.formeo-editor \.conditions-prop-inputs label\.condition-label\.then-condition-label`
  ),
  rule(String.raw`:where\(\.formeo-dialog, \.component-edit\[popover\]\)`),
]

/**
 * Replace every var(--formeo-*) with its :where(:root) default and drop the property blocks,
 * producing CSS comparable to the pre-change baseline.
 */
export function resolveFormeoProperties(css) {
  const root = takeBlock(css, ':where(:root)', /^--formeo-[\w-]+\s*:/)
  const darkBlock = takeBlock(root.css, ':where(.formeo-dark)', /^(--formeo-[\w-]+|color-scheme)\s*:/)
  const defaults = readDeclarations(root.body)
  const dark = readDeclarations(darkBlock.body)

  let out = darkBlock.css
  for (const re of ALLOWED_ADDITIONS) out = out.replace(re, '')
  out = out.replace(/var\((--formeo-[\w-]+)\)/g, (_, name) => {
    if (!defaults.has(name)) throw new Error(`No default declared for ${name}`)
    return defaults.get(name)
  })
  return { css: out, defaults, dark }
}
