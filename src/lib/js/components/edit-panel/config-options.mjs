import { labelHelper } from './helpers.mjs'

// a Config panel item edits its value with a checkbox or a text input, so only these defaults can be declared
const EDITABLE_DEFAULT_TYPES = new Set(['boolean', 'string', 'number'])
const warnedKeys = new Set()

/**
 * The config keys a component's Config panel offers: its resolved `panels.config.options` without the
 * `panels.config.disabled` ones. A declaration whose default the panel can't edit is dropped with a warning.
 * @param {Object} [componentConfig] a component's resolved config (Component#config)
 * @return {Map<String, {label: String, default: boolean|string|number}>} the keys, in declaration order
 */
export const configOptionsOf = componentConfig => {
  const { options = {}, disabled = [] } = componentConfig?.panels?.config || {}
  const declared = new Map()
  for (const [key, declaration] of Object.entries(options)) {
    if (disabled.includes(key)) {
      continue
    }
    if (!EDITABLE_DEFAULT_TYPES.has(typeof declaration?.default)) {
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key)
        console.warn(`formeo: config option "${key}" needs a boolean, string or number default; it is ignored`)
      }
      continue
    }
    declared.set(key, { label: declaration.label || labelHelper(`config.${key}`), default: declaration.default })
  }
  return declared
}
