const escapeSelector = selector => selector.replace(/[()[\].]/g, m => `\\${m}`)

/** A whole rule whose selector is exactly `selectorSource` (a regex source), starting where a rule may start. */
const rule = selectorSource => new RegExp(String.raw`(?<=(?:^|[};]|\*/)\s*)${selectorSource}\s*\{([^}]*)\}\s*`, 'g')

function readDeclarations(body = '') {
  const map = new Map()
  for (const decl of body.split(';').map(d => d.trim())) {
    const match = decl.match(/^(--formeo-[\w-]+)\s*:\s*([\s\S]+)$/)
    if (match) map.set(match[1], match[2])
  }
  return map
}

/** Remove the `selector { … }` property block and return its body. */
function takeBlock(css, selector) {
  const re = rule(escapeSelector(selector))
  return { body: re.exec(css)?.[1], css: css.replace(re, '') }
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
  const root = takeBlock(css, ':where(:root)')
  const darkBlock = takeBlock(root.css, ':where(.formeo-dark)')
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
