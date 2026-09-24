const block = selector => new RegExp(`${selector.replace(/[().]/g, m => `\\${m}`)}\\s*\\{([^}]*)\\}\\s*`)

function readDeclarations(body = '') {
  const map = new Map()
  for (const decl of body.split(';')) {
    const match = decl.match(/^\s*(--formeo-[\w-]+)\s*:\s*([\s\S]+?)\s*$/)
    if (match) map.set(match[1], match[2])
  }
  return map
}

/** Rules intentionally added by this change; removed before comparing to baseline. */
export const ALLOWED_ADDITIONS = [/:where\(\.svg-icon\)\s*\{[^}]*\}\s*/g]

/**
 * Replace every var(--formeo-*) with its :where(:root) default and drop the property blocks,
 * producing CSS comparable to the pre-change baseline.
 */
export function resolveFormeoProperties(css) {
  const rootRe = block(':where(:root)')
  const darkRe = block(':where(.formeo-dark)')
  const defaults = readDeclarations(css.match(rootRe)?.[1])
  const dark = readDeclarations(css.match(darkRe)?.[1])

  let out = css.replace(rootRe, '').replace(darkRe, '')
  for (const re of ALLOWED_ADDITIONS) out = out.replace(re, '')
  out = out.replace(/var\((--formeo-[\w-]+)\)/g, (_, name) => {
    if (!defaults.has(name)) throw new Error(`No default declared for ${name}`)
    return defaults.get(name)
  })
  return { css: out, defaults, dark }
}
