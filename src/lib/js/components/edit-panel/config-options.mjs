import i18n from '@draggable/i18n'
import { toTitleCase } from '../../common/utils/string.mjs'
import { labelHelper } from './helpers.mjs'

// a Config panel item edits its value with a checkbox, a text input or (with options) a select
const EDITABLE_DEFAULT_TYPES = new Set(['boolean', 'string', 'number'])
const warnedKeys = new Set()

const warnOnce = (key, problem) => {
  if (!warnedKeys.has(key)) {
    warnedKeys.add(key)
    console.warn(`formeo: config option "${key}" ${problem}; it is ignored`)
  }
}

/**
 * A declaration's dropdown choices, labelled, or null when they can't be offered: they must be a non-empty list of
 * string values that includes the default
 * @param {String} key config key
 * @param {Object} declaration
 * @return {Array<{value: String, label: String}>|null}
 */
const declaredChoices = (key, { options, default: defaultValue }) => {
  const usable =
    Array.isArray(options) &&
    options.length > 0 &&
    options.every(option => typeof option?.value === 'string') &&
    options.some(option => option.value === defaultValue)
  if (!usable) {
    return null
  }
  return options.map(({ value, label }) => ({
    value,
    label: label || i18n.get(`${key}.${value}`) || toTitleCase(value),
  }))
}

/**
 * The config keys a component's Config panel offers: its resolved `panels.config.options` without the
 * `panels.config.disabled` ones. A declaration the panel can't edit is dropped with a warning.
 * @param {Object} [componentConfig] a component's resolved config (Component#config)
 * @return {Map<String, {label: String, default: boolean|string|number, options?: Array}>} the keys, in declaration order
 */
export const configOptionsOf = componentConfig => {
  const { options = {}, disabled = [] } = componentConfig?.panels?.config || {}
  const declared = new Map()
  for (const [key, declaration] of Object.entries(options)) {
    if (disabled.includes(key)) {
      continue
    }
    if (!EDITABLE_DEFAULT_TYPES.has(typeof declaration?.default)) {
      warnOnce(key, 'needs a boolean, string or number default')
      continue
    }
    const entry = { label: declaration.label || labelHelper(`config.${key}`), default: declaration.default }
    if (declaration.options !== undefined) {
      const choices = declaredChoices(key, declaration)
      if (!choices) {
        warnOnce(key, 'needs options with string values that include its default')
        continue
      }
      entry.options = choices
    }
    declared.set(key, entry)
  }
  return declared
}
